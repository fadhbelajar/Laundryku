import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  Layers, 
  Users, 
  CheckCircle2, 
  TrendingUp,
  FileSpreadsheet,
  FileText,
  Filter,
  Search,
  AlertTriangle,
  Send,
  Printer,
  CreditCard,
  Building,
  RefreshCw
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LaundryOrder, CustomerType, PaymentStatus, Customer } from '../../types';
import { StorageService, formatRupiah, buildSantriDebtWhatsAppLink } from '../../data/storage';

export const ReportsModule: React.FC = () => {
  const [activeReportTab, setActiveReportTab] = useState<'TRANSAKSI_SANTRI' | 'REKAP_HUTANG' | 'REKAP_KELAS' | 'SEMUA_PELANGGAN'>('TRANSAKSI_SANTRI');
  
  // Filter States
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedCustomerType, setSelectedCustomerType] = useState<'ALL' | CustomerType>('ALL');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<'ALL' | 'LUNAS' | 'BELUM_LUNAS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const orders = StorageService.getOrders();
  const customers = StorageService.getCustomers();
  const settings = StorageService.getSettings();

  // Extract all unique student classes from customer database
  const availableClasses = useMemo(() => {
    const classSet = new Set<string>();
    customers.forEach(c => {
      if (c.type === 'SANTRIWATI' && c.student?.className) {
        classSet.add(c.student.className);
      }
    });
    return Array.from(classSet).sort();
  }, [customers]);

  // Quick date filter helper
  const setQuickDate = (period: 'TODAY' | 'WEEK' | 'MONTH' | 'ALL') => {
    const now = new Date();
    if (period === 'ALL') {
      setDateFrom('');
      setDateTo('');
      return;
    }
    const toStr = now.toISOString().split('T')[0];
    let fromDate = new Date();
    if (period === 'TODAY') {
      fromDate = now;
    } else if (period === 'WEEK') {
      fromDate.setDate(now.getDate() - 7);
    } else if (period === 'MONTH') {
      fromDate.setMonth(now.getMonth() - 1);
    }
    setDateFrom(fromDate.toISOString().split('T')[0]);
    setDateTo(toStr);
  };

  // Customers lookup map
  const customerMap = useMemo(() => {
    const map = new Map<string, Customer>();
    customers.forEach(c => map.set(c.id, c));
    return map;
  }, [customers]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Customer Type Filter
      if (selectedCustomerType !== 'ALL' && o.customerType !== selectedCustomerType) {
        return false;
      }

      // If active tab is specific to santri, enforce SANTRIWATI
      if (activeReportTab === 'TRANSAKSI_SANTRI' && o.customerType !== 'SANTRIWATI') {
        return false;
      }

      // Date filtering
      if (dateFrom && o.orderDate.slice(0, 10) < dateFrom) return false;
      if (dateTo && o.orderDate.slice(0, 10) > dateTo) return false;

      // Class filtering (for santri)
      const customer = customerMap.get(o.customerId);
      const studentClass = o.studentDormInfo?.className || customer?.student?.className;
      if (selectedClass !== 'ALL' && studentClass !== selectedClass) {
        return false;
      }

      // Payment Status filtering
      if (selectedPaymentStatus === 'LUNAS' && o.paymentStatus !== 'LUNAS') {
        return false;
      }
      if (selectedPaymentStatus === 'BELUM_LUNAS' && o.paymentStatus === 'LUNAS') {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchInvoice = o.id.toLowerCase().includes(q);
        const matchName = o.customerName.toLowerCase().includes(q);
        const matchNis = customer?.student?.nis?.toLowerCase().includes(q);
        const matchGuardian = (o.studentDormInfo?.guardianName || customer?.student?.guardianName || '').toLowerCase().includes(q);
        const matchPhone = o.customerPhone.includes(q);
        if (!matchInvoice && !matchName && !matchNis && !matchGuardian && !matchPhone) {
          return false;
        }
      }

      return true;
    });
  }, [orders, selectedCustomerType, activeReportTab, dateFrom, dateTo, selectedClass, selectedPaymentStatus, searchQuery, customerMap]);

  // Aggregate Financial & Volume KPIs
  const reportKPIs = useMemo(() => {
    let totalTransactions = filteredOrders.length;
    let totalWeightKg = 0;
    let totalPieces = 0;
    let totalGrossRevenue = 0;
    let totalPaid = 0;
    let totalUnpaidDebt = 0;
    let unpaidOrdersCount = 0;

    filteredOrders.forEach(o => {
      totalWeightKg += o.totalWeightKg || 0;
      totalPieces += o.totalPieces || 0;
      totalGrossRevenue += o.grandTotal || 0;
      
      const paid = o.paidAmount || (o.paymentStatus === 'LUNAS' ? o.grandTotal : 0);
      totalPaid += paid;
      
      const debt = Math.max(0, o.grandTotal - paid);
      totalUnpaidDebt += debt;
      if (debt > 0) {
        unpaidOrdersCount++;
      }
    });

    return {
      totalTransactions,
      totalWeightKg,
      totalPieces,
      totalGrossRevenue,
      totalPaid,
      totalUnpaidDebt,
      unpaidOrdersCount
    };
  }, [filteredOrders]);

  // Santri Debt Summaries (Per Student Aggregate)
  const santriDebtSummaries = useMemo(() => {
    const map: Record<string, {
      studentId: string;
      studentName: string;
      nis: string;
      className: string;
      guardianName: string;
      guardianPhone: string;
      unpaidOrders: LaundryOrder[];
      totalDebt: number;
    }> = {};

    orders.forEach(o => {
      if (o.customerType === 'SANTRIWATI' && (o.paymentStatus === 'BELUM_BAYAR' || o.paymentStatus === 'DP')) {
        const remaining = Math.max(0, o.grandTotal - (o.paidAmount || 0));
        if (remaining > 0) {
          const cust = customerMap.get(o.customerId);
          const sClass = o.studentDormInfo?.className || cust?.student?.className || 'Tanpa Kelas';
          
          if (selectedClass !== 'ALL' && sClass !== selectedClass) return;
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchName = o.customerName.toLowerCase().includes(q);
            const matchNis = (cust?.student?.nis || '').toLowerCase().includes(q);
            const matchGuardian = (cust?.student?.guardianName || '').toLowerCase().includes(q);
            if (!matchName && !matchNis && !matchGuardian) return;
          }

          if (!map[o.customerId]) {
            map[o.customerId] = {
              studentId: o.customerId,
              studentName: o.customerName,
              nis: cust?.student?.nis || '-',
              className: sClass,
              guardianName: o.studentDormInfo?.guardianName || cust?.student?.guardianName || '-',
              guardianPhone: o.studentDormInfo?.guardianPhone || cust?.student?.guardianPhone || cust?.phone || o.customerPhone,
              unpaidOrders: [],
              totalDebt: 0
            };
          }
          map[o.customerId].unpaidOrders.push(o);
          map[o.customerId].totalDebt += remaining;
        }
      }
    });

    return Object.values(map).sort((a, b) => b.totalDebt - a.totalDebt);
  }, [orders, customerMap, selectedClass, searchQuery]);

  // Class Volume and Debt Breakdown
  const classBreakdown = useMemo(() => {
    const map: Record<string, { orderCount: number; weightKg: number; totalRevenue: number; totalDebt: number }> = {};
    orders.forEach(o => {
      if (o.customerType === 'SANTRIWATI') {
        const cust = customerMap.get(o.customerId);
        const className = o.studentDormInfo?.className || cust?.student?.className || 'Lainnya';
        if (!map[className]) {
          map[className] = { orderCount: 0, weightKg: 0, totalRevenue: 0, totalDebt: 0 };
        }
        map[className].orderCount += 1;
        map[className].weightKg += o.totalWeightKg || 0;
        map[className].totalRevenue += o.grandTotal || 0;
        const remaining = Math.max(0, o.grandTotal - (o.paidAmount || (o.paymentStatus === 'LUNAS' ? o.grandTotal : 0)));
        map[className].totalDebt += remaining;
      }
    });
    return Object.entries(map).map(([className, data]) => ({ className, ...data })).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [orders, customerMap]);

  // Export PDF Report Generator
  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const storeTitle = settings.storeName || 'LAUNDRY PONDOK PESANTREN PUTRI ALMAWADDAH';
    const storeAddress = settings.address || 'Kompleks Pondok Pesantren Putri Almawaddah, Jetis, Ponorogo';
    const storePhone = settings.phone || '081234567890';
    const printDate = new Date().toLocaleString('id-ID');

    // Header Background Accent
    doc.setFillColor(6, 78, 59); // Emerald 900
    doc.rect(0, 0, 297, 24, 'F');

    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(storeTitle.toUpperCase(), 14, 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`${storeAddress} • Telp/WA: ${storePhone}`, 14, 16);
    doc.text(`Waktu Cetak: ${printDate}`, 283, 16, { align: 'right' });

    // Report Title & Filter Info
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);

    let reportTitle = 'LAPORAN TRANSAKSI CUCIAN SANTRIWATI & STATUS HUTANG';
    if (activeReportTab === 'REKAP_HUTANG') {
      reportTitle = 'LAPORAN REKAPITULASI PIUTANG & TUNGGAKAN HUTANG SANTRIWATI';
    } else if (activeReportTab === 'REKAP_KELAS') {
      reportTitle = 'LAPORAN REKAPITULASI CUCIAN PER KELAS SANTRIWATI';
    }

    doc.text(reportTitle, 14, 32);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const filterInfo = `Filter: Periode: ${dateFrom || 'Awal'} s/d ${dateTo || 'Sekarang'} | Kelas: ${selectedClass === 'ALL' ? 'Semua Kelas' : selectedClass} | Status: ${selectedPaymentStatus}`;
    doc.text(filterInfo, 14, 37);

    // KPI Summary Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 41, 269, 14, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    
    doc.text(`Total Order: ${reportKPIs.totalTransactions}`, 18, 49);
    doc.text(`Total Berat: ${reportKPIs.totalWeightKg.toFixed(1)} Kg`, 65, 49);
    doc.text(`Total Omzet: ${formatRupiah(reportKPIs.totalGrossRevenue)}`, 115, 49);
    doc.text(`Terbayar: ${formatRupiah(reportKPIs.totalPaid)}`, 175, 49);
    
    doc.setTextColor(190, 18, 60); // Rose 700 for Debt
    doc.text(`Sisa Hutang Santri: ${formatRupiah(reportKPIs.totalUnpaidDebt)} (${reportKPIs.unpaidOrdersCount} Order)`, 225, 49);

    if (activeReportTab === 'REKAP_HUTANG') {
      // Table for Debt Summary
      const tableData = santriDebtSummaries.map((s, idx) => [
        idx + 1,
        s.nis,
        s.studentName,
        s.className,
        s.guardianName,
        s.guardianPhone,
        `${s.unpaidOrders.length} Order`,
        formatRupiah(s.totalDebt)
      ]);

      autoTable(doc, {
        startY: 59,
        head: [['No', 'NIS', 'Nama Santriwati', 'Kelas', 'Wali / Orang Tua', 'Kontak WA', 'Jumlah Tertunggak', 'Total Hutang']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [159, 18, 57], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 25 },
          2: { cellWidth: 45, fontStyle: 'bold' },
          3: { cellWidth: 30 },
          4: { cellWidth: 45 },
          5: { cellWidth: 35 },
          6: { cellWidth: 35, halign: 'center' },
          7: { cellWidth: 44, halign: 'right', fontStyle: 'bold', textColor: [159, 18, 57] }
        }
      });
    } else {
      // Table for Transactions
      const tableData = filteredOrders.map((o, idx) => {
        const cust = customerMap.get(o.customerId);
        const sClass = o.studentDormInfo?.className || cust?.student?.className || '-';
        const guardian = o.studentDormInfo?.guardianName || cust?.student?.guardianName || '-';
        const paid = o.paidAmount || (o.paymentStatus === 'LUNAS' ? o.grandTotal : 0);
        const debt = Math.max(0, o.grandTotal - paid);

        return [
          idx + 1,
          o.id,
          o.orderDate.slice(0, 10),
          o.customerName,
          sClass,
          guardian,
          `${o.totalWeightKg} Kg`,
          formatRupiah(o.grandTotal),
          formatRupiah(paid),
          debt > 0 ? formatRupiah(debt) : 'Rp 0',
          o.paymentStatus
        ];
      });

      autoTable(doc, {
        startY: 59,
        head: [['No', 'No. Invoice', 'Tanggal', 'Nama Santri', 'Kelas', 'Wali Santri', 'Berat', 'Total Tagihan', 'Terbayar', 'Sisa Hutang', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [6, 78, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 26, fontStyle: 'bold' },
          2: { cellWidth: 20 },
          3: { cellWidth: 40, fontStyle: 'bold' },
          4: { cellWidth: 25 },
          5: { cellWidth: 35 },
          6: { cellWidth: 15, halign: 'center' },
          7: { cellWidth: 26, halign: 'right' },
          8: { cellWidth: 26, halign: 'right' },
          9: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
          10: { cellWidth: 22, halign: 'center' }
        }
      });
    }

    // Add Signature Footer
    const finalY = (doc as any).lastAutoTable?.finalY || 160;
    if (finalY < 170) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      
      const currentStaff = StorageService.getCurrentStaff();
      doc.text(`Ponorogo, ${new Date().toLocaleDateString('id-ID')}`, 235, finalY + 10);
      doc.text('Penanggung Jawab / Kasir', 235, finalY + 15);
      doc.text(`( ${currentStaff.name || 'Admin Laundry'} )`, 235, finalY + 32);
    }

    // Save and Trigger Download
    doc.save(`Laporan_Laundry_${activeReportTab}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Export CSV generator
  const handleExportCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'No,ID Invoice,Tanggal,Nama Santri,Kategori,Kelas,Nama Wali,Kontak Wali,Berat (Kg),Jumlah (Pcs),Total Tagihan (Rp),Terbayar (Rp),Sisa Hutang (Rp),Status Bayar\n';

    filteredOrders.forEach((o, idx) => {
      const cust = customerMap.get(o.customerId);
      const sClass = o.studentDormInfo?.className || cust?.student?.className || '-';
      const guardian = o.studentDormInfo?.guardianName || cust?.student?.guardianName || '-';
      const guardianPhone = o.studentDormInfo?.guardianPhone || cust?.student?.guardianPhone || cust?.phone || o.customerPhone;
      const paid = o.paidAmount || (o.paymentStatus === 'LUNAS' ? o.grandTotal : 0);
      const debt = Math.max(0, o.grandTotal - paid);

      csvContent += `${idx + 1},"${o.id}","${o.orderDate}","${o.customerName}","${o.customerType}","${sClass}","${guardian}","${guardianPhone}",${o.totalWeightKg},${o.totalPieces},${o.grandTotal},${paid},${debt},"${o.paymentStatus}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Transaksi_Santri_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="reports-module-view" className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-700" />
            Laporan Transaksi & Hutang Santriwati
          </h2>
          <p className="text-xs text-slate-500">
            Laporan komprehensif transaksi cucian, rekapitulasi hutang piutang santri per kelas, dan ekspor dokumen PDF resmi.
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-2xl transition-all active:scale-[0.98]"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            Ekspor Excel/CSV
          </button>
          
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-2xl shadow-md transition-all active:scale-[0.98]"
          >
            <FileText className="w-4 h-4 text-emerald-300" />
            Cetak / Download Laporan PDF
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex bg-white p-2 rounded-2xl border border-slate-200 shadow-xs gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveReportTab('TRANSAKSI_SANTRI')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeReportTab === 'TRANSAKSI_SANTRI'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>👧 Laporan Transaksi Santriwati</span>
        </button>

        <button
          onClick={() => setActiveReportTab('REKAP_HUTANG')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeReportTab === 'REKAP_HUTANG'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
          }`}
        >
          <span>⚠️ Rekapitulasi Hutang & Tagihan Santri</span>
          {santriDebtSummaries.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeReportTab === 'REKAP_HUTANG' ? 'bg-white text-rose-800' : 'bg-rose-200 text-rose-900'
            }`}>
              {santriDebtSummaries.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveReportTab('REKAP_KELAS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeReportTab === 'REKAP_KELAS'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🏫 Rekap Per Kelas Santriwati
        </button>

        <button
          onClick={() => setActiveReportTab('SEMUA_PELANGGAN')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeReportTab === 'SEMUA_PELANGGAN'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          👥 Semua Segmen Pelanggan
        </button>
      </div>

      {/* Filter Control Box */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-emerald-700" />
            Filter Laporan Transaksi
          </span>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium mr-1">Cepat:</span>
            <button
              onClick={() => setQuickDate('TODAY')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
            >
              Hari Ini
            </button>
            <button
              onClick={() => setQuickDate('WEEK')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
            >
              7 Hari
            </button>
            <button
              onClick={() => setQuickDate('MONTH')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
            >
              Bulan Ini
            </button>
            <button
              onClick={() => setQuickDate('ALL')}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px]"
            >
              Semua Periode
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="text-slate-600 font-bold block mb-1">Tanggal Mulai:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-600 font-medium"
            />
          </div>

          <div>
            <label className="text-slate-600 font-bold block mb-1">Tanggal Selesai:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-600 font-medium"
            />
          </div>

          <div>
            <label className="text-slate-600 font-bold block mb-1">Filter Kelas Santriwati:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-600 font-medium"
            >
              <option value="ALL">Semua Kelas</option>
              {availableClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-600 font-bold block mb-1">Status Pembayaran:</label>
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-600 font-medium"
            >
              <option value="ALL">Semua Status Bayar</option>
              <option value="LUNAS">Hanya Lunas</option>
              <option value="BELUM_LUNAS">Hanya Tertunggak / Hutang</option>
            </select>
          </div>

          <div>
            <label className="text-slate-600 font-bold block mb-1">Cari Santri / Wali / Invoice:</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Nama / NIS / No. WA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Transaksi</span>
          <div className="text-xl font-black text-slate-900">{reportKPIs.totalTransactions} Order</div>
          <span className="text-[11px] text-slate-500 block">Total Berat: <strong>{reportKPIs.totalWeightKg.toFixed(1)} Kg</strong></span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Nilai Transaksi</span>
          <div className="text-xl font-black text-slate-900">{formatRupiah(reportKPIs.totalGrossRevenue)}</div>
          <span className="text-[11px] text-emerald-700 block font-semibold">Omzet Kotor Laundry</span>
        </div>

        <div className="bg-emerald-50 p-4 rounded-3xl border border-emerald-200 shadow-xs space-y-1">
          <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">Total Kas Terbayar</span>
          <div className="text-xl font-black text-emerald-950">{formatRupiah(reportKPIs.totalPaid)}</div>
          <span className="text-[11px] text-emerald-800 block font-medium">Uang Masuk Kasir</span>
        </div>

        <div className="bg-rose-50 p-4 rounded-3xl border border-rose-200 shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-rose-700 font-bold uppercase tracking-wider block">Total Sisa Hutang Santri</span>
          <div className="text-xl font-black text-rose-700">{formatRupiah(reportKPIs.totalUnpaidDebt)}</div>
          <span className="text-[11px] text-rose-800 block font-semibold">{reportKPIs.unpaidOrdersCount} Order Tertunggak</span>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-xs space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Rasio Pelunasan</span>
          <div className="text-xl font-black">
            {reportKPIs.totalGrossRevenue > 0 
              ? `${Math.round((reportKPIs.totalPaid / reportKPIs.totalGrossRevenue) * 100)}%`
              : '100%'}
          </div>
          <span className="text-[11px] text-slate-300 block">Tingkat Kolektibilitas</span>
        </div>
      </div>

      {/* Main Content Area based on Tab */}
      {activeReportTab === 'REKAP_HUTANG' ? (
        /* Rekapitulasi Hutang Santri Table */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-rose-950 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                Daftar Santriwati Yang Memiliki Tunggakan Hutang Cucian
              </h3>
              <p className="text-xs text-slate-500">
                Menampilkan santriwati dengan status order belum lunas atau DP, lengkap dengan kontak orang tua untuk penagihan via WhatsApp.
              </p>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-xl">
              {santriDebtSummaries.length} Santriwati Tertunggak
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3.5">NIS</th>
                  <th className="p-3.5">Nama Santriwati</th>
                  <th className="p-3.5">Kelas</th>
                  <th className="p-3.5">Nama Orang Tua / Wali</th>
                  <th className="p-3.5">Kontak WhatsApp</th>
                  <th className="p-3.5 text-center">Jumlah Order</th>
                  <th className="p-3.5 text-right">Total Hutang</th>
                  <th className="p-3.5 text-center">Aksi Penagihan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {santriDebtSummaries.map(s => {
                  const handleSendWA = () => {
                    const link = buildSantriDebtWhatsAppLink(
                      s.guardianPhone,
                      s.studentName,
                      s.nis,
                      s.className,
                      s.guardianName,
                      s.totalDebt,
                      s.unpaidOrders
                    );
                    window.open(link, '_blank');
                  };

                  return (
                    <tr key={s.studentId} className="hover:bg-rose-50/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-800">{s.nis}</td>
                      <td className="p-3.5 font-extrabold text-slate-900">{s.studentName}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-900 font-bold text-[11px] border border-emerald-200">
                          {s.className}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800">{s.guardianName}</td>
                      <td className="p-3.5 font-mono text-emerald-800">{s.guardianPhone}</td>
                      <td className="p-3.5 text-center font-bold text-slate-700">
                        {s.unpaidOrders.length} Order
                      </td>
                      <td className="p-3.5 text-right font-black text-rose-700 text-sm">
                        {formatRupiah(s.totalDebt)}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={handleSendWA}
                          className="inline-flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-1.5 px-3 rounded-xl shadow-xs text-xs transition-colors"
                        >
                          <Send className="w-3 h-3" />
                          Kirim Tagihan WA
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {santriDebtSummaries.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-emerald-700 font-semibold text-xs">
                      Alhamdulillah, tidak ada santriwati yang memiliki tunggakan hutang sesuai filter ini!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeReportTab === 'REKAP_KELAS' ? (
        /* Rekap Per Kelas Santri */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-700" />
              Rekapitulasi Beban Cucian & Piutang Berdasarkan Kelas Santriwati
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classBreakdown.map(item => (
              <div key={item.className} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-sm text-slate-900">Kelas: {item.className}</span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg">
                    {item.orderCount} Order
                  </span>
                </div>
                <div className="text-xs space-y-1 text-slate-600 pt-1">
                  <div className="flex justify-between">
                    <span>Total Berat:</span>
                    <strong className="text-slate-900">{item.weightKg.toFixed(1)} Kg</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Omzet:</span>
                    <strong className="text-emerald-900">{formatRupiah(item.totalRevenue)}</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 text-rose-700">
                    <span className="font-bold">Total Sisa Hutang:</span>
                    <strong className="font-black">{formatRupiah(item.totalDebt)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Default Laporan Transaksi Cucian Table */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 flex justify-between items-center">
            <span>Rincian Transaksi Sesuai Filter ({filteredOrders.length} Order)</span>
            <span className="text-[11px] text-slate-500 font-normal">Siap diekspor ke PDF / Excel</span>
          </div>

          <div className="overflow-x-auto max-h-[480px]">
            <table className="w-full text-xs text-left">
              <thead className="bg-white border-b border-slate-200 text-slate-500 font-bold sticky top-0 z-10 shadow-xs">
                <tr>
                  <th className="p-3">No. Invoice</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Nama Santri / Pelanggan</th>
                  <th className="p-3">Kelas / Kategori</th>
                  <th className="p-3">Wali / Kontak</th>
                  <th className="p-3 text-center">Berat (Kg)</th>
                  <th className="p-3 text-right">Nilai Total</th>
                  <th className="p-3 text-right">Terbayar</th>
                  <th className="p-3 text-right">Sisa Hutang</th>
                  <th className="p-3 text-center">Status Bayar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map(o => {
                  const cust = customerMap.get(o.customerId);
                  const sClass = o.studentDormInfo?.className || cust?.student?.className || o.customerType.replace('_', ' ');
                  const guardian = o.studentDormInfo?.guardianName || cust?.student?.guardianName || '-';
                  const guardianPhone = o.studentDormInfo?.guardianPhone || cust?.student?.guardianPhone || cust?.phone || o.customerPhone;
                  const paid = o.paidAmount || (o.paymentStatus === 'LUNAS' ? o.grandTotal : 0);
                  const debt = Math.max(0, o.grandTotal - paid);

                  return (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">{o.id}</td>
                      <td className="p-3 text-slate-600">{o.orderDate.slice(0, 10)}</td>
                      <td className="p-3">
                        <div className="font-extrabold text-slate-900">{o.customerName}</div>
                        {cust?.student?.nis && (
                          <span className="text-[10px] text-slate-400 font-mono">NIS: {cust.student.nis}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100">
                          {sClass}
                        </span>
                      </td>
                      <td className="p-3 text-[11px]">
                        <div className="font-semibold text-slate-800">{guardian}</div>
                        <div className="text-slate-400 font-mono text-[10px]">{guardianPhone}</div>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-700">{o.totalWeightKg} Kg</td>
                      <td className="p-3 text-right font-bold text-slate-900">{formatRupiah(o.grandTotal)}</td>
                      <td className="p-3 text-right font-bold text-emerald-800">{formatRupiah(paid)}</td>
                      <td className="p-3 text-right font-black">
                        {debt > 0 ? (
                          <span className="text-rose-700">{formatRupiah(debt)}</span>
                        ) : (
                          <span className="text-emerald-700 font-semibold">Lunas</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                          o.paymentStatus === 'LUNAS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-10 text-center text-slate-400 text-xs">
                      Tidak ada transaksi yang cocok dengan filter yang dipilih.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
