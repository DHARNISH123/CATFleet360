import React, { useState } from 'react';
import {
  X,
  Truck,
  Wrench,
  KeyRound,
  FileText,
  Activity,
  MapPin,
  Clock,
  Fuel,
  Shield,
  Zap,
  CheckCircle2,
  Calendar,
  User,
  ArrowRight,
  TrendingUp,
  Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LifecycleStepper } from '../../components/common/LifecycleStepper';
import { apiService } from '../../services/api';
import { LifecycleStage } from '../../types';
import { downloadEquipmentReport } from '../../utils/reportGenerator';
import { playAlertSound } from '../../utils/sound';

export const AssetDetailDrawer: React.FC = () => {
  const {
    isAssetDrawerOpen,
    setIsAssetDrawerOpen,
    selectedAsset,
    triggerRefresh,
    setIsCreateMaintenanceOpen,
    setIsCreateRentalOpen
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'maintenance' | 'documents' | 'activity'>('overview');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionNotes, setTransitionNotes] = useState('');
  const [targetStage, setTargetStage] = useState<LifecycleStage | ''>('');

  if (!isAssetDrawerOpen || !selectedAsset) return null;

  const handleStageChange = async (newStage: LifecycleStage) => {
    try {
      playAlertSound('success');
      await apiService.updateLifecycle(selectedAsset.id, newStage, transitionNotes || `Transferred to ${newStage}`);
      selectedAsset.lifecycleStage = newStage;
      triggerRefresh();
      setIsTransitioning(false);
      setTransitionNotes('');
    } catch (err) {
      console.error('Failed to change stage:', err);
    }
  };

  const handleDownloadDoc = (docName: string) => {
    playAlertSound('success');
    downloadEquipmentReport(selectedAsset, docName);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-[#1d1f20] border-l border-[#393c3d] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 overflow-hidden">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#2e3132] bg-[#181a1b] flex items-start justify-between">
          <div className="flex items-start space-x-3.5">
            <img
              src={selectedAsset.imageUrl}
              alt={selectedAsset.name}
              className="w-14 h-14 rounded object-cover border border-[#393c3d]"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold bg-[#ffcd00]/20 text-[#ffcd00] px-2 py-0.5 rounded border border-[#ffcd00]/30">
                  {selectedAsset.assetId}
                </span>
                <StatusBadge status={selectedAsset.status} size="sm" />
              </div>
              <h2 className="text-base font-bold text-white mt-1 font-sans">
                {selectedAsset.name}
              </h2>
              <div className="text-xs text-gray-400 font-mono flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-[#ffcd00]" /> {selectedAsset.location}
                </span>
                <span>•</span>
                <span>{selectedAsset.category}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsAssetDrawerOpen(false)}
            className="p-1.5 rounded hover:bg-[#2c2f30] text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Lifecycle Tracker Visual Header */}
        <div className="px-5 py-3 bg-[#151617] border-b border-[#2e3132]">
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="text-gray-400 uppercase text-[10px] tracking-wider">Asset Lifecycle Progress</span>
            <button
              onClick={() => setIsTransitioning(!isTransitioning)}
              className="text-[#ffcd00] hover:underline text-[11px] font-semibold"
            >
              {isTransitioning ? 'Cancel Stage Change' : 'Change Lifecycle Stage ➔'}
            </button>
          </div>
          <LifecycleStepper
            currentStage={selectedAsset.lifecycleStage}
            interactive={isTransitioning}
            onSelectStage={(stg) => {
              setTargetStage(stg);
            }}
          />

          {isTransitioning && targetStage && targetStage !== selectedAsset.lifecycleStage && (
            <div className="mt-2 p-3 bg-[#202223] border border-[#ffcd00]/40 rounded text-xs animate-in fade-in">
              <div className="font-mono text-white mb-1.5 flex items-center justify-between">
                <span>Transition stage to: <strong>{targetStage}</strong></span>
              </div>
              <input
                type="text"
                placeholder="Reason or dispatch notes (e.g. Deployment to Quarry Site)"
                value={transitionNotes}
                onChange={(e) => setTransitionNotes(e.target.value)}
                className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-xs text-white placeholder-gray-500 mb-2 outline-none focus:border-[#ffcd00]"
              />
              <button
                onClick={() => handleStageChange(targetStage as LifecycleStage)}
                className="px-3 py-1 bg-[#ffcd00] hover:bg-[#e6b800] text-black font-mono font-bold text-xs rounded"
              >
                Confirm Stage Transition
              </button>
            </div>
          )}
        </div>

        {/* 5-Tab Navigation Bar */}
        <div className="flex border-b border-[#2e3132] bg-[#181a1b] px-4 text-xs font-mono">
          {[
            { id: 'overview', label: 'Overview', icon: Truck },
            { id: 'usage', label: 'Usage & Telemetry', icon: Activity },
            { id: 'maintenance', label: 'Maintenance', icon: Wrench },
            { id: 'documents', label: 'Documents & Reports', icon: FileText },
            { id: 'activity', label: 'Activity Log', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 py-3 px-3 border-b-2 font-medium transition-colors ${
                  isActive
                    ? 'border-[#ffcd00] text-[#ffcd00] font-semibold bg-[#222425]'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Drawer Body Tabs Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-gray-300">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#161718] border border-[#282a2b] rounded">
                  <div className="text-[10px] font-mono text-gray-500 uppercase">Manufacturer</div>
                  <div className="text-sm font-bold text-white mt-0.5">{selectedAsset.manufacturer}</div>
                </div>
                <div className="p-3 bg-[#161718] border border-[#282a2b] rounded">
                  <div className="text-[10px] font-mono text-gray-500 uppercase">Model / Series</div>
                  <div className="text-sm font-bold text-white mt-0.5">{selectedAsset.model}</div>
                </div>
                <div className="p-3 bg-[#161718] border border-[#282a2b] rounded">
                  <div className="text-[10px] font-mono text-gray-500 uppercase">Year of Manufacture</div>
                  <div className="text-sm font-bold text-white mt-0.5">{selectedAsset.year}</div>
                </div>
                <div className="p-3 bg-[#161718] border border-[#282a2b] rounded">
                  <div className="text-[10px] font-mono text-gray-500 uppercase">Operating Hours</div>
                  <div className="text-sm font-bold text-white mt-0.5">{selectedAsset.operatingHours} Hours</div>
                </div>
                <div className="p-3 bg-[#161718] border border-[#282a2b] rounded">
                  <div className="text-[10px] font-mono text-gray-500 uppercase">Serial Number (VIN)</div>
                  <div className="text-xs font-mono font-bold text-white mt-0.5">{selectedAsset.serialNumber || 'N/A'}</div>
                </div>
                <div className="p-3 bg-[#161718] border border-[#282a2b] rounded">
                  <div className="text-[10px] font-mono text-gray-500 uppercase">Current Fleet Score</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">{selectedAsset.healthScore} / 100</div>
                </div>
              </div>

              {/* Technical Description */}
              <div className="p-3 bg-[#161718] border border-[#282a2b] rounded">
                <div className="text-[10px] font-mono text-gray-500 uppercase mb-1">Equipment Notes</div>
                <p className="text-xs text-gray-300 font-sans leading-relaxed">
                  {selectedAsset.notes || 'Heavy duty Caterpillar construction equipment with electronic powertrain monitoring.'}
                </p>
              </div>

              {/* Quick Action Bar */}
              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={() => setIsCreateMaintenanceOpen(true)}
                  className="flex-1 py-2 bg-[#252829] hover:bg-[#2f3234] border border-[#393c3d] rounded text-xs font-mono font-semibold text-white flex items-center justify-center space-x-1.5"
                >
                  <Wrench size={14} className="text-amber-400" />
                  <span>Log Service Order</span>
                </button>
                <button
                  onClick={() => setIsCreateRentalOpen(true)}
                  className="flex-1 py-2 bg-[#252829] hover:bg-[#2f3234] border border-[#393c3d] rounded text-xs font-mono font-semibold text-white flex items-center justify-center space-x-1.5"
                >
                  <KeyRound size={14} className="text-emerald-400" />
                  <span>Rent Out Equipment</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: USAGE & TELEMETRY */}
          {activeTab === 'usage' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-[#161718] border border-[#282a2b] rounded text-center">
                  <div className="text-[10px] font-mono text-gray-400">UTILIZATION</div>
                  <div className="text-xl font-bold font-mono text-white mt-1">{selectedAsset.utilization}%</div>
                </div>
                <div className="p-3 bg-[#161718] border border-[#282a2b] rounded text-center">
                  <div className="text-[10px] font-mono text-gray-400">FUEL LEVEL</div>
                  <div className="text-xl font-bold font-mono text-[#ffcd00] mt-1">{selectedAsset.fuelLevel}%</div>
                </div>
                <div className="p-3 bg-[#161718] border border-[#282a2b] rounded text-center">
                  <div className="text-[10px] font-mono text-gray-400">ENGINE LOAD</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">74.2%</div>
                </div>
              </div>

              {/* Simulated Runtime Graph */}
              <div className="p-4 bg-[#161718] border border-[#282a2b] rounded">
                <div className="flex items-center justify-between mb-3 text-xs font-mono">
                  <span className="text-white font-bold">Daily Operating Hours (Last 7 Days)</span>
                  <span className="text-gray-400 text-[10px]">Avg: 7.8 hrs/day</span>
                </div>
                <div className="flex items-end justify-between h-32 pt-4 px-2 border-b border-[#2e3132]">
                  {[
                    { day: 'Mon', hrs: 8.5 },
                    { day: 'Tue', hrs: 9.0 },
                    { day: 'Wed', hrs: 7.2 },
                    { day: 'Thu', hrs: 8.8 },
                    { day: 'Fri', hrs: 9.4 },
                    { day: 'Sat', hrs: 4.5 },
                    { day: 'Sun', hrs: 0.0 },
                  ].map((bar) => (
                    <div key={bar.day} className="flex flex-col items-center gap-1.5">
                      <span className="text-[10px] font-mono text-gray-400">{bar.hrs}h</span>
                      <div
                        className="w-8 bg-[#ffcd00] rounded-t transition-all hover:bg-[#ffe066]"
                        style={{ height: `${(bar.hrs / 10) * 80}px` }}
                      />
                      <span className="text-[10px] font-mono text-gray-400 mt-1">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MAINTENANCE */}
          {activeTab === 'maintenance' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-white">Service History & Work Orders</span>
                <span className="text-gray-400">Total Orders: 2</span>
              </div>

              <div className="p-3 bg-[#161718] border border-[#282a2b] rounded space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Hydraulic Filter & Fluid Inspection</span>
                  <StatusBadge status="COMPLETED" size="sm" />
                </div>
                <p className="text-xs text-gray-400 font-sans">
                  Scheduled fluid flush completed using OEM Cat fluids. Operating pressures within nominal parameters.
                </p>
                <div className="text-[11px] font-mono text-gray-500 pt-1 flex justify-between">
                  <span>Cost: $480.00</span>
                  <span>Technician: Devon Miller</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DOCUMENTS & REPORTS */}
          {activeTab === 'documents' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#161718] border border-[#ffcd00]/30 rounded flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-white block">Official Machine Compliance Audit Report</span>
                  <span className="text-[11px] text-gray-400">Generates instant Caterpillar certification document</span>
                </div>
                <button
                  onClick={() => handleDownloadDoc('Official_Compliance_Audit')}
                  className="px-3 py-1.5 bg-[#ffcd00] hover:bg-[#e6b800] text-black font-mono font-bold text-xs rounded flex items-center space-x-1.5 shadow-md"
                >
                  <Download size={14} />
                  <span>Download Report</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {[
                  { name: 'Cat Operation & Maintenance Manual.pdf', size: '14.2 MB', date: '2024-01-15' },
                  { name: 'OSHA Heavy Machinery Safety Compliance Certificate.pdf', size: '2.1 MB', date: '2024-03-20' },
                  { name: 'OEM Telematics Unit Spec Sheet.pdf', size: '890 KB', date: '2024-05-12' },
                ].map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-[#161718] border border-[#282a2b] rounded hover:border-gray-500 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText size={18} className="text-[#ffcd00]" />
                      <div>
                        <div className="font-semibold text-white text-xs">{doc.name}</div>
                        <div className="text-[10px] font-mono text-gray-500">{doc.size} • {doc.date}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadDoc(doc.name)}
                      className="px-2.5 py-1 rounded bg-[#252829] hover:bg-[#ffcd00] hover:text-black text-gray-300 text-xs font-mono flex items-center space-x-1 transition-colors"
                    >
                      <Download size={12} />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ACTIVITY LOG */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-white">Chronological Audit Timeline</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { title: 'Operator Assigned', desc: 'Assigned to Jackson Reed on Shift 1', time: 'Today at 08:30' },
                  { title: 'Geofence Entry', desc: 'Unit entered Quarry Sector 4', time: 'Yesterday at 14:15' },
                  { title: 'Pre-Shift Inspection Passed', desc: 'Checklist completed via mobile operator terminal', time: 'Yesterday at 06:10' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-[#161718] border border-[#282a2b] rounded">
                    <div className="flex items-center justify-between text-xs font-semibold text-white mb-0.5">
                      <span>{item.title}</span>
                      <span className="text-[10px] font-mono text-gray-500">{item.time}</span>
                    </div>
                    <p className="text-xs text-gray-400 font-sans">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
