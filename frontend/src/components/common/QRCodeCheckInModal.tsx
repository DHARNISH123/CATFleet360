import React, { useState } from 'react';
import { QrCode, X, CheckCircle2, ArrowRight, Truck, User, Clock, ShieldCheck, Camera } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';
import { Asset } from '../../types';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset?: Asset | null;
}

export const QRCodeCheckInModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, asset }) => {
  const { triggerRefresh } = useApp();
  const [mode, setMode] = useState<'CHECK_IN' | 'CHECK_OUT'>('CHECK_IN');
  const [operatorId, setOperatorId] = useState('OP-4102');
  const [operatorName, setOperatorName] = useState('Jackson Reed');
  const [odometerHours, setOdometerHours] = useState(asset ? asset.operatingHours : 1840.5);
  const [fuelLevel, setFuelLevel] = useState(asset ? asset.fuelLevel : 85);
  const [preCheckPassed, setPreCheckPassed] = useState(true);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const targetAsset = asset || {
    id: 'ast-1',
    assetId: 'CAT-EX-205',
    name: 'CAT 320 GC Hydraulic Excavator',
    location: 'Jobsite Alpha - Quarry Sector'
  };

  const handleProcessScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'CHECK_IN') {
        await apiService.updateLifecycle(
          targetAsset.id,
          'IN_OPERATION',
          `QR Shift Check-In: Operator ${operatorName} (${operatorId}) commenced active operations. Fuel: ${fuelLevel}%, Hours: ${odometerHours}h. Pre-trip safety inspection certified.`
        );
      } else {
        await apiService.updateLifecycle(
          targetAsset.id,
          'AVAILABLE',
          `QR Shift Check-Out: Operator ${operatorName} completed shift. Returned to available pool. Logged Hours: ${odometerHours}h.`
        );
      }
      triggerRefresh();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-[#1d1f20] border border-[#393c3d] rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-[#181a1b] border-b border-[#2e3132] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <QrCode size={18} className="text-[#ffcd00]" />
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
              QR Digital Check-In / Out Terminal
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Check-In vs Check-Out Tabs */}
        <div className="grid grid-cols-2 p-2 bg-[#141516] border-b border-[#2e3132] gap-2">
          <button
            type="button"
            onClick={() => setMode('CHECK_IN')}
            className={`py-2 text-xs font-mono font-bold rounded transition-colors ${
              mode === 'CHECK_IN'
                ? 'bg-[#ffcd00] text-black shadow-md'
                : 'bg-[#1f2122] text-gray-400 hover:text-white'
            }`}
          >
            SHIFT CHECK-IN (INGRESS)
          </button>
          <button
            type="button"
            onClick={() => setMode('CHECK_OUT')}
            className={`py-2 text-xs font-mono font-bold rounded transition-colors ${
              mode === 'CHECK_OUT'
                ? 'bg-[#ffcd00] text-black shadow-md'
                : 'bg-[#1f2122] text-gray-400 hover:text-white'
            }`}
          >
            SHIFT CHECK-OUT (EGRESS)
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 size={48} className="mx-auto text-emerald-400 animate-bounce" />
            <h3 className="text-base font-bold text-white font-mono">
              QR Verification Successful!
            </h3>
            <p className="text-xs text-gray-400 font-sans">
              Machine status updated & telemetry synchronized with CATFleet360 engine.
            </p>
          </div>
        ) : (
          <form onSubmit={handleProcessScan} className="p-5 space-y-4 text-xs">
            {/* Visual QR Code Card */}
            <div className="p-4 bg-[#141516] border border-[#2e3132] rounded flex items-center space-x-4">
              <div className="w-20 h-20 bg-white p-1 rounded flex items-center justify-center flex-shrink-0 shadow-inner">
                {/* SVG QR Code Simulation */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-black fill-current">
                  <path d="M0 0h30v30H0zm5 5v20h20V5zm5 5h10v10H10zM70 0h30v30H70zm5 5v20h20V5zm5 5h10v10H80zM0 70h30v30H0zm5 5v20h20V75zm5 5h10v10H10zM40 10h10v10H40zm10 20h10v10H50zm-10 10h10v10H40zm20 0h10v10H60zm10 10h10v10H70zm-30 10h10v10H40zm20 10h10v10H60zm20 0h10v10H80zm-10 10h10v10H70zm-30 0h10v10H40zm20 10h10v10H60z" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-mono text-[#ffcd00] uppercase font-bold tracking-wider">
                  SCANNED ASSET QR
                </span>
                <div className="font-mono text-white font-bold text-xs mt-0.5">{targetAsset.assetId}</div>
                <div className="text-gray-400 text-[11px] truncate">{targetAsset.name}</div>
                <div className="text-[10px] font-mono text-gray-500 mt-1">{targetAsset.location}</div>
              </div>
            </div>

            {/* Operator Details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 font-mono text-[11px] mb-1">Operator ID</label>
                <input
                  type="text"
                  required
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white font-mono outline-none focus:border-[#ffcd00]"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-mono text-[11px] mb-1">Operator Name</label>
                <input
                  type="text"
                  required
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white outline-none focus:border-[#ffcd00]"
                />
              </div>
            </div>

            {/* Shift Telemetry Confirmation */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 font-mono text-[11px] mb-1">Meter Hours Reading</label>
                <input
                  type="number"
                  step="0.1"
                  value={odometerHours}
                  onChange={(e) => setOdometerHours(parseFloat(e.target.value))}
                  className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white font-mono outline-none focus:border-[#ffcd00]"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-mono text-[11px] mb-1">Current Fuel Level %</label>
                <input
                  type="number"
                  value={fuelLevel}
                  onChange={(e) => setFuelLevel(parseFloat(e.target.value))}
                  className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white font-mono outline-none focus:border-[#ffcd00]"
                />
              </div>
            </div>

            {/* OSHA Pre-Shift Checklist Acknowledgement */}
            <label className="flex items-start space-x-2.5 p-2.5 bg-[#161718] border border-[#282a2b] rounded cursor-pointer">
              <input
                type="checkbox"
                checked={preCheckPassed}
                onChange={(e) => setPreCheckPassed(e.target.checked)}
                className="mt-0.5 accent-[#ffcd00]"
              />
              <span className="text-[11px] text-gray-300 font-sans leading-snug">
                I verify that the pre-shift walkaround inspection (hydraulics, tires/tracks, braking systems, safety beacons) has been completed according to Caterpillar standards.
              </span>
            </label>

            {/* Buttons */}
            <div className="pt-2 border-t border-[#2e3132] flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-[#252829] hover:bg-[#2f3234] rounded text-gray-300 font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !preCheckPassed}
                className="px-4 py-1.5 bg-[#ffcd00] hover:bg-[#e6b800] disabled:bg-gray-700 disabled:text-gray-500 text-black font-semibold font-mono rounded flex items-center space-x-1.5"
              >
                <span>{loading ? 'Transmitting...' : `Confirm ${mode === 'CHECK_IN' ? 'Check-In' : 'Check-Out'}`}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
