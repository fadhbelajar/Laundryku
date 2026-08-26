import React from 'react';
import { 
  Menu, 
  Sparkles, 
  QrCode, 
  Plus, 
  Bell, 
  UserCheck, 
  Smartphone,
  ChevronDown
} from 'lucide-react';
import { StaffUser } from '../../types';
import { StorageService } from '../../data/storage';
import { AppLogo } from '../common/AppLogo';

interface HeaderProps {
  currentStaff: StaffUser;
  onOpenSidebar: () => void;
  onOpenNewTransaction: () => void;
  onOpenScanner: () => void;
  onOpenStaffModal: () => void;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentStaff,
  onOpenSidebar,
  onOpenNewTransaction,
  onOpenScanner,
  onOpenStaffModal,
  activeTab
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0f172a]/90 backdrop-blur-md border-b border-emerald-900/30 px-4 sm:px-6 py-3 transition-all">
      <div className="flex items-center justify-between gap-3">
        
        {/* Left Side: Mobile Menu Button & Brand Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center">
            <AppLogo showText={true} size="md" textColor="light" />
          </div>
        </div>

        {/* Center: System Status Indicator */}
        <div className="hidden md:flex items-center gap-2 bg-slate-800/50 border border-slate-700/60 px-3 py-1.5 rounded-full">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300">Sistem Online • Pesantren</span>
        </div>

        {/* Right Side: Quick Action Buttons & Staff Profile */}
        <div className="flex items-center gap-2">
          
          {/* Quick Scanner */}
          <button
            onClick={onOpenScanner}
            className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-bold py-2 px-3 rounded-2xl border border-slate-700/60 transition-colors"
            title="Scan Barcode / QR"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Scan QR</span>
          </button>

          {/* Quick POS New Transaction */}
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold py-2 px-3 sm:px-4 rounded-2xl shadow-lg shadow-amber-950/50 border border-amber-500/30 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">+ TRANSAKSI BARU</span>
            <span className="sm:hidden">POS</span>
          </button>

          {/* Current Staff Switcher Trigger */}
          <button
            onClick={onOpenStaffModal}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-emerald-900/40 text-slate-200 transition-colors"
            title="Ganti Role Petugas"
          >
            <div className="w-6 h-6 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
              {currentStaff.name.slice(0, 1)}
            </div>
            <div className="hidden md:block text-left text-[11px] leading-tight">
              <div className="font-extrabold text-slate-100">{currentStaff.name}</div>
              <span className="text-[9px] text-emerald-400 font-medium">{currentStaff.roleTitle}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

        </div>

      </div>
    </header>
  );
};
