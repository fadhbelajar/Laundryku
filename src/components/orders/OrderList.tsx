import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  QrCode, 
  Printer, 
  MessageCircle, 
  Tag, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  MoreVertical,
  Calendar,
  Layers,
  MapPin
} from 'lucide-react';
import { LaundryOrder, CustomerType, OrderStatus } from '../../types';
import { StorageService, STATUS_METADATA, formatRupiah, ORDER_STATUS_WORKFLOW } from '../../data/storage';

interface OrderListProps {
  onOpenNewTransaction: () => void;
  onOpenScanner: () => void;
  onSelectOrder: (order: LaundryOrder) => void;
  onOpenReceipt: (order: LaundryOrder) => void;
  onOpenBagLabel: (order: LaundryOrder) => void;
  onOpenWhatsApp: (order: LaundryOrder) => void;
  onOpenStatusModal: (order: LaundryOrder) => void;
  onOpenQcModal: (order: LaundryOrder) => void;
}

export const OrderList: React.FC<OrderListProps> = ({
  onOpenNewTransaction,
  onOpenScanner,
  onSelectOrder,
  onOpenReceipt,
  onOpenBagLabel,
  onOpenWhatsApp,
  onOpenStatusModal,
  onOpenQcModal
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | CustomerType>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<LaundryOrder[]>(StorageService.getOrders());

  const refreshOrders = () => {
    setOrders(StorageService.getOrders());
  };

  React.useEffect(() => {
    const handleStorageUpdate = () => refreshOrders();
    window.addEventListener('almawaddah_storage_updated', handleStorageUpdate);
    return () => window.removeEventListener('almawaddah_storage_updated', handleStorageUpdate);
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Tab filter
      if (activeTab !== 'ALL' && order.customerType !== activeTab) return false;
      // Status filter
      if (statusFilter !== 'ALL' && order.currentStatus !== statusFilter) return false;
      // Search
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchPhone = order.customerPhone.includes(q);
      const matchClass = order.studentDormInfo?.className?.toLowerCase().includes(q);
      const matchGuardian = order.studentDormInfo?.guardianName?.toLowerCase().includes(q);
      return matchId || matchName || matchPhone || matchClass || matchGuardian;
    });
  }, [orders, activeTab, statusFilter, searchQuery]);

  return (
    <div id="order-list-view" className="space-y-6">
      
      {/* Top Action & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-700" />
            Manajemen Transaksi & Antrian Laundry
          </h2>
          <p className="text-xs text-slate-500">
            Total {orders.length} transaksi tercatat dalam sistem terintegrasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-2.5 px-3.5 rounded-2xl transition-colors"
            title="Scan QR Code"
          >
            <QrCode className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline">Scan QR</span>
          </button>

          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-2xl shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Transaksi Baru (POS)
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Header */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ALL'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Pelanggan ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('SANTRIWATI')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'SANTRIWATI'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              👧 Santriwati ({orders.filter(o => o.customerType === 'SANTRIWATI').length})
            </button>
            <button
              onClick={() => setActiveTab('WARGA_PESANTREN')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'WARGA_PESANTREN'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🕌 Warga Pesantren ({orders.filter(o => o.customerType === 'WARGA_PESANTREN').length})
            </button>
            <button
              onClick={() => setActiveTab('MASYARAKAT_UMUM')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'MASYARAKAT_UMUM'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              👥 Masyarakat Umum ({orders.filter(o => o.customerType === 'MASYARAKAT_UMUM').length})
            </button>
          </div>

          {/* Status Dropdown Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-emerald-600"
            >
              <option value="ALL">Semua Status (13 Tahap)</option>
              {ORDER_STATUS_WORKFLOW.map(st => (
                <option key={st} value={st}>{STATUS_METADATA[st].label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor invoice (INV-...), nama santri/pelanggan, kamar asrama, atau nomor WhatsApp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
          />
        </div>

      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">No. Invoice & Tanggal</th>
                <th className="p-4">Pelanggan & Kategori</th>
                <th className="p-4">Layanan & Berat</th>
                <th className="p-4">Total & Pembayaran</th>
                <th className="p-4">Status Pengerjaan</th>
                <th className="p-4 text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map(order => {
                const statusMeta = STATUS_METADATA[order.currentStatus];
                return (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Invoice & Date */}
                    <td className="p-4">
                      <button
                        onClick={() => onSelectOrder(order)}
                        className="font-bold text-xs text-emerald-900 hover:text-emerald-700 font-mono block text-left"
                      >
                        {order.id}
                      </button>
                      <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                        {order.orderDate}
                      </span>
                      <span className={`inline-block text-[9px] font-semibold px-1.5 py-0.2 rounded mt-1 ${
                        order.transactionMode === 'PICKUP_DELIVERY' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {order.transactionMode === 'PICKUP_DELIVERY' ? '🚚 Pickup/Antar' : '🏪 Drop Off'}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="p-4">
                      <div className="font-extrabold text-slate-900 text-xs">{order.customerName}</div>
                      
                      {order.studentDormInfo ? (
                        <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>Kelas {order.studentDormInfo.className || '-'} • Wali: {order.studentDormInfo.guardianName || '-'}</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-500">{order.customerPhone}</div>
                      )}

                      <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full mt-1 ${
                        order.customerType === 'SANTRIWATI' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : order.customerType === 'WARGA_PESANTREN'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {order.customerType.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Services */}
                    <td className="p-4 space-y-0.5">
                      <div className="font-bold text-slate-800">
                        {order.totalWeightKg > 0 ? `${order.totalWeightKg} Kg` : ''} 
                        {order.totalPieces > 0 ? ` (${order.totalPieces} Pcs)` : ''}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        {order.items.map(i => i.serviceName).join(', ')}
                      </div>
                      {order.perfumeOption && (
                        <div className="text-[10px] text-emerald-700 italic">
                          🌸 {order.perfumeOption.split('(')[0]}
                        </div>
                      )}
                    </td>

                    {/* Price & Payment */}
                    <td className="p-4 space-y-1">
                      <div className="font-extrabold text-xs text-slate-900">
                        {formatRupiah(order.grandTotal)}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          order.paymentStatus === 'LUNAS' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.paymentStatus}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {order.paymentMethod.replace('_', ' ')}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <button
                        onClick={() => onOpenStatusModal(order)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all hover:scale-105 ${statusMeta.badgeClass}`}
                        title="Klik untuk ubah status"
                      >
                        {statusMeta.label}
                      </button>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Est: {order.estimatedCompletionDate.split(' ')[0]}
                      </span>
                    </td>

                    {/* Quick Action Icons */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenReceipt(order)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Cetak Nota Kasir"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenBagLabel(order)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Label Kantong / Basket"
                        >
                          <Tag className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenWhatsApp(order)}
                          className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                          title="Kirim Update WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectOrder(order)}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                          title="Detail Lengkap"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-slate-400">
                    Tidak ada transaksi yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
