import React, { useEffect, useState } from 'react';
import { QrCode, Printer, X, Sparkles, User, School, Phone, CheckCircle2 } from 'lucide-react';
import { Customer } from '../../types';
import { generateQrDataUrl } from '../../data/storage';
import { AppLogo } from './AppLogo';

interface StudentQrCardModalProps {
  customer: Customer | null;
  onClose: () => void;
  onSelectForOrder?: (customer: Customer) => void;
}

export const StudentQrCardModal: React.FC<StudentQrCardModalProps> = ({ 
  customer, 
  onClose,
  onSelectForOrder 
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (customer) {
      generateQrDataUrl(customer.id).then(setQrUrl);
    }
  }, [customer]);

  if (!customer) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="student-card-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        <div className="bg-emerald-900 text-white px-5 py-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-sm">Kartu Member & QR Code</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white transition-colors"
              title="Cetak Kartu"
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

        <div className="p-6 bg-slate-100 flex flex-col items-center justify-center space-y-4">
          
          {/* Card Physical Layout (ID Card size) */}
          <div className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white p-5 shadow-xl border border-emerald-500/30 relative overflow-hidden print:border-slate-800">
            {/* Background Islamic geometric subtle accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            
            {/* Top Brand */}
            <div className="flex items-center justify-between pb-3 border-b border-emerald-700/60">
              <div className="flex items-center gap-2">
                <AppLogo size="sm" />
                <div>
                  <h4 className="font-black text-xs tracking-tight text-white">LAUNDRY ALMAWADDAH</h4>
                  <p className="text-[9px] text-emerald-300 font-medium tracking-wider">KARTU RESMI PELANGGAN</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 uppercase">
                {customer.type.replace('_', ' ')}
              </span>
            </div>

            {/* Profile & QR Layout */}
            <div className="flex items-center gap-4 py-4">
              {qrUrl ? (
                <div className="bg-white p-2 rounded-xl shadow-md shrink-0">
                  <img src={qrUrl} alt="QR Member" className="w-24 h-24" />
                </div>
              ) : (
                <div className="w-24 h-24 bg-white/10 rounded-xl animate-pulse" />
              )}

              <div className="space-y-1 text-xs">
                <span className="font-mono text-[10px] text-emerald-300 font-bold block">{customer.id}</span>
                <h3 className="font-extrabold text-base leading-tight text-white">{customer.name}</h3>

                {customer.student && (
                  <div className="text-[11px] text-emerald-100/90 space-y-0.5 pt-1">
                    <div>NIS: <span className="font-mono">{customer.student.nis}</span> • {customer.student.className}</div>
                    <div className="font-semibold text-amber-300">
                      Wali: {customer.student.guardianName || '-'} ({customer.student.guardianPhone || '-'})
                    </div>
                  </div>
                )}

                {customer.warga && (
                  <div className="text-[11px] text-emerald-100/90 space-y-0.5 pt-1">
                    <div>{customer.warga.category} • {customer.warga.position}</div>
                    <div className="text-amber-300 font-semibold">{customer.warga.complexAddress}</div>
                  </div>
                )}

                {customer.umum && (
                  <div className="text-[11px] text-emerald-100/90 space-y-0.5 pt-1">
                    <div>{customer.umum.subdistrict}, {customer.umum.village}</div>
                    <div className="text-amber-300 font-semibold">{customer.umum.loyaltyPoints} Poin Loyalty</div>
                  </div>
                )}
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-2 border-t border-emerald-700/60 flex items-center justify-between text-[10px] text-emerald-300/90">
              <span>Tunjukkan QR ini saat titip laundry</span>
              <span className="font-medium text-white">WA: {customer.phone}</span>
            </div>

          </div>

          {/* Santri Package Info Banner if available */}
          {customer.student?.packageId && (
            <div className="w-full bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl space-y-1.5 text-xs text-emerald-950">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Status Kuota Paket Santri
                </span>
                <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full text-[10px]">
                  Aktif s/d {customer.student.packageActiveUntil}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-700 pt-1">
                <span>Sisa Kuota:</span>
                <span className="font-extrabold text-sm text-emerald-800">
                  {customer.student.packageRemainingKg || 0} Kg / {customer.student.packageQuotaKg || 0} Kg
                </span>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${Math.min(100, (((customer.student.packageRemainingKg || 0) / (customer.student.packageQuotaKg || 1)) * 100))}%` 
                  }}
                />
              </div>
            </div>
          )}

        </div>

        <div className="p-4 bg-white border-t border-slate-200 flex gap-2 no-print">
          {onSelectForOrder && (
            <button
              onClick={() => {
                onSelectForOrder(customer);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Buat Transaksi Laundry
            </button>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Cetak Kartu
          </button>
        </div>

      </div>
    </div>
  );
};
