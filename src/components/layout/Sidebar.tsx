import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Building, 
  Package, 
  Truck, 
  Sparkles, 
  DollarSign, 
  BarChart3, 
  ShieldAlert, 
  Tag, 
  UserCheck, 
  Settings, 
  Search, 
  X,
  Phone,
  Smartphone
} from 'lucide-react';
import { StaffUser } from '../../types';
import { AppLogo } from '../common/AppLogo';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  currentStaff: StaffUser;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  currentStaff
}) => {
  const menuItems = [
    {
      group: 'Utama & Operasional',
      items: [
        { id: 'DASHBOARD', label: 'Dashboard Utama', icon: LayoutDashboard },
        { id: 'STAFF_MOBILE', label: 'Mode Operator Cuci', icon: Smartphone },
        { id: 'ORDERS', label: 'Daftar & Status Cucian', icon: ShoppingBag },
        { id: 'PACKING', label: 'Sortir & Packing Cucian', icon: Package },
        { id: 'PICKUP_DELIVERY', label: 'Pickup & Delivery', icon: Truck },
      ]
    },
    {
      group: 'Data & Manajemen Pelanggan',
      items: [
        { id: 'CUSTOMERS', label: 'Database & Hutang Santri', icon: Users },
        { id: 'PORTAL_PUBLIC', label: 'Portal Cek Status Santri', icon: Search },
      ]
    },
    {
      group: 'Katalog & Keuangan',
      items: [
        { id: 'SERVICES', label: 'Layanan & Multi-Tarif', icon: Sparkles },
        { id: 'FINANCE', label: 'Kas Masuk & Hutang Santri', icon: DollarSign },
        { id: 'REPORTS', label: 'Laporan & Ekspor PDF', icon: BarChart3 },
      ]
    },
    {
      group: 'Layanan & Pengaturan',
      items: [
        { id: 'COMPLAINTS', label: 'Komplain & Garansi', icon: ShieldAlert },
        { id: 'PROMOS', label: 'Promo, Voucher & Poin', icon: Tag },
        { id: 'STAFF', label: 'Petugas & Hak Akses', icon: UserCheck },
        { id: 'SETTINGS', label: 'Profil Toko & Backup', icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#020617] text-slate-100 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-emerald-900/30 shadow-2xl`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-emerald-900/30 flex items-center justify-between">
          <AppLogo showText={true} size="md" textColor="light" />

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Brand motto subtitle */}
        <div className="px-5 py-2 bg-emerald-950/15 border-b border-emerald-900/20">
          <p className="text-[10px] text-slate-400 italic font-medium tracking-tight">
            "Bersih, Wangi, Rapi, Amanah"
          </p>
        </div>

        {/* Menu Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {menuItems.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <span className="px-3 text-[10px] uppercase font-bold text-slate-500 tracking-widest block">
                {group.group}
              </span>
              <div className="space-y-0.5 pt-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                        isActive
                          ? 'bg-emerald-600/15 text-emerald-400 font-bold border-l-2 border-emerald-500 shadow-xs'
                          : 'text-slate-400 hover:bg-slate-900/70 hover:text-slate-100 font-medium'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-emerald-900/30 bg-emerald-950/20 space-y-2">
          <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 text-[11px] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-200">
              {currentStaff.name.slice(0, 1)}
            </div>
            <div className="flex-1 truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">{currentStaff.name}</p>
              <p className="text-[10px] text-emerald-400 font-medium">{currentStaff.roleTitle}</p>
            </div>
          </div>

          <p className="text-[10px] text-center text-slate-500 font-light">
            © 2026 Laundry Almawaddah • Ponorogo
          </p>
        </div>
      </aside>
    </>
  );
};
