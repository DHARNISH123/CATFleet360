import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Radio,
  Filter,
  Truck,
  Fuel,
  Activity,
  AlertTriangle,
  Clock,
  ExternalLink,
  Pause,
  Play,
  RotateCcw,
  Zap
} from 'lucide-react';
import { apiService } from '../../services/api';
import { Asset, LiveEvent } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useApp } from '../../context/AppContext';
import L from 'leaflet';

export const LiveOperationsCenter: React.FC = () => {
  const { openAssetDetail, refreshKey } = useApp();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Fetch initial live operations data
  useEffect(() => {
    apiService.getLiveOperations().then((res) => {
      setAssets(res.mapAssets);
      setEvents(res.liveFeed);
      if (res.mapAssets.length > 0) setSelectedAsset(res.mapAssets[0]);
    }).catch(console.error);
  }, [refreshKey]);

  // Simulate real-time operational radio events stream
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const simulatedMessages = [
        { msg: 'Geofence ping: Machine active in Sector 4 excavation', type: 'GEOFENCE' },
        { msg: 'Telemetry update: Engine temperature nominal (84°C)', type: 'TELEMETRY' },
        { msg: 'Fuel level consumption rate: 14.2 L/hr (Optimal)', type: 'TELEMETRY' },
        { msg: 'Operator shift cycle check: All safety beacons active', type: 'OPERATOR' },
        { msg: 'GPS coordinates synced with CAT Fleet Satellites', type: 'TELEMETRY' }
      ];

      const randMsg = simulatedMessages[Math.floor(Math.random() * simulatedMessages.length)];
      const randAsset = assets[Math.floor(Math.random() * (assets.length || 1))] || {
        assetId: 'CAT-EX-205',
        name: 'CAT 320 GC Excavator',
        location: 'Jobsite Alpha',
        status: 'OPERATIONAL'
      };

      const newEvt: LiveEvent = {
        id: `evt-${Date.now()}`,
        type: randMsg.type,
        assetId: randAsset.assetId,
        assetName: randAsset.name,
        message: randMsg.msg,
        location: randAsset.location,
        time: 'Just now',
        status: randAsset.status
      };

      setEvents((prev) => [newEvt, ...prev.slice(0, 19)]);
    }, 6000);

    return () => clearInterval(interval);
  }, [isStreaming, assets]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [37.7749, -122.4194],
        zoom: 12,
        zoomControl: true,
      });

      // Dark theme map tiles (CartoDB Dark Matter)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Filter assets
    const filtered = assets.filter((a) => {
      if (filterCategory !== 'ALL' && a.category !== filterCategory) return false;
      if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
      return true;
    });

    // Add custom machine markers
    filtered.forEach((asset) => {
      const isSelected = selectedAsset?.id === asset.id;
      const statusColor =
        asset.status === 'OPERATIONAL'
          ? '#ffcd00'
          : asset.status === 'UNDER_MAINTENANCE'
          ? '#ef4444'
          : asset.status === 'ON_RENT'
          ? '#f59e0b'
          : '#3b82f6';

      const customIcon = L.divIcon({
        className: 'custom-cat-pin',
        html: `
          <div style="
            background: #1a1c1d;
            border: 2px solid ${statusColor};
            border-radius: 6px;
            padding: 4px 6px;
            color: #ffffff;
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
            transform: translate(-50%, -50%);
          ">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: ${statusColor};"></span>
            ${asset.assetId}
          </div>
        `,
        iconSize: [60, 24],
        iconAnchor: [30, 12],
      });

      const marker = L.marker([asset.latitude, asset.longitude], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setSelectedAsset(asset);
        map.panTo([asset.latitude, asset.longitude]);
      });

      markersRef.current.push(marker);
    });
  }, [assets, filterCategory, filterStatus, selectedAsset]);

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-[#1a1c1d] border border-[#2e3132] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#ffcd00] uppercase tracking-wider mb-1">
            <Radio size={14} className="animate-pulse text-red-400" />
            <span>Live Geospatial Operations</span>
          </div>
          <h1 className="text-xl font-bold text-white font-mono tracking-tight">
            Live Operations Center & Fleet Tracking
          </h1>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            Geofenced telemetry, machinery GPS positioning, and automated field dispatch feed.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1 bg-[#121314] border border-[#2e3132] px-2.5 py-1.5 rounded text-xs">
            <Filter size={12} className="text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent text-gray-200 outline-none font-mono text-xs cursor-pointer"
            >
              <option value="ALL" className="bg-[#202223]">All Categories</option>
              <option value="Hydraulic Excavator" className="bg-[#202223]">Excavators</option>
              <option value="Track Type Tractor" className="bg-[#202223]">Dozers</option>
              <option value="Wheel Loader" className="bg-[#202223]">Wheel Loaders</option>
              <option value="Off-Highway Truck" className="bg-[#202223]">Haul Trucks</option>
            </select>
          </div>

          <div className="flex items-center space-x-1 bg-[#121314] border border-[#2e3132] px-2.5 py-1.5 rounded text-xs">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-gray-200 outline-none font-mono text-xs cursor-pointer"
            >
              <option value="ALL" className="bg-[#202223]">All Statuses</option>
              <option value="OPERATIONAL" className="bg-[#202223]">Operational</option>
              <option value="AVAILABLE" className="bg-[#202223]">Available</option>
              <option value="UNDER_MAINTENANCE" className="bg-[#202223]">Maintenance</option>
              <option value="ON_RENT" className="bg-[#202223]">On Rent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Operations Grid: Interactive Map (8 cols) + Operations Feed (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[620px]">
        {/* Interactive Map (8 cols) with Floating Telemetry Panel */}
        <div className="lg:col-span-8 relative bg-[#141617] border border-[#2e3132] rounded-lg overflow-hidden shadow-2xl">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Floating Machine Telemetry Inspector Card (Top-Left overlay) */}
          {selectedAsset && (
            <div className="absolute top-4 left-4 z-[1000] w-80 bg-[#1d1f20]/95 backdrop-blur-md border border-[#393c3d] rounded-lg p-4 shadow-2xl animate-in fade-in duration-150 text-xs">
              <div className="flex items-start justify-between pb-2 border-b border-[#2e3132] mb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-[#ffcd00]/20 text-[#ffcd00] px-1.5 py-0.5 rounded border border-[#ffcd00]/30">
                    {selectedAsset.assetId}
                  </span>
                  <h3 className="text-xs font-bold text-white mt-1 truncate">{selectedAsset.name}</h3>
                </div>
                <StatusBadge status={selectedAsset.status} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-gray-300 mb-3">
                <div className="bg-[#141516] p-2 rounded border border-[#2a2c2d]">
                  <span className="text-[10px] text-gray-500 block">UTILIZATION</span>
                  <span className="text-white font-bold">{selectedAsset.utilization}%</span>
                </div>
                <div className="bg-[#141516] p-2 rounded border border-[#2a2c2d]">
                  <span className="text-[10px] text-gray-500 block">FUEL LEVEL</span>
                  <span className="text-[#ffcd00] font-bold">{selectedAsset.fuelLevel}%</span>
                </div>
                <div className="bg-[#141516] p-2 rounded border border-[#2a2c2d]">
                  <span className="text-[10px] text-gray-500 block">HEALTH SCORE</span>
                  <span className="text-emerald-400 font-bold">{selectedAsset.healthScore}/100</span>
                </div>
                <div className="bg-[#141516] p-2 rounded border border-[#2a2c2d]">
                  <span className="text-[10px] text-gray-500 block">OPERATING HRS</span>
                  <span className="text-white font-bold">{selectedAsset.operatingHours}h</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openAssetDetail(selectedAsset)}
                  className="flex-1 py-1.5 bg-[#ffcd00] hover:bg-[#e6b800] text-black font-mono font-bold text-[11px] rounded transition-colors text-center"
                >
                  Full Machine Drawer ➔
                </button>
              </div>
            </div>
          )}

          {/* Map Controls Floating Badge (Bottom-Right) */}
          <div className="absolute bottom-4 right-4 z-[1000] bg-[#161718]/90 backdrop-blur-xs border border-[#2e3132] px-3 py-1.5 rounded text-[11px] font-mono text-gray-300 flex items-center space-x-3 shadow-lg">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#ffcd00]" /> Operational
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Maintenance
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> On Rent
            </span>
          </div>
        </div>

        {/* Live Operations Event Feed (4 cols) */}
        <div className="lg:col-span-4 bg-[#1d1f20] border border-[#2e3132] rounded-lg p-4 shadow-2xl flex flex-col h-full">
          <div className="flex items-center justify-between pb-3 border-b border-[#2e3132] mb-3">
            <div className="flex items-center space-x-2">
              <Radio size={16} className="text-[#ffcd00] animate-pulse" />
              <h2 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                Operations Radio Stream
              </h2>
            </div>
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className="p-1 rounded hover:bg-[#2a2c2d] text-gray-400 hover:text-white"
              title={isStreaming ? 'Pause Stream' : 'Resume Stream'}
            >
              {isStreaming ? <Pause size={14} /> : <Play size={14} className="text-[#ffcd00]" />}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="p-3 bg-[#161718] border border-[#282a2b] rounded text-xs space-y-1.5 hover:border-gray-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#ffcd00] text-[11px]">
                    {evt.assetId}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500">{evt.time}</span>
                </div>
                <p className="text-gray-200 text-xs font-sans leading-snug">{evt.message}</p>
                <div className="flex items-center justify-between pt-1 border-t border-[#222425] text-[10px] font-mono text-gray-400">
                  <span>{evt.location}</span>
                  <span className="uppercase text-gray-500">{evt.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
