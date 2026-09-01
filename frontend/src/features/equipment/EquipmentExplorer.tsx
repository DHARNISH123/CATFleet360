import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  List,
  Search,
  Plus,
  Filter,
  Fuel,
  Clock,
  MapPin,
  Activity,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { apiService } from '../../services/api';
import { Asset, OperationalStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useApp } from '../../context/AppContext';

export const EquipmentExplorer: React.FC = () => {
  const { openAssetDetail, setIsCreateAssetOpen, refreshKey } = useApp();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedView, setSavedView] = useState<'all' | 'high_util' | 'maintenance' | 'excavators'>('all');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiService.getAssets({
      category: selectedCategory,
      status: selectedStatus,
      search: searchQuery,
    }).then((res) => {
      if (mounted) {
        setAssets(res);
        setLoading(false);
      }
    }).catch(console.error);

    return () => { mounted = false; };
  }, [selectedCategory, selectedStatus, searchQuery, refreshKey]);

  // Handle saved view presets
  const handleSelectSavedView = (view: 'all' | 'high_util' | 'maintenance' | 'excavators') => {
    setSavedView(view);
    if (view === 'all') {
      setSelectedCategory('ALL');
      setSelectedStatus('ALL');
    } else if (view === 'high_util') {
      setSelectedCategory('ALL');
      setSelectedStatus('OPERATIONAL');
    } else if (view === 'maintenance') {
      setSelectedCategory('ALL');
      setSelectedStatus('UNDER_MAINTENANCE');
    } else if (view === 'excavators') {
      setSelectedCategory('Hydraulic Excavator');
      setSelectedStatus('ALL');
    }
  };

  const categories = [
    'ALL',
    'Hydraulic Excavator',
    'Track Type Tractor',
    'Wheel Loader',
    'Off-Highway Truck',
    'Motor Grader',
    'Backhoe Loader'
  ];

  const statuses = ['ALL', 'OPERATIONAL', 'AVAILABLE', 'UNDER_MAINTENANCE', 'ON_RENT', 'IDLE'];

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-mono tracking-tight flex items-center gap-2">
            <span>Equipment Explorer</span>
            <span className="text-xs bg-[#ffcd00]/20 text-[#ffcd00] px-2 py-0.5 rounded font-mono border border-[#ffcd00]/30 font-semibold">
              {assets.length} UNITS
            </span>
          </h1>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            Heavy machinery inventory, operating telemetry, location tracking, and lifecycle status.
          </p>
        </div>

        {/* View Toggle & Register Button */}
        <div className="flex items-center space-x-3">
          <div className="bg-[#181a1b] border border-[#2e3132] rounded p-1 flex items-center space-x-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-[#2b2e2f] text-[#ffcd00]' : 'text-gray-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'table' ? 'bg-[#2b2e2f] text-[#ffcd00]' : 'text-gray-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>

          <button
            onClick={() => setIsCreateAssetOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#ffcd00] hover:bg-[#e6b800] text-black font-semibold font-mono text-xs rounded transition-colors"
          >
            <Plus size={15} className="font-bold stroke-[3]" />
            <span>REGISTER ASSET</span>
          </button>
        </div>
      </div>

      {/* Saved Views Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-mono">
        <span className="text-gray-400 text-[11px] uppercase mr-1">Views:</span>
        <button
          onClick={() => handleSelectSavedView('all')}
          className={`px-2.5 py-1 rounded-sm border transition-colors ${
            savedView === 'all'
              ? 'bg-[#ffcd00]/15 text-[#ffcd00] border-[#ffcd00]'
              : 'bg-[#191b1c] text-gray-400 border-[#2a2c2d] hover:text-white'
          }`}
        >
          All Fleet Machinery
        </button>
        <button
          onClick={() => handleSelectSavedView('high_util')}
          className={`px-2.5 py-1 rounded-sm border transition-colors ${
            savedView === 'high_util'
              ? 'bg-[#ffcd00]/15 text-[#ffcd00] border-[#ffcd00]'
              : 'bg-[#191b1c] text-gray-400 border-[#2a2c2d] hover:text-white'
          }`}
        >
          High Utilization Equipment
        </button>
        <button
          onClick={() => handleSelectSavedView('maintenance')}
          className={`px-2.5 py-1 rounded-sm border transition-colors ${
            savedView === 'maintenance'
              ? 'bg-red-500/15 text-red-400 border-red-500/50'
              : 'bg-[#191b1c] text-gray-400 border-[#2a2c2d] hover:text-white'
          }`}
        >
          Assets Needing Maintenance
        </button>
        <button
          onClick={() => handleSelectSavedView('excavators')}
          className={`px-2.5 py-1 rounded-sm border transition-colors ${
            savedView === 'excavators'
              ? 'bg-[#ffcd00]/15 text-[#ffcd00] border-[#ffcd00]'
              : 'bg-[#191b1c] text-gray-400 border-[#2a2c2d] hover:text-white'
          }`}
        >
          Hydraulic Excavators
        </button>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="bg-[#1d1f20] border border-[#2e3132] rounded-lg p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by asset ID, model, jobsite location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141516] border border-[#2e3132] rounded pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-[#ffcd00]"
          />
        </div>

        {/* Category & Status dropdowns */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1 bg-[#141516] border border-[#2e3132] px-2 py-1.5 rounded text-xs">
            <Filter size={12} className="text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-gray-200 outline-none font-mono text-xs cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-[#202223]">
                  {c === 'ALL' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1 bg-[#141516] border border-[#2e3132] px-2 py-1.5 rounded text-xs">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-gray-200 outline-none font-mono text-xs cursor-pointer"
            >
              {statuses.map((s) => (
                <option key={s} value={s} className="bg-[#202223]">
                  {s === 'ALL' ? 'All Statuses' : s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content Rendering: Grid vs Table */}
      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-gray-400">
          Loading Caterpillar Equipment Explorer...
        </div>
      ) : assets.length === 0 ? (
        <div className="py-16 text-center bg-[#1a1c1d] border border-[#2e3132] rounded-lg">
          <AlertCircle size={32} className="mx-auto text-[#ffcd00] mb-2" />
          <p className="text-sm font-bold text-white font-mono">No Machinery Found</p>
          <p className="text-xs text-gray-400 mt-1">Try clearing your search query or filters.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => openAssetDetail(asset)}
              className="bg-[#1d1f20] border border-[#2e3132] hover:border-[#ffcd00]/60 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-lg group flex flex-col justify-between"
            >
              <div>
                {/* Equipment Image & Status Header */}
                <div className="relative h-44 bg-[#141516] overflow-hidden">
                  <img
                    src={asset.imageUrl}
                    alt={asset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1d1f20] via-transparent to-black/40" />
                  <div className="absolute top-3 left-3">
                    <span className="font-mono text-xs font-bold bg-black/80 backdrop-blur-xs text-[#ffcd00] px-2 py-0.5 rounded border border-[#ffcd00]/40">
                      {asset.assetId}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={asset.status} size="sm" />
                  </div>
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-gray-300 font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-[#ffcd00]" /> {asset.location}
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-white font-sans group-hover:text-[#ffcd00] transition-colors truncate">
                      {asset.name}
                    </h3>
                    <div className="text-xs font-mono text-gray-400 mt-0.5">
                      {asset.manufacturer} • {asset.model} ({asset.year})
                    </div>
                  </div>

                  {/* Telemetry Bars */}
                  <div className="space-y-2 pt-2 border-t border-[#2a2c2d]">
                    {/* Utilization */}
                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-gray-400 mb-1">
                        <span>Utilization</span>
                        <span className="text-white font-bold">{asset.utilization}%</span>
                      </div>
                      <div className="w-full bg-[#141516] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#ffcd00] h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, asset.utilization)}%` }}
                        />
                      </div>
                    </div>

                    {/* Fuel & Operating Hours */}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono text-gray-300">
                      <div className="flex items-center space-x-1.5">
                        <Fuel size={13} className="text-[#ffcd00]" />
                        <span>Fuel: <strong>{asset.fuelLevel}%</strong></span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Clock size={13} className="text-gray-400" />
                        <span>Hours: <strong>{asset.operatingHours}h</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4 py-2.5 bg-[#171819] border-t border-[#2a2c2d] flex items-center justify-between text-[11px] font-mono text-gray-400">
                <span>Health: <strong className="text-emerald-400">{asset.healthScore}/100</strong></span>
                <span className="text-[#ffcd00] group-hover:underline">Inspect Details ➔</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-[#1d1f20] border border-[#2e3132] rounded-lg overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#161718] border-b border-[#2e3132] text-[11px] font-mono uppercase text-gray-400">
                <tr>
                  <th className="py-3 px-4">Asset ID & Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Lifecycle</th>
                  <th className="py-3 px-4">Utilization</th>
                  <th className="py-3 px-4">Fuel</th>
                  <th className="py-3 px-4">Hours</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262829]">
                {assets.map((asset) => (
                  <tr
                    key={asset.id}
                    onClick={() => openAssetDetail(asset)}
                    className="hover:bg-[#232526] cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={asset.imageUrl}
                          alt={asset.name}
                          className="w-10 h-10 rounded object-cover border border-[#2e3132]"
                        />
                        <div>
                          <div className="font-bold text-white font-mono text-xs">{asset.assetId}</div>
                          <div className="text-[11px] text-gray-400 truncate max-w-xs">{asset.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">{asset.category}</td>
                    <td className="py-3 px-4 font-mono text-[11px]">{asset.location}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={asset.status} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] text-[#ffcd00]">
                        {asset.lifecycleStage?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">{asset.utilization}%</td>
                    <td className="py-3 px-4 font-mono">{asset.fuelLevel}%</td>
                    <td className="py-3 px-4 font-mono">{asset.operatingHours}h</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openAssetDetail(asset);
                        }}
                        className="px-2 py-1 rounded bg-[#2a2c2e] hover:bg-[#ffcd00] hover:text-black font-mono font-semibold text-[10px] transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
