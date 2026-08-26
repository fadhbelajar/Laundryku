import React, { useState } from 'react';
import { 
  X, 
  QrCode, 
  Phone, 
  MessageCircle, 
  User, 
  ShoppingBag, 
  Sparkles, 
  Calendar,
  Edit,
  History,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Send,
  PlusCircle,
  Receipt
} from 'lucide-react';
import { Customer, LaundryOrder, SantriDebtPayment, PaymentMethod } from '../../types';
import { StorageService, formatRupiah, buildSantriDebtWhatsAppLink } from '../../data/storage';

interface CustomerDetailModalProps {
  customer: Customer | null;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  onOpenCard: (customer: Customer) => void;
  onCreateOrder: (customer: Customer) => void;
  onSelectOrder: (order: LaundryOrder) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  onClose,
  onEdit,
  onOpenCard,
  onCreateOrder,
  onSelectOrder
}) => {
  if (!customer) return null;

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('CASH');
  const [payNotes, setPayNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DEBT' | 'ORDERS'>('OVERVIEW');

  const allOrders = StorageService.getOrders();
  const customerOrders = allOrders.filter(o => o.customerId === customer.id);
  const isSantri = customer.type === 'SANTRIWATI';

  const unpaidOrders = customerOrders.filter(o => o.paymentStatus === 'BELUM_BAYAR' || o.paymentStatus === 'DP');
  const totalDebt = unpaidOrders.reduce((sum, o) => {
    const remaining = Math.max(0, o.grandTotal - (o.paidAmount || 0));
    return sum + remaining;
  }, 0);

  const payments = isSantri 
    ? StorageService.getSantriDebtPayments().filter(p => p.studentId === customer.id)
    : [];

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) {
      alert('Jumlah pembayaran harus lebih dari Rp 0');
      return;
    }

    const currentStaff = StorageService.getCurrentStaff();
    const newPayment: SantriDebtPayment = {
      id: `PAY-SAN-${Date.now()}`,
      studentId: customer.id,
      studentName: customer.name,
      nis: customer.student?.nis || customer.id,
      className: customer.student?.className || '',
      guardianName: customer.student?.guardianName || '',
      guardianPhone: customer.student?.guardianPhone || customer.phone,
      paymentDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      amount: payAmount,
      paymentMethod: payMethod,
      staffName: currentStaff.name,
      receiptNumber: `KWT-HUTANG-${Date.now()}`,
      notes: payNotes || 'Pembayaran cicilan / pelunasan hutang laundry santri'
    };

    StorageService.recordSantriDebtPayment(newPayment);
    setShowPaymentForm(false);
    setPayAmount(0);
    setPayNotes('');
    alert(`Alhamdulillah, pembayaran sebesar ${formatRupiah(payAmount)} berhasil dicatat dan dialokasikan ke tagihan!`);
  };

  const handleSendWaDebt = () => {
    if (!customer.student) return;
    const link = buildSantriDebtWhatsAppLink(
      customer.student.guardianPhone || customer.phone,
      customer.name,
      customer.student.nis,
      customer.student.className,
      customer.student.guardianName,
      totalDebt,
      unpaidOrders
    );
    window.open(link, '_blank');
  };

  return (
    <div id="customer-detail-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-4 border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center font-black text-base text-emerald-300">
              {customer.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">{customer.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  {customer.type === 'SANTRIWATI' ? 'SANTRIWATI' : customer.type.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 font-mono">
                {isSantri && customer.student?.nis ? `NIS: ${customer.student.nis}` : `ID: ${customer.id}`} • Terdaftar: {customer.createdAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onOpenCard(customer)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white transition-colors"
              title="Lihat Kartu & QR"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(customer)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Edit Data"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs for Modal */}
        {isSantri && (
          <div className="flex bg-slate-100 p-1.5 border-b border-slate-200 px-6 gap-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`py-1.5 px-3 rounded-xl transition-all ${
                activeTab === 'OVERVIEW' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ringkasan & Profil
            </button>
            <button
              onClick={() => setActiveTab('DEBT')}
              className={`py-1.5 px-3 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'DEBT' ? 'bg-white text-rose-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Hutang & Pembayaran</span>
              {totalDebt > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px]">
                  {formatRupiah(totalDebt)}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('ORDERS')}
              className={`py-1.5 px-3 rounded-xl transition-all ${
                activeTab === 'ORDERS' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Riwayat Order ({customerOrders.length})
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {(!isSantri || activeTab === 'OVERVIEW') && (
            <>
              {/* Key Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-medium block">Total Transaksi</span>
                  <span className="text-lg font-black text-slate-900">{customerOrders.length} Order</span>
                </div>
                <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 font-medium block">Total Belanja</span>
                  <span className="text-lg font-black text-emerald-950">
                    {formatRupiah(customerOrders.reduce((acc, o) => acc + o.grandTotal, 0))}
                  </span>
                </div>
                {isSantri ? (
                  <div className={`p-3.5 rounded-2xl border ${
                    totalDebt > 0 ? 'bg-rose-50 border-rose-200 text-rose-950' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  }`}>
                    <span className="text-[10px] font-semibold block opacity-80">
                      {totalDebt > 0 ? '⚠️ Total Sisa Hutang' : 'Status Tagihan'}
                    </span>
                    <span className="text-lg font-black">
                      {totalDebt > 0 ? formatRupiah(totalDebt) : 'Lunas (Rp 0)'}
                    </span>
                  </div>
                ) : (
                  <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
                    <span className="text-[10px] text-amber-700 font-medium block">
                      {customer.type === 'WARGA_PESANTREN' ? 'Tier Diskon' : 'Poin Loyalty'}
                    </span>
                    <span className="text-lg font-black text-amber-950">
                      {customer.type === 'WARGA_PESANTREN'
                        ? `${customer.warga?.membershipTier} (${customer.warga?.discountPercentage}%)`
                        : `${customer.umum?.loyaltyPoints || 0} Poin`}
                    </span>
                  </div>
                )}
              </div>

              {/* Profile Specifics */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                  Detail Lengkap Profil:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Nomor WhatsApp Pelanggan:</span>
                    <span className="font-bold text-slate-900">{customer.phone}</span>
                  </div>

                  {customer.student && (
                    <>
                      <div>
                        <span className="text-slate-500 block">ID Santri / NIS:</span>
                        <span className="font-bold text-slate-900 font-mono">{customer.student.nis}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Kelas Santriwati:</span>
                        <span className="font-extrabold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-lg inline-block">
                          {customer.student.className}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Nama Orang Tua / Wali:</span>
                        <span className="font-bold text-slate-900">{customer.student.guardianName || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Kontak WhatsApp Orang Tua:</span>
                        <span className="font-bold text-emerald-800">{customer.student.guardianPhone || customer.phone}</span>
                      </div>
                      {customer.student.packageActiveUntil && (
                        <div>
                          <span className="text-slate-500 block">Masa Aktif Paket:</span>
                          <span className="font-bold text-slate-900">s/d {customer.student.packageActiveUntil}</span>
                        </div>
                      )}
                    </>
                  )}

                  {customer.warga && (
                    <>
                      <div>
                        <span className="text-slate-500 block">Kategori Warga & Jabatan:</span>
                        <span className="font-bold text-teal-900">{customer.warga.category} • {customer.warga.position}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Unit Kerja:</span>
                        <span className="font-bold text-slate-900">{customer.warga.workUnit}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Alamat Kompleks Pesantren:</span>
                        <span className="font-bold text-slate-900">{customer.warga.complexAddress}</span>
                      </div>
                    </>
                  )}

                  {customer.umum && (
                    <>
                      <div>
                        <span className="text-slate-500 block">Wilayah:</span>
                        <span className="font-bold text-slate-900">{customer.umum.village}, {customer.umum.subdistrict}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Alamat Lengkap:</span>
                        <span className="font-bold text-slate-900">{customer.umum.fullAddress}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Dedicated Hutang Santri Tab */}
          {isSantri && (activeTab === 'DEBT' || activeTab === 'OVERVIEW') && (
            <div className="bg-rose-50/60 p-5 rounded-3xl border border-rose-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-extrabold text-sm text-rose-950 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-rose-700" />
                    Manajemen Hutang & Tagihan Santriwati
                  </h4>
                  <p className="text-[11px] text-rose-700">
                    Pantau tunggakan cucian, cicilan pembayaran, dan kirim rincian nota ke WhatsApp orang tua.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSendWaDebt}
                    className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Kirim WA Orang Tua
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentForm(!showPaymentForm);
                      if (!showPaymentForm) {
                        setPayAmount(totalDebt > 0 ? totalDebt : 10000);
                      }
                    }}
                    className="flex items-center gap-1 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-xs transition-colors"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    {showPaymentForm ? 'Tutup Form Bayar' : 'Bayar / Cicil Hutang'}
                  </button>
                </div>
              </div>

              {/* Debt Summary Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-2xl border border-rose-200/80">
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block">Total Tagihan Belum Lunas</span>
                  <span className="text-base font-black text-rose-700">{formatRupiah(totalDebt)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block">Jumlah Order Tertunggak</span>
                  <span className="text-base font-black text-slate-800">{unpaidOrders.length} Order</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block">Total Riwayat Pembayaran</span>
                  <span className="text-base font-black text-emerald-700">
                    {formatRupiah(payments.reduce((acc, p) => acc + p.amount, 0))}
                  </span>
                </div>
              </div>

              {/* Inline Payment Form */}
              {showPaymentForm && (
                <form onSubmit={handleRecordPayment} className="bg-white p-4 rounded-2xl border-2 border-rose-300 space-y-3">
                  <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-rose-700" />
                    Input Penerimaan Pembayaran / Cicilan Santri
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Nominal Bayar (Rp) *</label>
                      <input
                        type="number"
                        required
                        min={1000}
                        value={payAmount || ''}
                        onChange={(e) => setPayAmount(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                        placeholder="Contoh: 50000"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Metode Pembayaran *</label>
                      <select
                        value={payMethod}
                        onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                      >
                        <option value="CASH">Tunai (Kasir Laundry)</option>
                        <option value="TRANSFER_BSI">Transfer BSI Pondok</option>
                        <option value="QRIS">QRIS Laundry</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Catatan Pembayaran</label>
                      <input
                        type="text"
                        value={payNotes}
                        onChange={(e) => setPayNotes(e.target.value)}
                        placeholder="Contoh: Titipan orang tua saat sambang"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPaymentForm(false)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      Simpan Pembayaran
                    </button>
                  </div>
                </form>
              )}

              {/* Unpaid Orders Breakdown */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-800">Daftar Order Yang Belum Lunas:</h5>
                {unpaidOrders.length > 0 ? (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {unpaidOrders.map(order => {
                      const currentPaid = order.paidAmount || 0;
                      const remaining = Math.max(0, order.grandTotal - currentPaid);
                      return (
                        <div key={order.id} className="bg-white p-2.5 rounded-xl border border-rose-200 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-mono font-bold text-slate-900">{order.id}</span>
                            <span className="text-[10px] text-slate-500 ml-2">({order.orderDate.slice(0, 10)}) • {order.totalWeightKg} Kg</span>
                          </div>
                          <div className="text-right">
                            <span className="text-rose-700 font-extrabold block">{formatRupiah(remaining)}</span>
                            <span className="text-[10px] text-slate-500">Total: {formatRupiah(order.grandTotal)} (Terbayar: {formatRupiah(currentPaid)})</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-center text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Tidak ada tunggakan hutang. Semua cucian ananda lunas!
                  </div>
                )}
              </div>

              {/* Past Payments History */}
              {payments.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-rose-200/80">
                  <h5 className="text-xs font-bold text-slate-800">Riwayat Pembayaran Hutang Terakhir:</h5>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {payments.map(p => (
                      <div key={p.id} className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-900">{p.paymentDate} • {p.paymentMethod.replace('_', ' ')}</div>
                          <div className="text-[10px] text-slate-500">Diterima oleh: {p.staffName} {p.notes ? `• ${p.notes}` : ''}</div>
                        </div>
                        <div className="font-extrabold text-emerald-800 text-right">
                          +{formatRupiah(p.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Transaction History */}
          {(!isSantri || activeTab === 'ORDERS' || activeTab === 'OVERVIEW') && (
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-emerald-700" />
                Semua Riwayat Cucian:
              </h4>

              <div className="space-y-2 max-h-52 overflow-y-auto">
                {customerOrders.map(order => (
                  <div 
                    key={order.id} 
                    onClick={() => onSelectOrder(order)}
                    className="bg-white p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition-all flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span className="font-mono">{order.id}</span>
                        <span className="text-[10px] text-slate-500 font-normal">({order.orderDate})</span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        {order.totalWeightKg > 0 ? `${order.totalWeightKg} Kg • ` : ''}
                        {order.items.map(i => i.serviceName).join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-emerald-900">{formatRupiah(order.grandTotal)}</div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        order.paymentStatus === 'LUNAS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))}

                {customerOrders.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                    Belum ada riwayat transaksi untuk pelanggan ini.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2 justify-between">
          <button
            onClick={() => onOpenCard(customer)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            Buka Kartu Pelanggan
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                onCreateOrder(customer);
                onClose();
              }}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Buat Transaksi Baru
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
