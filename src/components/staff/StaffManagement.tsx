import React, { useState } from 'react';
import { 
  UserCheck, 
  Shield, 
  KeyRound, 
  Phone, 
  Check, 
  Sparkles,
  Users
} from 'lucide-react';
import { StaffUser, UserRole } from '../../types';
import { StorageService } from '../../data/storage';

interface StaffManagementProps {
  onRoleChanged: () => void;
}

export const StaffManagement: React.FC<StaffManagementProps> = ({ onRoleChanged }) => {
  const [staffList, setStaffList] = useState<StaffUser[]>(StorageService.getStaff());
  const [currentStaff, setCurrentStaff] = useState<StaffUser>(StorageService.getCurrentStaff());

  const handleSwitchActiveStaff = (staff: StaffUser) => {
    StorageService.setCurrentStaffId(staff.id);
    setCurrentStaff(staff);
    onRoleChanged();
  };

  return (
    <div id="staff-management-view" className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-700" />
            Manajemen Petugas & Hak Akses (Multi-Role)
          </h2>
          <p className="text-xs text-slate-500">
            Peralihan role instan untuk demonstrasi akun Super Admin, Kasir POS, Petugas Cuci/Packing, dan Kurir Delivery.
          </p>
        </div>

        <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200 text-xs">
          <span className="text-slate-500">Akun Aktif Sekarang: </span>
          <strong className="text-emerald-950 font-bold">{currentStaff.name} ({currentStaff.roleTitle})</strong>
        </div>
      </div>

      {/* Staff Role Switcher Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {staffList.map(staff => {
          const isCurrent = currentStaff.id === staff.id;
          return (
            <div
              key={staff.id}
              className={`bg-white rounded-3xl border-2 p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                isCurrent
                  ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md bg-emerald-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-black text-base shadow-xs">
                    {staff.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {staff.role}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">{staff.name}</h3>
                  <span className="text-xs font-bold text-emerald-800 block mt-0.5">{staff.roleTitle}</span>
                  <span className="text-[11px] text-slate-400 font-mono block mt-1">NIP: {staff.nip}</span>
                </div>

                <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                  <div>WhatsApp: <strong>{staff.phone}</strong></div>
                  <div>Shift: <strong>{staff.shift}</strong></div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                {isCurrent ? (
                  <div className="w-full bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 shadow-xs">
                    <Check className="w-4 h-4" />
                    Sedang Digunakan
                  </div>
                ) : (
                  <button
                    onClick={() => handleSwitchActiveStaff(staff)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors shadow-xs"
                  >
                    Beralih ke Akun Ini
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
