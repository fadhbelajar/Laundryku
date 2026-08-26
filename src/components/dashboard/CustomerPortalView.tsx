import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  Package, 
  CheckCircle2, 
  Clock, 
  Building, 
  Phone, 
  FileText, 
  Send,
  AlertCircle
} from 'lucide-react';
import { LaundryOrder } from '../../types';
import { StorageService, STATUS_METADATA, formatRupiah, ORDER_STATUS_WORKFLOW } from '../../data/storage';
import { AppLogo } from '../common/AppLogo';

interface CustomerPortalProps {
  onOpenWhatsApp: (order: LaundryOrder) => void;
}

export const CustomerPortalView: React.FC<CustomerPortalProps> = ({ onOpenWhatsApp }) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<LaundryOrder | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const orders = StorageService.getOrders();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    const q = searchInput.trim().toLowerCase();
    const found = orders.find(o => 
      o.id.toLowerCase() === q ||
      o.customerPhone.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, '')) ||
      o.customerName.toLowerCase().includes(q)
    );

    setSearchedOrder(found || null);
    setHasSearched(true);
  };

  return (
    <div id="customer-portal-view" className="max-w-3xl mx-auto space-y-6">
      
      {/* Brand Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-8 rounded-3xl shadow-xl text-center space-y-3 relative overflow-hidden">
        <div className="flex justify-center mb-1">
          <AppLogo size="lg" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Portal Pelanggan & Wali Santriwati</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">Cek Status Cucian Laundry Almawaddah</h1>
        <p className="text-xs sm:text-sm text-emerald-100/90 font-light max-w-lg mx-auto">
          Masukkan Nomor Nota / Invoice atau Nomor WhatsApp untuk melacak progress cucian secara transparan.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="pt-3 max-w-xl mx-auto flex gap-2">
          <input
            type="text"
            required
            placeholder="Contoh: INV-20260825-001 atau 081234567890"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 bg-white/95 text-slate-900 placeholder-slate-400 text-xs sm:text-sm rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-amber-400 font-semibold"
          />
          <button
            type="submit"
            className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs sm:text-sm px-6 rounded-2xl transition-all shadow-md active:scale-95"
          >
            Lacak
          </button>
        </form>
      </div>

      {/* Search Result */}
      {hasSearched && searchedOrder && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md space-y-6">
          
          {/* Top Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <span className="font-mono text-xs text-slate-400">Nomor Invoice</span>
              <h2 className="text-lg font-black text-slate-900 font-mono">{searchedOrder.id}</h2>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400 block">Status Terkini</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full inline-block mt-0.5 ${STATUS_METADATA[searchedOrder.currentStatus].badgeClass}`}>
                {STATUS_METADATA[searchedOrder.currentStatus].label}
              </span>
            </div>
          </div>

          {/* Customer & Dorm Detail */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Nama Pemilik:</span>
              <strong className="text-slate-900 font-extrabold text-sm">{searchedOrder.customerName}</strong>
            </div>

            {searchedOrder.studentDormInfo && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Gedung Asrama:</span>
                  <strong className="text-emerald-900 font-bold">{searchedOrder.studentDormInfo.dormitoryName}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Nomor Kamar:</span>
                  <strong className="text-emerald-900 font-bold">{searchedOrder.studentDormInfo.roomNumber}</strong>
                </div>
              </>
            )}

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Jumlah & Berat:</span>
              <strong className="text-slate-900">{searchedOrder.totalPieces} Pcs ({searchedOrder.totalWeightKg} Kg)</strong>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-slate-500">Total Biaya:</span>
              <strong className="text-emerald-900 font-black text-sm">{formatRupiah(searchedOrder.grandTotal)}</strong>
            </div>
          </div>

          {/* Timeline Progress */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
              Riwayat Perjalanan Cucian:
            </h3>

            <div className="space-y-2">
              {searchedOrder.history.map((h, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{STATUS_METADATA[h.status]?.label || h.status}</div>
                    <p className="text-slate-500 text-[11px]">{h.notes}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{h.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-500 text-center sm:text-left">
              Ada pertanyaan mengenai cucian ini? Hubungi CS Laundry Almawaddah.
            </span>
            <button
              onClick={() => onOpenWhatsApp(searchedOrder)}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              WhatsApp CS Laundry
            </button>
          </div>

        </div>
      )}

      {hasSearched && !searchedOrder && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs space-y-2">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="font-extrabold text-sm text-slate-900">Data Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Nomor invoice atau telepon "{searchInput}" tidak terdaftar dalam sistem. Pastikan nomor sudah sesuai nota.
          </p>
        </div>
      )}

      {/* Quick Demo Help */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
        <span className="font-bold text-slate-800 block">💡 Tips Demo Pelacakan Cepat:</span>
        <div>Coba masukkan nomor invoice: <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-emerald-800">INV-20260825-001</code> atau <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-emerald-800">INV-20260825-002</code></div>
      </div>

    </div>
  );
};
