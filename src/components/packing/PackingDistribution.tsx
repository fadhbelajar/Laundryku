import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  QrCode, 
  Printer, 
  Tag, 
  CheckCircle2, 
  Send, 
  ArrowRight, 
  Building, 
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { LaundryOrder } from '../../types';
import { StorageService, STATUS_METADATA, formatRupiah } from '../../data/storage';

interface PackingDistributionProps {
  onOpenReceipt: (order: LaundryOrder) => void;
  onOpenBagLabel: (order: LaundryOrder) => void;
  onOpenWhatsApp: (order: LaundryOrder) => void;
  onSelectOrder: (order: LaundryOrder) => void;
}

export const PackingDistribution: React.FC<PackingDistributionProps> = ({
  onOpenReceipt,
  onOpenBagLabel,
  onOpenWhatsApp,
  onSelectOrder
}) => {
  const [orders, setOrders] = useState<LaundryOrder[]>(StorageService.getOrders());
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const currentStaff = StorageService.getCurrentStaff();

  const refreshOrders = () => {
    setOrders(StorageService.getOrders());
  };

  // Orders in packing/ready status
  const packingQueue = useMemo(() => {
    return orders.filter(o => {
      const isPackingOrReady = ['SETRIKA', 'QUALITY_CONTROL', 'PACKING', 'SIAP_DIAMBIL', 'SIAP_DIANTAR'].includes(o.currentStatus);
      if (!isPackingOrReady) return false;
      if (selectedClassFilter !== 'ALL' && o.studentDormInfo?.className !== selectedClassFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || (o.studentDormInfo?.className || '').toLowerCase().includes(q) || (o.studentDormInfo?.guardianName || '').toLowerCase().includes(q);
    });
  }, [orders, selectedClassFilter, searchQuery]);

  // Group by class for santri
  const classGroups = useMemo(() => {
    const map: Record<string, LaundryOrder[]> = {};
    orders
      .filter(o => o.customerType === 'SANTRIWATI' && o.studentDormInfo?.className)
      .forEach(o => {
        const cName = o.studentDormInfo!.className!;
        if (!map[cName]) map[cName] = [];
        map[cName].push(o);
      });
    return map;
  }, [orders]);

  const handleMarkHandedOver = (order: LaundryOrder) => {
    StorageService.updateOrderStatus(
      order.id,
      'SELESAI',
      currentStaff.name,
      `Telah diserahterimakan kepada ${order.customerName} oleh ${currentStaff.name}`
    );
    refreshOrders();
  };

  const handleAdvanceToSiap = (order: LaundryOrder) => {
    StorageService.updateOrderStatus(
      order.id,
      'SIAP_DIAMBIL',
      currentStaff.name,
      `Packing selesai oleh ${currentStaff.name}. Siap didistribusikan.`
    );
    refreshOrders();
  };

  return (
    <div id="packing-distribution-view" className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-emerald-700" />
            Sortir, Packing & Distribusi Serah Terima
          </h2>
          <p className="text-xs text-slate-500">
            Pusat sortir pakaian bersih per kantong asrama, cetak label barcode, dan checklist serah terima santri.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-3 py-1.5 rounded-2xl">
            {packingQueue.length} Order Dalam Antrian Packing
          </span>
        </div>
      </div>

      {/* Filter Class & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 shrink-0">Filter Kelas:</span>
            <button
              onClick={() => setSelectedClassFilter('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                selectedClassFilter === 'ALL' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              Semua ({packingQueue.length})
            </button>
            {Object.keys(classGroups).map(c => (
              <button
                key={c}
                onClick={() => setSelectedClassFilter(c)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                  selectedClassFilter === c ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {c} ({classGroups[c].length})
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama santri, no invoice, kelas, atau nama orang tua..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Packing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packingQueue.map(order => {
          const statusMeta = STATUS_METADATA[order.currentStatus];
          const isReady = ['SIAP_DIAMBIL', 'SIAP_DIANTAR'].includes(order.currentStatus);

          return (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-slate-200 hover:border-emerald-500 p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all"
            >
              <div className="space-y-3">
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
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusMeta.badgeClass}`}>
                    {statusMeta.label}
                  </span>
                </div>

                {/* Customer & Class Banner */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="font-extrabold text-slate-900 text-sm">{order.customerName}</div>
                  {order.studentDormInfo && (
                    <div className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-emerald-600" />
                      Kelas {order.studentDormInfo.className || '-'} • Wali: {order.studentDormInfo.guardianName || '-'}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-500">
                    Jumlah: <strong>{order.totalPieces} Pcs ({order.totalWeightKg} Kg)</strong> • Wadah: {order.packing.bagType}
                  </div>
                  {order.perfumeOption && (
                    <div className="text-[10px] text-emerald-700 italic">🌸 {order.perfumeOption.split('(')[0]}</div>
                  )}
                </div>

                {/* Quality Check Status */}
                {order.qualityCheck?.checkedAt && (
                  <div className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded-xl flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Lolos QC oleh {order.qualityCheck.checkerStaffName} ({order.qualityCheck.checkedAt.split(' ')[1]})
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenBagLabel(order)}
                    className="flex-1 flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-2 rounded-xl transition-colors"
                  >
                    <Tag className="w-3.5 h-3.5 text-emerald-700" />
                    Label Kantong
                  </button>
                  <button
                    onClick={() => onOpenWhatsApp(order)}
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors"
                    title="WA Santri / Wali"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                {!isReady ? (
                  <button
                    onClick={() => handleAdvanceToSiap(order)}
                    className="w-full flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Selesai Packing & Siap Serah
                  </button>
                ) : (
                  <button
                    onClick={() => handleMarkHandedOver(order)}
                    className="w-full flex items-center justify-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Konfirmasi Serah Terima (Selesai)
                  </button>
                )}
              </div>

            </div>
          );
        })}

        {packingQueue.length === 0 && (
          <div className="col-span-full bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400 text-xs">
            Tidak ada cucian yang menunggu proses packing saat ini. Semua telah terdistribusi!
          </div>
        )}
      </div>

    </div>
  );
};
