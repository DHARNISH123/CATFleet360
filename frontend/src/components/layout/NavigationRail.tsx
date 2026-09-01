import React from 'react';
import {
  LayoutDashboard,
  Truck,
  GitBranch,
  Radio,
  Wrench,
  KeyRound,
  Users,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NavigationRail: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems = [
    { id: 'overview', label: 'Operations Hub', icon: LayoutDashboard },
    { id: 'equipment', label: 'Equipment Explorer', icon: Truck, count: 7 },
    { id: 'lifecycle', label: 'Asset Lifecycle', icon: GitBranch },
    { id: 'forecast', label: 'Rental Demand & AI Anomaly', icon: TrendingUp, badge: 'NEW' },
    { id: 'operations', label: 'Live Operations Map', icon: Radio, badge: 'LIVE' },
    { id: 'maintenance', label: 'Maintenance Ops', icon: Wrench, count: 1 },
    { id: 'rentals', label: 'Rental Management', icon: KeyRound, count: 2 },
    { id: 'operators', label: 'Operator Directory', icon: Users },
  ];

  return (
    <aside className="w-64 bg-[#141516] border-r border-[#26282a] flex flex-col justify-between select-none z-30">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-6 border-b border-[#26282a] bg-[#101112]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-[#ffcd00] flex items-center justify-center font-bold text-black font-mono text-sm tracking-tighter shadow-md shadow-amber-500/20">
              CAT
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white font-mono flex items-center gap-1.5">
                <span>Fleet360</span>
                <span className="text-[10px] bg-[#ffcd00]/20 text-[#ffcd00] px-1.5 py-0.2 rounded font-mono font-semibold">
                  PRO
                </span>
              </div>
              <div className="text-[10px] text-gray-400 font-mono tracking-wide uppercase">
                Enterprise OS
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-mono text-gray-400 uppercase tracking-wider">
            Workspaces
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-mono transition-all ${
                  isActive
                    ? 'bg-[#231f20] text-[#ffcd00] font-bold border-l-4 border-[#ffcd00] shadow-sm'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-[#1a1c1d]'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon size={16} className={isActive ? 'text-[#ffcd00]' : 'text-gray-400'} />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      item.badge === 'LIVE'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                        : 'bg-[#ffcd00]/20 text-[#ffcd00] border border-[#ffcd00]/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {typeof item.count === 'number' && (
                    <span className="text-[10px] bg-[#222425] text-gray-400 px-1.5 py-0.5 rounded font-mono">
                      {item.count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-4 border-t border-[#26282a] bg-[#101112]">
        <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 mb-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Telemetry Feed
          </span>
          <span className="text-emerald-400 font-bold">99.8%</span>
        </div>
        <div className="w-full bg-[#202223] h-1.5 rounded-full overflow-hidden mb-2">
          <div className="bg-[#ffcd00] h-full rounded-full" style={{ width: '99.8%' }}></div>
        </div>
        <div className="flex justify-between text-[9px] font-mono text-gray-400">
          <span>GPS Satellites: 12</span>
          <span>AES-256</span>
        </div>
      </div>
    </aside>
  );
};
