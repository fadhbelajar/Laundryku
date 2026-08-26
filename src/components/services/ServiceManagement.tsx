import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Tag, 
  Edit, 
  Check, 
  Layers, 
  PackageCheck,
  Building,
  Save,
  X
} from 'lucide-react';
import { LaundryService, StudentPackage } from '../../types';
import { StorageService, formatRupiah } from '../../data/storage';

export const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<LaundryService[]>(StorageService.getServices());
  const [packages, setPackages] = useState<StudentPackage[]>(StorageService.getPackages());
  const [activeTab, setActiveTab] = useState<'SERVICES' | 'PACKAGES'>('SERVICES');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Edit / Add modal state
  const [editingService, setEditingService] = useState<LaundryService | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'KILOAN' | 'SATUAN' | 'KARPET_SAJADAH' | 'SEPATU_TAS' | 'MUKENA_GAMIS'>('KILOAN');
  const [unit, setUnit] = useState('Kg');
  const [priceSantri, setPriceSantri] = useState(5000);
  const [priceWarga, setPriceWarga] = useState(6000);
  const [priceUmum, setPriceUmum] = useState(7000);
  const [estimatedHours, setEstimatedHours] = useState(48);

  const refreshData = () => {
    setServices(StorageService.getServices());
    setPackages(StorageService.getPackages());
  };

  const handleOpenAdd = () => {
    setEditingService(null);
    setName('');
    setCategory('KILOAN');
    setUnit('Kg');
    setPriceSantri(5000);
    setPriceWarga(6000);
    setPriceUmum(7000);
    setEstimatedHours(48);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: LaundryService) => {
    setEditingService(s);
    setName(s.name);
    setCategory(s.category);
    setUnit(s.unit);
    setPriceSantri(s.priceSantri);
    setPriceWarga(s.priceWarga);
    setPriceUmum(s.priceUmum);
    setEstimatedHours(s.estimatedHours);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedServices = [...services];
    if (editingService) {
      const idx = updatedServices.findIndex(s => s.id === editingService.id);
      if (idx >= 0) {
        updatedServices[idx] = {
          ...editingService,
          name,
          category,
          unit,
          priceSantri,
          priceWarga,
          priceUmum,
          estimatedHours
        };
      }
    } else {
      updatedServices.push({
        id: `SRV-${Date.now()}`,
        name,
        category,
        unit,
        priceSantri,
        priceWarga,
        priceUmum,
        estimatedHours,
        isActive: true
      });
    }
    StorageService.saveServices(updatedServices);
    setIsModalOpen(false);
    refreshData();
  };

  const filteredServices = services.filter(s => {
    if (categoryFilter === 'ALL') return true;
    return s.category === categoryFilter;
  });

  return (
    <div id="service-management-view" className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-700" />
            Katalog Layanan & Tarif Multi-Kategori
          </h2>
          <p className="text-xs text-slate-500">
            Sistem penetapan harga fleksibel & otomatis membedakan santriwati, asatidz/warga, dan masyarakat umum.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-2xl shadow-md transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Tambah Layanan Baru
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('SERVICES')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'SERVICES'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            📋 Master Layanan & Multi-Tarif ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('PACKAGES')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'PACKAGES'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ✨ Paket Langganan Santriwati ({packages.length})
          </button>
        </div>

        {activeTab === 'SERVICES' && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none"
          >
            <option value="ALL">Semua Kategori Layanan</option>
            <option value="KILOAN">Kiloan</option>
            <option value="SATUAN">Satuan</option>
            <option value="KARPET_SAJADAH">Karpet & Sajadah</option>
            <option value="SEPATU_TAS">Sepatu & Tas</option>
            <option value="MUKENA_GAMIS">Mukena & Gamis</option>
          </select>
        )}
      </div>

      {activeTab === 'SERVICES' ? (
        /* Services Multi-Tier Table */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Nama Layanan & Kategori</th>
                <th className="p-4 text-right bg-emerald-50/70 text-emerald-950 font-extrabold">
                  👧 Tarif Santriwati
                </th>
                <th className="p-4 text-right bg-teal-50/70 text-teal-950 font-extrabold">
                  🕌 Tarif Warga Pesantren
                </th>
                <th className="p-4 text-right bg-slate-100 text-slate-950 font-extrabold">
                  👥 Tarif Umum
                </th>
                <th className="p-4 text-center">Durasi Est.</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredServices.map(service => (
                <tr key={service.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4">
                    <div className="font-extrabold text-slate-900 text-sm">{service.name}</div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Kategori: {service.category} • Satuan: {service.unit}
                    </span>
                  </td>
                  <td className="p-4 text-right bg-emerald-50/40 font-extrabold text-emerald-900">
                    {formatRupiah(service.priceSantri)} / {service.unit}
                  </td>
                  <td className="p-4 text-right bg-teal-50/40 font-extrabold text-teal-900">
                    {formatRupiah(service.priceWarga)} / {service.unit}
                  </td>
                  <td className="p-4 text-right bg-slate-50/40 font-extrabold text-slate-900">
                    {formatRupiah(service.priceUmum)} / {service.unit}
                  </td>
                  <td className="p-4 text-center text-slate-600 font-medium">
                    {service.estimatedHours} Jam
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleOpenEdit(service)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 transition-colors"
                      title="Edit Tarif"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Santri Packages Cards */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {packages.map(pkg => (
            <div
              key={pkg.id}
              className="bg-white rounded-3xl border-2 border-emerald-500/30 hover:border-emerald-600 shadow-md p-6 flex flex-col justify-between space-y-5 relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                      Masa Aktif {pkg.durationDays} Hari
                    </span>
                    <h3 className="font-extrabold text-lg text-slate-900 mt-2">{pkg.name}</h3>
                  </div>
                </div>

                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200/80 text-center">
                  <span className="text-2xl font-black text-emerald-950 block">
                    {pkg.quotaKg} Kg
                  </span>
                  <span className="text-xs text-emerald-800 font-medium">Total Kuota Cucian</span>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <div className="font-bold text-slate-900">Keunggulan Paket:</div>
                  <ul className="space-y-1.5">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-600">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Harga Berlangganan</span>
                  <span className="text-lg font-black text-emerald-950">{formatRupiah(pkg.price)}</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl">
                  Aktif
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div id="service-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingService ? 'Edit Tarif Layanan' : 'Tambah Layanan Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nama Layanan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Cuci Kering Setrika Reguler"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="KILOAN">KILOAN</option>
                    <option value="SATUAN">SATUAN</option>
                    <option value="KARPET_SAJADAH">KARPET & SAJADAH</option>
                    <option value="SEPATU_TAS">SEPATU & TAS</option>
                    <option value="MUKENA_GAMIS">MUKENA & GAMIS</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Satuan (Unit)</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* 3 Tier Prices */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">Penetapan 3 Tarif Kategori:</span>
                
                <div>
                  <label className="text-[11px] font-bold text-emerald-900 block mb-1">
                    👧 Tarif Santriwati (Rp)
                  </label>
                  <input
                    type="number"
                    value={priceSantri}
                    onChange={(e) => setPriceSantri(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-950 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-teal-900 block mb-1">
                    🕌 Tarif Warga Pesantren (Rp)
                  </label>
                  <input
                    type="number"
                    value={priceWarga}
                    onChange={(e) => setPriceWarga(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-teal-300 rounded-xl px-3 py-1.5 text-xs font-bold text-teal-950 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    👥 Tarif Masyarakat Umum (Rp)
                  </label>
                  <input
                    type="number"
                    value={priceUmum}
                    onChange={(e) => setPriceUmum(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Simpan Layanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
