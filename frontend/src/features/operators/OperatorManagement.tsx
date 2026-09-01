import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  ShieldCheck,
  Award,
  Clock,
  Phone,
  Mail,
  Truck,
  CheckCircle2,
  AlertCircle,
  X,
  Link as LinkIcon
} from 'lucide-react';
import { apiService } from '../../services/api';
import { Operator, Asset } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useApp } from '../../context/AppContext';

export const OperatorManagement: React.FC = () => {
  const { isCreateOperatorOpen, setIsCreateOperatorOpen, refreshKey, triggerRefresh } = useApp();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOperatorForAssign, setSelectedOperatorForAssign] = useState<Operator | null>(null);
  const [assignAssetId, setAssignAssetId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');

  // New Operator Form
  const [formData, setFormData] = useState({
    employeeId: `OP-${Math.floor(1000 + Math.random() * 9000)}`,
    name: '',
    email: '',
    phone: '+1 (555) 349-1029',
    certifications: 'Heavy Excavator Level III, OSHA 30, Cat Grade Control',
    shift: 'Day Shift (06:00 - 14:30)',
    safetyScore: 99.2,
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      apiService.getOperators({ search: searchQuery }),
      apiService.getAssets(),
    ]).then(([opList, assetList]) => {
      if (mounted) {
        setOperators(opList);
        setAssets(assetList);
        if (assetList.length > 0 && !assignAssetId) {
          setAssignAssetId(assetList[0].id);
        }
        setLoading(false);
      }
    }).catch(console.error);

    return () => { mounted = false; };
  }, [searchQuery, refreshKey]);

  const handleCreateOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createOperator(formData);
      triggerRefresh();
      setIsCreateOperatorOpen(false);
      setFormData({
        employeeId: `OP-${Math.floor(1000 + Math.random() * 9000)}`,
        name: '',
        email: '',
        phone: '+1 (555) 349-1029',
        certifications: 'Heavy Excavator Level III, OSHA 30, Cat Grade Control',
        shift: 'Day Shift (06:00 - 14:30)',
        safetyScore: 99.2,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOperatorForAssign || !assignAssetId) return;
    try {
      await apiService.assignOperator(selectedOperatorForAssign.id, assignAssetId, assignNotes);
      triggerRefresh();
      setSelectedOperatorForAssign(null);
      setAssignNotes('');
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
            <Users size={14} className="text-sky-400" />
            <span>Personnel & Operator Certifications</span>
          </div>
          <h1 className="text-xl font-bold text-white font-mono tracking-tight">
            Certified Heavy Equipment Operators Directory
          </h1>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            OSHA certified machine drivers, active equipment assignments, and safety rating scores.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOperatorOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#ffcd00] hover:bg-[#e6b800] text-black font-semibold font-mono text-xs rounded transition-colors"
        >
          <Plus size={15} className="font-bold stroke-[3]" />
          <span>ADD OPERATOR PROFILE</span>
        </button>
      </div>

      {/* Operators Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {operators.map((op) => (
          <div
            key={op.id}
            className="bg-[#1d1f20] border border-[#2e3132] hover:border-[#ffcd00]/40 rounded-lg p-5 flex flex-col justify-between shadow-lg space-y-4"
          >
            <div>
              {/* Profile Card Header */}
              <div className="flex items-start justify-between pb-3 border-b border-[#2e3132]">
                <div className="flex items-center space-x-3">
                  <img
                    src={op.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                    alt={op.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#ffcd00]"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white">{op.name}</h3>
                    <span className="text-[10px] font-mono text-gray-400">{op.employeeId}</span>
                  </div>
                </div>
                <StatusBadge status={op.status} size="sm" />
              </div>

              {/* Contact Info & Shift */}
              <div className="space-y-1.5 pt-2 text-xs font-mono text-gray-300">
                <div className="flex items-center space-x-2 text-[11px] text-gray-400">
                  <Mail size={12} className="text-[#ffcd00]" />
                  <span className="truncate">{op.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-gray-400">
                  <Phone size={12} className="text-[#ffcd00]" />
                  <span>{op.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-gray-400">
                  <Clock size={12} className="text-[#ffcd00]" />
                  <span>{op.shift}</span>
                </div>
              </div>

              {/* Safety Score & Certifications */}
              <div className="mt-3 p-3 bg-[#161718] rounded border border-[#282a2b] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-400 flex items-center gap-1">
                    <ShieldCheck size={13} className="text-emerald-400" /> Safety Score
                  </span>
                  <span className="font-bold text-emerald-400">{op.safetyScore}%</span>
                </div>
                <div className="text-[11px] text-gray-300 font-sans">
                  <span className="text-gray-500 font-mono text-[10px] uppercase block mb-0.5">Certifications:</span>
                  {op.certifications}
                </div>
              </div>
            </div>

            {/* Footer Action: Assign Machine */}
            <div className="pt-3 border-t border-[#2e3132] flex items-center justify-between">
              <span className="text-[10px] font-mono text-gray-400">
                {op.assignments && op.assignments.length > 0 ? (
                  <span className="text-emerald-400">Machine Linked</span>
                ) : (
                  <span>No Active Machine</span>
                )}
              </span>

              <button
                onClick={() => setSelectedOperatorForAssign(op)}
                className="px-3 py-1 bg-[#252829] hover:bg-[#ffcd00] hover:text-black text-white font-mono font-semibold text-xs rounded transition-colors flex items-center space-x-1.5"
              >
                <LinkIcon size={12} />
                <span>Assign Equipment</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Assign Equipment Modal */}
      {selectedOperatorForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#1d1f20] border border-[#393c3d] rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#181a1b] border-b border-[#2e3132] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Truck size={18} className="text-[#ffcd00]" />
                <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                  Assign Heavy Machine
                </h2>
              </div>
              <button
                onClick={() => setSelectedOperatorForAssign(null)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-[#161718] rounded border border-[#282a2b]">
                <span className="text-[10px] font-mono text-gray-500 uppercase">Selected Operator</span>
                <div className="font-bold text-white text-sm mt-0.5">{selectedOperatorForAssign.name}</div>
                <div className="text-xs text-gray-400 font-mono">{selectedOperatorForAssign.employeeId} • {selectedOperatorForAssign.shift}</div>
              </div>

              <div>
                <label className="block text-gray-400 font-mono text-[11px] mb-1">Select Available Equipment</label>
                <select
                  value={assignAssetId}
                  onChange={(e) => setAssignAssetId(e.target.value)}
                  className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-2 text-white font-mono outline-none focus:border-[#ffcd00]"
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id} className="bg-[#202223]">
                      {a.assetId} - {a.name} ({a.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-mono text-[11px] mb-1">Assignment Shift Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Assigned to deep pit foundation excavation"
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white outline-none focus:border-[#ffcd00]"
                />
              </div>

              <div className="pt-3 border-t border-[#2e3132] flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedOperatorForAssign(null)}
                  className="px-3 py-1.5 bg-[#252829] hover:bg-[#2f3234] rounded text-gray-300 font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#ffcd00] hover:bg-[#e6b800] text-black font-semibold font-mono rounded"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Operator Modal */}
      {isCreateOperatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#1d1f20] border border-[#393c3d] rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#181a1b] border-b border-[#2e3132] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users size={18} className="text-sky-400" />
                <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                  Register Operator Profile
                </h2>
              </div>
              <button
                onClick={() => setIsCreateOperatorOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateOperator} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-mono text-[11px] mb-1">Employee ID</label>
                  <input
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white font-mono outline-none focus:border-[#ffcd00]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-mono text-[11px] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jackson Reed"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white outline-none focus:border-[#ffcd00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-mono text-[11px] mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="j.reed@catfleet360.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white outline-none focus:border-[#ffcd00]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-mono text-[11px] mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white outline-none focus:border-[#ffcd00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-mono text-[11px] mb-1">Machinery Certifications</label>
                <input
                  type="text"
                  value={formData.certifications}
                  onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                  className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white outline-none focus:border-[#ffcd00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-mono text-[11px] mb-1">Assigned Shift</label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white outline-none focus:border-[#ffcd00]"
                  >
                    <option value="Day Shift (06:00 - 14:30)">Day Shift (06:00 - 14:30)</option>
                    <option value="Swing Shift (14:00 - 22:30)">Swing Shift (14:00 - 22:30)</option>
                    <option value="Night Shift (22:00 - 06:30)">Night Shift (22:00 - 06:30)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-mono text-[11px] mb-1">Initial Safety Score %</label>
                  <input
                    type="number"
                    value={formData.safetyScore}
                    onChange={(e) => setFormData({ ...formData, safetyScore: parseFloat(e.target.value) })}
                    className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white font-mono outline-none focus:border-[#ffcd00]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#2e3132] flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateOperatorOpen(false)}
                  className="px-3 py-1.5 bg-[#252829] hover:bg-[#2f3234] rounded text-gray-300 font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#ffcd00] hover:bg-[#e6b800] text-black font-semibold font-mono rounded"
                >
                  Register Operator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
