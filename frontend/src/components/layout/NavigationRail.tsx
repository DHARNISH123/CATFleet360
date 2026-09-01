import React, { useState } from 'react';
import {
  LayoutDashboard,
  Truck,
  GitBranch,
  MapPin,
  Wrench,
  KeyRound,
  Users,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NavigationRail: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Operations Hub', icon: LayoutDashboard, badge: null },
    { id: 'equipment', label: 'Equipment Explorer', icon: Truck, badge: '7' },
    { id: 'lifecycle', label: 'Asset Lifecycle', icon: GitBranch, badge: null },
    { id: 'operations', label: 'Live Operations Map', icon: MapPin, badge: 'LIVE' },
    { id: 'maintenance', label: 'Maintenance Ops', icon: Wrench, badge: '1' },
    { id: 'rentals', label: 'Rental Management', icon: KeyRound, badge: '2' },
    { id: 'operators', label: 'Operator Directory', icon: Users, badge: null },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-[#161718] border-r border-[#2a2c2d] transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#2a2c2d] bg-[#1a1c1d]">
        <div className="flex items-center space-x-3 overflow-hidden">
          {/* Caterpillar Triangle Iconic Logo */}
          <div className="w-9 h-9 rounded bg-[#ffcd00] flex items-center justify-center font-black text-black text-base tracking-tighter flex-shrink-0 shadow-md shadow-amber-500/20">
            <span className="font-extrabold tracking-tight text-xs bg-black text-[#ffcd00] px-1 py-0.5 rounded-sm">CAT</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm text-white tracking-wider font-mono flex items-center gap-1.5">
                FLEET360
                <span className="bg-[#ffcd00]/20 text-[#ffcd00] text-[10px] font-sans px-1.5 py-0.2 rounded font-semibold border border-[#ffcd00]/30">PRO</span>
              </span>
              <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Industrial OS</span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded hover:bg-[#2a2c2d] text-gray-400 hover:text-white transition-colors"
          title={collapsed ? 'Expand rail' : 'Collapse rail'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center rounded-md text-sm font-medium transition-all group relative ${
                isActive
                  ? 'bg-[#25282a] text-[#ffcd00] font-semibold border-l-4 border-[#ffcd00] shadow-sm'
                  : 'text-gray-300 hover:bg-[#1f2122] hover:text-white'
              } ${collapsed ? 'justify-center px-0 py-3' : 'px-3.5 py-2.5 space-x-3'}`}
            >
              <Icon
                size={20}
                className={`flex-shrink-0 transition-colors ${
                  isActive ? 'text-[#ffcd00]' : 'text-gray-400 group-hover:text-gray-200'
                }`}
              />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between text-left">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm ${
                        item.badge === 'LIVE'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                          : 'bg-[#ffcd00]/10 text-[#ffcd00] border border-[#ffcd00]/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#231f20] text-white text-xs font-mono rounded border border-[#393c3d] shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Industrial Machine Telemetry Indicator */}
      <div className="p-3 border-t border-[#2a2c2d] bg-[#141516]">
        {!collapsed ? (
          <div className="bg-[#1f2122] rounded p-2.5 border border-[#2e3132] text-xs">
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5">
              <span className="font-mono flex items-center gap-1">
                <Zap size={12} className="text-[#ffcd00]" /> Telemetry Feed
              </span>
              <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> 99.8%
              </span>
            </div>
            <div className="w-full bg-[#121314] rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#ffcd00] h-full rounded-full w-[94%]"></div>
            </div>
            <div className="mt-2 text-[10px] text-gray-400 font-mono flex items-center justify-between">
              <span>GPS Satellites: 12</span>
              <span className="text-gray-400">AES-256</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Telemetry Feed Online">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
};
