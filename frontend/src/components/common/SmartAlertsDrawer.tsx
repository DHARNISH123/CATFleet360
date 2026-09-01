import React from 'react';
import { X, AlertTriangle, Info, CheckCircle2, ShieldAlert, Truck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SmartAlertsDrawer: React.FC = () => {
  const { isAlertsDrawerOpen, setIsAlertsDrawerOpen, alerts, setActiveTab, openAssetDetail } = useApp();

  if (!isAlertsDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#1d1f20] border-l border-[#393c3d] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#2e3132] flex items-center justify-between bg-[#191b1c]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded bg-red-500/10 text-red-400 border border-red-500/30">
              <ShieldAlert size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Fleet Smart Alerts
              </h2>
              <p className="text-[11px] text-gray-400">Automated operational & telemetry triggers</p>
            </div>
          </div>
          <button
            onClick={() => setIsAlertsDrawerOpen(false)}
            className="p-1.5 rounded hover:bg-[#2c2f30] text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
              <p className="text-xs font-mono">All fleet telemetry nominal. Zero active alerts.</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const isCrit = alert.type === 'CRITICAL';
              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-md border text-xs transition-all ${
                    isCrit
                      ? 'bg-red-950/20 border-red-800/40 text-red-200'
                      : 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center space-x-2 font-mono font-bold">
                      {isCrit ? (
                        <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                      ) : (
                        <Info size={14} className="text-amber-400 flex-shrink-0" />
                      )}
                      <span className="text-xs">{alert.title}</span>
                    </div>
                    <span className="text-[10px] font-mono opacity-60">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 font-sans leading-relaxed mb-3">
                    {alert.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] font-mono">
                    <span className="text-gray-400 font-semibold">{alert.assetId}</span>
                    <button
                      onClick={() => {
                        setIsAlertsDrawerOpen(false);
                        setActiveTab('maintenance');
                      }}
                      className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                    >
                      Resolve Order ➔
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#161718] border-t border-[#2e3132] text-center">
          <button
            onClick={() => setIsAlertsDrawerOpen(false)}
            className="w-full py-2 bg-[#252829] hover:bg-[#2f3234] text-xs font-mono font-bold text-gray-300 rounded border border-[#3a3d3e]"
          >
            Close Alert Panel
          </button>
        </div>
      </div>
    </div>
  );
};
