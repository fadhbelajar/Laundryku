import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  Store, 
  Download, 
  Upload, 
  RotateCcw, 
  Save, 
  Check, 
  Smartphone, 
  Phone, 
  Building, 
  ShieldCheck,
  AlertTriangle,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Globe,
  Monitor,
  CheckCircle2,
  FileCode,
  FileCheck,
  Zap,
  Sliders,
  Printer,
  Trash2,
  Layers
} from 'lucide-react';
import { StorageService } from '../../data/storage';
import { AppSettings } from '../../types';
import { AppLogo } from '../common/AppLogo';
import { 
  processAutomaticBrandingUpload, 
  applyBrandingToDOM, 
  downloadDataUrlFile, 
  ProcessedBrandingResult 
} from '../../utils/imageProcessor';

export const SettingsModule: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  
  // Form fields
  const [storeName, setStoreName] = useState(settings.storeName || 'LAUNDRY ALMAWADDAH');
  const [tagline, setTagline] = useState(settings.tagline || 'Bersih, Wangi, Rapi, Amanah');
  const [phone, setPhone] = useState(settings.phone || '081234567890');
  const [address, setAddress] = useState(settings.address || 'Kompleks Pondok Pesantren Putri Almawaddah, Coper, Jetis, Ponorogo, Jawa Timur 63473');
  const [bankAccount, setBankAccount] = useState(
    settings.bankAccountDetails?.[0] 
      ? `${settings.bankAccountDetails[0].bankName}: ${settings.bankAccountDetails[0].accountNumber} (a.n. ${settings.bankAccountDetails[0].accountHolder})`
      : 'BSI: 7123456789 (a.n. Laundry Almawaddah Pesantren)'
  );
  const [receiptFooterNote, setReceiptFooterNote] = useState(settings.receiptFooterNote || 'Terima kasih atas kepercayaan Anda. Pakaian suci & bersih ibadah berkah.');
  const [pointsRate, setPointsRate] = useState(settings.pointsRatePerTenThousand || 1);
  const [pointsValue, setPointsValue] = useState(settings.pointsValueInRupiah || 500);
  const [enableWhatsApp, setEnableWhatsApp] = useState(settings.enableAutoWhatsAppPrompt ?? true);

  // Branding & Logo state
  const [appLogoUrl, setAppLogoUrl] = useState<string | undefined>(settings.appLogoUrl);
  const [faviconUrl, setFaviconUrl] = useState<string | undefined>(settings.faviconUrl);
  const [pwaIcon192Url, setPwaIcon192Url] = useState<string | undefined>(settings.pwaIcon192Url);
  const [pwaIcon512Url, setPwaIcon512Url] = useState<string | undefined>(settings.pwaIcon512Url);
  const [appleTouchIconUrl, setAppleTouchIconUrl] = useState<string | undefined>(settings.appleTouchIconUrl);
  const [receiptMonochromeUrl, setReceiptMonochromeUrl] = useState<string | undefined>(settings.receiptMonochromeUrl);
  const [logoShape, setLogoShape] = useState<'rounded' | 'circle' | 'square' | 'original'>(settings.logoShape || 'rounded');
  const [pwaBgColor, setPwaBgColor] = useState<string>('#020617');
  const [pwaPadding, setPwaPadding] = useState<number>(0.08);

  // Processing stats
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<ProcessedBrandingResult['stats'] | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'browser' | 'mobile' | 'header' | 'receipt'>('browser');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastProcessedFileRef = useRef<File | null>(null);

  // Handle Logo Upload & Auto Compression
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (PNG, JPG, SVG, WebP, GIF).');
      return;
    }

    try {
      setIsProcessing(true);
      lastProcessedFileRef.current = file;

      const result = await processAutomaticBrandingUpload(file, {
        shape: logoShape,
        bgColor: pwaBgColor,
        paddingRatio: pwaPadding
      });

      setAppLogoUrl(result.appLogoUrl);
      setFaviconUrl(result.faviconUrl);
      setPwaIcon192Url(result.pwaIcon192Url);
      setPwaIcon512Url(result.pwaIcon512Url);
      setAppleTouchIconUrl(result.appleTouchIconUrl);
      setReceiptMonochromeUrl(result.receiptMonochromeUrl);
      setCompressionStats(result.stats);
    } catch (err: any) {
      alert('Gagal memproses gambar: ' + (err.message || 'Error tidak diketahui'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Re-process when shape, bg, or padding changes if file is cached
  const handleReapplyCustomization = async (
    newShape: 'rounded' | 'circle' | 'square' | 'original',
    newBg: string,
    newPadding: number
  ) => {
    setLogoShape(newShape);
    setPwaBgColor(newBg);
    setPwaPadding(newPadding);

    if (lastProcessedFileRef.current) {
      try {
        setIsProcessing(true);
        const result = await processAutomaticBrandingUpload(lastProcessedFileRef.current, {
          shape: newShape,
          bgColor: newBg,
          paddingRatio: newPadding
        });
        setAppLogoUrl(result.appLogoUrl);
        setFaviconUrl(result.faviconUrl);
        setPwaIcon192Url(result.pwaIcon192Url);
        setPwaIcon512Url(result.pwaIcon512Url);
        setAppleTouchIconUrl(result.appleTouchIconUrl);
        setReceiptMonochromeUrl(result.receiptMonochromeUrl);
        setCompressionStats(result.stats);
      } catch (err) {
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Reset to default branding
  const handleResetLogo = () => {
    if (confirm('Kembalikan logo, favicon, dan ikon PWA ke format default monogram "LA"?')) {
      setAppLogoUrl(undefined);
      setFaviconUrl(undefined);
      setPwaIcon192Url(undefined);
      setPwaIcon512Url(undefined);
      setAppleTouchIconUrl(undefined);
      setReceiptMonochromeUrl(undefined);
      setCompressionStats(null);
      lastProcessedFileRef.current = null;
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Save all settings to StorageService & Update DOM
  const handleSaveAllSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const updatedSettings: AppSettings = {
      ...settings,
      storeName: storeName.trim() || 'LAUNDRY ALMAWADDAH',
      tagline: tagline.trim() || 'Bersih, Wangi, Rapi, Amanah',
      phone: phone.trim(),
      address: address.trim(),
      receiptFooterNote: receiptFooterNote.trim(),
      pointsRatePerTenThousand: pointsRate,
      pointsValueInRupiah: pointsValue,
      enableAutoWhatsAppPrompt: enableWhatsApp,
      appLogoUrl: appLogoUrl || undefined,
      faviconUrl: faviconUrl || undefined,
      pwaIcon192Url: pwaIcon192Url || undefined,
      pwaIcon512Url: pwaIcon512Url || undefined,
      appleTouchIconUrl: appleTouchIconUrl || undefined,
      receiptMonochromeUrl: receiptMonochromeUrl || undefined,
      logoShape: logoShape,
      logoOriginalSizeKb: compressionStats?.originalFileSizeKb,
      logoCompressedSizeKb: compressionStats?.totalCompressedSizeKb,
      logoUpdatedDate: new Date().toISOString()
    };

    StorageService.saveSettings(updatedSettings);
    setSettings(updatedSettings);

    // Apply favicon, title and manifest dynamically to DOM
    applyBrandingToDOM(updatedSettings);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  // Download Individual Asset Packages
  const handleDownloadFavicon = () => {
    if (faviconUrl) {
      downloadDataUrlFile(faviconUrl, 'favicon-64x64.png');
    }
  };

  const handleDownloadPwa192 = () => {
    if (pwaIcon192Url) {
      downloadDataUrlFile(pwaIcon192Url, 'icon-192x192.png');
    }
  };

  const handleDownloadPwa512 = () => {
    if (pwaIcon512Url) {
      downloadDataUrlFile(pwaIcon512Url, 'icon-512x512.png');
    }
  };

  const handleDownloadManifest = () => {
    const manifest = {
      name: storeName,
      short_name: storeName.slice(0, 18),
      description: tagline,
      start_url: '/',
      display: 'standalone',
      background_color: '#020617',
      theme_color: '#020617',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
      ]
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(manifest, null, 2));
    downloadDataUrlFile(dataStr, 'manifest.json');
  };

  // Export / Import Handlers
  const handleExportBackup = () => {
    const snapshot = {
      customers: StorageService.getCustomers(),
      services: StorageService.getServices(),
      packages: StorageService.getPackages(),
      dormitories: StorageService.getDormitories(),
      rooms: StorageService.getRooms(),
      orders: StorageService.getOrders(),
      zones: StorageService.getZones(),
      promos: StorageService.getPromos(),
      expenses: StorageService.getExpenses(),
      complaints: StorageService.getComplaints(),
      staff: StorageService.getStaff(),
      settings: StorageService.getSettings()
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(snapshot, null, 2));
    downloadDataUrlFile(dataStr, `Backup_Laundry_Almawaddah_${new Date().toISOString().split('T')[0]}.json`);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        if (content) {
          const parsed = JSON.parse(content);
          if (parsed.customers) StorageService.saveCustomers(parsed.customers);
          if (parsed.services) StorageService.saveServices(parsed.services);
          if (parsed.packages) StorageService.savePackages(parsed.packages);
          if (parsed.dormitories) StorageService.saveDormitories(parsed.dormitories);
          if (parsed.rooms) StorageService.saveRooms(parsed.rooms);
          if (parsed.orders) StorageService.saveOrders(parsed.orders);
          if (parsed.zones) StorageService.saveZones(parsed.zones);
          if (parsed.promos) StorageService.savePromos(parsed.promos);
          if (parsed.expenses) StorageService.saveExpenses(parsed.expenses);
          if (parsed.complaints) StorageService.saveComplaints(parsed.complaints);
          if (parsed.staff) StorageService.saveStaff(parsed.staff);
          if (parsed.settings) StorageService.saveSettings(parsed.settings);
          alert('Data berhasil dipulihkan dari file backup!');
          window.location.reload();
        }
      } catch (err) {
        alert('Format file JSON tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemoData = () => {
    if (confirm('Apakah Anda yakin ingin mereset seluruh data ke data demo awal? Semua perubahan transaksi akan kembali ke default.')) {
      StorageService.resetAllData();
      alert('Data berhasil direset ke data default!');
      window.location.reload();
    }
  };

  return (
    <div id="settings-module-view" className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700/60 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-100 tracking-tight">
              Pengaturan Sistem & Custom Branding
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Kustomisasi Logo, Favicon, PWA Icon otomatis terkompresi, Profil Usaha, dan Backup Database JSON.
          </p>
        </div>

        <button
          onClick={() => handleSaveAllSettings()}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold py-3 px-6 rounded-2xl shadow-lg shadow-emerald-950/50 transition-all active:scale-[0.98] shrink-0"
        >
          <Save className="w-4 h-4" />
          Simpan Semua Pengaturan
        </button>
      </div>

      {/* Success Notification Alert */}
      {savedSuccess && (
        <div className="bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 px-5 py-4 rounded-2xl flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-xs">Perubahan Berhasil Disimpan & Diterapkan!</p>
              <p className="text-[11px] text-emerald-300/80">Logo, Favicon browser tab, dan PWA Manifest langsung diperbarui secara live.</p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-mono font-bold bg-emerald-800/80 px-2 py-0.5 rounded text-emerald-100">Live Updated</span>
        </div>
      )}

      {/* SECTION 1: AUTO LOGO, FAVICON & PWA GENERATOR */}
      <div className="bg-slate-800/40 rounded-3xl border border-slate-700/60 shadow-xl overflow-hidden">
        
        {/* Section Header */}
        <div className="p-6 border-b border-slate-700/60 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-emerald-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-100 flex items-center gap-2">
                Ubah Logo Aplikasi, Favicon & PWA Web App
                <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Auto Resize & Compression
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Cukup upload 1 gambar master. Sistem secara otomatis menghasilkan Logo Navigasi, Favicon Tab Browser (64x64), dan Ikon PWA HP (192x192 & 512x512) berukuran super ringan.
              </p>
            </div>
          </div>

          {appLogoUrl && (
            <button
              onClick={handleResetLogo}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-900/50 px-3.5 py-2 rounded-xl transition-colors shrink-0 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset ke Default
            </button>
          )}
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Upload Dropzone & Customization Controls */}
          <div className="lg:col-span-6 space-y-5">
            
            {/* Upload Zone */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Upload Gambar Master Logo / Lambang</span>
                <span className="text-[11px] text-slate-400 font-normal">PNG, JPG, SVG, WebP (Maks 10MB)</span>
              </label>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                  isProcessing 
                    ? 'border-emerald-500 bg-emerald-950/20' 
                    : 'border-slate-700/80 hover:border-emerald-500/60 bg-slate-900/60 hover:bg-slate-900/90'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                {isProcessing ? (
                  <div className="py-4 flex flex-col items-center gap-3 text-emerald-400">
                    <RefreshCw className="w-8 h-8 animate-spin" />
                    <span className="text-xs font-bold">Mengompres & Menyesuaikan Multi-Resolusi...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-inner">
                      <ImageIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">
                        Klik untuk Pilih Foto Logo atau Tarik & Lepas Gambar ke Sini
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Sistem otomatis memotong, mengompres kualitas tinggi, dan menyusun ikon PWA & Favicon secara instan.
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-700/50 px-3 py-1.5 rounded-xl">
                      <Zap className="w-3.5 h-3.5" /> Pilih File Gambar
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Compression Stats Banner */}
            {compressionStats && (
              <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-4 space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-emerald-400" /> Hasil Kompresi & Optimasi Otomatis
                  </span>
                  <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                    {compressionStats.savingsPercent}% Lebih Ringan
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">File Asli</span>
                    <span className="font-bold text-slate-200">{compressionStats.originalFileSizeKb} KB</span>
                    <span className="text-[9px] text-slate-500 block">{compressionStats.originalWidth}x{compressionStats.originalHeight}px</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">App Logo</span>
                    <span className="font-bold text-emerald-400">{compressionStats.compressedLogoSizeKb} KB</span>
                    <span className="text-[9px] text-slate-500 block">Max 512px</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Favicon Tab</span>
                    <span className="font-bold text-emerald-400">{compressionStats.compressedFaviconSizeKb} KB</span>
                    <span className="text-[9px] text-slate-500 block">64x64px</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">PWA Icon</span>
                    <span className="font-bold text-emerald-400">{compressionStats.compressedPwa192SizeKb} KB</span>
                    <span className="text-[9px] text-slate-500 block">192x192px</span>
                  </div>
                </div>
              </div>
            )}

            {/* Customization Options */}
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Pengaturan Tampilan & Format Icon
              </div>

              {/* Logo Shape */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Bentuk Pemotongan Logo (Logo Shape)</label>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'rounded', label: 'Rounded', desc: 'Kotak Melengkung' },
                    { id: 'circle', label: 'Lingkaran', desc: 'Circle Badge' },
                    { id: 'square', label: 'Persegi', desc: 'Square Minimal' },
                    { id: 'original', label: 'Asli', desc: 'Rasio Asli' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleReapplyCustomization(s.id as any, pwaBgColor, pwaPadding)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        logoShape === s.id
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold shadow-xs'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <span className="block text-xs">{s.label}</span>
                      <span className="block text-[9px] text-slate-500 mt-0.5">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Color for PWA / iOS Shortcut */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Background Kanvas Ikon PWA Mobile</label>
                <div className="flex items-center gap-2">
                  {[
                    { color: '#020617', name: 'Dark Slate' },
                    { color: '#064e3b', name: 'Deep Emerald' },
                    { color: '#0f172a', name: 'Midnight' },
                    { color: 'transparent', name: 'Transparan' },
                    { color: '#ffffff', name: 'Putih' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => handleReapplyCustomization(logoShape, c.color, pwaPadding)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] border transition-all ${
                        pwaBgColor === c.color
                          ? 'bg-slate-800 border-emerald-400 text-slate-100 font-bold'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span 
                        className="w-3 h-3 rounded-full border border-slate-600 shrink-0" 
                        style={{ backgroundColor: c.color === 'transparent' ? '#64748b' : c.color }}
                      />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Padding */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Batas Jarak Margin Ikon (PWA Padding)</label>
                <div className="flex items-center gap-2 text-xs">
                  {[
                    { val: 0, label: 'Penuh (0%)' },
                    { val: 0.08, label: 'Standar Aman (8%)' },
                    { val: 0.15, label: 'Luas / Longgar (15%)' },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => handleReapplyCustomization(logoShape, pwaBgColor, p.val)}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] border transition-all ${
                        pwaPadding === p.val
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Quick Export / Download Icons Pack */}
            {appLogoUrl && (
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-400" />
                  Unduh File Asset Terkompresi
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <button
                    onClick={handleDownloadFavicon}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-center font-medium transition-colors"
                  >
                    Favicon (64x64)
                  </button>
                  <button
                    onClick={handleDownloadPwa192}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-center font-medium transition-colors"
                  >
                    PWA Icon (192px)
                  </button>
                  <button
                    onClick={handleDownloadPwa512}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-center font-medium transition-colors"
                  >
                    PWA Icon (512px)
                  </button>
                  <button
                    onClick={handleDownloadManifest}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-center font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                    manifest.json
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Live Mockup Previews */}
          <div className="lg:col-span-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-emerald-400" />
                Pratinjau Langsung (Live Multi-Device Mockup)
              </span>

              {/* Preview Tabs */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('browser')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activePreviewTab === 'browser' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tab Browser
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('mobile')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activePreviewTab === 'mobile' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  PWA Mobile
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('header')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activePreviewTab === 'header' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Header App
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('receipt')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activePreviewTab === 'receipt' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Struk Kasir
                </button>
              </div>
            </div>

            {/* PREVIEW 1: BROWSER TAB MOCKUP */}
            {activePreviewTab === 'browser' && (
              <div className="bg-[#0f172a] rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl p-3 space-y-3 animate-in fade-in">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Simulasi Tab Google Chrome / Safari Desktop (Favicon 64x64)
                </span>

                {/* Browser window header mockup */}
                <div className="bg-slate-900 rounded-xl p-2 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>

                    {/* Active Tab */}
                    <div className="bg-[#0f172a] px-3 py-1.5 rounded-t-lg border-t border-x border-slate-700/80 flex items-center gap-2 max-w-xs shadow-xs">
                      {faviconUrl ? (
                        <img 
                          src={faviconUrl} 
                          alt="Favicon" 
                          className="w-4 h-4 rounded-xs shrink-0 object-contain" 
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-xs bg-emerald-600 text-white text-[8px] flex items-center justify-center font-black">
                          LA
                        </div>
                      )}
                      <span className="text-xs font-bold text-slate-200 truncate">{storeName}</span>
                      <span className="text-slate-500 text-xs ml-auto">×</span>
                    </div>
                  </div>

                  {/* Browser URL bar */}
                  <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-slate-200 font-mono">https://laundry-almawaddah.pesantren.id/</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl text-[11px] text-slate-400 space-y-1">
                  <p className="font-semibold text-emerald-400">✓ Favicon Dinamis Aktif</p>
                  <p>Favicon akan langsung muncul di tab browser pengguna dan bookmark bar saat disimpan.</p>
                </div>
              </div>
            )}

            {/* PREVIEW 2: SMARTPHONE HOME SCREEN PWA MOCKUP */}
            {activePreviewTab === 'mobile' && (
              <div className="bg-[#0f172a] rounded-2xl border border-slate-700/80 p-4 space-y-4 shadow-2xl animate-in fade-in">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Simulasi Ikon Aplikasi di Layar Utama HP (Android & iOS PWA 192x192)
                </span>

                <div className="relative mx-auto w-64 h-80 bg-slate-950 rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden p-4 flex flex-col justify-between">
                  {/* Phone Notch & Status */}
                  <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono pb-2 border-b border-slate-900">
                    <span>09:41</span>
                    <div className="w-12 h-2.5 bg-slate-900 rounded-full" />
                    <span>5G 100%</span>
                  </div>

                  {/* App Grid on Home Screen */}
                  <div className="grid grid-cols-3 gap-4 my-auto place-items-center">
                    
                    {/* The Custom PWA Icon */}
                    <div className="flex flex-col items-center gap-1 group cursor-pointer">
                      <div 
                        className="w-14 h-14 rounded-2xl border border-emerald-500/40 shadow-lg flex items-center justify-center p-1 overflow-hidden"
                        style={{ backgroundColor: pwaBgColor === 'transparent' ? '#020617' : pwaBgColor }}
                      >
                        {pwaIcon192Url ? (
                          <img 
                            src={pwaIcon192Url} 
                            alt="PWA Icon" 
                            className="w-full h-full object-contain" 
                          />
                        ) : (
                          <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-black text-sm flex items-center justify-center">
                            LA
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-100 truncate w-16 text-center">
                        {storeName.slice(0, 10)}
                      </span>
                    </div>

                    {/* Dummy companion icons */}
                    <div className="flex flex-col items-center gap-1 opacity-40">
                      <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 text-xs">
                        WA
                      </div>
                      <span className="text-[10px] text-slate-500">WhatsApp</span>
                    </div>

                    <div className="flex flex-col items-center gap-1 opacity-40">
                      <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 text-xs">
                        BSI
                      </div>
                      <span className="text-[10px] text-slate-500">Mobile</span>
                    </div>

                  </div>

                  {/* Phone Bottom Dock */}
                  <div className="bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border border-slate-800 flex justify-around">
                    <div className="w-8 h-8 rounded-xl bg-slate-800/80" />
                    <div className="w-8 h-8 rounded-xl bg-slate-800/80" />
                    <div className="w-8 h-8 rounded-xl bg-slate-800/80" />
                    <div className="w-8 h-8 rounded-xl bg-slate-800/80" />
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl text-[11px] text-slate-400 space-y-1">
                  <p className="font-semibold text-emerald-400">✓ Web App Manifest Siap Pasang</p>
                  <p>Ikon ini akan otomatis dipakai saat petugas atau santri memilih "Install Aplikasi / Tambahkan ke Layar Utama".</p>
                </div>
              </div>
            )}

            {/* PREVIEW 3: HEADER & SIDEBAR APP */}
            {activePreviewTab === 'header' && (
              <div className="bg-[#0f172a] rounded-2xl border border-slate-700/80 p-4 space-y-4 shadow-2xl animate-in fade-in">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Simulasi Tampilan di Header & Sidebar Aplikasi
                </span>

                {/* Top Nav Header Mockup */}
                <div className="bg-[#0f172a] border border-emerald-900/40 rounded-2xl p-3 shadow-md">
                  <span className="text-[9px] text-slate-500 uppercase font-mono block mb-2">Navbar Atas:</span>
                  <div className="flex items-center justify-between">
                    <AppLogo 
                      showText={true} 
                      size="md" 
                      textColor="light" 
                      overrideUrl={appLogoUrl}
                      overrideShape={logoShape}
                    />
                    <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/60 text-[10px] text-emerald-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Kasir Siap
                    </div>
                  </div>
                </div>

                {/* Sidebar Header Mockup */}
                <div className="bg-[#020617] border border-emerald-900/40 rounded-2xl p-3 shadow-md max-w-xs">
                  <span className="text-[9px] text-slate-500 uppercase font-mono block mb-2">Sidebar Navigasi:</span>
                  <AppLogo 
                    showText={true} 
                    size="md" 
                    textColor="light" 
                    overrideUrl={appLogoUrl}
                    overrideShape={logoShape}
                  />
                </div>
              </div>
            )}

            {/* PREVIEW 4: THERMAL RECEIPT HEADER */}
            {activePreviewTab === 'receipt' && (
              <div className="bg-[#0f172a] rounded-2xl border border-slate-700/80 p-4 space-y-4 shadow-2xl animate-in fade-in">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Simulasi Header Struk Cetak Kasir Thermal (58mm/80mm)
                </span>

                <div className="max-w-xs mx-auto bg-white text-slate-900 font-mono p-5 rounded-2xl shadow-xl space-y-2 border border-slate-200 text-center">
                  <div className="flex justify-center mb-1">
                    <AppLogo 
                      size="sm" 
                      textColor="dark" 
                      overrideUrl={receiptMonochromeUrl || appLogoUrl}
                      overrideShape={logoShape}
                    />
                  </div>
                  <h4 className="font-extrabold text-sm font-sans uppercase tracking-tight text-slate-900">
                    {storeName}
                  </h4>
                  <p className="text-[10px] font-sans text-slate-600">{tagline}</p>
                  <p className="text-[9px] text-slate-500">{address}</p>
                  <p className="text-[9px] text-slate-500">WA: {phone}</p>
                  <div className="border-b border-dashed border-slate-400 pt-2" />
                  <div className="text-[10px] text-left space-y-0.5 pt-1 text-slate-700">
                    <div className="flex justify-between">
                      <span>No: NOTA-202608-001</span>
                      <span>25/08/2026</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Paket Cuci Kiloan (3.5 Kg)</span>
                      <span>Rp21.000</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* SECTION 2: STORE PROFILE & OPERATIONAL SETTINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Store Profile Form */}
        <div className="lg:col-span-7 bg-slate-800/40 p-6 rounded-3xl border border-slate-700/60 shadow-xl space-y-5">
          <h3 className="font-black text-sm text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-700/60">
            <Store className="w-4 h-4 text-emerald-400" />
            Informasi Toko & Pesantren
          </h3>

          <form onSubmit={handleSaveAllSettings} className="space-y-4 text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Nama Usaha / Aplikasi</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Tagline Resmi</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-emerald-400 font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-300 block mb-1">WhatsApp CS & Notifikasi</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Rekening Pembayaran Utama</label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Alamat Lengkap Unit Laundry</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Catatan Kaki Struk (Receipt Footer)</label>
              <input
                type="text"
                value={receiptFooterNote}
                onChange={(e) => setReceiptFooterNote(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 space-y-1">
                <span className="font-bold text-slate-200 block">Poin Loyalitas Santri / Pelanggan</span>
                <p className="text-[10px] text-slate-400">1 Poin per kelipatan Rp 10.000 transaksi</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-slate-400">Nilai 1 Poin =</span>
                  <input
                    type="number"
                    value={pointsValue}
                    onChange={(e) => setPointsValue(Number(e.target.value))}
                    className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-emerald-400"
                  />
                  <span className="text-xs text-slate-400">Rupiah</span>
                </div>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">Prompt Notifikasi WA Otomatis</span>
                  <span className="text-[10px] text-slate-400">Kirim struk otomatis saat kasir simpan transaksi</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableWhatsApp}
                  onChange={(e) => setEnableWhatsApp(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-5 rounded-2xl shadow-lg shadow-emerald-950/40 transition-colors"
              >
                <Save className="w-4 h-4" />
                Simpan Profil Toko
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Database Backup, Restore & Reset */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Backup Card */}
          <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/60 shadow-xl space-y-4">
            <h3 className="font-black text-sm text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-700/60">
              <Download className="w-4 h-4 text-emerald-400" />
              Backup & Ekspor Database (JSON)
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              Unduh seluruh database aplikasi (Pelanggan, Santriwati, Transaksi, Keuangan, Logo, Asrama, Tarif) dalam format JSON aman untuk arsip berkala.
            </p>

            <button
              onClick={handleExportBackup}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 rounded-2xl border border-slate-700 shadow-md transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Unduh File Backup JSON
            </button>
          </div>

          {/* Restore Card */}
          <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/60 shadow-xl space-y-4">
            <h3 className="font-black text-sm text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-700/60">
              <Upload className="w-4 h-4 text-emerald-400" />
              Pulihkan / Import Data (JSON)
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              Unggah file JSON backup sebelumnya untuk memulihkan seluruh riwayat cucian, akun santri, dan pengaturan.
            </p>

            <label className="w-full flex items-center justify-center gap-2 bg-slate-900/80 hover:bg-slate-900 text-slate-200 text-xs font-bold py-3 rounded-2xl cursor-pointer transition-colors border border-slate-700/80">
              <Upload className="w-4 h-4 text-emerald-400" />
              Pilih File Backup JSON
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset Demo Data Card */}
          <div className="bg-rose-950/20 p-5 rounded-3xl border border-rose-900/40 space-y-3">
            <div className="flex items-center gap-2 text-rose-300 font-extrabold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Reset Database ke Demo Awal
            </div>
            <p className="text-[11px] text-rose-300/70 leading-relaxed">
              Kembalikan seluruh data transaksi, akun santri, dan pengaturan ke dataset bawaan pesantren.
            </p>
            <button
              onClick={handleResetDemoData}
              className="w-full flex items-center justify-center gap-2 bg-rose-900/60 hover:bg-rose-800 text-rose-100 text-xs font-bold py-2.5 rounded-2xl border border-rose-800/60 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset ke Data Default
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
