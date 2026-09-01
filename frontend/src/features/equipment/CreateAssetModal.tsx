import React, { useState } from 'react';
import { X, Truck, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export const CreateAssetModal: React.FC = () => {
  const { isCreateAssetOpen, setIsCreateAssetOpen, triggerRefresh } = useApp();

  const [formData, setFormData] = useState({
    assetId: `CAT-EX-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    category: 'Hydraulic Excavator',
    manufacturer: 'Caterpillar',
    model: '320 GC',
    year: 2024,
    location: 'Jobsite Alpha - Quarry Sector',
    operatingHours: 0,
    utilization: 0,
    fuelLevel: 95,
    notes: '',
  });

  if (!isCreateAssetOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createAsset({
        ...formData,
        imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      });
      triggerRefresh();
      setIsCreateAssetOpen(false);
    } catch (err) {
      console.error('Failed to create asset:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-[#1d1f20] border border-[#393c3d] rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-4 bg-[#181a1b] border-b border-[#2e3132] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Truck size={18} className="text-[#ffcd00]" />
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
              Register Heavy Equipment
            </h2>
          </div>
          <button onClick={() => setIsCreateAssetOpen(false)} className="p-1 text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 font-mono text-[11px] mb-1">Asset ID / Code</label>
              <input
                type="text"
                required
                value={formData.assetId}
                onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white font-mono outline-none focus:border-[#ffcd00]"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-mono text-[11px] mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white outline-none focus:border-[#ffcd00]"
              >
                <option value="Hydraulic Excavator">Hydraulic Excavator</option>
                <option value="Track Type Tractor">Track Type Tractor (Dozer)</option>
                <option value="Wheel Loader">Wheel Loader</option>
                <option value="Off-Highway Truck">Off-Highway Truck</option>
                <option value="Motor Grader">Motor Grader</option>
                <option value="Backhoe Loader">Backhoe Loader</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 font-mono text-[11px] mb-1">Machine Name / Description</label>
            <input
              type="text"
              required
              placeholder="e.g. CAT 320 GC Hydraulic Excavator"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white outline-none focus:border-[#ffcd00]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-400 font-mono text-[11px] mb-1">Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white font-mono outline-none focus:border-[#ffcd00]"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-mono text-[11px] mb-1">Year</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white font-mono outline-none focus:border-[#ffcd00]"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-mono text-[11px] mb-1">Initial Fuel %</label>
              <input
                type="number"
                value={formData.fuelLevel}
                onChange={(e) => setFormData({ ...formData, fuelLevel: parseFloat(e.target.value) })}
                className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white font-mono outline-none focus:border-[#ffcd00]"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 font-mono text-[11px] mb-1">Assigned Jobsite Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-[#141516] border border-[#2e3132] rounded px-3 py-1.5 text-white outline-none focus:border-[#ffcd00]"
            />
          </div>

          <div className="pt-3 border-t border-[#2e3132] flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={() => setIsCreateAssetOpen(false)}
              className="px-3 py-1.5 bg-[#252829] hover:bg-[#2f3234] rounded text-gray-300 font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#ffcd00] hover:bg-[#e6b800] text-black font-semibold font-mono rounded"
            >
              Confirm Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
