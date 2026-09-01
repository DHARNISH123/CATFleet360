import React, { useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  ChevronRight,
  Shield,
  Truck,
  Wrench,
  KeyRound,
  Users,
  UserCheck,
  QrCode
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';

export const CommandBar: React.FC = () => {
  const {
    activeTab,
    currentUser,
    setUserRole,
    setIsCommandPaletteOpen,
    setIsAlertsDrawerOpen,
    unreadAlertsCount,
    setIsCreateAssetOpen,
    setIsCreateMaintenanceOpen,
    setIsCreateRentalOpen,
    setIsCreateOperatorOpen,
    openQRModal
  } = useApp();

  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const getBreadcrumbTitle = (tab: string) => {
    switch (tab) {
      case 'overview': return 'Operations Overview & Fleet Health';
      case 'equipment': return 'Equipment Explorer & Registry';
      case 'lifecycle': return 'Asset Lifecycle & Stage Transitions';
      case 'operations': return 'Live Operations Center & Geo-Tracking';
      case 'maintenance': return 'Maintenance Workspace & Work Orders';
      case 'rentals': return 'Commercial Rental Operations';
      case 'operators': return 'Operator Directory & Certifications';
      default: return 'Fleet Workspace';
    }
  };

  const roles: Role[] = ['ADMINISTRATOR', 'FLEET_MANAGER', 'TECHNICIAN'];

  return (
    <header className="h-16 bg-[#1a1c1d] border-b border-[#2a2c2d] flex items-center justify-between px-6 z-20 select-none">
      {/* Contextual Breadcrumb & Title */}
      <div className="flex items-center space-x-3 text-sm">
        <span className="text-gray-400 font-mono text-xs uppercase tracking-wider">CATFleet360</span>
        <ChevronRight size={14} className="text-gray-600" />
        <span className="text-gray-100 font-semibold font-mono tracking-tight text-sm">
          {getBreadcrumbTitle(activeTab)}
        </span>
      </div>

      {/* Center / Right Commands */}
      <div className="flex items-center space-x-3">
        {/* Global Search trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center space-x-3 px-3.5 py-1.5 bg-[#121314] hover:bg-[#202223] border border-[#2e3132] hover:border-[#ffcd00]/50 rounded-md text-gray-400 hover:text-gray-200 transition-all text-xs w-60 shadow-inner"
        >
          <Search size={14} className="text-[#ffcd00]" />
          <span className="flex-1 text-left truncate">Search assets, tickets...</span>
          <kbd className="hidden sm:inline-block bg-[#231f20] border border-[#393c3d] text-gray-300 text-[10px] font-mono px-1.5 py-0.5 rounded shadow-sm">
            Ctrl+K
          </kbd>
        </button>

        {/* QR Code Check-In / Out Button */}
        <button
          onClick={() => openQRModal()}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#121314] hover:bg-[#202223] text-[#ffcd00] border border-[#ffcd00]/40 rounded text-xs font-mono font-bold transition-all shadow-sm"
          title="Scan QR Code for Machine Shift Handover & Ingress/Egress"
        >
          <QrCode size={15} />
          <span>QR CHECK-IN/OUT</span>
        </button>

        {/* Quick Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#ffcd00] hover:bg-[#e6b800] text-black font-semibold text-xs rounded transition-colors shadow-md shadow-amber-500/10 font-mono"
          >
            <Plus size={15} className="font-bold stroke-[3]" />
            <span>NEW ACTION</span>
          </button>

          {isQuickActionOpen && (
            <div
              className="absolute right-0 mt-2 w-52 bg-[#202223] border border-[#393c3d] rounded shadow-2xl py-1.5 z-50 text-xs font-sans"
              onClick={() => setIsQuickActionOpen(false)}
            >
              <div className="px-3 py-1 text-[10px] font-mono uppercase text-gray-400 tracking-wider">
                Fleet Dispatch
              </div>
              <button
                onClick={() => setIsCreateAssetOpen(true)}
                className="w-full px-3 py-2 text-left text-gray-200 hover:bg-[#2a2d2e] hover:text-[#ffcd00] flex items-center space-x-2.5"
              >
                <Truck size={14} className="text-[#ffcd00]" />
                <span>Register Machinery</span>
              </button>
              <button
                onClick={() => setIsCreateMaintenanceOpen(true)}
                className="w-full px-3 py-2 text-left text-gray-200 hover:bg-[#2a2d2e] hover:text-[#ffcd00] flex items-center space-x-2.5"
              >
                <Wrench size={14} className="text-amber-400" />
                <span>Log Maintenance Order</span>
              </button>
              <button
                onClick={() => setIsCreateRentalOpen(true)}
                className="w-full px-3 py-2 text-left text-gray-200 hover:bg-[#2a2d2e] hover:text-[#ffcd00] flex items-center space-x-2.5"
              >
                <KeyRound size={14} className="text-emerald-400" />
                <span>Create Rental Contract</span>
              </button>
              <button
                onClick={() => setIsCreateOperatorOpen(true)}
                className="w-full px-3 py-2 text-left text-gray-200 hover:bg-[#2a2d2e] hover:text-[#ffcd00] flex items-center space-x-2.5"
              >
                <Users size={14} className="text-sky-400" />
                <span>Add Operator Profile</span>
              </button>
            </div>
          )}
        </div>

        {/* Smart Alerts Notification Bell */}
        <button
          onClick={() => setIsAlertsDrawerOpen(true)}
          className="relative p-2 rounded hover:bg-[#25282a] text-gray-300 hover:text-white border border-transparent hover:border-[#2e3132] transition-colors"
          title="Smart Fleet Alerts"
        >
          <Bell size={18} />
          {unreadAlertsCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* User Role Switcher Profile */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center space-x-2 pl-2 pr-3 py-1 bg-[#161718] hover:bg-[#202223] border border-[#2e3132] rounded-md transition-colors"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover border border-[#ffcd00]"
            />
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-white leading-tight">{currentUser.name}</div>
              <div className="text-[10px] font-mono text-[#ffcd00] tracking-tight">
                {currentUser.role.replace('_', ' ')}
              </div>
            </div>
          </button>

          {isRoleDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-[#202223] border border-[#393c3d] rounded shadow-2xl py-2 z-50 text-xs"
              onClick={() => setIsRoleDropdownOpen(false)}
            >
              <div className="px-3 py-1 text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                Switch Active Role View
              </div>
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => setUserRole(r)}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#2a2d2e] transition-colors ${
                    currentUser.role === r ? 'text-[#ffcd00] font-semibold bg-[#26282a]' : 'text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Shield size={13} className={currentUser.role === r ? 'text-[#ffcd00]' : 'text-gray-400'} />
                    <span>{r.replace('_', ' ')}</span>
                  </div>
                  {currentUser.role === r && <UserCheck size={14} className="text-[#ffcd00]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
