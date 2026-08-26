import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';
import { AppLogo } from './AppLogo';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallBanner: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [countdown, setCountdown] = useState(20);

  useEffect(() => {
    // Listen for PWA prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Timer countdown 20 detik setelah buka aplikasi
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowPopup(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      clearInterval(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback for browsers / iOS
      alert('Untuk memasang di Layar Utama HP Anda:\n- Android (Chrome): Ketuk menu titik tiga (⋮) > Tambahkan ke Layar Utama (Add to Home screen)\n- iPhone (Safari): Ketuk tombol Bagikan (Share) > Tambah ke Layar Utama (Add to Home Screen)');
    }
  };

  if (!showPopup) return null;

  return (
    <div id="pwa-install-modal" className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100vw-2.5rem)] bg-slate-900 rounded-2xl shadow-2xl border border-emerald-500/40 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#020617] p-4 text-white flex items-center justify-between border-b border-emerald-900/40">
        <div className="flex items-center gap-2.5">
          <AppLogo size="sm" />
          <div>
            <h4 className="font-bold text-sm leading-tight text-slate-100 flex items-center gap-1.5">
              Install Almawaddah Web App
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">PWA</span>
            </h4>
            <p className="text-[10px] text-slate-400">Akses sistem lebih cepat dan praktis.</p>
          </div>
        </div>
        <button 
          id="btn-close-pwa-popup"
          onClick={() => setShowPopup(false)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-xs text-slate-300 leading-relaxed">
          Pasang aplikasi <strong className="text-emerald-400">Laundry Almawaddah</strong> di layar smartphone/desktop Anda untuk akses kasir instan dan pemantauan real-time!
        </p>

        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Akses POS 1-Klik</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Scan QR Santri</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            id="btn-confirm-install-pwa"
            onClick={handleInstallClick}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-950/50 transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            Install Sekarang
          </button>
          <button
            id="btn-dismiss-pwa"
            onClick={() => setShowPopup(false)}
            className="text-xs font-medium text-slate-400 hover:text-slate-200 py-2.5 px-3 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Nanti Saja
          </button>
        </div>
      </div>
    </div>
  );
};
