import React, { useState, useMemo, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  X, 
  Save, 
  Users, 
  Search, 
  MessageCircle, 
  CheckCircle2, 
  AlertCircle, 
  Receipt, 
  Send, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  Phone, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  ExpenseRecord, 
  PaymentMethod, 
  LaundryOrder, 
  Customer, 
  SantriDebtPayment, 
  StaffUser 
} from '../../types';
import { 
  StorageService, 
  formatRupiah, 
  buildSantriDebtWhatsAppLink 
} from '../../data/storage';

export const FinanceModule: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(StorageService.getExpenses());
  const [orders, setOrders] = useState<LaundryOrder[]>(StorageService.getOrders());
  const [customers, setCustomers] = useState<Customer[]>(StorageService.getCustomers());
  const [debtPayments, setDebtPayments] = useState<SantriDebtPayment[]>(StorageService.getSantriDebtPayments());

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'DEBT_MANAGEMENT' | 'DEBT_HISTORY' | 'CASH_FLOW' | 'INCOME' | 'EXPENSE'>('DEBT_MANAGEMENT');

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [payingStudent, setPayingStudent] = useState<Customer | null>(null);
  const [viewingReceiptPayment, setViewingReceiptPayment] = useState<SantriDebtPayment | null>(null);
  const [isBulkReminderOpen, setIsBulkReminderOpen] = useState(false);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  // Expense form
  const [expenseCategory, setExpenseCategory] = useState<ExpenseRecord['category']>('DETERJEN');
  const [expenseAmount, setExpenseAmount] = useState<number>(75000);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseRecipient, setExpenseRecipient] = useState('Toko Sabun Berkah');
  const [expenseNotes, setExpenseNotes] = useState('');

  // Quick Pay / Debt Payment Form State
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('TUNAI');
  const [payNotes, setPayNotes] = useState<string>('');
  const [autoSendWaReceipt, setAutoSendWaReceipt] = useState<boolean>(true);

  // Filters for Santri Debt Management
  const [debtSearchQuery, setDebtSearchQuery] = useState('');
  const [debtClassFilter, setDebtClassFilter] = useState('ALL');
  const [debtRangeFilter, setDebtRangeFilter] = useState<'OUTSTANDING_ONLY' | 'ABOVE_50K' | 'ABOVE_100K' | 'ALL_STUDENTS'>('OUTSTANDING_ONLY');

  // Bulk reminder status tracker
  const [sentReminderIds, setSentReminderIds] = useState<Record<string, boolean>>({});

  const currentStaff: StaffUser = StorageService.getCurrentStaff();

  const refreshData = () => {
    setExpenses(StorageService.getExpenses());
    setOrders(StorageService.getOrders());
    setCustomers(StorageService.getCustomers());
    setDebtPayments(StorageService.getSantriDebtPayments());
  };

  useEffect(() => {
    const handleStorageUpdate = () => {
      refreshData();
    };
    window.addEventListener('almawaddah_storage_updated', handleStorageUpdate);
    return () => window.removeEventListener('almawaddah_storage_updated', handleStorageUpdate);
  }, []);

  // 1. Compute Santri Debt List
  const santriDebtList = useMemo(() => {
    const santriwati = customers.filter(c => c.type === 'SANTRIWATI');
    
    return santriwati.map(santri => {
      const studentOrders = orders.filter(o => o.customerId === santri.id && o.customerType === 'SANTRIWATI');
      const unpaidOrders = studentOrders.filter(o => o.paymentStatus === 'BELUM_BAYAR' || o.paymentStatus === 'DP');
      
      const totalDebt = unpaidOrders.reduce((sum, o) => {
        const remaining = Math.max(0, o.grandTotal - (o.paidAmount || 0));
        return sum + remaining;
      }, 0);

      const totalSpent = studentOrders.reduce((sum, o) => sum + o.grandTotal, 0);
      const studentPayments = debtPayments.filter(p => p.studentId === santri.id);

      return {
        customer: santri,
        student: santri.student,
        totalOrdersCount: studentOrders.length,
        totalSpent,
        totalDebt,
        hasDebt: totalDebt > 0,
        unpaidOrders,
        payments: studentPayments
      };
    });
  }, [customers, orders, debtPayments]);

  // Filtered Santri Debt List
  const filteredSantriDebts = useMemo(() => {
    return santriDebtList.filter(item => {
      // Filter by Debt Status / Threshold
      if (debtRangeFilter === 'OUTSTANDING_ONLY' && !item.hasDebt) return false;
      if (debtRangeFilter === 'ABOVE_50K' && item.totalDebt < 50000) return false;
      if (debtRangeFilter === 'ABOVE_100K' && item.totalDebt < 100000) return false;

      // Filter by Class
      if (debtClassFilter !== 'ALL' && item.student?.className !== debtClassFilter) {
        return false;
      }

      // Search Query Filter
      if (!debtSearchQuery.trim()) return true;
      const q = debtSearchQuery.toLowerCase();
      const matchName = item.customer.name.toLowerCase().includes(q);
      const matchNis = (item.student?.nis || item.customer.id).toLowerCase().includes(q);
      const matchClass = (item.student?.className || '').toLowerCase().includes(q);
      const matchGuardian = (item.student?.guardianName || '').toLowerCase().includes(q);
      const matchPhone = (item.student?.guardianPhone || item.customer.phone).includes(q);

      return matchName || matchNis || matchClass || matchGuardian || matchPhone;
    });
  }, [santriDebtList, debtRangeFilter, debtClassFilter, debtSearchQuery]);

  // Available Classes for Dropdown
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    customers.forEach(c => {
      if (c.type === 'SANTRIWATI' && c.student?.className) {
        set.add(c.student.className);
      }
    });
    return Array.from(set).sort();
  }, [customers]);

  // Totals & KPI Metrics
  const totalSantriWithDebt = useMemo(() => {
    return santriDebtList.filter(s => s.hasDebt).length;
  }, [santriDebtList]);

  const totalNominalDebt = useMemo(() => {
    return santriDebtList.reduce((sum, s) => sum + s.totalDebt, 0);
  }, [santriDebtList]);

  const totalUnpaidOrdersCount = useMemo(() => {
    return santriDebtList.reduce((sum, s) => sum + s.unpaidOrders.length, 0);
  }, [santriDebtList]);

  const totalCollectedDebtThisMonth = useMemo(() => {
    return debtPayments.reduce((sum, p) => sum + p.amount, 0);
  }, [debtPayments]);

  // Financial Overview Calculations
  const totalIncome = useMemo(() => {
    return orders
      .filter(o => o.paymentStatus === 'LUNAS' || o.paidAmount > 0)
      .reduce((acc, o) => acc + (o.paidAmount || o.grandTotal), 0);
  }, [orders]);

  const totalExpense = useMemo(() => {
    return expenses.reduce((acc, e) => acc + e.amount, 0);
  }, [expenses]);

  const netProfit = totalIncome - totalExpense;

  // Breakdown by payment channel
  const methodBreakdown = useMemo(() => {
    const map: Record<PaymentMethod, number> = {
      TUNAI: 0,
      QRIS: 0,
      TRANSFER_BANK: 0,
      KUOTA_PAKET: 0,
      SALDO_MEMBER: 0
    };
    orders.forEach(o => {
      const amt = o.paidAmount || (o.paymentStatus === 'LUNAS' ? o.grandTotal : 0);
      map[o.paymentMethod] = (map[o.paymentMethod] || 0) + amt;
    });
    return map;
  }, [orders]);

  // Record Expense Handler
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (expenseAmount <= 0 || !expenseTitle.trim()) {
      alert('Isi jumlah dan judul pengeluaran dengan benar.');
      return;
    }

    const newRecord: ExpenseRecord = {
      id: `EXP-${Date.now().toString().slice(-6)}`,
      category: expenseCategory,
      title: expenseTitle,
      amount: expenseAmount,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      recipient: expenseRecipient,
      authorizedBy: currentStaff.name,
      notes: expenseNotes
    };

    const updated = [newRecord, ...expenses];
    StorageService.saveExpenses(updated);
    setIsExpenseModalOpen(false);
    setExpenseTitle('');
    setExpenseNotes('');
    setExpenseAmount(75000);
    refreshData();
  };

  // Open Quick Pay Modal for a Student
  const handleOpenQuickPayModal = (student: Customer, suggestedAmount?: number) => {
    setPayingStudent(student);
    const detail = StorageService.getSantriDebtDetails(student.id);
    setPayAmount(suggestedAmount !== undefined ? suggestedAmount : detail.totalDebt);
    setPayMethod('TUNAI');
    setPayNotes('Pembayaran cicilan / pelunasan hutang laundry santri');
  };

  // Submit Quick Pay / Installment Payment
  const handleProcessDebtPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingStudent) return;
    if (payAmount <= 0) {
      alert('Masukkan nominal pembayaran yang valid (minimal Rp 1.000).');
      return;
    }

    const receiptNo = `KWT-HUTANG-${Date.now().toString().slice(-6)}`;
    const newPayment: SantriDebtPayment = {
      id: `PAY-DEBT-${Date.now()}`,
      studentId: payingStudent.id,
      studentName: payingStudent.name,
      nis: payingStudent.student?.nis || payingStudent.id,
      className: payingStudent.student?.className || '',
      guardianName: payingStudent.student?.guardianName || '',
      guardianPhone: payingStudent.student?.guardianPhone || payingStudent.phone,
      paymentDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      amount: payAmount,
      paymentMethod: payMethod,
      staffName: currentStaff.name,
      receiptNumber: receiptNo,
      notes: payNotes || 'Pembayaran cicilan / pelunasan hutang laundry santri'
    };

    StorageService.recordSantriDebtPayment(newPayment);
    refreshData();

    // Prepare WhatsApp Confirmation Link
    const targetPhone = payingStudent.student?.guardianPhone || payingStudent.phone;
    const cleanPhone = (targetPhone || '').replace(/\D/g, '').replace(/^0/, '62');

    const remainingDebtAfter = Math.max(0, (santriDebtList.find(s => s.customer.id === payingStudent.id)?.totalDebt || 0) - payAmount);

    const waMsg = `*KUITANSI PEMBAYARAN LAUNDRY SANTRIWATI*\n*PONDOK PESANTREN AL-MAWADDAH*\n\nAssalamu'alaikum Wr. Wb.\n\nYth. Bapak/Ibu *${payingStudent.student?.guardianName || 'Wali Santri'}*,\nAlhamdulillah, kami telah menerima pembayaran laundry untuk santriwati ananda:\n👤 *${payingStudent.name}*\n🆔 NIS: *${payingStudent.student?.nis || payingStudent.id}*\n🏫 Kelas: *${payingStudent.student?.className || '-'}*\n\n📄 *Rincian Pembayaran:*\n- No. Kuitansi: *${receiptNo}*\n- Tanggal: ${newPayment.paymentDate}\n- Jumlah Dibayar: *${formatRupiah(payAmount)}*\n- Metode Pembayaran: *${payMethod.replace('_', ' ')}*\n- Kasir Penerima: ${currentStaff.name}\n- Keterangan: ${newPayment.notes}\n\n💰 *Sisa Tagihan / Hutang Saat Ini: ${formatRupiah(remainingDebtAfter)}*\n\nJazaakumullahu khairan katsiran atas pembayaran yang telah dilakukan. Semoga membawa berkah bagi ananda dalam menuntut ilmu di pesantren.\n\nWassalamu'alaikum Wr. Wb.\n\n*Administrasi Keuangan Laundry Almawaddah*`;

    const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMsg)}`;

    setPayingStudent(null);
    setViewingReceiptPayment(newPayment);

    if (autoSendWaReceipt && cleanPhone) {
      window.open(waLink, '_blank');
    }
  };

  // Trigger Automated WhatsApp Payment Reminder to Guardian
  const handleSendWhatsAppReminder = (santriData: {
    customer: Customer;
    student?: any;
    totalDebt: number;
    unpaidOrders: LaundryOrder[];
  }) => {
    const gPhone = santriData.student?.guardianPhone || santriData.customer.phone;
    const link = buildSantriDebtWhatsAppLink(
      gPhone,
      santriData.customer.name,
      santriData.student?.nis || santriData.customer.id,
      santriData.student?.className || '-',
      santriData.student?.guardianName || 'Orang Tua',
      santriData.totalDebt,
      santriData.unpaidOrders
    );

    setSentReminderIds(prev => ({ ...prev, [santriData.customer.id]: true }));
    window.open(link, '_blank');
  };

  return (
    <div id="finance-module-view" className="space-y-6">
      
      {/* Module Banner & Quick Action Buttons */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Wallet className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Modul Keuangan & Manajemen Hutang Santri
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pantau arus kas laundry, kelola pelunasan cicilan santriwati dengan Quick Pay, serta kirim pengingat tagihan otomatis ke kontak WhatsApp wali santri.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsBulkReminderOpen(true)}
            className="flex items-center gap-2 bg-[#128C7E] hover:bg-[#0f7a6e] text-white text-xs font-bold py-2.5 px-4 rounded-2xl shadow-xs transition-all active:scale-[0.98]"
            title="Kirim pengingat tagihan WhatsApp otomatis ke seluruh wali santri yang memiliki tunggakan"
          >
            <MessageCircle className="w-4 h-4 text-emerald-100" />
            Kirim Pengingat WA Massal ({totalSantriWithDebt})
          </button>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold py-2.5 px-4 rounded-2xl shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Catat Pengeluaran
          </button>
        </div>
      </div>

      {/* Top Level Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Santri Debt Highlight Card */}
        <div className="bg-gradient-to-br from-rose-900 to-rose-950 text-white p-5 rounded-3xl shadow-sm relative overflow-hidden border border-rose-800/40">
          <div className="absolute right-3 top-3 w-20 h-20 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-rose-200 font-bold uppercase tracking-wider">Total Piutang / Hutang Santri</span>
              <div className="text-2xl font-black tracking-tight mt-1">{formatRupiah(totalNominalDebt)}</div>
            </div>
            <div className="p-2.5 bg-rose-800/80 rounded-2xl text-rose-200">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-rose-200/90 pt-2 border-t border-rose-800/50">
            <span><strong>{totalSantriWithDebt}</strong> Santriwati Tertunggak</span>
            <span><strong>{totalUnpaidOrdersCount}</strong> Nota Belum Lunas</span>
          </div>
        </div>

        {/* Income Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Pemasukan Kas</span>
              <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">{formatRupiah(totalIncome)}</div>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-2xl text-emerald-800">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-emerald-700 font-medium flex items-center gap-1 pt-2 border-t border-slate-100">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Dari {orders.length} Transaksi Laundry
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Pengeluaran Operasional</span>
              <div className="text-2xl font-black text-rose-700 tracking-tight mt-1">{formatRupiah(totalExpense)}</div>
            </div>
            <div className="p-2.5 bg-rose-50 rounded-2xl text-rose-600">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1 pt-2 border-t border-slate-100">
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
            {expenses.length} Catatan Pembelian Operasional
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Estimasi Laba Bersih</span>
              <div className="text-2xl font-black text-emerald-900 tracking-tight mt-1">{formatRupiah(netProfit)}</div>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-2xl text-emerald-800">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-emerald-800 font-bold flex items-center gap-1 pt-2 border-t border-slate-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Saldo Kas Bersih Siap Pakai
          </div>
        </div>
      </div>

      {/* Main Tabbed Navigation Frame */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Navigation Bar */}
        <div className="p-3 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            
            {/* View: Santri Debt Management */}
            <button
              onClick={() => setActiveTab('DEBT_MANAGEMENT')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                activeTab === 'DEBT_MANAGEMENT' 
                  ? 'bg-rose-700 text-white shadow-xs' 
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Santri Debt Management</span>
              {totalSantriWithDebt > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === 'DEBT_MANAGEMENT' ? 'bg-white text-rose-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {totalSantriWithDebt}
                </span>
              )}
            </button>

            {/* View: Riwayat Pembayaran Hutang */}
            <button
              onClick={() => setActiveTab('DEBT_HISTORY')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'DEBT_HISTORY' 
                  ? 'bg-emerald-800 text-white shadow-xs' 
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Riwayat Cicilan & Pelunasan ({debtPayments.length})</span>
            </button>

            {/* View: Arus Kas */}
            <button
              onClick={() => setActiveTab('CASH_FLOW')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'CASH_FLOW' 
                  ? 'bg-emerald-800 text-white shadow-xs' 
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Arus Kas & Multi-Metode</span>
            </button>

            {/* View: Pemasukan Invoice */}
            <button
              onClick={() => setActiveTab('INCOME')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'INCOME' 
                  ? 'bg-emerald-800 text-white shadow-xs' 
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Pemasukan Invoice</span>
            </button>

            {/* View: Pengeluaran Operasional */}
            <button
              onClick={() => setActiveTab('EXPENSE')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'EXPENSE' 
                  ? 'bg-emerald-800 text-white shadow-xs' 
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>Pengeluaran Operasional ({expenses.length})</span>
            </button>

          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* VIEW: SANTRI DEBT MANAGEMENT                                  */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'DEBT_MANAGEMENT' && (
          <div id="santri-debt-management-view" className="p-5 space-y-5">
            
            {/* View Title & Functional Explanation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-1 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                  Santri Debt Management - Manajemen Piutang & Tagihan Santriwati
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tabel data santriwati yang memiliki sisa tunggakan cucian. Gunakan tombol <strong>Quick Pay</strong> untuk mencatat cicilan/pelunasan dan tombol <strong>Pengingat WA</strong> untuk mengirimkan rincian nota langsung ke wali santri.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-500">Total Piutang Aktif:</span>
                <span className="text-sm font-black text-rose-700 font-mono bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
                  {formatRupiah(totalNominalDebt)}
                </span>
              </div>
            </div>

            {/* Search, Class Filter, and Range Controls */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama santriwati, NIS, nama wali, atau nomor WhatsApp..."
                  value={debtSearchQuery}
                  onChange={(e) => setDebtSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-700"
                />
              </div>

              {/* Class Filter */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-600">Kelas:</span>
                <select
                  value={debtClassFilter}
                  onChange={(e) => setDebtClassFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-emerald-700"
                >
                  <option value="ALL">Semua Kelas ({santriDebtList.length})</option>
                  {availableClasses.map(cls => (
                    <option key={cls} value={cls}>Kelas {cls}</option>
                  ))}
                </select>
              </div>

              {/* Outstanding Debt Range Filter */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-600">Tampilkan:</span>
                <select
                  value={debtRangeFilter}
                  onChange={(e) => setDebtRangeFilter(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-emerald-700"
                >
                  <option value="OUTSTANDING_ONLY">Hanya Yang Berhutang ({totalSantriWithDebt})</option>
                  <option value="ABOVE_50K">Hutang &gt; Rp 50.000</option>
                  <option value="ABOVE_100K">Hutang &gt; Rp 100.000</option>
                  <option value="ALL_STUDENTS">Semua Santriwati (Termasuk Lunas)</option>
                </select>
              </div>

            </div>

            {/* Searchable Data Table of Students */}
            {filteredSantriDebts.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-extrabold text-slate-800 text-sm">Tidak Ada Data Hutang Ditemukan</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Semua santri pada filter ini telah melunasi tagihan laundry atau tidak ada data yang cocok dengan kueri pencarian Anda.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-xs bg-white">
                
                {/* Desktop & Tablet Table View */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Santriwati & NIS</th>
                        <th className="py-3 px-4">Kelas</th>
                        <th className="py-3 px-4">Orang Tua / Wali & Kontak WA</th>
                        <th className="py-3 px-4 text-center">Nota Tertunggak</th>
                        <th className="py-3 px-4 text-right">Sisa Hutang</th>
                        <th className="py-3 px-4 text-center">Aksi Manajemen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSantriDebts.map((item) => {
                        const isExpanded = expandedStudentId === item.customer.id;
                        const isSent = sentReminderIds[item.customer.id];

                        return (
                          <React.Fragment key={item.customer.id}>
                            <tr className={`hover:bg-slate-50/70 transition-colors ${item.hasDebt ? 'bg-white' : 'bg-slate-50/40'}`}>
                              
                              {/* Student Info */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                    item.hasDebt ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {item.customer.name.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-extrabold text-slate-900 text-xs">{item.customer.name}</div>
                                    <div className="font-mono text-[10px] text-slate-400">
                                      NIS: {item.student?.nis || item.customer.id}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Class */}
                              <td className="py-3.5 px-4">
                                <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-black text-[11px]">
                                  Kelas {item.student?.className || '-'}
                                </span>
                              </td>

                              {/* Guardian & WhatsApp Phone */}
                              <td className="py-3.5 px-4">
                                <div>
                                  <div className="font-bold text-slate-800">{item.student?.guardianName || '-'}</div>
                                  <div className="font-mono text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                    <Phone className="w-3 h-3 text-emerald-700" />
                                    {item.student?.guardianPhone || item.customer.phone}
                                  </div>
                                </div>
                              </td>

                              {/* Unpaid Orders Count */}
                              <td className="py-3.5 px-4 text-center">
                                {item.unpaidOrders.length > 0 ? (
                                  <button
                                    onClick={() => setExpandedStudentId(isExpanded ? null : item.customer.id)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-extrabold text-[11px] hover:bg-rose-100 transition-colors"
                                    title="Klik untuk melihat rincian nomor invoice"
                                  >
                                    <span>{item.unpaidOrders.length} Nota</span>
                                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-emerald-700 font-semibold">0 Nota</span>
                                )}
                              </td>

                              {/* Total Outstanding Balance */}
                              <td className="py-3.5 px-4 text-right font-mono">
                                <div className={`font-black text-sm ${item.hasDebt ? 'text-rose-700' : 'text-emerald-800'}`}>
                                  {item.hasDebt ? formatRupiah(item.totalDebt) : 'Rp 0 (Lunas)'}
                                </div>
                                {item.hasDebt && item.payments.length > 0 && (
                                  <div className="text-[10px] text-emerald-800 font-semibold">
                                    Telah dicicil: {formatRupiah(item.payments.reduce((s, p) => s + p.amount, 0))}
                                  </div>
                                )}
                              </td>

                              {/* Action Buttons: Quick Pay & Automated WhatsApp Reminder */}
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  
                                  {/* Quick Pay Action Button */}
                                  {item.hasDebt ? (
                                    <button
                                      onClick={() => handleOpenQuickPayModal(item.customer, item.totalDebt)}
                                      className="flex items-center gap-1 bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-black py-1.5 px-3 rounded-xl shadow-xs transition-all active:scale-[0.98]"
                                      title="Catat cicilan pembayaran atau pelunasan tagihan"
                                    >
                                      <CreditCard className="w-3.5 h-3.5" />
                                      <span>Quick Pay</span>
                                    </button>
                                  ) : (
                                    <span className="text-[11px] text-slate-400 italic">Sudah Lunas</span>
                                  )}

                                  {/* Automated WhatsApp Reminder Trigger */}
                                  {item.hasDebt && (
                                    <button
                                      onClick={() => handleSendWhatsAppReminder(item)}
                                      className={`flex items-center gap-1 text-[11px] font-bold py-1.5 px-2.5 rounded-xl border transition-all active:scale-[0.98] ${
                                        isSent 
                                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                                          : 'bg-[#128C7E] hover:bg-[#0f7a6e] text-white border-transparent'
                                      }`}
                                      title="Kirim pengingat WhatsApp otomatis berisi rincian nota & no rekening ke wali santri"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                      <span>{isSent ? 'Terkirim ✓' : 'Pengingat WA'}</span>
                                    </button>
                                  )}

                                  {/* Expand/Collapse Breakdown */}
                                  <button
                                    onClick={() => setExpandedStudentId(isExpanded ? null : item.customer.id)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors"
                                    title="Lihat detail nota & riwayat kuitansi"
                                  >
                                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>

                                </div>
                              </td>

                            </tr>

                            {/* Expandable Breakdown Drawer inside table */}
                            {isExpanded && (
                              <tr className="bg-slate-50/90 border-b border-slate-200">
                                <td colSpan={6} className="p-4">
                                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
                                    
                                    {/* Unpaid Orders Section */}
                                    <div>
                                      <div className="text-[11px] font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                                        <span>Rincian Nota Cucian Belum Terbayar ({item.unpaidOrders.length})</span>
                                        {item.unpaidOrders.length > 0 && (
                                          <button
                                            onClick={() => handleOpenQuickPayModal(item.customer, item.totalDebt)}
                                            className="text-emerald-800 hover:underline font-extrabold text-[11px] flex items-center gap-1"
                                          >
                                            <CreditCard className="w-3 h-3" />
                                            Lunasi Semua Sekaligus ({formatRupiah(item.totalDebt)})
                                          </button>
                                        )}
                                      </div>

                                      {item.unpaidOrders.length === 0 ? (
                                        <div className="text-xs text-slate-500 p-2 text-center bg-slate-50 rounded-xl">
                                          Tidak ada nota yang belum terbayar saat ini.
                                        </div>
                                      ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                          {item.unpaidOrders.map(ord => {
                                            const paid = ord.paidAmount || 0;
                                            const remaining = Math.max(0, ord.grandTotal - paid);

                                            return (
                                              <div key={ord.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                                                <div>
                                                  <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                                                    <span className="font-mono">{ord.id}</span>
                                                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                                      ord.paymentStatus === 'DP' ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-800'
                                                    }`}>
                                                      {ord.paymentStatus}
                                                    </span>
                                                  </div>
                                                  <div className="text-[10px] text-slate-500 mt-0.5">
                                                    {ord.orderDate.slice(0, 10)} • {ord.totalWeightKg} Kg ({ord.items.length} layanan)
                                                  </div>
                                                </div>

                                                <div className="text-right">
                                                  <div className="font-black text-rose-700 font-mono">{formatRupiah(remaining)}</div>
                                                  <div className="text-[10px] text-slate-400 font-mono">Total: {formatRupiah(ord.grandTotal)}</div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>

                                    {/* Previous Payment History for this Student */}
                                    {item.payments.length > 0 && (
                                      <div className="pt-2 border-t border-slate-100">
                                        <div className="text-[11px] font-black text-slate-700 uppercase tracking-wider mb-2">
                                          Riwayat Pembayaran Cicilan Sebelumnya ({item.payments.length})
                                        </div>
                                        <div className="space-y-1.5">
                                          {item.payments.map(p => (
                                            <div key={p.id} className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                                              <div className="flex items-center gap-2">
                                                <Receipt className="w-3.5 h-3.5 text-emerald-800" />
                                                <div>
                                                  <span className="font-mono font-bold text-slate-900">{p.receiptNumber}</span>
                                                  <span className="text-[10px] text-slate-500 ml-2">{p.paymentDate} • Metode: {p.paymentMethod.replace('_', ' ')}</span>
                                                </div>
                                              </div>

                                              <div className="flex items-center gap-3">
                                                <span className="font-mono font-black text-emerald-900">+{formatRupiah(p.amount)}</span>
                                                <button
                                                  onClick={() => setViewingReceiptPayment(p)}
                                                  className="text-[11px] font-bold text-emerald-800 hover:underline"
                                                >
                                                  Lihat Kuitansi
                                                </button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW: RIWAYAT PEMBAYARAN HUTANG                              */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'DEBT_HISTORY' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Riwayat Pembayaran Cicilan & Pelunasan</h4>
                <p className="text-xs text-slate-500">Daftar seluruh kuitansi pelunasan hutang santriwati yang telah dicatat oleh kasir.</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">Total Terkumpul:</span>
                <div className="text-base font-black text-emerald-900 font-mono">{formatRupiah(totalCollectedDebtThisMonth)}</div>
              </div>
            </div>

            {debtPayments.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                Belum ada riwayat pembayaran hutang santri.
              </div>
            ) : (
              <div className="space-y-2">
                {debtPayments.map(p => (
                  <div key={p.id} className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs shrink-0">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h5 className="font-extrabold text-xs text-slate-900">{p.studentName}</h5>
                          <span className="px-2 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Kelas {p.className || '-'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {p.receiptNumber} • {p.paymentDate} • Metode: {p.paymentMethod.replace('_', ' ')}
                        </div>
                        {p.notes && <div className="text-[11px] text-slate-600">{p.notes}</div>}
                        <div className="text-[10px] text-slate-400">Kasir: {p.staffName} • Wali: {p.guardianName || '-'} ({p.guardianPhone || '-'})</div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                      <div className="font-mono font-black text-sm text-emerald-800">+{formatRupiah(p.amount)}</div>
                      <button
                        onClick={() => setViewingReceiptPayment(p)}
                        className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-white px-2.5 py-1 rounded-lg border border-slate-200"
                      >
                        <Printer className="w-3 h-3" />
                        Cetak Kuitansi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW: ARUS KAS & MULTI-METODE                                 */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'CASH_FLOW' && (
          <div className="p-5 space-y-6">
            <div className="space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-800" />
                Rincian Arus Kas Berdasarkan Saluran Pembayaran
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[11px] font-bold text-slate-500">Tunai / Kasir</span>
                  <div className="font-extrabold text-sm text-slate-900 mt-1 font-mono">{formatRupiah(methodBreakdown.TUNAI)}</div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[11px] font-bold text-slate-500">QRIS Almawaddah</span>
                  <div className="font-extrabold text-sm text-slate-900 mt-1 font-mono">{formatRupiah(methodBreakdown.QRIS)}</div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[11px] font-bold text-slate-500">Transfer Bank BSI</span>
                  <div className="font-extrabold text-sm text-slate-900 mt-1 font-mono">{formatRupiah(methodBreakdown.TRANSFER_BANK)}</div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[11px] font-bold text-slate-500">Kuota Paket Santri</span>
                  <div className="font-extrabold text-sm text-slate-900 mt-1 font-mono">{formatRupiah(methodBreakdown.KUOTA_PAKET)}</div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[11px] font-bold text-slate-500">Saldo Deposit Warga</span>
                  <div className="font-extrabold text-sm text-slate-900 mt-1 font-mono">{formatRupiah(methodBreakdown.SALDO_MEMBER)}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW: PEMASUKAN INVOICE                                       */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'INCOME' && (
          <div className="p-5 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-700 tracking-wider uppercase">Pemasukan Transaksi Terkini</h4>
            <div className="space-y-2">
              {orders.slice(0, 15).map(ord => (
                <div key={ord.id} className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs">
                      {ord.paymentMethod}
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-900">{ord.id} - {ord.customerName}</h5>
                      <span className="text-[10px] text-slate-400 font-mono">{ord.orderDate} • {ord.totalWeightKg} Kg ({ord.totalPieces} pcs)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-extrabold text-sm text-emerald-800">+{formatRupiah(ord.grandTotal)}</span>
                    <div className="text-[10px] text-slate-500 font-medium">{ord.paymentStatus}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW: PENGELUARAN OPERASIONAL                                 */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'EXPENSE' && (
          <div className="p-5 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-700 tracking-wider uppercase">Daftar Pengeluaran Operasional ({expenses.length})</h4>
            <div className="space-y-2">
              {expenses.map(exp => (
                <div key={exp.id} className="flex items-center justify-between p-3.5 bg-rose-50/50 hover:bg-rose-50 rounded-2xl border border-rose-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl font-bold text-xs">
                      {exp.category}
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-900">{exp.title}</h5>
                      <span className="text-[10px] text-slate-400 font-mono">Penerima: {exp.recipient} • Disetujui: {exp.authorizedBy} • {exp.date}</span>
                      {exp.notes && <p className="text-[11px] text-slate-600 mt-0.5">{exp.notes}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-extrabold text-sm text-rose-700">-{formatRupiah(exp.amount)}</span>
                  </div>
                </div>
              ))}

              {expenses.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">Belum ada catatan pengeluaran.</div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ============================================================= */}
      {/* MODAL 1: QUICK PAY / INSTALLMENT PAYMENT                      */}
      {/* ============================================================= */}
      {payingStudent && (
        <div id="santri-debt-payment-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            
            {/* Header */}
            <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-200" />
                <div>
                  <h3 className="font-extrabold text-sm">Quick Pay - Catat Pembayaran & Pelunasan</h3>
                  <p className="text-[11px] text-emerald-200/80">Cicilan atau pelunasan sisa tagihan laundry santriwati</p>
                </div>
              </div>
              <button
                onClick={() => setPayingStudent(null)}
                className="p-1.5 rounded-xl bg-emerald-700/60 hover:bg-emerald-700 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleProcessDebtPayment} className="p-6 space-y-4">
              
              {/* Student Summary Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-sm text-slate-900">{payingStudent.name}</h4>
                    <div className="text-xs text-slate-500 font-mono">
                      NIS: {payingStudent.student?.nis || payingStudent.id} • Kelas {payingStudent.student?.className || '-'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Total Hutang:</span>
                    <div className="text-base font-black text-rose-700 font-mono">
                      {formatRupiah(santriDebtList.find(s => s.customer.id === payingStudent.id)?.totalDebt || 0)}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                  <span>Wali: <strong>{payingStudent.student?.guardianName || '-'}</strong></span>
                  <span className="font-mono text-[11px]">{payingStudent.student?.guardianPhone || payingStudent.phone}</span>
                </div>
              </div>

              {/* Quick Amount Presets */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Pilihan Cepat Nominal Bayar:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const curDebt = santriDebtList.find(s => s.customer.id === payingStudent.id)?.totalDebt || 0;
                      setPayAmount(curDebt);
                    }}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-black transition-colors"
                  >
                    Bayar Lunas
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayAmount(20000)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    Rp 20.000
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayAmount(50000)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    Rp 50.000
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayAmount(100000)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    Rp 100.000
                  </button>
                </div>
              </div>

              {/* Nominal Input */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nominal Pembayaran (Rp) *</label>
                <input
                  type="number"
                  required
                  min={1000}
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black text-slate-900 focus:outline-none focus:border-emerald-700 font-mono"
                />
                
                {/* Remaining Debt Calculation */}
                {payingStudent && (
                  <div className="mt-1.5 flex items-center justify-between text-xs px-1">
                    <span className="text-slate-500">Estimasi Sisa Hutang:</span>
                    <span className="font-extrabold text-slate-900 font-mono">
                      {formatRupiah(Math.max(0, (santriDebtList.find(s => s.customer.id === payingStudent.id)?.totalDebt || 0) - payAmount))}
                    </span>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Metode Pembayaran *</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-700"
                >
                  <option value="TUNAI">💵 Tunai / Kasir Laundry</option>
                  <option value="QRIS">📱 QRIS Almawaddah</option>
                  <option value="TRANSFER_BANK">🏦 Transfer Bank Syariah Indonesia (BSI)</option>
                  <option value="KUOTA_PAKET">📦 Kuota Paket Santri</option>
                  <option value="SALDO_MEMBER">💳 Saldo Member</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Catatan / Keterangan</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="Contoh: Titipan orang tua via transfer / uang saku"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-700"
                />
              </div>

              {/* Checkbox: Auto Send WhatsApp Confirmation */}
              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSendWaReceipt}
                  onChange={(e) => setAutoSendWaReceipt(e.target.checked)}
                  className="w-4 h-4 text-emerald-800 rounded focus:ring-0"
                />
                <div className="text-xs">
                  <span className="font-bold text-emerald-950 block">Kirim Kuitansi Pelunasan ke WhatsApp Wali</span>
                  <span className="text-[11px] text-emerald-800">Kirim format rincian pelunasan resmi ke {payingStudent.student?.guardianPhone || payingStudent.phone}</span>
                </div>
              </label>

              {/* Actions */}
              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setPayingStudent(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black py-2.5 rounded-xl shadow-xs transition-all active:scale-[0.98]"
                >
                  <Save className="w-4 h-4" />
                  Simpan Pembayaran & Lunasi
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 2: KUITANSI PELUNASAN MODAL                             */}
      {/* ============================================================= */}
      {viewingReceiptPayment && (
        <div id="debt-receipt-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 p-6 space-y-4">
            
            {/* Printable Area Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300 space-y-1">
              <h3 className="font-black text-base text-slate-900 tracking-tight uppercase">LAUNDRY ALMAWADDAH</h3>
              <p className="text-[10px] text-slate-500">Pondok Pesantren Putri Al-Mawaddah • Ponorogo</p>
              <div className="inline-block bg-emerald-100 text-emerald-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full mt-1">
                TANDA TERIMA PELUNASAN HUTANG
              </div>
            </div>

            {/* Receipt Details */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Kuitansi:</span>
                <span className="font-mono font-bold text-slate-900">{viewingReceiptPayment.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal:</span>
                <span className="font-bold text-slate-900">{viewingReceiptPayment.paymentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Santri:</span>
                <span className="font-bold text-slate-900">{viewingReceiptPayment.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">NIS / Kelas:</span>
                <span className="font-bold text-slate-900">{viewingReceiptPayment.nis} • Kelas {viewingReceiptPayment.className || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Wali Santri:</span>
                <span className="font-bold text-slate-900">{viewingReceiptPayment.guardianName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Metode Bayar:</span>
                <span className="font-bold text-slate-900">{viewingReceiptPayment.paymentMethod.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kasir Penerima:</span>
                <span className="font-bold text-slate-900">{viewingReceiptPayment.staffName}</span>
              </div>
            </div>

            {/* Amount Box */}
            <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 text-center">
              <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Jumlah Dibayarkan</span>
              <div className="text-xl font-black text-emerald-950 mt-0.5 font-mono">{formatRupiah(viewingReceiptPayment.amount)}</div>
              {viewingReceiptPayment.notes && (
                <div className="text-[10px] text-emerald-800 mt-1 italic">"{viewingReceiptPayment.notes}"</div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setViewingReceiptPayment(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs py-2.5 rounded-xl"
              >
                <Printer className="w-4 h-4" />
                Cetak Struk
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 3: BULK WHATSAPP REMINDER MODAL                         */}
      {/* ============================================================= */}
      {isBulkReminderOpen && (
        <div id="bulk-reminder-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="bg-[#128C7E] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-5 h-5 text-emerald-100" />
                <div>
                  <h3 className="font-extrabold text-sm">Pengingat Tagihan WhatsApp Massal</h3>
                  <p className="text-[11px] text-emerald-100/80">Kirim tagihan ke wali santri yang memiliki tunggakan</p>
                </div>
              </div>
              <button
                onClick={() => setIsBulkReminderOpen(false)}
                className="p-1.5 rounded-xl bg-black/10 hover:bg-black/20 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content List */}
            <div className="p-6 space-y-3 overflow-y-auto flex-1">
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                <span>Ditemukan <strong>{santriDebtList.filter(s => s.hasDebt).length}</strong> santriwati dengan tunggakan.</span>
                <span className="font-extrabold text-rose-700 font-mono">Total Piutang: {formatRupiah(totalNominalDebt)}</span>
              </div>

              <div className="space-y-2">
                {santriDebtList.filter(s => s.hasDebt).map((santriItem, idx) => {
                  const isSent = sentReminderIds[santriItem.customer.id];

                  return (
                    <div key={santriItem.customer.id} className="p-3.5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-500 shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-extrabold text-slate-900">{santriItem.customer.name} (Kelas {santriItem.student?.className || '-'})</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Wali: {santriItem.student?.guardianName || '-'} • {santriItem.student?.guardianPhone || santriItem.customer.phone}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-black text-rose-700 font-mono">{formatRupiah(santriItem.totalDebt)}</div>
                          <div className="text-[10px] text-slate-400">{santriItem.unpaidOrders.length} Nota</div>
                        </div>

                        <button
                          onClick={() => handleSendWhatsAppReminder(santriItem)}
                          className={`flex items-center gap-1.5 text-xs font-bold py-1.5 px-3 rounded-xl transition-all ${
                            isSent 
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                              : 'bg-[#128C7E] hover:bg-[#0f7a6e] text-white'
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSent ? 'Terkirim ✓' : 'Kirim WA'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500">
                Pesan akan otomatis membuka chat WhatsApp resmi dengan rincian nota & no rekening BSI.
              </span>
              <button
                onClick={() => setIsBulkReminderOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold"
              >
                Selesai
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 4: RECORD EXPENSE MODAL                                 */}
      {/* ============================================================= */}
      {isExpenseModalOpen && (
        <div id="expense-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-rose-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Catat Pengeluaran Operasional</h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1.5 rounded-xl bg-rose-800 hover:bg-rose-700 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Kategori Pengeluaran *</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                >
                  <option value="DETERJEN">Deterjen Laundry Eco-Wash</option>
                  <option value="PEWANGI">Parfum & Pelembut Pakaian</option>
                  <option value="PLASTIK_PACKING">Plastik & Tas Spunbond Packing</option>
                  <option value="LISTRIK">Token Listrik Mesin Laundry</option>
                  <option value="AIR">Air PDAM & Filter Bersih</option>
                  <option value="PERAWATAN_MESIN">Servis / Sparepart Mesin</option>
                  <option value="TRANSPORTASI">Bensin Kurir Antar-Jemput</option>
                  <option value="GAJI">Gaji & Insentif Karyawan</option>
                  <option value="LAINNYA">Lain-lain</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Judul / Deskripsi Pembelian *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beli 2 Jerigen Deterjen Cair 20L"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nominal Biaya (Rp) *</label>
                <input
                  type="number"
                  required
                  min={1000}
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Toko / Penerima Dana</label>
                  <input
                    type="text"
                    value={expenseRecipient}
                    onChange={(e) => setExpenseRecipient(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Catatan Tambahan</label>
                  <input
                    type="text"
                    value={expenseNotes}
                    onChange={(e) => setExpenseNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Simpan Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
