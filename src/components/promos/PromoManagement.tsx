import React, { useState } from 'react';
import { 
  Tag, 
  Plus, 
  Sparkles, 
  Gift, 
  Copy, 
  Check, 
  Calendar, 
  Percent, 
  CreditCard,
  X,
  Save
} from 'lucide-react';
import { PromoVoucher } from '../../types';
import { StorageService, formatRupiah } from '../../data/storage';

export const PromoManagement: React.FC = () => {
  const [promos, setPromos] = useState<PromoVoucher[]>(StorageService.getPromos());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form fields
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minTransaction, setMinTransaction] = useState<number>(20000);
  const [validUntil, setValidUntil] = useState('2026-12-31');

  const refreshData = () => {
    setPromos(StorageService.getPromos());
  };

  const handleCopyCode = (c: string) => {
    navigator.clipboard.writeText(c);
    setCopiedCode(c);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim()) {
      alert('Kode dan Judul Promo wajib diisi!');
      return;
    }

    const newPromo: PromoVoucher = {
      id: `PRM-${Date.now()}`,
      code: code.trim().toUpperCase(),
      title: title.trim(),
      description: description,
      discountType: discountType,
      discountValue: discountValue,
      minTransaction: minTransaction,
      validUntil: validUntil,
      isActive: true,
      targetCustomerType: 'ALL',
      usageCount: 0
    };

    const updated = [newPromo, ...promos];
    StorageService.savePromos(updated);
    setIsModalOpen(false);
    setCode('');
    setTitle('');
    setDescription('');
    refreshData();
  };

  return (
    <div id="promo-management-view" className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Tag className="w-6 h-6 text-emerald-700" />
            Promo, Voucher Diskon & Program Poin Loyalty
          </h2>
          <p className="text-xs text-slate-500">
            Kelola kode kupon berkah, diskon khusus warga pesantren, dan reward poin masyarakat umum.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-2xl shadow-md transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Buat Kode Promo Baru
        </button>
      </div>

      {/* Loyalty Point Explanation Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 p-5 rounded-3xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-amber-950">
              Sistem Reward Poin Pelanggan Umum Almawaddah
            </h3>
            <p className="text-xs text-amber-900/80 mt-0.5">
              Setiap kelipatan transaksi <strong>Rp 10.000</strong> mendapatkan <strong>1 Poin</strong>. 1 Poin bernilai <strong>Rp 500</strong> untuk potongan kasir.
            </p>
          </div>
        </div>
      </div>

      {/* Promo Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {promos.map(promo => (
          <div
            key={promo.id}
            className="bg-white rounded-3xl border border-slate-200 hover:border-emerald-500 p-6 shadow-xs flex flex-col justify-between space-y-5 transition-all relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                    {promo.targetAudience}
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900 mt-2">{promo.title}</h3>
                </div>
                <span className="text-xs font-black text-emerald-800 bg-emerald-50 p-2 rounded-2xl border border-emerald-200">
                  {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}% OFF` : formatRupiah(promo.discountValue)}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{promo.description}</p>

              {/* Promo Code Box */}
              <div className="bg-slate-50 p-3 rounded-2xl border-2 border-dashed border-emerald-300 flex items-center justify-between">
                <span className="font-mono font-black text-sm tracking-wider text-emerald-950">
                  {promo.code}
                </span>
                <button
                  onClick={() => handleCopyCode(promo.code)}
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-xl transition-colors"
                >
                  {copiedCode === promo.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode === promo.code ? 'Disalin' : 'Salin'}
                </button>
              </div>

              <div className="text-[11px] text-slate-400 space-y-0.5 pt-1">
                <div>Min. Transaksi: <strong>{formatRupiah(promo.minTransaction || 0)}</strong></div>
                <div>Berlaku hingga: <strong>{promo.validUntil}</strong></div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-semibold">● Aktif Digunakan di Kasir</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Promo Modal */}
      {isModalOpen && (
        <div id="promo-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Buat Kode Promo Baru</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Kode Voucher (Huruf Besar & Tanpa Spasi) *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: RAMADHANBERKAH"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 uppercase focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nama / Judul Promo *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Berkah Cuci Ramadhan"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Deskripsi Singkat</label>
                <input
                  type="text"
                  placeholder="Contoh: Diskon 15% khusus cuci pakaian & mukena"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tipe Diskon</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="PERCENTAGE">Persentase (%)</option>
                    <option value="FIXED_AMOUNT">Nominal Tetap (Rp)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nilai Diskon</label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Min. Transaksi (Rp)</label>
                  <input
                    type="number"
                    value={minTransaction}
                    onChange={(e) => setMinTransaction(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Masa Berlaku</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
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
                  Simpan Promo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
