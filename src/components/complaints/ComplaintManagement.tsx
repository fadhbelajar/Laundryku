import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  MessageCircle, 
  Sparkles, 
  RotateCcw,
  X,
  Save,
  AlertCircle
} from 'lucide-react';
import { ComplaintTicket, LaundryOrder } from '../../types';
import { StorageService, formatRupiah } from '../../data/storage';

export const ComplaintManagement: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintTicket[]>(StorageService.getComplaints());
  const [orders, setOrders] = useState<LaundryOrder[]>(StorageService.getOrders());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form fields
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [category, setCategory] = useState<ComplaintTicket['category']>('KURANG_BERSIH');
  const [description, setDescription] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('Diberikan garansi cuci ulang prioritas gratis.');
  const [compensationAmount, setCompensationAmount] = useState<number>(0);

  const currentStaff = StorageService.getCurrentStaff();

  const refreshData = () => {
    setComplaints(StorageService.getComplaints());
    setOrders(StorageService.getOrders());
  };

  const handleCreateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    const order = orders.find(o => o.id === selectedOrderId);
    if (!order) {
      alert('Pilih pesanan/invoice yang valid!');
      return;
    }

    const newTicket: ComplaintTicket = {
      id: `TKT-${Date.now().toString().slice(-6)}`,
      orderId: order.id,
      customerId: order.customerId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      category: category,
      description: description,
      status: 'BARU',
      reportedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      resolvedByStaff: currentStaff.name,
      resolutionNotes: resolutionNotes,
      compensationAmount: compensationAmount
    };

    const updated = [newTicket, ...complaints];
    StorageService.saveComplaints(updated);
    setIsModalOpen(false);
    setDescription('');
    refreshData();
  };

  const handleResolveTicket = (ticketId: string) => {
    const all = StorageService.getComplaints();
    const target = all.find(t => t.id === ticketId);
    if (target) {
      target.status = 'SELESAI';
      target.resolvedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
      target.resolvedByStaff = currentStaff.name;
      StorageService.saveComplaints(all);
    }
    refreshData();
  };

  return (
    <div id="complaints-management-view" className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-700" />
            Layanan Pengaduan, Komplain & Garansi Cuci Ulang
          </h2>
          <p className="text-xs text-slate-500">
            Sistem penanganan tiket komplain terhubung nomor invoice, garansi cuci ulang gratis dan kompensasi.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-rose-700 hover:bg-rose-800 text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-2xl shadow-md transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Buat Tiket Pengaduan Baru
        </button>
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {complaints.map(ticket => (
          <div
            key={ticket.id}
            className="bg-white rounded-3xl border border-slate-200 hover:border-rose-300 p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-rose-900">{ticket.id}</span>
                  <h3 className="font-extrabold text-sm text-slate-900 mt-0.5">{ticket.customerName}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Invoice: {ticket.orderId} • {ticket.reportedAt}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  ticket.status === 'SELESAI' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800 animate-pulse'
                }`}>
                  {ticket.status === 'SELESAI' ? 'SELESAI DITANGANI' : 'DALAM PROSES'}
                </span>
              </div>

              {/* Detail box */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="font-bold text-rose-900">
                  Jenis: {ticket.category.replace(/_/g, ' ')}
                </div>
                <p className="text-slate-700 leading-relaxed italic">"{ticket.description}"</p>
                
                {ticket.resolutionNotes && (
                  <div className="pt-2 border-t border-slate-200/80 text-[11px] text-emerald-900 font-semibold">
                    Solusi: <span className="font-normal text-slate-600">{ticket.resolutionNotes}</span>
                  </div>
                )}
                {ticket.compensationAmount ? (
                  <div className="text-[11px] text-rose-800 font-bold">
                    Kompensasi: {formatRupiah(ticket.compensationAmount)}
                  </div>
                ) : null}
              </div>

              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>WA: {ticket.customerPhone}</span>
                {ticket.resolvedByStaff && <span>Petugas: {ticket.resolvedByStaff}</span>}
              </div>
            </div>

            {/* Ticket Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">{ticket.resolvedAt ? `Selesai: ${ticket.resolvedAt}` : 'Menunggu tindakan'}</span>

              {ticket.status !== 'SELESAI' && (
                <button
                  onClick={() => handleResolveTicket(ticket.id)}
                  className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Tandai Selesai
                </button>
              )}
            </div>
          </div>
        ))}

        {complaints.length === 0 && (
          <div className="col-span-full bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400 text-xs">
            Alhamdulillah, tidak ada komplain aktif saat ini.
          </div>
        )}
      </div>

      {/* New Complaint Modal */}
      {isModalOpen && (
        <div id="complaint-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-rose-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Buat Tiket Pengaduan Pelanggan</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-rose-800 hover:bg-rose-700 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateComplaint} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Pilih Nomor Invoice / Cucian *</label>
                <select
                  required
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                >
                  <option value="">-- Pilih Transaksi --</option>
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.id} - {o.customerName} ({o.customerType.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Kategori Kendala</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                >
                  <option value="KURANG_BERSIH">Noda Kurang Bersih (Cuci Ulang)</option>
                  <option value="PAKAIAN_HILANG">Pakaian Tertinggal / Hilang</option>
                  <option value="PAKAIAN_TERTUKAR">Pakaian Tertukar</option>
                  <option value="PAKAIAN_RUSAK">Pakaian Rusak / Luntur</option>
                  <option value="KETERLAMBATAN">Pengerjaan Terlambat</option>
                  <option value="LAINNYA">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Rincian Komplain *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Contoh: Mukena putih ada bercak kecap di bagian bawah belum hilang..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tindakan / Solusi</label>
                  <input
                    type="text"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Kompensasi Nominal (Rp)</label>
                  <input
                    type="number"
                    value={compensationAmount}
                    onChange={(e) => setCompensationAmount(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
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
                  className="flex-1 flex items-center justify-center gap-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Simpan Tiket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
