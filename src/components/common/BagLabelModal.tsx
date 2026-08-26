import React, { useEffect, useState } from 'react';
import { Tag, Printer, X, User, Home, Package } from 'lucide-react';
import { LaundryOrder } from '../../types';
import { generateQrDataUrl } from '../../data/storage';
import { AppLogo } from './AppLogo';

interface BagLabelModalProps {
  order: LaundryOrder | null;
  onClose: () => void;
}

export const BagLabelModal: React.FC<BagLabelModalProps> = ({ order, onClose }) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (order) {
      generateQrDataUrl(`BAG-${order.id}-${order.customerId}`).then(setQrUrl);
    }
  }, [order]);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="bag-label-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        <div className="bg-emerald-950 text-white px-5 py-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">Label Kantong Laundry</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white transition-colors"
              title="Cetak Label"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 bg-slate-100 flex justify-center">
          {/* Physical Bag Sticker Mockup */}
          <div className="w-full bg-white p-4 rounded-2xl border-2 border-dashed border-emerald-600 shadow-md space-y-3 font-sans print:border-solid print:shadow-none">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <AppLogo size="sm" />
                <div>
                  <h4 className="font-black text-xs text-emerald-950 leading-tight">LAUNDRY ALMAWADDAH</h4>
                  <p className="text-[9px] font-semibold text-emerald-700 tracking-wider">LABEL KANTONG / BASKET</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                {order.customerType === 'SANTRIWATI' ? 'SANTRI' : order.customerType === 'WARGA_PESANTREN' ? 'WARGA' : 'UMUM'}
              </span>
            </div>

            {/* Main Highlight: Customer & Dorm Room */}
            <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-extrabold text-sm text-emerald-950 truncate">{order.customerName}</span>
              </div>

              {order.studentDormInfo ? (
                <div className="text-xs space-y-0.5 pt-1 border-t border-emerald-200/60">
                  <div className="flex items-center gap-1 text-emerald-900 font-bold">
                    <Home className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Kelas: {order.studentDormInfo.className || '-'}</span>
                  </div>
                  {order.studentDormInfo.guardianName && (
                    <div className="text-[10px] text-emerald-700 font-medium pl-4.5">
                      Wali: {order.studentDormInfo.guardianName} ({order.studentDormInfo.guardianPhone || '-'})
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[10px] text-slate-600 truncate">
                  ID: {order.customerId} • WA: {order.customerPhone}
                </div>
              )}
            </div>

            {/* Order Details & Stats */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                <span className="text-[9px] text-slate-500 block">BERAT</span>
                <span className="font-bold text-slate-900">{order.totalWeightKg} Kg</span>
              </div>
              <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                <span className="text-[9px] text-slate-500 block">JUMLAH</span>
                <span className="font-bold text-slate-900">{order.totalPieces} Pcs</span>
              </div>
              <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                <span className="text-[9px] text-slate-500 block">KEMASAN</span>
                <span className="font-bold text-emerald-700">{order.packing.packageCount || 1} Bag</span>
              </div>
            </div>

            {/* Services Summary */}
            <div className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg space-y-1">
              <div className="font-semibold text-slate-800">Layanan:</div>
              <div className="text-slate-700">
                {order.items.map(i => `${i.serviceName} (${i.quantity} ${i.unit})`).join(', ')}
              </div>
              {order.perfumeOption && (
                <div className="text-emerald-800 font-medium text-[9px]">
                  🌸 {order.perfumeOption}
                </div>
              )}
            </div>

            {/* QR Barcode and Dates */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
              <div className="space-y-0.5 text-[9px] text-slate-500">
                <div>Masuk: <span className="text-slate-700 font-medium">{order.orderDate}</span></div>
                <div>Selesai: <span className="text-emerald-800 font-bold">{order.estimatedCompletionDate}</span></div>
                <div className="font-mono font-semibold text-slate-900 text-[10px]">{order.id}</div>
              </div>
              {qrUrl && (
                <img src={qrUrl} alt="QR Bag" className="w-16 h-16 border border-slate-200 rounded-md p-0.5" />
              )}
            </div>

          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-200 flex gap-2 no-print">
          <button
            onClick={handlePrint}
            className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Cetak Stiker Kantong
          </button>
        </div>

      </div>
    </div>
  );
};
