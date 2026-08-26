import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Zap, Check, AlertCircle } from 'lucide-react';
import { StorageService } from '../../data/storage';
import { Customer, LaundryOrder } from '../../types';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (scannedText: string, foundEntity?: { type: 'CUSTOMER' | 'ORDER' | 'ROOM', data: any }) => void;
  title?: string;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  title = 'Scan QR Code Santri / Member / Invoice'
}) => {
  const [hasCamera, setHasCamera] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [scanningMessage, setScanningMessage] = useState('Arahkan kamera ke QR Code...');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const customers = StorageService.getCustomers();
  const orders = StorageService.getOrders();

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isOpen) {
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            setCameraActive(true);
          }
        })
        .catch((err) => {
          console.warn('Camera access not granted or not available:', err);
          setHasCamera(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleResolveCode = (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    // Check if Customer ID (e.g. SAN-000101, WPS-000001, UMU-000001)
    const matchedCustomer = customers.find(c => 
      c.id.toLowerCase() === cleanCode.toLowerCase() || 
      c.student?.nis === cleanCode ||
      c.phone === cleanCode
    );

    if (matchedCustomer) {
      onScanSuccess(cleanCode, { type: 'CUSTOMER', data: matchedCustomer });
      onClose();
      return;
    }

    // Check if Order Invoice (e.g. INV-20260825-0001)
    const matchedOrder = orders.find(o => 
      o.id.toLowerCase() === cleanCode.toLowerCase() ||
      cleanCode.includes(o.id)
    );

    if (matchedOrder) {
      onScanSuccess(cleanCode, { type: 'ORDER', data: matchedOrder });
      onClose();
      return;
    }

    // Generic fallback
    onScanSuccess(cleanCode);
    onClose();
  };

  return (
    <div id="qr-scanner-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-slate-900 text-white rounded-3xl shadow-2xl overflow-hidden border border-slate-800">
        
        {/* Header */}
        <div className="p-4 bg-slate-800/80 flex items-center justify-between border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-100">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Stage */}
        <div className="p-5 space-y-4">
          <div className="relative aspect-square w-full rounded-2xl bg-black overflow-hidden flex items-center justify-center border-2 border-slate-700">
            {hasCamera ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4 space-y-2 text-slate-400">
                <Camera className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-xs">Kamera tidak aktif atau browser dalam mode sandbox.</p>
                <p className="text-[11px] text-emerald-400">Gunakan simulator tombol cepat di bawah.</p>
              </div>
            )}

            {/* Scanner reticle overlay */}
            <div className="absolute inset-8 border-2 border-emerald-400/80 rounded-2xl pointer-events-none animate-pulse flex flex-col justify-between p-2">
              <div className="flex justify-between">
                <span className="w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                <span className="w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
              </div>
              <div className="text-center">
                <span className="bg-emerald-950/80 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full backdrop-blur-xs font-mono">
                  {scanningMessage}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                <span className="w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
              </div>
            </div>
          </div>

          {/* Quick Simulation Buttons for Instant Workflow Testing */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Simulasi Cepat Scan Demo:
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                onClick={() => handleResolveCode('SAN-000101')}
                className="p-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-300 text-left transition-colors truncate"
              >
                <span className="font-bold block">Aisyah (SAN-000101)</span>
                <span className="text-[10px] text-emerald-400/80">Kamar A-01 (Santri)</span>
              </button>
              <button
                onClick={() => handleResolveCode('SAN-000102')}
                className="p-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-300 text-left transition-colors truncate"
              >
                <span className="font-bold block">Fatimah (SAN-000102)</span>
                <span className="text-[10px] text-emerald-400/80">Kamar A-01 (Santri)</span>
              </button>
              <button
                onClick={() => handleResolveCode('WPS-000001')}
                className="p-2 rounded-xl bg-teal-950 hover:bg-teal-900 border border-teal-800/80 text-teal-300 text-left transition-colors truncate"
              >
                <span className="font-bold block">Ustazah Nurul (WPS)</span>
                <span className="text-[10px] text-teal-400/80">VIP Warga Pesantren</span>
              </button>
              <button
                onClick={() => handleResolveCode('INV-20260825-0001')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-left transition-colors truncate"
              >
                <span className="font-bold block">INV-20260825-0001</span>
                <span className="text-[10px] text-slate-400">Nota Cucian Santri</span>
              </button>
            </div>
          </div>

          {/* Manual Input Search */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ketik NIS / ID / No Invoice manual..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleResolveCode(manualInput)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => handleResolveCode(manualInput)}
                disabled={!manualInput.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors"
              >
                Cari
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
