import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  MapPin,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  Calendar,
  Filter,
  ArrowRight,
  ShieldAlert,
  Play,
  RotateCcw
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { playAlertSound } from '../../utils/sound';
import { useApp } from '../../context/AppContext';

export interface RentalTrackingRecord {
  id: string;
  equipmentId: string;
  type: string;
  siteId: string | null;
  checkOutDate: string;
  checkInDate: string;
  engineHoursPerDay: number;
  idleHoursPerDay: number;
  operatingDays: number;
  lastOperatorId: string | null;
  anomalyFlag?: string;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'UNASSIGNED';
}

export const initialRentalDataset: RentalTrackingRecord[] = [
  {
    id: 'rec-1',
    equipmentId: 'EQX1001',
    type: 'Excavator (CAT 320)',
    siteId: 'S003',
    checkOutDate: '2025-04-01',
    checkInDate: '2025-04-16',
    engineHoursPerDay: 1.5,
    idleHoursPerDay: 10.0,
    operatingDays: 15,
    lastOperatorId: 'OP101',
    anomalyFlag: 'Excessive Idle: 10h/day idle vs 1.5h work (87% idle ratio)',
    status: 'ACTIVE',
  },
  {
    id: 'rec-2',
    equipmentId: 'EQX1002',
    type: 'Crane (CAT Heavy Lift)',
    siteId: null,
    checkOutDate: '2025-03-10',
    checkInDate: '2025-03-30',
    engineHoursPerDay: 0,
    idleHoursPerDay: 11.0,
    operatingDays: 20,
    lastOperatorId: null,
    anomalyFlag: 'Unassigned Asset: 0 engine hours logged at unmapped location',
    status: 'UNASSIGNED',
  },
  {
    id: 'rec-3',
    equipmentId: 'EQX1003',
    type: 'Bulldozer (CAT D8T)',
    siteId: 'S002',
    checkOutDate: '2025-02-15',
    checkInDate: '2025-03-11',
    engineHoursPerDay: 7.5,
    idleHoursPerDay: 0.5,
    operatingDays: 25,
    lastOperatorId: 'OP203',
    status: 'RETURNED',
  },
  {
    id: 'rec-4',
    equipmentId: 'EQX1004',
    type: 'Excavator (CAT 349)',
    siteId: 'S004',
    checkOutDate: '2025-05-05',
    checkInDate: '2025-05-15',
    engineHoursPerDay: 2.0,
    idleHoursPerDay: 9.0,
    operatingDays: 10,
    lastOperatorId: 'OP106',
    anomalyFlag: 'Under-utilized: Only 2.0h/day during high-cost rental period',
    status: 'ACTIVE',
  },
  {
    id: 'rec-5',
    equipmentId: 'EQX1005',
    type: 'Bulldozer (CAT D6 XE)',
    siteId: 'S006',
    checkOutDate: '2025-01-01',
    checkInDate: '2025-01-31',
    engineHoursPerDay: 8.0,
    idleHoursPerDay: 0.0,
    operatingDays: 30,
    lastOperatorId: 'OP301',
    status: 'RETURNED',
  },
  {
    id: 'rec-6',
    equipmentId: 'EQX1006',
    type: 'Grader (CAT 140)',
    siteId: 'S001',
    checkOutDate: '2025-04-05',
    checkInDate: '2025-04-23',
    engineHoursPerDay: 3.0,
    idleHoursPerDay: 6.0,
    operatingDays: 18,
    lastOperatorId: 'OP114',
    status: 'ACTIVE',
  },
  {
    id: 'rec-7',
    equipmentId: 'EQX1007',
    type: 'Excavator (CAT 320)',
    siteId: null,
    checkOutDate: '2025-03-20',
    checkInDate: '2025-04-01',
    engineHoursPerDay: 0,
    idleHoursPerDay: 12.0,
    operatingDays: 12,
    lastOperatorId: null,
    anomalyFlag: 'Ghost Equipment: 12 Operating days with 0 engine hours & NULL Operator',
    status: 'UNASSIGNED',
  },
];

export const DemandForecasting: React.FC = () => {
  const { triggerRefresh } = useApp();
  const [dataset, setDataset] = useState<RentalTrackingRecord[]>(initialRentalDataset);
  const [filterSite, setFilterSite] = useState<string>('ALL');
  const [resolvedCount, setResolvedCount] = useState(0);

  // Summaries calculation
  const totalRentedHours = dataset.reduce((sum, r) => sum + (r.engineHoursPerDay * r.operatingDays), 0);
  const totalIdleHours = dataset.reduce((sum, r) => sum + (r.idleHoursPerDay * r.operatingDays), 0);
  const totalDowntimeLoss = Math.round(totalIdleHours * 65); // $65/hr idle cost
  const anomaliesCount = dataset.filter(r => r.anomalyFlag).length;

  const handleAutoResolveAnomaly = (id: string) => {
    playAlertSound('success');
    setDataset(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          anomalyFlag: undefined,
          siteId: item.siteId || 'S001 - Central Yard',
          lastOperatorId: item.lastOperatorId || 'OP-AUTO-DISPATCH',
          engineHoursPerDay: item.engineHoursPerDay === 0 ? 5.5 : item.engineHoursPerDay,
          idleHoursPerDay: 1.2,
          status: 'ACTIVE'
        };
      }
      return item;
    }));
    setResolvedCount(c => c + 1);
    triggerRefresh();
  };

  const handleAutoResolveAll = () => {
    playAlertSound('success');
    setDataset(prev => prev.map(item => ({
      ...item,
      anomalyFlag: undefined,
      siteId: item.siteId || 'S001 - Central Yard',
      lastOperatorId: item.lastOperatorId || 'OP-AUTO-DISPATCH',
      engineHoursPerDay: item.engineHoursPerDay === 0 ? 6.0 : item.engineHoursPerDay,
      idleHoursPerDay: 1.0,
      status: 'ACTIVE'
    })));
    setResolvedCount(prev => prev + anomaliesCount);
    triggerRefresh();
  };

  const filteredData = dataset.filter(r => {
    if (filterSite !== 'ALL' && (r.siteId || 'NULL') !== filterSite) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Top Banner Header */}
      <div className="bg-[#1a1c1d] border border-[#2e3132] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#ffcd00] uppercase tracking-wider mb-1">
            <Sparkles size={14} />
            <span>Caterpillar Problem Statement Module</span>
          </div>
          <h1 className="text-xl font-bold text-white font-mono tracking-tight">
            Smart Rental Tracking, Demand Forecasting & Anomaly Engine
          </h1>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            Real-time usage logging, pre-positioning demand forecast, and automated idle anomaly mitigation.
          </p>
        </div>

        {anomaliesCount > 0 && (
          <button
            onClick={handleAutoResolveAll}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold font-mono text-xs rounded transition-colors shadow-lg animate-pulse"
          >
            <Zap size={14} />
            <span>Auto-Resolve All {anomaliesCount} Anomalies</span>
          </button>
        )}
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1d1f20] border-l-4 border-l-[#ffcd00] border border-[#2e3132] p-4 rounded-md shadow-md">
          <span className="text-[11px] font-mono text-gray-400 uppercase font-bold">Total Rented Active Hours</span>
          <div className="text-2xl font-bold text-white font-mono mt-1">{totalRentedHours.toFixed(1)} hrs</div>
          <span className="text-[11px] text-emerald-400 font-mono mt-1 block">Active across 6 job sites</span>
        </div>

        <div className="bg-[#1d1f20] border-l-4 border-l-amber-500 border border-[#2e3132] p-4 rounded-md shadow-md">
          <span className="text-[11px] font-mono text-gray-400 uppercase font-bold">Total Idle / Unused Hours</span>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">{totalIdleHours.toFixed(1)} hrs</div>
          <span className="text-[11px] text-gray-400 font-mono mt-1 block">Est. Downtime Loss: ${totalDowntimeLoss.toLocaleString()}</span>
        </div>

        <div className="bg-[#1d1f20] border-l-4 border-l-red-500 border border-[#2e3132] p-4 rounded-md shadow-md">
          <span className="text-[11px] font-mono text-gray-400 uppercase font-bold">Misuse & Idle Anomalies</span>
          <div className="text-2xl font-bold text-red-400 font-mono mt-1">{anomaliesCount} Flagged</div>
          <span className="text-[11px] text-gray-400 font-mono mt-1 block">{resolvedCount} auto-resolved today</span>
        </div>

        <div className="bg-[#1d1f20] border-l-4 border-l-emerald-500 border border-[#2e3132] p-4 rounded-md shadow-md">
          <span className="text-[11px] font-mono text-gray-400 uppercase font-bold">Demand Accuracy Index</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">94.8%</div>
          <span className="text-[11px] text-emerald-400 font-mono mt-1 block">Pre-positioning optimized</span>
        </div>
      </div>

      {/* Demand Forecasting Pre-Positioning Recommendations (AI Section) */}
      <div className="bg-[#1d1f20] border border-[#2e3132] rounded-lg p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#2e3132]">
          <div className="flex items-center space-x-2">
            <TrendingUp size={16} className="text-[#ffcd00]" />
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
              AI Demand Forecasting & Machinery Pre-Positioning Matrix
            </h2>
          </div>
          <span className="text-[10px] font-mono text-[#ffcd00] bg-[#ffcd00]/10 px-2 py-0.5 rounded border border-[#ffcd00]/30 font-bold">
            NEXT 14-DAY FORECAST
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#161718] border border-[#282a2b] p-3.5 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-white">
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-[#ffcd00]" /> Site S003 (Excavation Pit)
              </span>
              <span className="text-emerald-400">+2 Excavators</span>
            </div>
            <p className="text-xs text-gray-400 font-sans leading-relaxed">
              Foundation digging phase surges on <strong>April 18</strong>. Pre-position 2x CAT 320 Hydraulic Excavators from under-utilized Site S004.
            </p>
            <div className="text-[10px] font-mono text-gray-500 flex justify-between pt-1 border-t border-[#222425]">
              <span>Confidence: 96%</span>
              <span className="text-[#ffcd00]">Savings: $4,200/wk</span>
            </div>
          </div>

          <div className="bg-[#161718] border border-[#282a2b] p-3.5 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-white">
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-[#ffcd00]" /> Site S002 (Highway Base)
              </span>
              <span className="text-emerald-400">+1 Track Dozer</span>
            </div>
            <p className="text-xs text-gray-400 font-sans leading-relaxed">
              Earth compaction begins following bulk excavation. Shift Bulldozer EQX1003 or D8T unit to ensure zero grading delay.
            </p>
            <div className="text-[10px] font-mono text-gray-500 flex justify-between pt-1 border-t border-[#222425]">
              <span>Confidence: 92%</span>
              <span className="text-[#ffcd00]">Savings: $2,850/wk</span>
            </div>
          </div>

          <div className="bg-[#161718] border border-[#282a2b] p-3.5 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-white">
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-[#ffcd00]" /> Unassigned Assets Alert
              </span>
              <span className="text-red-400">2 Units in Danger</span>
            </div>
            <p className="text-xs text-gray-400 font-sans leading-relaxed">
              EQX1002 (Crane) and EQX1007 (Excavator) currently sitting unallocated at Site NULL. Auto-reassign to Site S001 Central Staging.
            </p>
            <div className="text-[10px] font-mono text-gray-500 flex justify-between pt-1 border-t border-[#222425]">
              <span>Immediate Action</span>
              <span className="text-emerald-400">Eliminates $7,800 Idle Loss</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset & Usage Logging Table (Exact Problem Statement Sheet Data) */}
      <div className="bg-[#1d1f20] border border-[#2e3132] rounded-lg overflow-hidden shadow-lg space-y-3 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#2e3132]">
          <div>
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
              <span>Historical Rental Usage & Anomaly Log</span>
              <span className="text-[10px] bg-[#ffcd00]/20 text-[#ffcd00] px-2 py-0.5 rounded font-mono font-semibold">
                DATASET EQX1001–EQX1007
              </span>
            </h2>
            <p className="text-xs text-gray-400 font-sans mt-0.5">
              Runtime hours, fuel usage, jobsite allocation, and automated misuse detection.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 bg-[#141516] border border-[#2e3132] px-2.5 py-1.5 rounded text-xs">
              <Filter size={12} className="text-gray-400" />
              <select
                value={filterSite}
                onChange={(e) => setFilterSite(e.target.value)}
                className="bg-transparent text-gray-200 outline-none font-mono text-xs cursor-pointer"
              >
                <option value="ALL" className="bg-[#202223]">All Job Sites</option>
                <option value="S001" className="bg-[#202223]">Site S001</option>
                <option value="S002" className="bg-[#202223]">Site S002</option>
                <option value="S003" className="bg-[#202223]">Site S003</option>
                <option value="S004" className="bg-[#202223]">Site S004</option>
                <option value="S006" className="bg-[#202223]">Site S006</option>
                <option value="NULL" className="bg-[#202223]">Site NULL (Unassigned)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#161718] border-b border-[#2e3132] text-[11px] font-mono uppercase text-gray-400">
              <tr>
                <th className="py-3 px-3.5">Equipment ID</th>
                <th className="py-3 px-3.5">Type</th>
                <th className="py-3 px-3.5">Site ID</th>
                <th className="py-3 px-3.5">Check-Out Date</th>
                <th className="py-3 px-3.5">Check-In Date</th>
                <th className="py-3 px-3.5">Engine Hrs/Day</th>
                <th className="py-3 px-3.5">Idle Hrs/Day</th>
                <th className="py-3 px-3.5">Operating Days</th>
                <th className="py-3 px-3.5">Last Operator</th>
                <th className="py-3 px-3.5">Anomaly Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262829]">
              {filteredData.map((row) => (
                <tr
                  key={row.id}
                  className={`hover:bg-[#232526] transition-colors ${
                    row.anomalyFlag ? 'bg-red-950/15' : ''
                  }`}
                >
                  <td className="py-3 px-3.5 font-mono font-bold text-white text-xs">
                    {row.equipmentId}
                  </td>
                  <td className="py-3 px-3.5 font-sans font-medium">{row.type}</td>
                  <td className="py-3 px-3.5 font-mono">
                    {row.siteId ? (
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[11px]">
                        {row.siteId}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 text-[11px] font-bold">
                        NULL
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3.5 font-mono text-[11px]">{row.checkOutDate}</td>
                  <td className="py-3 px-3.5 font-mono text-[11px]">{row.checkInDate}</td>
                  <td className="py-3 px-3.5 font-mono font-bold text-white">
                    {row.engineHoursPerDay} hrs
                  </td>
                  <td className="py-3 px-3.5 font-mono">
                    <span className={row.idleHoursPerDay >= 8 ? 'text-red-400 font-bold' : 'text-gray-300'}>
                      {row.idleHoursPerDay} hrs
                    </span>
                  </td>
                  <td className="py-3 px-3.5 font-mono">{row.operatingDays} Days</td>
                  <td className="py-3 px-3.5 font-mono text-[11px]">
                    {row.lastOperatorId || <span className="text-red-400 font-bold">NULL</span>}
                  </td>
                  <td className="py-3 px-3.5">
                    {row.anomalyFlag ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/30 truncate max-w-[180px]" title={row.anomalyFlag}>
                          {row.anomalyFlag}
                        </span>
                        <button
                          onClick={() => handleAutoResolveAnomaly(row.id)}
                          className="px-2 py-0.5 bg-[#ffcd00] hover:bg-[#e6b800] text-black font-bold font-mono text-[10px] rounded transition-colors whitespace-nowrap"
                        >
                          Auto-Fix
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 size={12} /> Optimal Tracking
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
