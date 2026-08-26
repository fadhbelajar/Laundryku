import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  QrCode, 
  Search, 
  Package, 
  Truck, 
  Tag, 
  Sparkles, 
  Building, 
  ArrowRight, 
  RefreshCw,
  Phone,
  ShieldAlert
} from 'lucide-react';
import { LaundryOrder } from '../../types';
import { StorageService, STATUS_METADATA, formatRupiah } from '../../data/storage';

interface StaffMobileDashboardProps {
  onOpenScanner: () => void;
  onSelectOrder: (order: LaundryOrder) => void;
  onOpenStatusModal: (order: LaundryOrder) => void;
  onOpenQcModal: (order: LaundryOrder) => void;
  onOpenBagLabel: (order: LaundryOrder) => void;
}

export const StaffMobileDashboard: React.FC<StaffMobileDashboardProps> = ({
  onOpenScanner,
  onSelectOrder,
  onOpenStatusModal,
  onOpenQcModal,
  onOpenBagLabel
}) => {
  const [orders, setOrders] = useState<LaundryOrder[]>(StorageService.getOrders());
  const [filterMode, setFilterMode] = useState<'MY_STATION' | 'ALL_ACTIVE' | 'READY'>('MY_STATION');
  const [searchQuery, setSearchQuery] = useState('');
  const currentStaff = StorageService.getCurrentStaff();

  const refreshOrders = () => {
    setOrders(StorageService.getOrders());
  };

  // Station mapping according to staff role
  const relevantStatuses = useMemo(() => {
    switch (currentStaff.role) {
      case 'PETUGAS_CUCI':
        return ['DITERIMA', 'DITIMBANG', 'DICUCI', 'DIBILAS', 'DIKERINGKAN'] as const;
      case 'PETUGAS_SORTIR':
        return ['SORTIR', 'DISETRIKA', 'QUALITY_CHECK'] as const;
      case 'PETUGAS_DELIVERY':
        return ['SIAP_DIAMBIL', 'DALAM_PENGIRIMAN'] as const;
      default:
        return ['ORDER_BARU', 'DITERIMA', 'DICUCI', 'DISETRIKA', 'QUALITY_CHECK', 'PACKING', 'SIAP_DIAMBIL'] as const;
    }
  }, [currentStaff.role]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (filterMode === 'MY_STATION') {
        if (!relevantStatuses.includes(o.currentStatus as any)) return false;
      } else if (filterMode === 'READY') {
        if (!['SIAP_DIAMBIL', 'DALAM_PENGIRIMAN'].includes(o.currentStatus)) return false;
      } else if (filterMode === 'ALL_ACTIVE') {
        if (o.currentStatus === 'SELESAI') return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (o.studentDormInfo?.roomNumber || '').toLowerCase().includes(q)
      );
    });
  }, [orders, filterMode, relevantStatuses, searchQuery]);

  return (
    <div id="staff-mobile-dashboard" className="space-y-4 max-w-4xl mx-auto">
      
      {/* Top Banner for Operator */}
      <div className="bg-emerald-900 text-white p-5 rounded-3xl shadow-lg border border-emerald-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300">
            Mode Operator Operasional • {currentStaff.roleTitle}
          </span>
          <h2 className="text-xl font-extrabold mt-0.5">{currentStaff.name}</h2>
          <p className="text-xs text-emerald-100 font-light mt-1">
            Fokus stasiun kerja: <strong>{relevantStatuses.map(s => STATUS_METADATA[s]?.label).join(', ')}</strong>
          </p>
        </div>

        <button
          onClick={onOpenScanner}
          className="flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs py-3 px-5 rounded-2xl shadow-md transition-all active:scale-[0.98] shrink-0"
        >
          <QrCode className="w-4 h-4" />
          Scan QR Barcode Pakaian
        </button>
      </div>

      {/* Quick Tabs & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex gap-2 border-b border-slate-100 pb-3">
          <button
            onClick={() => setFilterMode('MY_STATION')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'MY_STATION' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            🎯 Pos Tugas Saya ({orders.filter(o => relevantStatuses.includes(o.currentStatus)).length})
          </button>
          <button
            onClick={() => setFilterMode('ALL_ACTIVE')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'ALL_ACTIVE' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Semua Antrian ({orders.filter(o => o.currentStatus !== 'SELESAI').length})
          </button>
          <button
            onClick={() => setFilterMode('READY')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'READY' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Siap Serah ({orders.filter(o => ['SIAP_DIAMBIL', 'SIAP_DIANTAR'].includes(o.currentStatus)).length})
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari barcode / nomor kamar santri..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Operator Tasks List */}
      <div className="space-y-3">
        {filteredOrders.map(order => {
          const statusMeta = STATUS_METADATA[order.currentStatus];
          return (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3 hover:border-emerald-400 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <button
                    onClick={() => onSelectOrder(order)}
                    className="font-mono font-extrabold text-sm text-emerald-950 hover:underline block text-left"
                  >
                    {order.id}
                  </button>
                  <span className="text-[10px] text-slate-400 font-mono">{order.orderDate}</span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${statusMeta.badgeClass}`}>
                  {statusMeta.label}
                </span>
              </div>

              {/* Customer Box */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs space-y-1">
                <div className="font-extrabold text-slate-900 text-sm">{order.customerName}</div>
                {order.studentDormInfo && (
                  <div className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-emerald-600" />
                    Asrama: {order.studentDormInfo.dormitoryName} • Kamar {order.studentDormInfo.roomNumber}
                  </div>
                )}
                <div className="text-slate-600 text-[11px]">
                  Beban: <strong>{order.totalPieces} Pcs ({order.totalWeightKg} Kg)</strong> • Kantong: {order.packing.bagType}
                </div>
                {order.perfumeOption && (
                  <div className="text-[10px] text-emerald-700 italic">
                    🌸 Aroma: {order.perfumeOption.split('(')[0]}
                  </div>
                )}
              </div>

              {/* Action Buttons for Mobile Screen */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  onClick={() => onOpenStatusModal(order)}
                  className="flex items-center justify-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  Update Status Pos
                </button>

                {order.currentStatus === 'DISETRIKA' ? (
                  <button
                    onClick={() => onOpenQcModal(order)}
                    className="flex items-center justify-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-teal-200" />
                    Quality Control
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenBagLabel(order)}
                    className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 rounded-xl transition-colors"
                  >
                    <Tag className="w-4 h-4 text-emerald-700" />
                    Label Kantong
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400 text-xs">
            Tidak ada tugas cucian pada filter ini saat ini.
          </div>
        )}
      </div>

    </div>
  );
};
