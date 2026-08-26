import React, { useState } from 'react';
import { X, CheckCircle2, ArrowRight, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { LaundryOrder, OrderStatus } from '../../types';
import { ORDER_STATUS_WORKFLOW, STATUS_METADATA, StorageService } from '../../data/storage';

interface StatusChangeModalProps {
  order: LaundryOrder | null;
  onClose: () => void;
  onStatusUpdated: () => void;
}

export const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  order,
  onClose,
  onStatusUpdated
}) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
  const [notes, setNotes] = useState('');
  const currentStaff = StorageService.getCurrentStaff();

  if (!order) return null;

  const currentStatus = order.currentStatus;
  const currentIndex = ORDER_STATUS_WORKFLOW.indexOf(currentStatus);
  const nextStatus = currentIndex < ORDER_STATUS_WORKFLOW.length - 1 ? ORDER_STATUS_WORKFLOW[currentIndex + 1] : null;

  const targetStatus = selectedStatus || nextStatus || currentStatus;

  const handleUpdate = (statusToSet: OrderStatus) => {
    StorageService.updateOrderStatus(
      order.id,
      statusToSet,
      currentStaff.name,
      notes || `Status diperbarui ke ${STATUS_METADATA[statusToSet].label}`
    );
    onStatusUpdated();
    onClose();
  };

  return (
    <div id="status-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm">Update Status Laundry</h3>
            <p className="text-xs text-emerald-200/90">Invoice: <strong className="font-mono text-white">{order.id}</strong></p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Quick 1-Click Advance to Next Status */}
          {nextStatus && (
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-2">
              <div className="text-xs font-bold text-emerald-950">Langkah Berikutnya yang Direkomendasikan:</div>
              <button
                type="button"
                onClick={() => handleUpdate(nextStatus)}
                className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold py-3 px-4 rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                <span>Lanjut ke: <strong>{STATUS_METADATA[nextStatus].label}</strong></span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Or choose any status manually */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Atau Pilih Status Spesifik:</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {ORDER_STATUS_WORKFLOW.map((statusKey, idx) => {
                const meta = STATUS_METADATA[statusKey];
                const isSelected = targetStatus === statusKey;
                const isCurrent = currentStatus === statusKey;
                return (
                  <button
                    key={statusKey}
                    type="button"
                    onClick={() => setSelectedStatus(statusKey)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                        : isCurrent
                        ? 'border-slate-300 bg-slate-100 text-slate-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{idx + 1}. {meta.label}</span>
                      {isCurrent && <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">Saat Ini</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Catatan Pengerjaan / Petugas:</label>
            <input
              type="text"
              placeholder="Contoh: Dicuci di mesin cuci No. 2 / Siap antar..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Tercatat oleh: <strong>{currentStaff.name}</strong> ({currentStaff.roleTitle})</span>
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
            onClick={() => handleUpdate(targetStatus)}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            Simpan Perubahan ({STATUS_METADATA[targetStatus].label})
          </button>
        </div>

      </div>
    </div>
  );
};
