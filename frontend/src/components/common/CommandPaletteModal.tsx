import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Truck, Users, Wrench, KeyRound, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';
import { SearchResult } from '../../types';
import { StatusBadge } from './StatusBadge';

export const CommandPaletteModal: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setActiveTab,
    openAssetDetail,
    setIsCreateAssetOpen,
    setIsCreateMaintenanceOpen,
    setIsCreateRentalOpen
  } = useApp();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await apiService.search(query);
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isCommandPaletteOpen) return null;

  const handleSelectResult = (item: SearchResult) => {
    setIsCommandPaletteOpen(false);
    if (item.type === 'ASSET') {
      openAssetDetail(item.raw);
    } else if (item.type === 'OPERATOR') {
      setActiveTab('operators');
    } else if (item.type === 'MAINTENANCE') {
      setActiveTab('maintenance');
    } else if (item.type === 'RENTAL') {
      setActiveTab('rentals');
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'ASSET': return <Truck size={16} className="text-[#ffcd00]" />;
      case 'OPERATOR': return <Users size={16} className="text-sky-400" />;
      case 'MAINTENANCE': return <Wrench size={16} className="text-amber-400" />;
      case 'RENTAL': return <KeyRound size={16} className="text-emerald-400" />;
      default: return <Search size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1e2021] border border-[#393c3d] rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#2e3132] bg-[#181a1b]">
          <Search size={18} className="text-[#ffcd00] mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search across machinery, operators, work orders, rentals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none text-sm text-white placeholder-gray-500 font-sans"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-gray-400 hover:text-white mr-2">
              <X size={14} />
            </button>
          )}
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="text-xs bg-[#2b2e2f] hover:bg-[#383b3c] text-gray-300 px-2 py-1 rounded font-mono"
          >
            ESC
          </button>
        </div>

        {/* Quick Command Shortcuts */}
        {!query && (
          <div className="p-4 border-b border-[#2e3132] bg-[#161718]">
            <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-2.5">
              Quick System Actions
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => { setIsCommandPaletteOpen(false); setIsCreateAssetOpen(true); }}
                className="flex items-center space-x-2.5 p-2 rounded bg-[#202223] hover:bg-[#282a2b] hover:text-[#ffcd00] border border-[#2e3132] text-left transition-colors"
              >
                <Truck size={14} className="text-[#ffcd00]" />
                <span className="font-medium text-gray-200">Register New Heavy Machine</span>
              </button>
              <button
                onClick={() => { setIsCommandPaletteOpen(false); setIsCreateMaintenanceOpen(true); }}
                className="flex items-center space-x-2.5 p-2 rounded bg-[#202223] hover:bg-[#282a2b] hover:text-[#ffcd00] border border-[#2e3132] text-left transition-colors"
              >
                <Wrench size={14} className="text-amber-400" />
                <span className="font-medium text-gray-200">Schedule Maintenance Order</span>
              </button>
              <button
                onClick={() => { setIsCommandPaletteOpen(false); setIsCreateRentalOpen(true); }}
                className="flex items-center space-x-2.5 p-2 rounded bg-[#202223] hover:bg-[#282a2b] hover:text-[#ffcd00] border border-[#2e3132] text-left transition-colors"
              >
                <KeyRound size={14} className="text-emerald-400" />
                <span className="font-medium text-gray-200">Create Rental Agreement</span>
              </button>
              <button
                onClick={() => { setIsCommandPaletteOpen(false); setActiveTab('operations'); }}
                className="flex items-center space-x-2.5 p-2 rounded bg-[#202223] hover:bg-[#282a2b] hover:text-[#ffcd00] border border-[#2e3132] text-left transition-colors"
              >
                <ArrowRight size={14} className="text-sky-400" />
                <span className="font-medium text-gray-200">Open Live Operations Map</span>
              </button>
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {loading && (
            <div className="p-6 text-center text-xs text-gray-400 font-mono">
              Querying CATFleet360 engine...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-xs font-mono">
              No matching assets, operators, or orders found for "{query}".
            </div>
          )}

          {!loading && results.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              onClick={() => handleSelectResult(item)}
              className="flex items-center justify-between p-3 rounded-md hover:bg-[#282b2c] cursor-pointer transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded bg-[#161718] border border-[#2e3132]">
                  {getResultIcon(item.type)}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-[#ffcd00]">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-gray-400 font-sans">{item.subtitle}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <StatusBadge status={item.status} size="sm" />
                <CornerDownLeft size={13} className="text-gray-500 opacity-0 group-hover:opacity-100" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-[#161718] border-t border-[#2e3132] flex items-center justify-between text-[10px] text-gray-400 font-mono">
          <span>Navigate with mouse or keyboard</span>
          <span>CATFleet360 v2.6 Enterprise Search</span>
        </div>
      </div>
    </div>
  );
};
