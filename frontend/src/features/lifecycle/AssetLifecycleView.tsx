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
  Info,
  ChevronRight,
  ChevronLeft,
  Play
} from 'lucide-react';
import { apiService } from '../../services/api';
import { Asset, LifecycleStage } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { stages } from '../../components/common/LifecycleStepper';
import { playAlertSound } from '../../utils/sound';
import { useApp } from '../../context/AppContext';

export const AssetLifecycleView: React.FC = () => {
  const { openAssetDetail, refreshKey, triggerRefresh } = useApp();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [targetStage, setTargetStage] = useState<LifecycleStage>('AVAILABLE');
  const [reason, setReason] = useState('');
  const [transitioning, setTransitioning] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

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
  const currentStageIndex = stages.findIndex((s) => s.stage === (activeAsset?.lifecycleStage || 'AVAILABLE'));

  const handleStepProgression = async (direction: 'next' | 'prev') => {
    if (!activeAsset) return;
    const nextIndex = direction === 'next'
      ? Math.min(stages.length - 1, currentStageIndex + 1)
      : Math.max(0, currentStageIndex - 1);
    const nextStage = stages[nextIndex].stage;

    playAlertSound('success');
    setTransitioning(true);
    try {
      await apiService.updateLifecycle(
        activeAsset.id,
        nextStage,
        `Step-by-step lifecycle progression: ${direction === 'next' ? 'Advanced' : 'Reverted'} to ${nextStage}`
      );
      activeAsset.lifecycleStage = nextStage;
      triggerRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setTransitioning(false);
    }
  };

  const handleExecuteTransition = async () => {
    if (!activeAsset) return;
    playAlertSound('success');
    setTransitioning(true);
    try {
      await apiService.updateLifecycle(activeAsset.id, targetStage, reason || `Lifecycle transition to ${targetStage}`);
      activeAsset.lifecycleStage = targetStage;
      triggerRefresh();
      setReason('');
    } catch (err) {
      console.error(err);
    } finally {
      setTransitioning(false);
    }
  };

  const handleSimulateFullCycle = async () => {
    if (!activeAsset || isSimulating) return;
    setIsSimulating(true);
    playAlertSound('checkin');

    for (let i = 0; i < stages.length; i++) {
      const stg = stages[i].stage;
      await apiService.updateLifecycle(
        activeAsset.id,
        stg,
        `Automated Full Cycle Demo: Progressed to ${stg}`
      );
      activeAsset.lifecycleStage = stg;
      triggerRefresh();
      await new Promise(r => setTimeout(r, 900));
    }
    setIsSimulating(false);
    playAlertSound('success');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-[#1a1c1d] border border-[#2e3132] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#ffcd00] uppercase tracking-wider mb-1">
            <GitBranch size={14} />
            <span>State Machine & Lifecycle Governance</span>
          </div>
          <h1 className="text-xl font-bold text-white font-mono tracking-tight">
            Asset Lifecycle Step-by-Step Progression
          </h1>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            Every heavy machine transitions sequentially through 7 verified enterprise lifecycle stages with immutable audit logs.
          </p>
        </div>

        <button
          disabled={isSimulating}
          onClick={handleSimulateFullCycle}
          className="flex items-center space-x-2 px-3.5 py-2 bg-[#ffcd00] hover:bg-[#e6b800] disabled:bg-gray-700 text-black font-bold font-mono text-xs rounded transition-colors shadow-md"
        >
          <Play size={13} />
          <span>{isSimulating ? 'Simulating Cycle...' : 'Simulate Full 7-Stage Progression'}</span>
        </button>
      </div>

      {/* Main Interactive Transition Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Machinery Selector (4 cols) */}
        <div className="lg:col-span-4 bg-[#1d1f20] border border-[#2e3132] rounded-lg p-4 shadow-lg flex flex-col h-[620px]">
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

        {/* Right Column: Step-by-Step Controller (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {activeAsset ? (
            <>
              {/* Machine Banner with Next / Previous Step Buttons */}
              <div className="bg-[#1d1f20] border border-[#2e3132] rounded-lg p-5 shadow-lg space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#2e3132]">
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={activeAsset.imageUrl}
                      alt={activeAsset.name}
                      className="w-14 h-14 rounded object-cover border border-[#393c3d]"
                    />
                    <div>
                      <h2 className="text-base font-bold text-white">{activeAsset.name}</h2>
                      <div className="text-xs text-gray-400 font-mono">
                        {activeAsset.assetId} • {activeAsset.location}
                      </div>
                    </div>
                  </div>

                  {/* Step Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      disabled={transitioning || currentStageIndex === 0}
                      onClick={() => handleStepProgression('prev')}
                      className="px-3 py-1.5 bg-[#252829] hover:bg-[#323638] disabled:opacity-40 text-gray-200 font-mono text-xs rounded border border-[#393c3d] flex items-center space-x-1"
                    >
                      <ChevronLeft size={14} />
                      <span>Prev Stage</span>
                    </button>
                    <button
                      disabled={transitioning || currentStageIndex === stages.length - 1}
                      onClick={() => handleStepProgression('next')}
                      className="px-3.5 py-1.5 bg-[#ffcd00] hover:bg-[#e6b800] disabled:opacity-40 text-black font-mono font-bold text-xs rounded shadow-md flex items-center space-x-1"
                    >
                      <span>Next Stage</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Visual 7-Stage Stepper Progression */}
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-gray-400 uppercase mb-2">
                    <span>Sequential Progression (Stage {currentStageIndex + 1} of 7):</span>
                    <span className="text-[#ffcd00] font-bold">{stages[currentStageIndex]?.label}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {stages.map((stg, index) => {
                      const isCurrent = stg.stage === activeAsset.lifecycleStage;
                      const isPassed = index < currentStageIndex;
                      return (
                        <div
                          key={stg.stage}
                          className={`p-2.5 rounded border text-center transition-all ${
                            isCurrent
                              ? 'bg-[#ffcd00] text-black font-bold border-[#ffcd00] shadow-md'
                              : isPassed
                              ? 'bg-[#15231c] border-emerald-900/50 text-emerald-400'
                              : 'bg-[#161718] border-[#2a2c2d] text-gray-400'
                          }`}
                        >
                          <div className="text-[10px] font-mono uppercase truncate">{stg.label}</div>
                          <div className="text-[9px] font-mono uppercase mt-0.5 opacity-80">
                            {isCurrent ? 'ACTIVE' : isPassed ? 'DONE ✓' : 'QUEUED'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Transition Reason & Notes */}
                <div className="p-4 bg-[#161718] border border-[#2e3132] rounded space-y-3">
                  <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#ffcd00]" />
                    <span>Direct Jump Stage Selector</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-gray-400 mb-1">
                        Select Target Stage
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
                        Audit Note / Authorization Reason
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
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
