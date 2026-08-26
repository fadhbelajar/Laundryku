import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  QrCode, 
  Phone, 
  MapPin, 
  Sparkles, 
  Edit, 
  ShoppingBag, 
  Building, 
  CheckCircle2,
  Filter
} from 'lucide-react';
import { Customer, CustomerType } from '../../types';
import { StorageService, formatRupiah } from '../../data/storage';

interface CustomerListProps {
  onOpenNewCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
  onOpenCard: (customer: Customer) => void;
  onSelectCustomer: (customer: Customer) => void;
  onCreateOrder: (customer: Customer) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  onOpenNewCustomer,
  onEditCustomer,
  onOpenCard,
  onSelectCustomer,
  onCreateOrder
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | CustomerType | 'HUTANG_SANTRI'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>(StorageService.getCustomers());
  const [orders, setOrders] = useState(StorageService.getOrders());

  const refreshData = () => {
    setCustomers(StorageService.getCustomers());
    setOrders(StorageService.getOrders());
  };

  React.useEffect(() => {
    const handleStorageUpdate = () => refreshData();
    window.addEventListener('almawaddah_storage_updated', handleStorageUpdate);
    return () => window.removeEventListener('almawaddah_storage_updated', handleStorageUpdate);
  }, []);

  // Compute student debts map
  const studentDebtMap = useMemo(() => {
    const map: Record<string, { totalDebt: number; unpaidCount: number }> = {};
    orders.forEach(o => {
      if (o.customerType === 'SANTRIWATI' && (o.paymentStatus === 'BELUM_BAYAR' || o.paymentStatus === 'DP')) {
        const remaining = Math.max(0, o.grandTotal - (o.paidAmount || 0));
        if (!map[o.customerId]) {
          map[o.customerId] = { totalDebt: 0, unpaidCount: 0 };
        }
        map[o.customerId].totalDebt += remaining;
        map[o.customerId].unpaidCount += 1;
      }
    });
    return map;
  }, [orders]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      if (activeTab === 'HUTANG_SANTRI') {
        if (c.type !== 'SANTRIWATI') return false;
        const debtInfo = studentDebtMap[c.id];
        if (!debtInfo || debtInfo.totalDebt <= 0) return false;
      } else if (activeTab !== 'ALL' && c.type !== activeTab) {
        return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchId = c.id.toLowerCase().includes(q);
      const matchPhone = c.phone.includes(q);
      const matchNis = c.student?.nis?.toLowerCase().includes(q);
      const matchClass = c.student?.className?.toLowerCase().includes(q);
      const matchGuardian = c.student?.guardianName?.toLowerCase().includes(q);
      const matchGuardianPhone = c.student?.guardianPhone?.includes(q);
      const matchWarga = c.warga?.complexAddress?.toLowerCase().includes(q);
      return matchName || matchId || matchPhone || matchNis || matchClass || matchGuardian || matchGuardianPhone || matchWarga;
    });
  }, [customers, activeTab, searchQuery, studentDebtMap]);

  return (
    <div id="customer-list-view" className="space-y-6">
      
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-700" />
            Database Pelanggan Almawaddah
          </h2>
          <p className="text-xs text-slate-500">
            Terbagi menjadi 3 pilar: Santriwati Pondok, Warga Pesantren, dan Masyarakat Umum.
          </p>
        </div>

        <button
          onClick={onOpenNewCustomer}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-2xl shadow-md transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Tambah Pelanggan Baru
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-slate-100 pb-3">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ALL'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Pelanggan ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('SANTRIWATI')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'SANTRIWATI'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            👧 Database Santriwati ({customers.filter(c => c.type === 'SANTRIWATI').length})
          </button>
          <button
            onClick={() => setActiveTab('HUTANG_SANTRI')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'HUTANG_SANTRI'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <span>⚠️ Santri Berhutang</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeTab === 'HUTANG_SANTRI' ? 'bg-white text-rose-800' : 'bg-rose-200 text-rose-900'
            }`}>
              {(Object.values(studentDebtMap) as Array<{ totalDebt: number; unpaidCount: number }>).filter(d => d.totalDebt > 0).length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('WARGA_PESANTREN')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'WARGA_PESANTREN'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🕌 Warga Pesantren ({customers.filter(c => c.type === 'WARGA_PESANTREN').length})
          </button>
          <button
            onClick={() => setActiveTab('MASYARAKAT_UMUM')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'MASYARAKAT_UMUM'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            👥 Masyarakat Umum ({customers.filter(c => c.type === 'MASYARAKAT_UMUM').length})
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama santri, NIS, kelas, nama orang tua/wali, kontak WA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
          />
        </div>

      </div>

      {/* Customer Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map(customer => {
          const debtInfo = customer.type === 'SANTRIWATI' ? studentDebtMap[customer.id] : null;
          const hasDebt = debtInfo && debtInfo.totalDebt > 0;

          return (
            <div 
              key={customer.id} 
              className={`bg-white rounded-3xl border transition-all p-5 flex flex-col justify-between space-y-4 ${
                hasDebt ? 'border-rose-300 hover:border-rose-500 shadow-rose-100/50 shadow-sm' : 'border-slate-200 hover:border-emerald-500 hover:shadow-md'
              }`}
            >
              
              <div className="space-y-3">
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xs shrink-0 ${
                      customer.type === 'SANTRIWATI'
                        ? hasDebt ? 'bg-rose-700 text-white' : 'bg-emerald-700 text-white'
                        : customer.type === 'WARGA_PESANTREN' ? 'bg-teal-700 text-white' : 'bg-slate-700 text-white'
                    }`}>
                      {customer.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 
                        onClick={() => onSelectCustomer(customer)}
                        className="font-extrabold text-sm text-slate-900 hover:text-emerald-800 cursor-pointer line-clamp-1"
                      >
                        {customer.name}
                      </h3>
                      <span className="font-mono text-[10px] text-slate-400 block">
                        {customer.type === 'SANTRIWATI' && customer.student?.nis ? `NIS: ${customer.student.nis}` : customer.id}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    customer.type === 'SANTRIWATI'
                      ? hasDebt ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800'
                      : customer.type === 'WARGA_PESANTREN'
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    {customer.type === 'SANTRIWATI' ? 'SANTRIWATI' : customer.type.replace('_', ' ')}
                  </span>
                </div>

                {/* Dynamic Information based on category */}
                {customer.student && (
                  <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/60 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-950 font-extrabold bg-emerald-100/80 px-2 py-0.5 rounded-md text-[11px]">
                        🏫 Kelas: {customer.student.className}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        NIS: {customer.student.nis}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-700 space-y-0.5 pt-1 border-t border-emerald-200/50">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Orang Tua/Wali:</span>
                        <strong className="text-slate-900">{customer.student.guardianName || '-'}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Kontak Orang Tua:</span>
                        <span className="font-semibold text-emerald-800">{customer.student.guardianPhone || customer.phone}</span>
                      </div>
                    </div>

                    {/* Santri Debt Status */}
                    <div className="pt-2 border-t border-emerald-200/50">
                      {hasDebt ? (
                        <div className="bg-rose-50 p-2 rounded-xl border border-rose-200 flex items-center justify-between text-[11px]">
                          <div>
                            <span className="text-rose-700 font-bold block">Tunggakan Hutang:</span>
                            <span className="text-[10px] text-rose-600 font-medium">{debtInfo.unpaidCount} Order belum lunas</span>
                          </div>
                          <span className="font-black text-rose-700 text-xs">{formatRupiah(debtInfo.totalDebt)}</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Status: Tidak ada tunggakan hutang (Lunas)</span>
                        </div>
                      )}
                    </div>

                    {customer.student.packageRemainingKg !== undefined && (
                      <div className="text-[11px] text-emerald-700 font-semibold pt-1 flex justify-between">
                        <span>Sisa Kuota Paket:</span>
                        <strong className="text-emerald-950">{customer.student.packageRemainingKg} / {customer.student.packageQuotaKg} Kg</strong>
                      </div>
                    )}
                  </div>
                )}

                {customer.warga && (
                  <div className="bg-teal-50/70 p-3 rounded-2xl border border-teal-200/60 text-xs space-y-1">
                    <div className="text-teal-900 font-bold">
                      {customer.warga.category} • {customer.warga.position}
                    </div>
                    <div className="text-[11px] text-teal-800">
                      {customer.warga.complexAddress}
                    </div>
                    <div className="text-[11px] text-teal-700 font-semibold pt-1 border-t border-teal-200/50 flex justify-between">
                      <span>Tier Member:</span>
                      <strong className="text-teal-950">{customer.warga.membershipTier} (Diskon {customer.warga.discountPercentage}%)</strong>
                    </div>
                  </div>
                )}

                {customer.umum && (
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
                    <div className="text-slate-800 font-medium">
                      {customer.umum.village}, {customer.umum.subdistrict}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      {customer.umum.fullAddress}
                    </div>
                    <div className="text-[11px] text-amber-700 font-semibold pt-1 border-t border-slate-200 flex justify-between">
                      <span>Loyalty Poin:</span>
                      <strong className="text-amber-950">{customer.umum.loyaltyPoints} Poin</strong>
                    </div>
                  </div>
                )}

                <div className="text-[11px] text-slate-500 flex items-center justify-between px-1">
                  <span>WA: {customer.phone}</span>
                  <span>{customer.totalOrdersCount || 0} Order</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <button
                    onClick={() => onOpenCard(customer)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Cetak Kartu Member QR"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                  </button>
                  <button
                    onClick={() => onEditCustomer(customer)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Edit Data"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => onCreateOrder(customer)}
                  className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-xs transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Buat Order
                </button>
              </div>

            </div>
          );
        })}

        {filteredCustomers.length === 0 && (
          <div className="col-span-full bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400 text-xs">
            Tidak ada pelanggan yang cocok dengan pencarian Anda.
          </div>
        )}
      </div>

    </div>
  );
};
