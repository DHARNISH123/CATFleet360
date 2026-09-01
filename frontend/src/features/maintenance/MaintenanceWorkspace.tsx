import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Calendar,
  Kanban,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  DollarSign,
  ArrowRight,
  Filter,
  X
} from 'lucide-react';
import { apiService } from '../../services/api';
import { MaintenanceTask, MaintenanceStatus, MaintenancePriority, Asset } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useApp } from '../../context/AppContext';

export const MaintenanceWorkspace: React.FC = () => {
  const { isCreateMaintenanceOpen, setIsCreateMaintenanceOpen, refreshKey, triggerRefresh } = useApp();
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'board' | 'planner'>('board');
  const [filterPriority, setFilterPriority] = useState('ALL');

  // New Maintenance Task form state
  const [formData, setFormData] = useState({
    assetId: '',
    title: '',
    description: '',
    priority: 'HIGH' as MaintenancePriority,
    cost: 850,
    scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      apiService.getMaintenanceTasks({ priority: filterPriority }),
      apiService.getAssets(),
    ]).then(([taskList, assetList]) => {
      if (mounted) {
        setTasks(taskList);
        setAssets(assetList);
        if (assetList.length > 0 && !formData.assetId) {
          setFormData((prev) => ({ ...prev, assetId: assetList[0].id }));
        }
        setLoading(false);
      }
    }).catch(console.error);

    return () => { mounted = false; };
  }, [filterPriority, refreshKey]);

  const kanbanColumns: { status: MaintenanceStatus; label: string; desc: string }[] = [
    { status: 'REPORTED', label: 'Reported Issues', desc: 'Awaiting triage' },
    { status: 'INSPECTION_REQUIRED', label: 'Inspection Required', desc: 'Diagnostic testing' },
    { status: 'SCHEDULED', label: 'Scheduled Work', desc: 'Booked service bay' },
    { status: 'IN_PROGRESS', label: 'In Progress', desc: 'Active technician repair' },
    { status: 'COMPLETED', label: 'Completed', desc: 'Certified & returned' },
  ];

  const handleAdvanceStatus = async (task: MaintenanceTask, nextStatus: MaintenanceStatus) => {
    try {
      await apiService.updateMaintenanceStatus(task.id, nextStatus, 'Status updated via Kanban Board');
      triggerRefresh();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createMaintenanceTask(formData);
      triggerRefresh();
      setIsCreateMaintenanceOpen(false);
      setFormData({
        assetId: assets[0]?.id || '',
        title: '',
        description: '',
        priority: 'HIGH',
        cost: 850,
        scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-[#1a1c1d] border border-[#2e3132] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#ffcd00] uppercase tracking-wider mb-1">
            <Wrench size={14} className="text-amber-400" />
            <span>Heavy Equipment Service Operations</span>
          </div>
          <h1 className="text-xl font-bold text-white font-mono tracking-tight">
            Maintenance Workspace & Kanban Work Orders
          </h1>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            Track multi-point inspections, scheduled component rebuilds, and technician task assignments.
          </p>
        </div>

        {/* View mode toggle & Action */}
        <div className="flex items-center space-x-3">
          <div className="bg-[#181a1b] border border-[#2e3132] rounded p-1 flex items-center space-x-1">
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                viewMode === 'board' ? 'bg-[#2b2e2f] text-[#ffcd00] font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Kanban size={14} />
              <span>Kanban Board</span>
            </button>
            <button
              onClick={() => setViewMode('planner')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                viewMode === 'planner' ? 'bg-[#2b2e2f] text-[#ffcd00] font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Calendar size={14} />
              <span>Planner Calendar</span>
            </button>
          </div>

          <button
            onClick={() => setIsCreateMaintenanceOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#ffcd00] hover:bg-[#e6b800] text-black font-semibold font-mono text-xs rounded transition-colors"
          >
            <Plus size={15} className="font-bold stroke-[3]" />
            <span>LOG SERVICE ORDER</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center space-x-2.5 text-xs font-mono">
        <span className="text-gray-400 uppercase text-[11px]">Priority:</span>
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
          <button
            key={p}
            onClick={() => setFilterPriority(p)}
            className={`px-2.5 py-1 rounded-sm border transition-colors ${
              filterPriority === p
                ? 'bg-[#ffcd00]/15 text-[#ffcd00] border-[#ffcd00]'
                : 'bg-[#191b1c] text-gray-400 border-[#2a2c2d] hover:text-white'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Content: Kanban Board vs Planner Calendar */}
      {viewMode === 'board' ? (
        /* KANBAN BOARD */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {kanbanColumns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.status);
            return (
              <div
                key={col.status}
                className="bg-[#181a1b] border border-[#2e3132] rounded-lg p-3.5 flex flex-col h-[650px]"
              >
                {/* Column Header */}
                <div className="pb-3 border-b border-[#2e3132] mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                      {col.label}
                    </h3>
                    <span className="text-[10px] text-gray-500">{col.desc}</span>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-[#242728] text-gray-300 font-mono text-xs font-bold flex items-center justify-center border border-[#393c3d]">
                    {colTasks.length}
                  </span>
                </div>

                {/* Task Cards Column */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-[#202223] border border-[#2e3132] hover:border-[#ffcd00]/50 rounded-md p-3 text-xs space-y-2.5 transition-all shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-mono font-bold text-[#ffcd00] text-[11px]">
                          {task.asset?.assetId || 'CAT-EQ'}
                        </span>
                        <StatusBadge status={task.priority} size="sm" />
                      </div>

                      <h4 className="font-bold text-white text-xs leading-snug">{task.title}</h4>
                      <p className="text-[11px] text-gray-400 font-sans line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>

                      <div className="pt-2 border-t border-[#2a2c2d] flex items-center justify-between text-[10px] font-mono text-gray-400">
                        <span className="flex items-center gap-1">
                          <DollarSign size={11} className="text-emerald-400" />
                          <strong className="text-white">${task.cost}</strong>
                        </span>
                        <span>{task.asset?.location?.split(' - ')[0]}</span>
                      </div>

                      {/* Quick Move Stage Action Buttons */}
                      <div className="pt-1 flex items-center justify-end space-x-1.5">
                        {col.status === 'REPORTED' && (
                          <button
                            onClick={() => handleAdvanceStatus(task, 'INSPECTION_REQUIRED')}
                            className="px-2 py-0.5 rounded bg-[#2a2d2e] hover:bg-[#ffcd00] hover:text-black font-mono text-[10px] font-semibold transition-colors"
                          >
                            Inspect ➔
                          </button>
                        )}
                        {col.status === 'INSPECTION_REQUIRED' && (
                          <button
                            onClick={() => handleAdvanceStatus(task, 'SCHEDULED')}
                            className="px-2 py-0.5 rounded bg-[#2a2d2e] hover:bg-[#ffcd00] hover:text-black font-mono text-[10px] font-semibold transition-colors"
                          >
                            Schedule ➔
                          </button>
                        )}
                        {col.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handleAdvanceStatus(task, 'IN_PROGRESS')}
                            className="px-2 py-0.5 rounded bg-[#2a2d2e] hover:bg-[#ffcd00] hover:text-black font-mono text-[10px] font-semibold transition-colors"
                          >
                            Start Work ➔
                          </button>
                        )}
                        {col.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleAdvanceStatus(task, 'COMPLETED')}
                            className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-bold transition-colors"
                          >
                            Complete ✓
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* PLANNER CALENDAR / TIMELINE */
        <div className="bg-[#1d1f20] border border-[#2e3132] rounded-lg p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2e3132]">
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
              Maintenance Timeline Schedule
            </h3>
            <span className="text-xs font-mono text-gray-400">Target Service Windows</span>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 bg-[#161718] border border-[#282a2b] rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-gray-500 transition-colors"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="p-2.5 rounded bg-[#202223] border border-[#2e3132]">
                    <Wrench size={18} className="text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-[#ffcd00] text-xs">
                        {task.asset?.assetId}
                      </span>
                      <StatusBadge status={task.status} size="sm" />
                      <StatusBadge status={task.priority} size="sm" />
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">{task.title}</h4>
                    <p className="text-xs text-gray-400 font-sans mt-0.5">{task.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs font-mono text-gray-300">
                  <div className="text-right">
                    <div className="text-gray-500 text-[10px]">SCHEDULED DATE</div>
                    <div className="font-bold text-white">
                      {task.scheduledDate ? new Date(task.scheduledDate).toLocaleDateString() : 'Immediate'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-500 text-[10px]">ESTIMATED COST</div>
                    <div className="font-bold text-emerald-400">${task.cost.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Maintenance Modal */}
      {isCreateMaintenanceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#1d1f20] border border-[#393c3d] rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#181a1b] border-b border-[#2e3132] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wrench size={18} className="text-amber-400" />
                <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                  Log Service Work Order
                </h2>
              </div>
              <button
                onClick={() => setIsCreateMaintenanceOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-mono text-[11px] mb-1">Select Machine</label>
                <select
                  value={formData.assetId}
                  onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
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
                <label className="block text-gray-400 font-mono text-[11px] mb-1">Work Order Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hydraulic Boom Cylinder Replacement & Seal Testing"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white outline-none focus:border-[#ffcd00]"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-mono text-[11px] mb-1">Issue Description & Telemetry Symptoms</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detailed inspection findings and required parts..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white outline-none focus:border-[#ffcd00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-mono text-[11px] mb-1">Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as MaintenancePriority })}
                    className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white outline-none focus:border-[#ffcd00]"
                  >
                    <option value="CRITICAL">CRITICAL (Ground Immediately)</option>
                    <option value="HIGH">HIGH (Next Window)</option>
                    <option value="MEDIUM">MEDIUM (Scheduled Service)</option>
                    <option value="LOW">LOW (Routine Inspection)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-mono text-[11px] mb-1">Estimated Cost ($ USD)</label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                    className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white font-mono outline-none focus:border-[#ffcd00]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#2e3132] flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateMaintenanceOpen(false)}
                  className="px-3 py-1.5 bg-[#252829] hover:bg-[#2f3234] rounded text-gray-300 font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#ffcd00] hover:bg-[#e6b800] text-black font-semibold font-mono rounded"
                >
                  Create Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
