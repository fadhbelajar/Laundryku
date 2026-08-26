import React, { useMemo } from 'react';
import { 
  DollarSign, 
  Package, 
  Users, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  Plus, 
  QrCode, 
  Truck, 
  Building, 
  ArrowRight, 
  ArrowUpRight, 
  Layers,
  ShoppingBag,
  Tag,
  AlertCircle
} from 'lucide-react';
import { LaundryOrder, Customer } from '../../types';
import { StorageService, formatRupiah, STATUS_METADATA, ORDER_STATUS_WORKFLOW } from '../../data/storage';

interface SuperAdminDashboardProps {
  onOpenNewTransaction: () => void;
  onOpenScanner: () => void;
  onSelectOrder: (order: LaundryOrder) => void;
  onNavigateTab: (tab: any) => void;
  onOpenReceipt: (order: LaundryOrder) => void;
  onOpenBagLabel: (order: LaundryOrder) => void;
  onOpenWhatsApp: (order: LaundryOrder) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  onOpenNewTransaction,
  onOpenScanner,
  onSelectOrder,
  onNavigateTab,
  onOpenReceipt,
  onOpenBagLabel,
  onOpenWhatsApp
}) => {
  const orders = StorageService.getOrders();
  const customers = StorageService.getCustomers();
  const expenses = StorageService.getExpenses();
  const currentStaff = StorageService.getCurrentStaff();

  // Metrics
  const activeOrders = useMemo(() => orders.filter(o => o.currentStatus !== 'SELESAI'), [orders]);
  const readyOrders = useMemo(() => orders.filter(o => ['SIAP_DIAMBIL', 'DALAM_PENGIRIMAN'].includes(o.currentStatus)), [orders]);
  const totalRevenue = useMemo(() => orders.reduce((acc, o) => acc + o.grandTotal, 0), [orders]);
  const totalWeightKg = useMemo(() => orders.reduce((acc, o) => acc + o.totalWeightKg, 0), [orders]);

  // Status distribution
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(o => {
      counts[o.currentStatus] = (counts[o.currentStatus] || 0) + 1;
    });
    return counts;
  }, [orders]);

  // Customer segment distribution
  const segmentStats = useMemo(() => {
    const santri = orders.filter(o => o.customerType === 'SANTRIWATI');
    const warga = orders.filter(o => o.customerType === 'WARGA_PESANTREN');
    const umum = orders.filter(o => o.customerType === 'MASYARAKAT_UMUM');
    return {
      santriCount: santri.length,
      santriRev: santri.reduce((a, o) => a + o.grandTotal, 0),
      wargaCount: warga.length,
      wargaRev: warga.reduce((a, o) => a + o.grandTotal, 0),
      umumCount: umum.length,
      umumRev: umum.reduce((a, o) => a + o.grandTotal, 0)
    };
  }, [orders]);

  return (
    <div id="super-admin-dashboard-view" className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#020617] via-slate-900 to-emerald-950 text-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-900/40 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sistem Operasional Laundry Terpadu Almawaddah</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white">
            Selamat Datang, {currentStaff.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
            Memantau antrian laundry santriwati pondok, asatidz/warga pesantren, dan masyarakat umum secara real-time.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 z-10 shrink-0">
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-xs text-slate-200 text-xs sm:text-sm font-bold py-3 px-4 rounded-2xl border border-slate-700/60 transition-all active:scale-[0.98]"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            Scan QR
          </button>

          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-black py-3 px-5 rounded-2xl shadow-lg shadow-amber-950/50 border border-amber-500/30 transition-all active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            + TRANSAKSI BARU
          </button>
        </div>

        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Main Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-slate-800/40 p-4 sm:p-5 rounded-xl border border-slate-700/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pendapatan Omzet</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-950/50 border border-emerald-800/40 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{formatRupiah(totalRevenue)}</div>
          <span className="text-[10px] text-emerald-500/90 font-medium block flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Dari {orders.length} Transaksi Terdata
          </span>
        </div>

        {/* Active Washing Queue */}
        <div className="bg-slate-800/40 p-4 sm:p-5 rounded-xl border border-slate-700/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status Diproses</span>
            <div className="w-8 h-8 rounded-xl bg-amber-950/50 border border-amber-800/40 text-amber-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-400">{activeOrders.length} <span className="text-xs font-normal text-slate-500">Antrian</span></div>
          <div className="w-full bg-slate-700/60 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-amber-500 h-full w-2/3"></div>
          </div>
        </div>

        {/* Ready to Pickup / Deliver */}
        <div className="bg-slate-800/40 p-4 sm:p-5 rounded-xl border border-slate-700/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Siap Ambil / Kirim</span>
            <div className="w-8 h-8 rounded-xl bg-blue-950/50 border border-blue-800/40 text-blue-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-400">{readyOrders.length} <span className="text-xs font-normal text-slate-500">Paket</span></div>
          <span className="text-[10px] text-slate-400 block">
            Menunggu serah terima / kurir distribusi
          </span>
        </div>

        {/* Total Customers */}
        <div className="bg-slate-800/40 p-4 sm:p-5 rounded-xl border border-slate-700/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Pesanan</span>
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{orders.length} <span className="text-xs font-normal text-slate-500">Invoice</span></div>
          <div className="flex gap-1.5 pt-1">
            <span className="text-[9px] bg-emerald-950/60 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/50">{segmentStats.santriCount} Santri</span>
            <span className="text-[9px] bg-blue-950/60 text-blue-400 px-2 py-0.5 rounded border border-blue-800/50">{segmentStats.wargaCount} Warga</span>
            <span className="text-[9px] bg-amber-950/60 text-amber-400 px-2 py-0.5 rounded border border-amber-800/50">{segmentStats.umumCount} Umum</span>
          </div>
        </div>

      </div>

      {/* 3 Pillars Customer Segmentation Widget */}
      <div className="bg-slate-800/20 p-6 rounded-2xl border border-slate-700/50 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Performa 3 Kategori Pelanggan Almawaddah
            </h3>
            <p className="text-xs text-slate-400">Integrasi operasional terpadu dengan tarif dan alur spesifik.</p>
          </div>
          <button
            onClick={() => onNavigateTab('CUSTOMERS')}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            Lihat Database <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Santriwati */}
          <div 
            onClick={() => onNavigateTab('DORMITORY')}
            className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-800/40 hover:border-emerald-500/60 cursor-pointer transition-all space-y-2"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                👧 Santriwati Pondok
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                {segmentStats.santriCount} Order
              </span>
            </div>
            <div className="text-lg font-bold text-emerald-400">{formatRupiah(segmentStats.santriRev)}</div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Distribusi per Asrama, Gedung & Kamar. Mendukung kuota paket kiloan bulanan.
            </p>
          </div>

          {/* Warga Pesantren */}
          <div 
            onClick={() => onNavigateTab('CUSTOMERS')}
            className="bg-blue-950/20 p-4 rounded-xl border border-blue-800/40 hover:border-blue-500/60 cursor-pointer transition-all space-y-2"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                🕌 Warga Pesantren
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50">
                {segmentStats.wargaCount} Order
              </span>
            </div>
            <div className="text-lg font-bold text-blue-400">{formatRupiah(segmentStats.wargaRev)}</div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Asatidz, Guru, Pengasuh & Karyawan. Tier membership diskon & delivery kompleks.
            </p>
          </div>

          {/* Masyarakat Umum */}
          <div 
            onClick={() => onNavigateTab('CUSTOMERS')}
            className="bg-amber-950/20 p-4 rounded-xl border border-amber-800/40 hover:border-amber-500/60 cursor-pointer transition-all space-y-2"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                👥 Masyarakat Umum
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 border border-amber-700/50">
                {segmentStats.umumCount} Order
              </span>
            </div>
            <div className="text-lg font-bold text-amber-400">{formatRupiah(segmentStats.umumRev)}</div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Pelanggan umum luar pesantren dengan program poin loyalitas dan jemput antar.
            </p>
          </div>

        </div>
      </div>

      {/* 13-Step Workflow Pipeline Status Monitor */}
      <div className="bg-slate-800/20 p-6 rounded-2xl border border-slate-700/50 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Monitoring Pipa 13 Tahap Operasional Laundry
            </h3>
            <p className="text-xs text-slate-400">Jumlah cucian yang sedang berada pada masing-masing pos pengerjaan.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {ORDER_STATUS_WORKFLOW.slice(0, 7).map((statusKey, idx) => {
            const meta = STATUS_METADATA[statusKey];
            const count = statusCounts[statusKey] || 0;
            return (
              <div key={statusKey} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block">{idx + 1}. Pos Pengerjaan</span>
                <span className="text-xs font-bold text-slate-300 block truncate">{meta.label}</span>
                <span className="text-base font-bold text-emerald-400">{count} Order</span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {ORDER_STATUS_WORKFLOW.slice(7).map((statusKey, idx) => {
            const meta = STATUS_METADATA[statusKey];
            const count = statusCounts[statusKey] || 0;
            return (
              <div key={statusKey} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block">{idx + 8}. Pos Pengerjaan</span>
                <span className="text-xs font-bold text-slate-300 block truncate">{meta.label}</span>
                <span className="text-base font-bold text-emerald-400">{count} Order</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders List with Direct Actions */}
      <div className="bg-slate-800/20 rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Laundry Masuk Terbaru
            </h3>
            <p className="text-xs text-slate-400">Antrian cucian paling mutakhir dalam sistem.</p>
          </div>
          <button
            onClick={() => onNavigateTab('ORDERS')}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            Lihat Semua Antrian <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/60">
          {orders.slice(0, 5).map(order => {
            const statusMeta = STATUS_METADATA[order.currentStatus];
            return (
              <div 
                key={order.id} 
                className="p-4 hover:bg-slate-800/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                    {order.customerName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectOrder(order)}
                        className="font-mono font-bold text-xs text-emerald-400 hover:underline"
                      >
                        {order.id}
                      </button>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {order.customerType.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="font-bold text-slate-200 text-sm">{order.customerName}</div>
                    <div className="text-[11px] text-slate-400">
                      {order.totalWeightKg > 0 ? `${order.totalWeightKg} Kg • ` : ''}
                      {order.items.map(i => i.serviceName).join(', ')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div className="text-left sm:text-right">
                    <div className="font-bold text-slate-100">{formatRupiah(order.grandTotal)}</div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${statusMeta.badgeClass}`}>
                      {statusMeta.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenReceipt(order)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      title="Cetak Nota"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenWhatsApp(order)}
                      className="p-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/50 transition-colors"
                      title="WhatsApp"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSelectOrder(order)}
                      className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                      title="Detail"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
