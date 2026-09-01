import React, { useState, useEffect } from 'react';
import {
  Activity,
  Truck,
  Wrench,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Filter,
  Calendar,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';
import { MetricCard } from '../../components/common/MetricCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { apiService } from '../../services/api';
import { OperationsOverviewData, ActivityLog } from '../../types';
import { useApp } from '../../context/AppContext';

export const OperationsOverview: React.FC = () => {
  const { setActiveTab, openAssetDetail, refreshKey, setIsCreateMaintenanceOpen, setIsCreateRentalOpen } = useApp();
  const [data, setData] = useState<OperationsOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiService.getOverview().then((res) => {
      if (mounted) {
        setData(res);
        setLoading(false);
      }
    }).catch(console.error);

    return () => { mounted = false; };
  }, [refreshKey]);

  if (loading || !data) {
    return (
      <div className="p-8 flex items-center justify-center h-full text-gray-400 font-mono text-xs">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#ffcd00] border-t-transparent rounded-full animate-spin"></div>
          <span>Loading CAT Operations Hub Telemetry...</span>
        </div>
      </div>
    );
  }

  const { metrics, recentActivities, upcomingMaintenance, activeRentals } = data;

  const filteredActivities = recentActivities.filter((act) => {
    if (selectedCategory !== 'ALL' && act.asset?.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Top Banner & Dynamic Filters */}
      <div className="bg-[#1a1c1d] border border-[#2e3132] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#ffcd00] uppercase tracking-wider mb-1">
            <Sparkles size={14} />
            <span>Industrial Operations Overview</span>
          </div>
          <h1 className="text-xl font-bold text-white font-mono tracking-tight">
            Caterpillar Heavy Machinery Control Command
          </h1>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            Real-time fleet health calculation, live jobsite allocation, and automated maintenance metrics.
          </p>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-1.5 bg-[#121314] border border-[#2e3132] px-2.5 py-1.5 rounded text-xs">
            <Filter size={13} className="text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-gray-200 outline-none cursor-pointer font-mono text-xs"
            >
              <option value="ALL" className="bg-[#202223]">All Categories</option>
              <option value="Hydraulic Excavator" className="bg-[#202223]">Excavators</option>
              <option value="Track Type Tractor" className="bg-[#202223]">Dozers</option>
              <option value="Wheel Loader" className="bg-[#202223]">Wheel Loaders</option>
              <option value="Off-Highway Truck" className="bg-[#202223]">Haul Trucks</option>
              <option value="Motor Grader" className="bg-[#202223]">Motor Graders</option>
              <option value="Backhoe Loader" className="bg-[#202223]">Backhoes</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-[#121314] border border-[#2e3132] px-2.5 py-1.5 rounded text-xs">
            <Calendar size={13} className="text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-gray-200 outline-none cursor-pointer font-mono text-xs"
            >
              <option value="24h" className="bg-[#202223]">Last 24 Hours</option>
              <option value="7d" className="bg-[#202223]">Last 7 Days</option>
              <option value="30d" className="bg-[#202223]">Last 30 Days</option>
              <option value="quarter" className="bg-[#202223]">Quarter to Date</option>
            </select>
          </div>

          <button
            onClick={() => setActiveTab('operations')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#ffcd00] hover:bg-[#e6b800] text-black font-semibold font-mono text-xs rounded transition-colors"
          >
            <span>LIVE MAP</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* Fleet Health Score Hero Gauge & Interactive Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Fleet Health Score Calculation Card (4 cols) */}
        <div className="lg:col-span-4 bg-[#1d1f20] border border-[#2e3132] rounded-lg p-5 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">
              Fleet Health Score
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
              OPTIMAL
            </span>
          </div>

          <div className="my-6 flex items-center justify-center">
            {/* Radial score display */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-[#2a2c2e]"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-[#ffcd00] transition-all duration-1000 ease-out"
                  strokeWidth="10"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 * (1 - metrics.healthScore / 100)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black font-mono text-white tracking-tight">
                  {metrics.healthScore}
                </span>
                <span className="text-[10px] font-mono text-gray-400 uppercase">/ 100 PTS</span>
              </div>
            </div>
          </div>

          {/* Health Breakdown deductions */}
          <div className="space-y-1.5 bg-[#161718] p-3 rounded border border-[#262829] text-[11px] font-mono">
            <div className="flex justify-between text-gray-300">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-400" /> Availability Factor
              </span>
              <span className="text-white font-bold">{metrics.availabilityRate}%</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span className="flex items-center gap-1">
                <TrendingUp size={12} className="text-[#ffcd00]" /> Average Utilization
              </span>
              <span className="text-white font-bold">{metrics.averageUtilization}%</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span className="flex items-center gap-1">
                <AlertTriangle size={12} className={metrics.overdueMaintenanceCount > 0 ? 'text-red-400' : 'text-gray-400'} /> Overdue Service
              </span>
              <span className={metrics.overdueMaintenanceCount > 0 ? 'text-red-400 font-bold' : 'text-gray-400'}>
                {metrics.overdueMaintenanceCount} Tasks
              </span>
            </div>
          </div>
        </div>

        {/* KPI Grid (8 cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <MetricCard
            title="Equipment Availability"
            value={`${metrics.availabilityRate}%`}
            subtitle={`${metrics.operationalCount} of ${metrics.totalAssets} units ready`}
            icon={Truck}
            accentColor="emerald"
            trend={{ value: '+4.2% vs last wk', isPositive: true }}
            onClick={() => setActiveTab('equipment')}
          />

          <MetricCard
            title="Active In-Field"
            value={metrics.operationalCount}
            subtitle="Engaged in active operations"
            icon={Zap}
            accentColor="yellow"
            onClick={() => setActiveTab('equipment')}
          />

          <MetricCard
            title="Under Maintenance"
            value={metrics.inMaintenanceCount}
            subtitle="1 critical hydraulic repair"
            icon={Wrench}
            accentColor="red"
            onClick={() => setActiveTab('maintenance')}
          />

          <MetricCard
            title="Active Rentals"
            value={metrics.onRentCount}
            subtitle="Turner Corp & Pacific Bay"
            icon={KeyRound}
            accentColor="amber"
            onClick={() => setActiveTab('rentals')}
          />

          <MetricCard
            title="Staged / Idle"
            value={metrics.idleCount}
            subtitle="Ready for shift deployment"
            icon={Clock}
            accentColor="blue"
            onClick={() => setActiveTab('equipment')}
          />

          <MetricCard
            title="Fleet Average Util"
            value={`${metrics.averageUtilization}%`}
            subtitle="Target threshold: >65%"
            icon={Activity}
            accentColor="yellow"
            trend={{ value: 'Within Target', isPositive: true }}
            onClick={() => setActiveTab('equipment')}
          />
        </div>
      </div>

      {/* Main Workspace 2-Column: Activity Timeline & Operational Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Operational Activity Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-[#1d1f20] border border-[#2e3132] rounded-lg p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-[#2e3132] mb-4">
            <div className="flex items-center space-x-2">
              <Activity size={16} className="text-[#ffcd00]" />
              <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                Live Activity Timeline
              </h2>
            </div>
            <span className="text-[10px] font-mono text-gray-400">Real-time event logging</span>
          </div>

          <div className="space-y-4">
            {filteredActivities.map((act) => (
              <div
                key={act.id}
                className="flex items-start space-x-3 p-3 rounded bg-[#161718] border border-[#282a2b] hover:border-gray-600 transition-colors"
              >
                <div className="p-2 rounded bg-[#202223] border border-[#2e3132] mt-0.5">
                  {act.activityType.includes('MAINTENANCE') ? (
                    <Wrench size={14} className="text-amber-400" />
                  ) : act.activityType.includes('RENTAL') ? (
                    <KeyRound size={14} className="text-emerald-400" />
                  ) : (
                    <Truck size={14} className="text-[#ffcd00]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-200 truncate">
                      {act.description}
                    </span>
                    <span className="text-[10px] font-mono text-gray-500 flex-shrink-0 ml-2">
                      {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {act.asset && (
                    <div className="flex items-center space-x-2 text-[11px] font-mono text-gray-400">
                      <button
                        onClick={() => openAssetDetail(act.asset!)}
                        className="text-[#ffcd00] hover:underline"
                      >
                        {act.asset.assetId}
                      </button>
                      <span>•</span>
                      <span>{act.asset.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Maintenance & Active Rentals Snapshot (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upcoming Maintenance */}
          <div className="bg-[#1d1f20] border border-[#2e3132] rounded-lg p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#2e3132] mb-3">
              <div className="flex items-center space-x-2">
                <Wrench size={15} className="text-amber-400" />
                <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                  Upcoming Maintenance Tasks
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('maintenance')}
                className="text-[11px] font-mono text-[#ffcd00] hover:underline flex items-center gap-1"
              >
                Board ➔
              </button>
            </div>

            <div className="space-y-2.5">
              {upcomingMaintenance.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  onClick={() => setActiveTab('maintenance')}
                  className="p-3 bg-[#161718] border border-[#282a2b] rounded hover:border-gray-500 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-200 truncate">{task.title}</span>
                    <StatusBadge status={task.priority} size="sm" />
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono flex items-center justify-between mt-1.5">
                    <span>{task.asset?.name || 'Heavy Equipment'}</span>
                    <span className="text-amber-400 font-bold">${task.cost.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Rentals Snapshot */}
          <div className="bg-[#1d1f20] border border-[#2e3132] rounded-lg p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#2e3132] mb-3">
              <div className="flex items-center space-x-2">
                <KeyRound size={15} className="text-emerald-400" />
                <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                  Commercial Rentals
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('rentals')}
                className="text-[11px] font-mono text-[#ffcd00] hover:underline flex items-center gap-1"
              >
                All Rentals ➔
              </button>
            </div>

            <div className="space-y-2.5">
              {activeRentals.slice(0, 2).map((rental) => (
                <div
                  key={rental.id}
                  onClick={() => setActiveTab('rentals')}
                  className="p-3 bg-[#161718] border border-[#282a2b] rounded hover:border-gray-500 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-200">{rental.customerName}</span>
                    <StatusBadge status={rental.status} size="sm" />
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono flex items-center justify-between mt-1">
                    <span>{rental.asset?.name}</span>
                    <span className="text-emerald-400 font-bold">${rental.estimatedCost.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
