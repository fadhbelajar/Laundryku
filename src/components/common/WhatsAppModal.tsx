import React, { useState } from 'react';
import { MessageCircle, X, Send, Copy, Check } from 'lucide-react';
import { LaundryOrder } from '../../types';
import { buildWhatsAppLink } from '../../data/storage';

interface WhatsAppModalProps {
  order: LaundryOrder | null;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ order, onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<
    'ORDER_DITERIMA' | 'SEDANG_DIPROSES' | 'SIAP_DIAMBIL' | 'DELIVERY' | 'SELESAI' | 'TAGIHAN' | 'SANTRI_ASRAMA'
  >('ORDER_DITERIMA');

  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const targetPhone = order.customerType === 'SANTRIWATI' && order.studentDormInfo?.guardianPhone
    ? order.studentDormInfo.guardianPhone
    : order.customerPhone;

  const waLink = buildWhatsAppLink(targetPhone, selectedTemplate, order);

  const handleOpenWA = () => {
    window.open(waLink, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(waLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="whatsapp-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-[#128C7E] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-100" />
            <div>
              <h3 className="font-bold text-sm">Kirim Notifikasi WhatsApp</h3>
              <p className="text-[11px] text-emerald-100/90">Kirim update otomatis ke nomor {targetPhone}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-black/10 hover:bg-black/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Customer Highlight */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block">Penerima:</span>
              <span className="font-bold text-slate-900">{order.customerName}</span>
              {order.customerType === 'SANTRIWATI' && (
                <span className="text-[10px] text-emerald-700 block">Wali Santri / Pengurus Kamar</span>
              )}
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">No. Invoice:</span>
              <span className="font-mono font-bold text-slate-900">{order.id}</span>
            </div>
          </div>

          {/* Template Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Pilih Template Pesan:</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedTemplate('ORDER_DITERIMA')}
                className={`p-2.5 rounded-xl text-left border font-medium transition-all ${
                  selectedTemplate === 'ORDER_DITERIMA'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                📥 Order Diterima
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('SEDANG_DIPROSES')}
                className={`p-2.5 rounded-xl text-left border font-medium transition-all ${
                  selectedTemplate === 'SEDANG_DIPROSES'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                🔄 Sedang Diproses
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('SIAP_DIAMBIL')}
                className={`p-2.5 rounded-xl text-left border font-medium transition-all ${
                  selectedTemplate === 'SIAP_DIAMBIL'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                ✅ Siap Diambil
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('DELIVERY')}
                className={`p-2.5 rounded-xl text-left border font-medium transition-all ${
                  selectedTemplate === 'DELIVERY'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                🚚 Dalam Pengantaran
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('TAGIHAN')}
                className={`p-2.5 rounded-xl text-left border font-medium transition-all ${
                  selectedTemplate === 'TAGIHAN'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                💳 Rincian Tagihan
              </button>

              {order.customerType === 'SANTRIWATI' && (
                <button
                  type="button"
                  onClick={() => setSelectedTemplate('SANTRI_ASRAMA')}
                  className={`p-2.5 rounded-xl text-left border font-medium transition-all ${
                    selectedTemplate === 'SANTRI_ASRAMA'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  👧 Info Asrama & Kamar
                </button>
              )}
            </div>
          </div>

          {/* WhatsApp Bubble Preview */}
          <div className="bg-[#EFEAE2] p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Pratinjau Pesan:
            </div>
            <div className="bg-white p-3.5 rounded-2xl rounded-tl-none shadow-xs text-xs text-slate-800 space-y-2 whitespace-pre-line leading-relaxed font-sans">
              {decodeURIComponent(waLink.split('text=')[1] || '')}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Tersalin' : 'Salin Pesan'}
          </button>
          
          <button
            onClick={handleOpenWA}
            className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            <Send className="w-4 h-4" />
            Buka di WhatsApp
          </button>
        </div>

      </div>
    </div>
  );
};
