import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Plus,
  Calendar,
  DollarSign,
  User,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Building,
  Phone,
  Mail,
  X
} from 'lucide-react';
import { apiService } from '../../services/api';
import { Rental, RentalStatus, Asset } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useApp } from '../../context/AppContext';

export const RentalManagement: React.FC = () => {
  const { isCreateRentalOpen, setIsCreateRentalOpen, refreshKey, triggerRefresh } = useApp();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Form State
  const [formData, setFormData] = useState({
    assetId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '+1 (555) ',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    dailyRate: 480,
    notes: 'Includes high-capacity material bucket and telemetry tracking link.',
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      apiService.getRentals({ status: selectedStatus }),
      apiService.getAssets(),
    ]).then(([rentalList, assetList]) => {
      if (mounted) {
        setRentals(rentalList);
        setAssets(assetList);
        if (assetList.length > 0 && !formData.assetId) {
          setFormData((prev) => ({ ...prev, assetId: assetList[0].id }));
        }
        setLoading(false);
      }
    }).catch(console.error);

    return () => { mounted = false; };
  }, [selectedStatus, refreshKey]);

  // Compute live estimated cost
  const start = new Date(formData.startDate);
  const end = new Date(formData.endDate);
  const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const totalEstimatedCost = durationDays * formData.dailyRate;

  const handleUpdateStatus = async (rentalId: string, newStatus: RentalStatus, paymentStatus?: string) => {
    try {
      await apiService.updateRentalStatus(rentalId, newStatus, paymentStatus);
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRental = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createRental(formData);
      triggerRefresh();
      setIsCreateRentalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-[#1a1c1d] border border-[#2e3132] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#ffcd00] uppercase tracking-wider mb-1">
            <KeyRound size={14} className="text-emerald-400" />
            <span>Commercial Equipment Leasing</span>
          </div>
          <h1 className="text-xl font-bold text-white font-mono tracking-tight">
            Commercial Rental Lifecycle Operations
          </h1>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            Manage corporate client rentals, daily rates, active jobsite handover, and returns.
          </p>
        </div>

        <button
          onClick={() => setIsCreateRentalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#ffcd00] hover:bg-[#e6b800] text-black font-semibold font-mono text-xs rounded transition-colors"
        >
          <Plus size={15} className="font-bold stroke-[3]" />
          <span>NEW RENTAL CONTRACT</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center space-x-2 text-xs font-mono">
        <span className="text-gray-400 uppercase text-[11px]">Workflow Status:</span>
        {['ALL', 'REQUESTED', 'APPROVED', 'ACTIVE', 'COMPLETED'].map((s) => (
          <button
            key={s}
            onClick={() => setSelectedStatus(s)}
            className={`px-2.5 py-1 rounded-sm border transition-colors ${
              selectedStatus === s
                ? 'bg-[#ffcd00]/15 text-[#ffcd00] border-[#ffcd00]'
                : 'bg-[#191b1c] text-gray-400 border-[#2a2c2d] hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Rentals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {rentals.map((rental) => (
          <div
            key={rental.id}
            className="bg-[#1d1f20] border border-[#2e3132] rounded-lg p-5 flex flex-col justify-between shadow-lg hover:border-[#ffcd00]/40 transition-all space-y-4"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-[#2e3132]">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-[#ffcd00]">
                      {rental.asset?.assetId || 'CAT-ASSET'}
                    </span>
                    <StatusBadge status={rental.status} size="sm" />
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      {rental.paymentStatus}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1.5 flex items-center gap-1.5">
                    <Building size={14} className="text-gray-400" /> {rental.customerName}
                  </h3>
                </div>

                <div className="text-right font-mono">
                  <div className="text-[10px] text-gray-500 uppercase">Total Contract</div>
                  <div className="text-base font-bold text-emerald-400">
                    ${rental.estimatedCost.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Equipment info & Client info */}
              <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
                <div className="bg-[#161718] p-3 rounded border border-[#282a2b] space-y-1">
                  <div className="text-[10px] font-mono text-gray-500 uppercase">Equipment Leased</div>
                  <div className="font-semibold text-white truncate">{rental.asset?.name}</div>
                  <div className="text-[11px] text-gray-400 font-mono">${rental.dailyRate} / day rate</div>
                </div>

                <div className="bg-[#161718] p-3 rounded border border-[#282a2b] space-y-1">
                  <div className="text-[10px] font-mono text-gray-500 uppercase">Contract Window</div>
                  <div className="font-mono text-white text-[11px]">
                    {new Date(rental.startDate).toLocaleDateString()} ➔ {new Date(rental.endDate).toLocaleDateString()}
                  </div>
                  <div className="text-[11px] text-gray-400 font-sans truncate">{rental.customerEmail}</div>
                </div>
              </div>

              {rental.notes && (
                <div className="mt-3 text-xs text-gray-400 font-sans bg-[#161718] p-2.5 rounded border border-[#242627]">
                  {rental.notes}
                </div>
              )}
            </div>

            {/* Status Transition Control Actions */}
            <div className="pt-3 border-t border-[#2a2c2d] flex items-center justify-between">
              <span className="text-[10px] font-mono text-gray-500">
                Action Required:
              </span>

              <div className="flex items-center space-x-2">
                {rental.status === 'REQUESTED' && (
                  <button
                    onClick={() => handleUpdateStatus(rental.id, 'APPROVED', 'PAID')}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-semibold text-xs rounded transition-colors"
                  >
                    Approve Contract ➔
                  </button>
                )}
                {rental.status === 'APPROVED' && (
                  <button
                    onClick={() => handleUpdateStatus(rental.id, 'ACTIVE')}
                    className="px-3 py-1 bg-[#ffcd00] hover:bg-[#e6b800] text-black font-mono font-bold text-xs rounded transition-colors"
                  >
                    Dispatch Machine (Active) ➔
                  </button>
                )}
                {rental.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleUpdateStatus(rental.id, 'COMPLETED')}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-mono font-semibold text-xs rounded transition-colors"
                  >
                    Mark Returned ✓
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Rental Modal */}
      {isCreateRentalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#1d1f20] border border-[#393c3d] rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#181a1b] border-b border-[#2e3132] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <KeyRound size={18} className="text-emerald-400" />
                <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                  Create Commercial Rental Agreement
                </h2>
              </div>
              <button
                onClick={() => setIsCreateRentalOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateRental} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-mono text-[11px] mb-1">Select Machine</label>
                <select
                  value={formData.assetId}
                  onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                  className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-2 text-white font-mono outline-none focus:border-[#ffcd00]"
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id} className="bg-[#202223]">
                      {a.assetId} - {a.name} ({a.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-mono text-[11px] mb-1">Client / Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Turner Infrastructure Corp"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white outline-none focus:border-[#ffcd00]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-mono text-[11px] mb-1">Client Email</label>
                  <input
                    type="email"
                    required
                    placeholder="equipment@turnerconstruction.com"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white outline-none focus:border-[#ffcd00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 font-mono text-[11px] mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white font-mono outline-none focus:border-[#ffcd00]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-mono text-[11px] mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white font-mono outline-none focus:border-[#ffcd00]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-mono text-[11px] mb-1">Daily Rate ($)</label>
                  <input
                    type="number"
                    value={formData.dailyRate}
                    onChange={(e) => setFormData({ ...formData, dailyRate: parseFloat(e.target.value) })}
                    className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white font-mono outline-none focus:border-[#ffcd00]"
                  />
                </div>
              </div>

              {/* Automatic Calculation Banner */}
              <div className="p-3 bg-[#161718] border border-[#282a2b] rounded flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400">Calculated Estimation ({durationDays} Days @ ${formData.dailyRate}/day):</span>
                <span className="text-emerald-400 font-bold text-sm">${totalEstimatedCost.toLocaleString()}</span>
              </div>

              <div className="pt-3 border-t border-[#2e3132] flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateRentalOpen(false)}
                  className="px-3 py-1.5 bg-[#252829] hover:bg-[#2f3234] rounded text-gray-300 font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#ffcd00] hover:bg-[#e6b800] text-black font-semibold font-mono rounded"
                >
                  Submit Rental Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
