import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  MapPin, 
  Phone, 
  Search, 
  CheckCircle2, 
  Clock, 
  Navigation, 
  UserCheck, 
  DollarSign, 
  Plus, 
  ExternalLink 
} from 'lucide-react';
import { LaundryOrder, DeliveryZone } from '../../types';
import { StorageService, formatRupiah } from '../../data/storage';

interface PickupDeliveryProps {
  onSelectOrder: (order: LaundryOrder) => void;
  onOpenWhatsApp: (order: LaundryOrder) => void;
}

export const PickupDeliveryManagement: React.FC<PickupDeliveryProps> = ({
  onSelectOrder,
  onOpenWhatsApp
}) => {
  const [orders, setOrders] = useState<LaundryOrder[]>(StorageService.getOrders());
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(StorageService.getZones());
  const [activeTab, setActiveTab] = useState<'ALL' | 'JADWAL' | 'JALAN' | 'SELESAI'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const currentStaff = StorageService.getCurrentStaff();

  const refreshData = () => {
    setOrders(StorageService.getOrders());
    setDeliveryZones(StorageService.getZones());
  };

  const deliveryOrders = useMemo(() => {
    return orders.filter(o => {
      const isDelivery = o.transactionMode === 'PICKUP_DELIVERY' || o.delivery.isDelivery;
      if (!isDelivery) return false;
      if (activeTab === 'JADWAL' && o.delivery.deliveryStatus !== 'DIJADWALKAN') return false;
      if (activeTab === 'JALAN' && !['MENUJU_LOKASI', 'DIAMBIL_KURIR'].includes(o.delivery.deliveryStatus || '')) return false;
      if (activeTab === 'SELESAI' && o.delivery.deliveryStatus !== 'TERKIRIM') return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || (o.delivery.address || '').toLowerCase().includes(q);
    });
  }, [orders, activeTab, searchQuery]);

  const handleUpdateDeliveryStatus = (order: LaundryOrder, status: 'DALAM_PERJALANAN' | 'TERKIRIM') => {
    const all = StorageService.getOrders();
    const target = all.find(o => o.id === order.id);
    if (target) {
      target.delivery.deliveryStatus = status;
      target.delivery.courierStaffName = currentStaff.name;
      if (status === 'TERKIRIM') {
        StorageService.updateOrderStatus(order.id, 'SELESAI', currentStaff.name, `Pengantaran berhasil diserahkan oleh kurir ${currentStaff.name}`);
      } else {
        StorageService.updateOrderStatus(order.id, 'DALAM_PENGIRIMAN', currentStaff.name, `Kurir ${currentStaff.name} sedang dalam perjalanan`);
      }
      StorageService.saveOrders(all);
    }
    refreshData();
  };

  return (
    <div id="pickup-delivery-view" className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-700" />
            Layanan Pickup & Delivery Pesantren
          </h2>
          <p className="text-xs text-slate-500">
            Armada jemput antar cucian untuk Warga Pesantren, Rumah Dinas Asatidz, dan Pelanggan Umum.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-3 py-1.5 rounded-2xl">
            {deliveryOrders.length} Tugas Antar / Jemput
          </span>
        </div>
      </div>

      {/* Delivery Zones Showcase */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {deliveryZones.map(zone => (
          <div key={zone.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex justify-between items-center">
              <h4 className="font-extrabold text-xs text-slate-900">{zone.name}</h4>
              <span className="text-xs font-extrabold text-emerald-800">
                {zone.fee === 0 ? 'GRATIS' : formatRupiah(zone.fee)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">{zone.coverage}</p>
            <span className="text-[10px] text-slate-400 block font-mono">Estimasi: {zone.estimatedMins} Menit</span>
          </div>
        ))}
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex gap-2 border-b border-slate-100 pb-3">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${
              activeTab === 'ALL' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Semua ({orders.filter(o => o.transactionMode === 'PICKUP_DELIVERY').length})
          </button>
          <button
            onClick={() => setActiveTab('JADWAL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${
              activeTab === 'JADWAL' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            📋 Dijadwalkan
          </button>
          <button
            onClick={() => setActiveTab('JALAN')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${
              activeTab === 'JALAN' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            🛵 Sedang Di Jalan
          </button>
          <button
            onClick={() => setActiveTab('SELESAI')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${
              activeTab === 'SELESAI' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            ✅ Terkirim
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari order pengantaran, nama penerima, alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deliveryOrders.map(order => (
          <div
            key={order.id}
            className="bg-white rounded-3xl border border-slate-200 hover:border-emerald-500 p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono font-bold text-xs text-emerald-950 block">{order.id}</span>
                  <h4 className="font-extrabold text-sm text-slate-900 mt-0.5">{order.customerName}</h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                  {order.delivery.deliveryStatus || 'DIJADWALKAN'}
                </span>
              </div>

              {/* Address Box */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-start gap-1.5 text-slate-700">
                  <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-medium text-slate-900 leading-snug">{order.delivery.address}</span>
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-200/60">
                  <span>Zona: <strong>{order.delivery.zoneName}</strong></span>
                  <span className="font-bold text-emerald-800">Ongkir: {formatRupiah(order.delivery.fee)}</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  Kontak: <strong>{order.customerPhone}</strong>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-0.5">
                <div>Cucian: <strong>{order.totalPieces} Pcs ({order.totalWeightKg} Kg)</strong></div>
                <div>Status Cucian: <strong className="text-emerald-800">{order.currentStatus}</strong></div>
              </div>
            </div>

            {/* Courier Actions */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex gap-1.5">
                <button
                  onClick={() => onOpenWhatsApp(order)}
                  className="flex-1 flex items-center justify-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold py-2 rounded-xl transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Hubungi WA
                </button>
                <button
                  onClick={() => onSelectOrder(order)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
                >
                  Detail
                </button>
              </div>

              {order.delivery.deliveryStatus !== 'TERKIRIM' ? (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleUpdateDeliveryStatus(order, 'DALAM_PERJALANAN')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-xl transition-colors"
                  >
                    🛵 Berangkat
                  </button>
                  <button
                    onClick={() => handleUpdateDeliveryStatus(order, 'TERKIRIM')}
                    className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2 rounded-xl transition-colors"
                  >
                    ✅ Sudah Diterima
                  </button>
                </div>
              ) : (
                <div className="text-center text-xs font-bold text-emerald-800 bg-emerald-50 p-2 rounded-xl">
                  ✓ Berhasil Diserahkan ({order.delivery.courierStaffName || 'Kurir'})
                </div>
              )}
            </div>
          </div>
        ))}

        {deliveryOrders.length === 0 && (
          <div className="col-span-full bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400 text-xs">
            Tidak ada pesanan pickup & delivery pada kategori ini.
          </div>
        )}
      </div>

    </div>
  );
};
