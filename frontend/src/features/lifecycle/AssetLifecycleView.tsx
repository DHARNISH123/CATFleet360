import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { apiService } from '../../services/api';
import { Asset, LifecycleStage } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { stages } from '../../components/common/LifecycleStepper';
import { useApp } from '../../context/AppContext';

export const AssetLifecycleView: React.FC = () => {
  const { openAssetDetail, refreshKey, triggerRefresh } = useApp();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [targetStage, setTargetStage] = useState<LifecycleStage>('AVAILABLE');
  const [reason, setReason] = useState('');
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiService.getAssets().then((res) => {
      if (mounted) {
        setAssets(res);
        if (res.length > 0) setSelectedAssetId(res[0].id);
        setLoading(false);
      }
    }).catch(console.error);

    return () => { mounted = false; };
  }, [refreshKey]);

  const activeAsset = assets.find((a) => a.id === selectedAssetId) || assets[0];

  const handleExecuteTransition = async () => {
    if (!activeAsset) return;
    setTransitioning(true);
    try {
      await apiService.updateLifecycle(activeAsset.id, targetStage, reason || `Lifecycle transition to ${targetStage}`);
      triggerRefresh();
      setReason('');
    } catch (err) {
      console.error(err);
    } finally {
      setTransitioning(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-[#1a1c1d] border border-[#2e3132] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#ffcd00] uppercase tracking-wider mb-1">
            <GitBranch size={14} />
            <span>State Machine & Asset Governance</span>
          </div>
          <h1 className="text-xl font-bold text-white font-mono tracking-tight">
            Asset Lifecycle Governance Workflow
          </h1>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            Every heavy machine transitions strictly through verified enterprise lifecycle stages with immutable audit logs.
          </p>
        </div>

        <div className="bg-[#121314] px-3.5 py-2 rounded border border-[#2e3132] text-xs font-mono text-gray-300">
          <span className="text-[#ffcd00] font-bold">7 Stages:</span> Registered ➔ Available ➔ Assigned ➔ In Operation ➔ Maintenance ➔ Rental ➔ Retired
        </div>
      </div>

      {/* Main Interactive Transition Workspace (Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Machinery Selector (4 cols) */}
        <div className="lg:col-span-4 bg-[#1d1f20] border border-[#2e3132] rounded-lg p-4 shadow-lg flex flex-col h-[600px]">
          <div className="text-xs font-mono font-bold text-white uppercase tracking-wider pb-3 border-b border-[#2e3132] mb-3 flex items-center justify-between">
            <span>Select Machine</span>
            <span className="text-gray-500 font-normal">{assets.length} Units</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {assets.map((asset) => {
              const isSelected = asset.id === selectedAssetId;
              return (
                <div
                  key={asset.id}
                  onClick={() => {
                    setSelectedAssetId(asset.id);
                    setTargetStage(asset.lifecycleStage);
                  }}
                  className={`p-3 rounded border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#252829] border-[#ffcd00] ring-1 ring-[#ffcd00]'
                      : 'bg-[#161718] border-[#2a2c2d] hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-[#ffcd00]">{asset.assetId}</span>
                    <StatusBadge status={asset.lifecycleStage} size="sm" />
                  </div>
                  <div className="text-xs font-semibold text-white truncate">{asset.name}</div>
                  <div className="text-[11px] text-gray-400 font-mono mt-1 flex justify-between">
                    <span>{asset.category}</span>
                    <span>{asset.operatingHours} hrs</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Stage Visualizer & State Transition Controller (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {activeAsset ? (
            <>
              {/* Machine Overview Banner */}
              <div className="bg-[#1d1f20] border border-[#2e3132] rounded-lg p-5 shadow-lg">
                <div className="flex items-center justify-between pb-3 border-b border-[#2e3132] mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={activeAsset.imageUrl}
                      alt={activeAsset.name}
                      className="w-12 h-12 rounded object-cover border border-[#393c3d]"
                    />
                    <div>
                      <h2 className="text-base font-bold text-white">{activeAsset.name}</h2>
                      <div className="text-xs text-gray-400 font-mono">
                        {activeAsset.assetId} • {activeAsset.location}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => openAssetDetail(activeAsset)}
                    className="px-3 py-1 bg-[#282a2b] hover:bg-[#ffcd00] hover:text-black text-xs font-mono font-semibold rounded transition-colors"
                  >
                    Full Specs ➔
                  </button>
                </div>

                {/* Interactive Visual Stepper */}
                <div className="mb-4">
                  <div className="text-xs font-mono text-gray-400 uppercase mb-2">
                    Current Stage Progression:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {stages.map((stg, index) => {
                      const isCurrent = stg.stage === activeAsset.lifecycleStage;
                      return (
                        <div
                          key={stg.stage}
                          className={`p-2.5 rounded border text-center transition-all ${
                            isCurrent
                              ? 'bg-[#ffcd00] text-black font-bold border-[#ffcd00] shadow-md shadow-amber-500/20'
                              : 'bg-[#161718] border-[#2a2c2d] text-gray-400'
                          }`}
                        >
                          <div className="text-[10px] font-mono uppercase truncate">{stg.label}</div>
                          {isCurrent && (
                            <div className="text-[9px] font-mono uppercase mt-0.5 font-extrabold tracking-wider">
                              ACTIVE
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stage Transition Action Box */}
                <div className="p-4 bg-[#161718] border border-[#2e3132] rounded space-y-3">
                  <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#ffcd00]" />
                    <span>Execute Stage Transition</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-gray-400 mb-1">
                        Select Target Lifecycle Stage
                      </label>
                      <select
                        value={targetStage}
                        onChange={(e) => setTargetStage(e.target.value as LifecycleStage)}
                        className="w-full bg-[#1d1f20] border border-[#2e3132] rounded px-3 py-2 text-xs text-white outline-none font-mono focus:border-[#ffcd00]"
                      >
                        {stages.map((s) => (
                          <option key={s.stage} value={s.stage} className="bg-[#202223]">
                            {s.label} ({s.desc})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-gray-400 mb-1">
                        Authorization Reason / Work Order Note
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Cleared 1000-hr service; dispatched to Highway site"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full bg-[#1d1f20] border border-[#2e3132] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#ffcd00]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      disabled={transitioning || targetStage === activeAsset.lifecycleStage}
                      onClick={handleExecuteTransition}
                      className="px-4 py-2 bg-[#ffcd00] hover:bg-[#e6b800] disabled:bg-gray-700 disabled:text-gray-500 text-black font-semibold font-mono text-xs rounded transition-colors flex items-center space-x-1.5"
                    >
                      <ArrowRight size={14} />
                      <span>{transitioning ? 'Recording Audit...' : 'Commit Lifecycle Transition'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* State Transition Example Pathway Info */}
              <div className="bg-[#1d1f20] border border-[#2e3132] rounded-lg p-5 shadow-lg">
                <div className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Info size={14} className="text-sky-400" />
                  <span>Standard Heavy Fleet Lifecycle Journey</span>
                </div>
                <div className="p-3 bg-[#161718] rounded border border-[#2a2c2d] text-xs font-mono text-gray-300 leading-relaxed">
                  Registered ➔ Available ➔ Assigned to Operator ➔ Active In Operation ➔ Maintenance Flagged ➔ Service Completed ➔ Available Pool ➔ Commercial Rental
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
