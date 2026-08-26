import React, { useEffect, useState } from 'react';
import { Printer, Download, Share2, X, Check, MessageCircle } from 'lucide-react';
import { LaundryOrder, AppSettings } from '../../types';
import { StorageService, formatRupiah, generateQrDataUrl, buildWhatsAppLink } from '../../data/storage';
import { AppLogo } from './AppLogo';

interface ThermalReceiptModalProps {
  order: LaundryOrder | null;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({ order, onClose }) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const settings: AppSettings = StorageService.getSettings();

  useEffect(() => {
    if (order) {
      generateQrDataUrl(order.id).then(setQrUrl);
    }
  }, [order]);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const openWhatsApp = () => {
    const link = buildWhatsAppLink(order.customerPhone, 'ORDER_DITERIMA', order);
    window.open(link, '_blank');
  };

  return (
    <div id="receipt-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden my-8 border border-slate-200">
        
        {/* Action Header */}
        <div className="bg-emerald-900 text-white px-5 py-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-sm">Nota Transaksi Kasir</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={openWhatsApp}
              className="p-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white transition-colors"
              title="Kirim Nota via WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-200" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white transition-colors"
              title="Cetak Struk"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-slate-300 hover:text-white transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thermal Slip Content */}
        <div className="p-6 bg-slate-50 font-mono text-xs text-slate-800 space-y-4 max-h-[75vh] overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 print:border-none print:shadow-none space-y-3">
            
            {/* Header / Brand */}
            <div className="text-center space-y-1 pb-2 border-b border-dashed border-slate-300">
              <div className="flex justify-center mb-1">
                <AppLogo size="sm" />
              </div>
              <h2 className="font-extrabold text-base tracking-tight text-slate-900 font-sans">
                {settings.storeName.toUpperCase()}
              </h2>
              <p className="text-[10px] text-slate-500 font-sans font-medium">{settings.tagline}</p>
              <p className="text-[9px] text-slate-500">{settings.address}</p>
              <p className="text-[9px] text-slate-500">WA: {settings.phone}</p>
            </div>

            {/* Meta Info */}
            <div className="text-[11px] space-y-0.5 border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Nota:</span>
                <span className="font-bold text-slate-900">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal:</span>
                <span>{order.orderDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pelanggan:</span>
                <span className="font-semibold text-slate-900">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kategori:</span>
                <span className="font-medium bg-slate-100 px-1.5 py-0.2 rounded text-[10px] text-slate-700">
                  {order.customerType.replace('_', ' ')}
                </span>
              </div>
              {order.studentDormInfo && (
                <div className="flex justify-between text-emerald-900 font-medium">
                  <span>Kelas / Wali:</span>
                  <span>Kelas {order.studentDormInfo.className || '-'} ({order.studentDormInfo.guardianName || '-'})</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Kasir:</span>
                <span>{order.staffInChargeName}</span>
              </div>
            </div>

            {/* Item List */}
            <div className="space-y-2 border-b border-dashed border-slate-300 pb-3">
              <div className="font-bold text-[11px] text-slate-900 flex justify-between">
                <span>LAYANAN / ITEM</span>
                <span>TOTAL</span>
              </div>

              {order.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5 text-[11px]">
                  <div className="font-medium text-slate-900">{item.serviceName}</div>
                  <div className="flex justify-between text-slate-600 pl-1 text-[10px]">
                    <span>{item.quantity} {item.unit} x {formatRupiah(item.unitPrice)}</span>
                    <span className="font-semibold">{formatRupiah(item.subtotal)}</span>
                  </div>
                  {item.notes && (
                    <div className="text-[9px] text-slate-400 italic pl-1">Catatan: {item.notes}</div>
                  )}
                </div>
              ))}

              {order.additionalAddons.filter(a => a.selected).map((addon, idx) => (
                <div key={idx} className="flex justify-between text-[10px] text-emerald-800">
                  <span>+ {addon.name}</span>
                  <span>{formatRupiah(addon.price)}</span>
                </div>
              ))}

              {order.perfumeOption && (
                <div className="text-[10px] text-slate-500 italic bg-amber-50/70 p-1 rounded">
                  Parfum: {order.perfumeOption}
                </div>
              )}
            </div>

            {/* Total Calculations */}
            <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Layanan:</span>
                <span>{formatRupiah(order.itemsSubtotal)}</span>
              </div>
              {order.addonsSubtotal > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Layanan Tambahan:</span>
                  <span>{formatRupiah(order.addonsSubtotal)}</span>
                </div>
              )}
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Ongkir ({order.delivery.zoneName?.split('-')[0] || 'Delivery'}):</span>
                  <span>{formatRupiah(order.deliveryFee)}</span>
                </div>
              )}
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Diskon / Promo:</span>
                  <span>-{formatRupiah(order.discountAmount)}</span>
                </div>
              )}
              {order.pointsDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Potongan Poin ({order.pointsUsed} Poin):</span>
                  <span>-{formatRupiah(order.pointsDiscount)}</span>
                </div>
              )}
              
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>GRAND TOTAL:</span>
                <span className="text-emerald-900">{formatRupiah(order.grandTotal)}</span>
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-slate-100 p-2.5 rounded-xl text-[11px] space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Metode Bayar:</span>
                <span className="font-bold text-slate-900">{order.paymentMethod.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Status Pembayaran:</span>
                <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                  order.paymentStatus === 'LUNAS' 
                    ? 'bg-emerald-200 text-emerald-900' 
                    : 'bg-amber-200 text-amber-900'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.paymentStatus === 'LUNAS' && (
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Bayar / Diterima:</span>
                  <span>{formatRupiah(order.paidAmount)}</span>
                </div>
              )}
              {order.changeAmount > 0 && (
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Kembalian:</span>
                  <span>{formatRupiah(order.changeAmount)}</span>
                </div>
              )}
            </div>

            {/* QR Code & Estimation */}
            <div className="text-center pt-2 space-y-2">
              {qrUrl && (
                <div className="flex flex-col items-center">
                  <img src={qrUrl} alt="QR Invoice" className="w-24 h-24" />
                  <span className="text-[9px] text-slate-400 tracking-wider font-mono mt-0.5">{order.id}</span>
                </div>
              )}

              <div className="bg-emerald-50 text-emerald-950 p-2 rounded-lg text-[10px] font-sans">
                <span className="font-bold block">Estimasi Selesai:</span>
                <span className="text-emerald-800 font-medium">{order.estimatedCompletionDate}</span>
              </div>

              <p className="text-[9px] text-slate-500 font-sans leading-relaxed pt-1">
                {settings.receiptFooterNote}
              </p>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex gap-2 no-print">
          <button
            onClick={openWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Kirim WhatsApp
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Cetak Nota
          </button>
        </div>

      </div>
    </div>
  );
};
