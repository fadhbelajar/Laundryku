import React, { useState } from 'react';
import { X, UserPlus, Save, User, Building, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import { Customer, CustomerType, WargaCategory, MembershipTier } from '../../types';
import { StorageService } from '../../data/storage';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
  onCustomerSaved: (customer: Customer) => void;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  customerToEdit,
  onCustomerSaved
}) => {
  const [type, setType] = useState<CustomerType>(customerToEdit?.type || 'SANTRIWATI');
  const [name, setName] = useState(customerToEdit?.name || '');
  const [phone, setPhone] = useState(customerToEdit?.phone || '');
  const [notes, setNotes] = useState(customerToEdit?.notes || '');

  // Santriwati fields
  const [nis, setNis] = useState(customerToEdit?.student?.nis || '');
  const [className, setClassName] = useState(customerToEdit?.student?.className || '10 Aliyah IPA 1');
  const [level, setLevel] = useState(customerToEdit?.student?.level || 'Aliyah');
  const [guardianName, setGuardianName] = useState(customerToEdit?.student?.guardianName || '');
  const [guardianPhone, setGuardianPhone] = useState(customerToEdit?.student?.guardianPhone || '');
  const [packageId, setPackageId] = useState(customerToEdit?.student?.packageId || '');

  // Warga Pesantren fields
  const [wargaCategory, setWargaCategory] = useState<WargaCategory>(customerToEdit?.warga?.category || 'USTAZAH');
  const [workUnit, setWorkUnit] = useState(customerToEdit?.warga?.workUnit || 'Madrasah Aliyah');
  const [position, setPosition] = useState(customerToEdit?.warga?.position || 'Guru Fiqih');
  const [complexAddress, setComplexAddress] = useState(customerToEdit?.warga?.complexAddress || 'Kompleks Asatidz Blok A No. 01');
  const [membershipTier, setMembershipTier] = useState<MembershipTier>(customerToEdit?.warga?.membershipTier || 'MEMBER');

  // Masyarakat Umum fields
  const [subdistrict, setSubdistrict] = useState(customerToEdit?.umum?.subdistrict || 'Kecamatan Ponorogo');
  const [village, setVillage] = useState(customerToEdit?.umum?.village || 'Kelurahan Kauman');
  const [fullAddress, setFullAddress] = useState(customerToEdit?.umum?.fullAddress || '');

  const dormitories = StorageService.getDormitories();
  const packages = StorageService.getPackages();

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Nama dan Nomor WhatsApp wajib diisi!');
      return;
    }

    const selectedPkg = packages.find(p => p.id === packageId);

    const customerId = customerToEdit?.id || StorageService.generateCustomerId(type);

    const newCustomer: Customer = {
      id: customerId,
      name: name.trim(),
      phone: phone.trim(),
      type: type,
      isActive: true,
      notes: notes,
      createdAt: customerToEdit?.createdAt || new Date().toISOString().split('T')[0],
      totalOrdersCount: customerToEdit?.totalOrdersCount || 0,
      totalSpent: customerToEdit?.totalSpent || 0,
      student: type === 'SANTRIWATI' ? {
        nis: nis.trim() || `2024${Math.floor(100000 + Math.random() * 900000)}`,
        studentName: name.trim(),
        className: className.trim() || '10 Aliyah IPA 1',
        level: level,
        guardianName: guardianName.trim() || 'Wali Santri',
        guardianPhone: guardianPhone.trim() || phone.trim(),
        packageId: packageId || undefined,
        packageActiveUntil: packageId ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
        packageQuotaKg: selectedPkg?.quotaKg,
        packageRemainingKg: selectedPkg?.quotaKg
      } : undefined,
      warga: type === 'WARGA_PESANTREN' ? {
        category: wargaCategory,
        workUnit: workUnit,
        position: position,
        complexAddress: complexAddress,
        membershipTier: membershipTier,
        discountPercentage: membershipTier === 'VIP' ? 15 : membershipTier === 'MEMBER' ? 10 : 5
      } : undefined,
      umum: type === 'MASYARAKAT_UMUM' ? {
        subdistrict: subdistrict,
        village: village,
        fullAddress: fullAddress || `${village}, ${subdistrict}`,
        loyaltyPoints: customerToEdit?.umum?.loyaltyPoints || 0,
        isMember: true
      } : undefined
    };

    StorageService.upsertCustomer(newCustomer);
    onCustomerSaved(newCustomer);
    onClose();
  };

  return (
    <div id="customer-form-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-4 border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-base">
              {customerToEdit ? `Edit Data Pelanggan (${customerToEdit.id})` : 'Tambah Pelanggan Baru'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-slate-200 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
          
          {/* Category Tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Kategori Pelanggan:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('SANTRIWATI')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  type === 'SANTRIWATI'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                👧 Santriwati Pondok
              </button>
              <button
                type="button"
                onClick={() => setType('WARGA_PESANTREN')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  type === 'WARGA_PESANTREN'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                🕌 Warga Pesantren
              </button>
              <button
                type="button"
                onClick={() => setType('MASYARAKAT_UMUM')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  type === 'MASYARAKAT_UMUM'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                👥 Masyarakat Umum
              </button>
            </div>
          </div>

          {/* Basic Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nama Lengkap *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Aisyah Rahma Safitri"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nomor WhatsApp Aktif *</label>
              <input
                type="text"
                required
                placeholder="Contoh: 081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Conditional Sub-Form: SANTRIWATI */}
          {type === 'SANTRIWATI' && (
            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-700" />
                  Database Profil Santriwati & Orang Tua
                </h4>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                  Format Baru Pesantren
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">ID Santri / NIS *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 2024090123"
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Nomor Induk Santri resmi</span>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Kelas / Tingkat *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 10 Aliyah IPA 1 / 3 KMI"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Kelas santri di madrasah/kulliyyatul mu'allimat</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-emerald-200/70">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Nama Orang Tua / Wali *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Bapak H. Ahmad Fauzi"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Untuk konfirmasi tagihan & laporan</span>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Kontak WhatsApp Orang Tua *</label>
                  <input
                    type="text"
                    placeholder="Contoh: 081298765432"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Notifikasi invoice & rincian tunggakan santri</span>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200/70">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Langganan Paket Laundry (Opsional)</label>
                <select
                  value={packageId}
                  onChange={(e) => setPackageId(e.target.value)}
                  className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="">-- Tanpa Paket Langganan (Reguler Kiloan / Hutang Per Order) --</option>
                  {packages.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.quotaKg} Kg - Rp {p.price.toLocaleString('id-ID')})</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Conditional Sub-Form: WARGA PESANTREN */}
          {type === 'WARGA_PESANTREN' && (
            <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-200 space-y-3">
              <h4 className="text-xs font-extrabold text-teal-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-700" />
                Data Asatidz, Pengasuh & Karyawan Pesantren
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Kategori Warga</label>
                  <select
                    value={wargaCategory}
                    onChange={(e) => setWargaCategory(e.target.value as WargaCategory)}
                    className="w-full bg-white border border-teal-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="USTAZAH">USTAZAH</option>
                    <option value="GURU">GURU</option>
                    <option value="PENGASUH">PENGASUH</option>
                    <option value="KARYAWAN">KARYAWAN</option>
                    <option value="KELUARGA">KELUARGA</option>
                    <option value="WARGA_PESANTREN">WARGA PESANTREN</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Unit Kerja / Bagian</label>
                  <input
                    type="text"
                    placeholder="Biro Pengasuhan / TU"
                    value={workUnit}
                    onChange={(e) => setWorkUnit(e.target.value)}
                    className="w-full bg-white border border-teal-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Jabatan / Relasi</label>
                  <input
                    type="text"
                    placeholder="Guru Fiqih / Teknisi"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full bg-white border border-teal-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Alamat Kompleks / No. Rumah</label>
                  <input
                    type="text"
                    placeholder="Rumah Dinas Asatidz Blok B No. 04"
                    value={complexAddress}
                    onChange={(e) => setComplexAddress(e.target.value)}
                    className="w-full bg-white border border-teal-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Tier Membership</label>
                  <select
                    value={membershipTier}
                    onChange={(e) => setMembershipTier(e.target.value as MembershipTier)}
                    className="w-full bg-white border border-teal-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-teal-950 focus:outline-none"
                  >
                    <option value="REGULER">REGULER (Diskon 5%)</option>
                    <option value="MEMBER">MEMBER (Diskon 10%)</option>
                    <option value="VIP">VIP (Diskon 15% + Prioritas)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Conditional Sub-Form: MASYARAKAT UMUM */}
          {type === 'MASYARAKAT_UMUM' && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-950 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-700" />
                Data Alamat Pelanggan Umum
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Kecamatan</label>
                  <input
                    type="text"
                    placeholder="Kecamatan Ponorogo"
                    value={subdistrict}
                    onChange={(e) => setSubdistrict(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Kelurahan / Desa</label>
                  <input
                    type="text"
                    placeholder="Kelurahan Kauman"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Alamat Lengkap & Patokan</label>
                <input
                  type="text"
                  placeholder="Jl. Diponegoro No. 45 RT 02 / RW 04"
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Catatan Khusus Pelanggan:</label>
            <input
              type="text"
              placeholder="Contoh: Alergi parfum menyengat / Minta hanger gantung..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              Simpan Data Pelanggan
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
