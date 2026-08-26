import React from 'react';
import { 
  X, 
  Printer, 
  MessageCircle, 
  Tag, 
  CheckCircle2, 
  Clock, 
  User, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  PackageCheck
} from 'lucide-react';
import { LaundryOrder } from '../../types';
import { STATUS_METADATA, formatRupiah, ORDER_STATUS_WORKFLOW } from '../../data/storage';

interface OrderDetailModalProps {
  order: LaundryOrder | null;
  onClose: () => void;
  onOpenReceipt: (order: LaundryOrder) => void;
  onOpenBagLabel: (order: LaundryOrder) => void;
  onOpenWhatsApp: (order: LaundryOrder) => void;
  onOpenStatusModal: (order: LaundryOrder) => void;
  onOpenQcModal: (order: LaundryOrder) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onOpenReceipt,
  onOpenBagLabel,
  onOpenWhatsApp,
  onOpenStatusModal,
  onOpenQcModal
}) => {
  if (!order) return null;

  const currentStatusMeta = STATUS_METADATA[order.currentStatus];
  const currentStepIndex = ORDER_STATUS_WORKFLOW.indexOf(order.currentStatus);

  return (
    <div id="order-detail-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-4 border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-white/10">
              <PackageCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg tracking-tight font-mono">{order.id}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${currentStatusMeta.badgeClass}`}>
                  {currentStatusMeta.label}
                </span>
              </div>
              <p className="text-xs text-emerald-200/90">
                Masuk: {order.orderDate} • Estimasi: <strong className="text-white">{order.estimatedCompletionDate}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onOpenWhatsApp(order)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white transition-colors"
              title="Kirim WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenReceipt(order)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Cetak Nota"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenBagLabel(order)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Cetak Label Kantong"
            >
              <Tag className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Visual 13-Step Progress Workflow Tracker */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Progres 13 Tahap Laundry:</span>
              <span className="font-extrabold text-emerald-800">
                Langkah {currentStepIndex + 1} dari {ORDER_STATUS_WORKFLOW.length} ({Math.round(((currentStepIndex + 1) / ORDER_STATUS_WORKFLOW.length) * 100)}%)
              </span>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-600 to-teal-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${((currentStepIndex + 1) / ORDER_STATUS_WORKFLOW.length) * 100}%` }}
              />
            </div>

            {/* Workflow Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
              {ORDER_STATUS_WORKFLOW.map((statusKey, idx) => {
                const meta = STATUS_METADATA[statusKey];
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div
                    key={statusKey}
                    className={`px-2.5 py-1 rounded-xl whitespace-nowrap shrink-0 border transition-all ${
                      isCurrent
                        ? 'bg-emerald-700 text-white font-bold border-emerald-700 shadow-xs'
                        : isPassed
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200 font-medium'
                        : 'bg-white text-slate-400 border-slate-200'
                    }`}
                  >
                    {idx + 1}. {meta.label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid 2 Columns: Customer & Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Customer Information */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-500 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-700" />
                  INFORMASI PELANGGAN
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {order.customerType.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="text-sm font-extrabold text-slate-900">{order.customerName}</div>
                <div className="text-slate-600">ID Pelanggan: <strong className="font-mono">{order.customerId}</strong></div>
                <div className="text-slate-600">WhatsApp: <strong>{order.customerPhone}</strong></div>
                
                {order.studentDormInfo && (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-950 space-y-1 border border-emerald-200/60">
                    <div className="font-bold text-emerald-900 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      Kelas: {order.studentDormInfo.className || '-'}
                    </div>
                    {order.studentDormInfo.guardianName && (
                      <div className="text-[11px] text-emerald-800">
                        Orang Tua / Wali: <strong>{order.studentDormInfo.guardianName}</strong>
                      </div>
                    )}
                    {order.studentDormInfo.guardianPhone && (
                      <div className="text-[10px] text-emerald-700">
                        Kontak Wali: {order.studentDormInfo.guardianPhone}
                      </div>
                    )}
                  </div>
                )}

                {order.delivery.isDelivery && (
                  <div className="mt-2 p-2.5 rounded-xl bg-blue-50 text-blue-950 space-y-1 border border-blue-200">
                    <div className="font-bold text-blue-900">Alamat Pengantaran:</div>
                    <div className="text-xs text-blue-800">{order.delivery.address}</div>
                    <div className="text-[10px] text-blue-700">Zona: {order.delivery.zoneName} (Ongkir: {formatRupiah(order.delivery.fee)})</div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment & Summary */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-500 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                  RINCIAN PEMBAYARAN
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  order.paymentStatus === 'LUNAS' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Item:</span>
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
                    <span>Ongkir Delivery:</span>
                    <span>{formatRupiah(order.deliveryFee)}</span>
                  </div>
                )}
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Potongan Diskon:</span>
                    <span>-{formatRupiah(order.discountAmount)}</span>
                  </div>
                )}
                {order.pointsDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Potongan Poin:</span>
                    <span>-{formatRupiah(order.pointsDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total Tagihan:</span>
                  <span className="text-emerald-900">{formatRupiah(order.grandTotal)}</span>
                </div>

                <div className="pt-2 text-[11px] text-slate-500 space-y-0.5">
                  <div>Metode: <strong>{order.paymentMethod.replace('_', ' ')}</strong></div>
                  <div>Kasir Penanggung Jawab: <strong>{order.staffInChargeName}</strong></div>
                  {order.perfumeOption && (
                    <div className="text-emerald-700 font-medium">🌸 Parfum: {order.perfumeOption}</div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Items Breakdown Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-700">Daftar Cucian:</h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3">Nama Layanan</th>
                    <th className="p-3 text-center">Jumlah / Berat</th>
                    <th className="p-3 text-right">Harga Satuan</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="p-3 font-semibold text-slate-900">
                        {item.serviceName}
                        {item.notes && <span className="block text-[10px] text-slate-400 italic">Catatan: {item.notes}</span>}
                      </td>
                      <td className="p-3 text-center font-bold text-slate-800">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="p-3 text-right text-slate-600">{formatRupiah(item.unitPrice)}</td>
                      <td className="p-3 text-right font-bold text-slate-900">{formatRupiah(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Status Timeline History */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-slate-700">Riwayat Perubahan Status (Audit Log):</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {order.statusHistory.map((log) => {
                const meta = STATUS_METADATA[log.status];
                return (
                  <div key={log.id} className="flex items-start gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">{meta?.label || log.status}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{log.notes || 'Status diperbarui'}</p>
                      <span className="text-[10px] text-emerald-800 font-medium">Petugas: {log.staffName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-2 justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => onOpenQcModal(order)}
              className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold py-2.5 px-4 rounded-xl transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Quality Check (QC)
            </button>
            <button
              onClick={() => onOpenStatusModal(order)}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              Perbarui Status ({currentStatusMeta.label})
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
