import React, { useState } from 'react';
import { X, ShieldCheck, Check, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import { LaundryOrder } from '../../types';
import { StorageService } from '../../data/storage';

interface QualityControlModalProps {
  order: LaundryOrder | null;
  onClose: () => void;
  onQcSaved: () => void;
}

export const QualityControlModal: React.FC<QualityControlModalProps> = ({
  order,
  onClose,
  onQcSaved
}) => {
  const [itemCountMatched, setItemCountMatched] = useState(order?.qualityCheck?.itemCountMatched ?? true);
  const [cleanlinessPassed, setCleanlinessPassed] = useState(order?.qualityCheck?.cleanlinessPassed ?? true);
  const [neatnessPassed, setNeatnessPassed] = useState(order?.qualityCheck?.neatnessPassed ?? true);
  const [fabricConditionPassed, setFabricConditionPassed] = useState(order?.qualityCheck?.fabricConditionPassed ?? true);
  const [hasIssues, setHasIssues] = useState(order?.qualityCheck?.hasIssues ?? false);
  const [issueNotes, setIssueNotes] = useState(order?.qualityCheck?.issueNotes ?? '');

  const currentStaff = StorageService.getCurrentStaff();

  if (!order) return null;

  const handleSaveQc = () => {
    const orders = StorageService.getOrders();
    const target = orders.find(o => o.id === order.id);
    if (target) {
      target.qualityCheck = {
        checkedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        checkerStaffName: currentStaff.name,
        itemCountMatched,
        cleanlinessPassed,
        neatnessPassed,
        fabricConditionPassed,
        hasIssues,
        issueNotes
      };
      
      // If QC passed and status is before Packing, advance to PACKING
      if (!hasIssues && cleanlinessPassed && neatnessPassed && itemCountMatched) {
        StorageService.updateOrderStatus(order.id, 'PACKING', currentStaff.name, 'Lolos Quality Control (QC)');
      }

      StorageService.saveOrders(orders);
    }
    onQcSaved();
    onClose();
  };

  return (
    <div id="qc-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-rose-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-rose-300" />
            <div>
              <h3 className="font-bold text-sm">Pemeriksaan Kualitas (Quality Check)</h3>
              <p className="text-xs text-rose-200">Invoice: {order.id} • {order.customerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-rose-800 hover:bg-rose-700 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200 text-xs text-rose-950">
            Petugas pemeriksa: <strong>{currentStaff.name}</strong> ({currentStaff.roleTitle})
          </div>

          {/* Checklist items */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 block">Daftar Parameter Uji Kualitas:</label>
            
            <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
              <div>
                <span className="font-bold text-xs text-slate-900 block">1. Kesesuaian Jumlah Pakaian</span>
                <span className="text-[11px] text-slate-500">Jumlah {order.totalPieces} potong pakaian cocok tanpa ada yang tertinggal</span>
              </div>
              <input
                type="checkbox"
                checked={itemCountMatched}
                onChange={(e) => setItemCountMatched(e.target.checked)}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
              <div>
                <span className="font-bold text-xs text-slate-900 block">2. Kebersihan Tuntas & Bebas Noda</span>
                <span className="text-[11px] text-slate-500">Kerah, ujung lengan, mukena & gamis bersih sempurna</span>
              </div>
              <input
                type="checkbox"
                checked={cleanlinessPassed}
                onChange={(e) => setCleanlinessPassed(e.target.checked)}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
              <div>
                <span className="font-bold text-xs text-slate-900 block">3. Kerapian Setrika & Harum Standar Pesantren</span>
                <span className="text-[11px] text-slate-500">Setrika uap licin rapi, lipatan presisi, aroma wangi merata</span>
              </div>
              <input
                type="checkbox"
                checked={neatnessPassed}
                onChange={(e) => setNeatnessPassed(e.target.checked)}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
              <div>
                <span className="font-bold text-xs text-slate-900 block">4. Kondisi Serat & Kancing Aman</span>
                <span className="text-[11px] text-slate-500">Tidak ada kancing lepas, robekan baru, atau warna luntur</span>
              </div>
              <input
                type="checkbox"
                checked={fabricConditionPassed}
                onChange={(e) => setFabricConditionPassed(e.target.checked)}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>
          </div>

          {/* Has Issue Flag */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-rose-700">
              <input
                type="checkbox"
                checked={hasIssues}
                onChange={(e) => setHasIssues(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
              />
              Tandai Jika Ditemukan Masalah / Perlu Cuci Ulang
            </label>

            {hasIssues && (
              <textarea
                placeholder="Jelaskan detail kendala (misal: Noda saus di kerah belum hilang, perlu spot cleaning ulang)..."
                value={issueNotes}
                onChange={(e) => setIssueNotes(e.target.value)}
                rows={3}
                className="w-full bg-rose-50 border border-rose-300 rounded-xl p-3 text-xs text-slate-900 placeholder-rose-400 focus:outline-none focus:border-rose-600"
              />
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSaveQc}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Simpan Hasil QC & Lanjut Packing
          </button>
        </div>

      </div>
    </div>
  );
};
