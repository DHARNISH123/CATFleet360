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
  Zap,
  Globe,
  Layers,
  Compass,
  Maximize2
} from 'lucide-react';
import { apiService } from '../../services/api';
import { Asset, LiveEvent } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useApp } from '../../context/AppContext';
import { playAlertSound } from '../../utils/sound';
import L from 'leaflet';

export interface GlobalProjectRegion {
  id: string;
  name: string;
  coords: [number, number];
  zoom: number;
  country: string;
}

export const GLOBAL_REGIONS: GlobalProjectRegion[] = [
  { id: 'global', name: 'Global Fleet (World View)', coords: [20, 0], zoom: 2, country: 'Worldwide' },
  { id: 'us_west', name: 'USA West - California Quarry', coords: [37.7749, -122.4194], zoom: 12, country: 'USA' },
  { id: 'india_south', name: 'India - Chennai & Bangalore Corridor', coords: [13.0827, 80.2707], zoom: 11, country: 'India' },
  { id: 'aus_mining', name: 'Australia - Pilbara Mining Pit', coords: [-20.3150, 118.5760], zoom: 10, country: 'Australia' },
  { id: 'eu_central', name: 'Europe - Central Rail Infrastructure', coords: [51.5074, -0.1278], zoom: 11, country: 'UK' },
];

export type MapTileProvider = 'satellite' | 'dark' | 'streets' | 'terrain';

export const LiveOperationsCenter: React.FC = () => {
  const { openAssetDetail, refreshKey } = useApp();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [tileProvider, setTileProvider] = useState<MapTileProvider>('satellite');
  const [activeRegion, setActiveRegion] = useState<string>('us_west');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Multi-region asset dataset for worldwide telemetry
  const enrichedGlobalAssets = [
    // US Jobsite
    { id: 'ast-1', assetId: 'CAT-EX-205', name: 'CAT 320 GC Hydraulic Excavator', category: 'Hydraulic Excavator', status: 'OPERATIONAL', latitude: 37.7833, longitude: -122.4167, location: 'Jobsite Alpha - Quarry Sector', fuelLevel: 76, operatingHours: 1840.5, speed: 4.2, rpm: 1850, imageUrl: '/assets/equipment/cat_320gc.jpg', healthScore: 94 },
    { id: 'ast-2', assetId: 'CAT-EX-349', name: 'CAT 349 Next Gen Large Excavator', category: 'Hydraulic Excavator', status: 'OPERATIONAL', latitude: 37.7558, longitude: -122.4449, location: 'South Highway Expansion', fuelLevel: 82, operatingHours: 620.0, speed: 2.1, rpm: 1920, imageUrl: '/assets/equipment/cat_349.jpg', healthScore: 98 },
    { id: 'ast-3', assetId: 'CAT-DZ-801', name: 'CAT D8T Heavy Track Dozer', category: 'Track Type Tractor', status: 'UNDER_MAINTENANCE', latitude: 37.7690, longitude: -122.4467, location: 'West Maintenance Bay 2', fuelLevel: 45, operatingHours: 3410.0, speed: 0.0, rpm: 0, imageUrl: '/assets/equipment/cat_d8t.jpg', healthScore: 68 },
    { id: 'ast-4', assetId: 'CAT-WL-950', name: 'CAT 950 GC Wheel Loader', category: 'Wheel Loader', status: 'ON_RENT', latitude: 37.7915, longitude: -122.3920, location: 'Turner Construction - Bay Pier', fuelLevel: 62, operatingHours: 1420.0, speed: 12.8, rpm: 2100, imageUrl: '/assets/equipment/cat_950gc.jpg', healthScore: 92 },
    { id: 'ast-5', assetId: 'CAT-TR-770', name: 'CAT 770G Off-Highway Haul Truck', category: 'Off-Highway Truck', status: 'AVAILABLE', latitude: 37.7420, longitude: -122.4080, location: 'West Quarry Pit A', fuelLevel: 94, operatingHours: 2100.0, speed: 24.5, rpm: 2250, imageUrl: '/assets/equipment/cat_770g.jpg', healthScore: 96 },
    { id: 'ast-6', assetId: 'CAT-MG-140', name: 'CAT 140 GC Motor Grader', category: 'Motor Grader', status: 'OPERATIONAL', latitude: 37.7600, longitude: -122.4300, location: 'South Highway Expansion', fuelLevel: 58, operatingHours: 890.0, speed: 8.4, rpm: 1750, imageUrl: '/assets/equipment/cat_140gc.jpg', healthScore: 95 },
    { id: 'ast-7', assetId: 'CAT-BH-420', name: 'CAT 420 XE Backhoe Loader', category: 'Backhoe Loader', status: 'AVAILABLE', latitude: 37.7720, longitude: -122.4100, location: 'Central Equipment Yard', fuelLevel: 88, operatingHours: 950.0, speed: 0.0, rpm: 800, imageUrl: '/assets/equipment/cat_420xe.jpg', healthScore: 97 },

    // India Jobsite Assets (from Caterpillar document references)
    { id: 'ast-ind-1', assetId: 'EQX1001', name: 'CAT 320 Hydraulic Excavator', category: 'Hydraulic Excavator', status: 'OPERATIONAL', latitude: 13.0827, longitude: 80.2707, location: 'Site S003 - Chennai Metro Rail', fuelLevel: 71, operatingHours: 1240.0, speed: 3.5, rpm: 1800, imageUrl: '/assets/equipment/cat_320gc.jpg', healthScore: 91 },
    { id: 'ast-ind-2', assetId: 'EQX1003', name: 'CAT D8T Heavy Track Bulldozer', category: 'Track Type Tractor', status: 'OPERATIONAL', latitude: 12.9716, longitude: 77.5946, location: 'Site S002 - Bangalore Expressway', fuelLevel: 85, operatingHours: 2150.0, speed: 6.2, rpm: 1950, imageUrl: '/assets/equipment/cat_d8t.jpg', healthScore: 95 },
    { id: 'ast-ind-3', assetId: 'EQX1006', name: 'CAT 140 Motor Grader', category: 'Motor Grader', status: 'OPERATIONAL', latitude: 17.3850, longitude: 78.4867, location: 'Site S001 - Hyderabad Ring Road', fuelLevel: 64, operatingHours: 880.0, speed: 9.0, rpm: 1700, imageUrl: '/assets/equipment/cat_140gc.jpg', healthScore: 93 },

    // Australia Pilbara Mining
    { id: 'ast-aus-1', assetId: 'CAT-MINE-01', name: 'CAT 797F Ultra Mining Truck', category: 'Off-Highway Truck', status: 'OPERATIONAL', latitude: -20.3150, longitude: 118.5760, location: 'Pilbara Heavy Iron Ore Pit', fuelLevel: 79, operatingHours: 4890.0, speed: 32.0, rpm: 2350, imageUrl: '/assets/equipment/cat_770g.jpg', healthScore: 96 },

    // Europe Civil
    { id: 'ast-eu-1', assetId: 'CAT-EU-02', name: 'CAT 349 Rail Excavator', category: 'Hydraulic Excavator', status: 'OPERATIONAL', latitude: 51.5074, longitude: -0.1278, location: 'London Crossrail Terminal', fuelLevel: 68, operatingHours: 1100.0, speed: 1.8, rpm: 1820, imageUrl: '/assets/equipment/cat_349.jpg', healthScore: 97 }
  ];

  // Fetch initial live operations data
  useEffect(() => {
    apiService.getLiveOperations().then((res) => {
      setEvents(res.liveFeed);
      setAssets(enrichedGlobalAssets as any);
      if (enrichedGlobalAssets.length > 0) setSelectedAsset(enrichedGlobalAssets[0] as any);
    }).catch(() => {
      setAssets(enrichedGlobalAssets as any);
      if (enrichedGlobalAssets.length > 0) setSelectedAsset(enrichedGlobalAssets[0] as any);
    });
  }, [refreshKey]);

  // Radio events simulation
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const simulatedMessages = [
        { msg: 'Geofence ping: Machine active in Sector 4 excavation', type: 'GEOFENCE' },
        { msg: 'Telemetry update: Engine temperature nominal (84°C)', type: 'TELEMETRY' },
        { msg: 'Fuel consumption rate: 14.2 L/hr (Optimal calibration)', type: 'TELEMETRY' },
        { msg: 'Operator shift cycle check: All safety beacons active', type: 'OPERATOR' },
        { msg: 'GPS coordinates synced with CAT Fleet Satellites', type: 'TELEMETRY' },
        { msg: 'Hydraulic pressure sensor: 3,450 PSI (Standard load)', type: 'TELEMETRY' }
      ];

      const randMsg = simulatedMessages[Math.floor(Math.random() * simulatedMessages.length)];
      const randAsset = assets[Math.floor(Math.random() * (assets.length || 1))] || enrichedGlobalAssets[0];

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
    }, 5000);

    return () => clearInterval(interval);
  }, [isStreaming, assets]);

  // Get tile layer URL based on provider (100% Free Public APIs without key required)
  const getTileConfig = (provider: MapTileProvider) => {
    switch (provider) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; Esri, Maxar, Earthstar Geographics, USDA'
        };
      case 'dark':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        };
      case 'streets':
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; OpenStreetMap contributors'
        };
      case 'terrain':
        return {
          url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          attribution: '&copy; OpenStreetMap &copy; OpenTopoMap'
        };
    }
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [37.7749, -122.4194],
        zoom: 12,
        zoomControl: true,
      });

      const tileConfig = getTileConfig(tileProvider);
      tileLayerRef.current = L.tileLayer(tileConfig.url, {
        attribution: tileConfig.attribution,
        maxZoom: 19,
        subdomains: ['a', 'b', 'c', 'd']
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Update tile layer if changed
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    const currentConfig = getTileConfig(tileProvider);
    tileLayerRef.current = L.tileLayer(currentConfig.url, {
      attribution: currentConfig.attribution,
      maxZoom: 19,
      subdomains: ['a', 'b', 'c', 'd']
    }).addTo(map);

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Filter assets
    const filtered = (assets.length ? assets : enrichedGlobalAssets).filter((a: any) => {
      if (filterCategory !== 'ALL' && a.category !== filterCategory) return false;
      if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
      return true;
    });

    // Add machinery markers
    filtered.forEach((asset: any) => {
      const isSelected = selectedAsset?.id === asset.id;
      const isOperational = asset.status === 'OPERATIONAL' || asset.status === 'ON_RENT';

      const customIcon = L.divIcon({
        className: 'custom-cat-marker',
        html: `
          <div class="relative group cursor-pointer flex flex-col items-center">
            <div class="w-8 h-8 rounded-full border-2 ${
              isSelected ? 'border-white ring-4 ring-[#ffcd00]' : 'border-black'
            } ${
              isOperational ? 'bg-[#ffcd00]' : 'bg-red-500'
            } flex items-center justify-center text-black font-bold font-mono text-[10px] shadow-2xl transition-transform hover:scale-110">
              CAT
            </div>
            <div class="mt-1 px-1.5 py-0.5 bg-[#1a1c1d] border border-[#ffcd00]/40 rounded text-[9px] font-mono text-white whitespace-nowrap shadow-lg flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full ${isOperational ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}"></span>
              ${asset.assetId}
            </div>
          </div>
        `,
        iconSize: [40, 48],
        iconAnchor: [20, 24],
      });

      const marker = L.marker([asset.latitude, asset.longitude], { icon: customIcon })
        .addTo(map)
        .on('click', () => {
          setSelectedAsset(asset);
          playAlertSound('checkin');
          map.panTo([asset.latitude, asset.longitude], { animate: true });
        });

      // Bind rich popup
      marker.bindPopup(`
        <div style="font-family: monospace; font-size: 11px; padding: 4px; color: #1a1c1d; min-width: 180px;">
          <div style="font-weight: bold; color: #231f20; font-size: 12px; border-bottom: 2px solid #ffcd00; padding-bottom: 3px;">
            ${asset.assetId} - ${asset.name}
          </div>
          <div style="margin-top: 6px; font-size: 10px; color: #555;">
            Location: <strong>${asset.location}</strong><br/>
            Fuel: <strong>${asset.fuelLevel}%</strong> | Health: <strong>${asset.healthScore}/100</strong><br/>
            Engine Status: <strong style="color: ${isOperational ? '#16a34a' : '#dc2626'};">${asset.status}</strong>
          </div>
        </div>
      `);

      markersRef.current.push(marker);
    });

  }, [assets, selectedAsset, filterCategory, filterStatus, tileProvider]);

  // Handle region jump
  const handleJumpToRegion = (region: GlobalProjectRegion) => {
    setActiveRegion(region.id);
    playAlertSound('checkin');
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(region.coords, region.zoom, {
        duration: 1.5
      });
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Top Header Controls Bar */}
      <div className="bg-[#1a1c1d] border border-[#2e3132] rounded-lg p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#ffcd00] uppercase tracking-wider mb-1">
            <Globe size={14} className="animate-spin-slow" />
            <span>Live Global Telemetry GIS Engine</span>
          </div>
          <h1 className="text-xl font-bold text-white font-mono tracking-tight flex items-center gap-2">
            <span>Live Geospatial Operations Center</span>
            <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
              LIVE SATELLITE FEED
            </span>
          </h1>
        </div>

        {/* Global Region Quick Jump Buttons */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-[11px] font-mono text-gray-400 mr-1 flex items-center gap-1">
            <Compass size={13} className="text-[#ffcd00]" /> Regions:
          </span>
          {GLOBAL_REGIONS.map((reg) => (
            <button
              key={reg.id}
              onClick={() => handleJumpToRegion(reg)}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-all border ${
                activeRegion === reg.id
                  ? 'bg-[#ffcd00] text-black font-bold border-[#ffcd00] shadow-md'
                  : 'bg-[#141516] text-gray-300 border-[#2e3132] hover:border-gray-500'
              }`}
            >
              {reg.name.split(' - ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Map + Sidebars Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Map Container (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="relative bg-[#1a1c1d] border border-[#2e3132] rounded-lg overflow-hidden h-[600px] shadow-2xl">
            {/* Free Tile Server Layer Switcher */}
            <div className="absolute top-3 right-3 z-[1000] bg-[#141516]/90 backdrop-blur-md border border-[#393c3d] p-1.5 rounded-md flex items-center space-x-1 shadow-2xl">
              <Layers size={13} className="text-[#ffcd00] ml-1 mr-1" />
              {[
                { id: 'satellite', label: '🛰️ Satellite' },
                { id: 'dark', label: '🌙 Tactical Dark' },
                { id: 'streets', label: '🗺️ Streets' },
                { id: 'terrain', label: '🏔️ Topo' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTileProvider(t.id as MapTileProvider)}
                  className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
                    tileProvider === t.id
                      ? 'bg-[#ffcd00] text-black font-bold shadow'
                      : 'text-gray-300 hover:text-white hover:bg-[#252829]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Leaflet Map Target */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Floating Live Telemetry Inspector Card */}
            {selectedAsset && (
              <div className="absolute bottom-4 left-4 z-[1000] bg-[#181a1b]/95 backdrop-blur-md border border-[#ffcd00]/40 rounded-lg p-4 w-80 shadow-2xl animate-in slide-in-from-bottom duration-150">
                <div className="flex items-start justify-between pb-2 border-b border-[#2e3132] mb-3">
                  <div>
                    <span className="text-[10px] font-mono text-[#ffcd00] font-bold uppercase">
                      INSPECTING ACTIVE GPS ASSET
                    </span>
                    <h3 className="text-sm font-bold text-white font-mono mt-0.5">{selectedAsset.assetId}</h3>
                    <div className="text-[11px] text-gray-300 truncate">{selectedAsset.name}</div>
                  </div>
                  <StatusBadge status={selectedAsset.status} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
                  <div className="p-2 bg-[#121314] rounded border border-[#262829]">
                    <span className="text-[10px] text-gray-400">FUEL LEVEL</span>
                    <div className="text-sm font-bold text-[#ffcd00]">{selectedAsset.fuelLevel}%</div>
                  </div>
                  <div className="p-2 bg-[#121314] rounded border border-[#262829]">
                    <span className="text-[10px] text-gray-400">OPERATING HOURS</span>
                    <div className="text-sm font-bold text-white">{selectedAsset.operatingHours}h</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} className="text-[#ffcd00]" /> {selectedAsset.location}
                  </span>
                </div>

                <button
                  onClick={() => openAssetDetail(selectedAsset)}
                  className="w-full py-1.5 bg-[#ffcd00] hover:bg-[#e6b800] text-black font-mono font-bold text-xs rounded transition-colors flex items-center justify-center space-x-1.5 shadow"
                >
                  <span>Open Full Machine Drawer</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Operations Radio Feed (4 cols) */}
        <div className="lg:col-span-4 bg-[#1d1f20] border border-[#2e3132] rounded-lg p-4 shadow-lg flex flex-col h-[600px]">
          <div className="flex items-center justify-between pb-3 border-b border-[#2e3132] mb-3">
            <div className="flex items-center space-x-2">
              <Radio size={16} className="text-[#ffcd00] animate-pulse" />
              <h2 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Live Field Dispatch Feed
              </h2>
            </div>
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className="p-1 rounded bg-[#252829] hover:bg-[#303335] text-gray-300 text-xs"
              title={isStreaming ? 'Pause Feed' : 'Resume Feed'}
            >
              {isStreaming ? <Pause size={12} /> : <Play size={12} />}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="p-3 bg-[#161718] border border-[#26282a] hover:border-gray-600 rounded transition-all text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-[#ffcd00] text-[11px]">{evt.assetId}</span>
                  <span className="text-[10px] font-mono text-gray-500">{evt.time}</span>
                </div>
                <p className="text-xs text-gray-300 font-sans leading-relaxed">{evt.message}</p>
                <div className="text-[10px] font-mono text-gray-400 mt-1 flex items-center gap-1">
                  <MapPin size={10} className="text-gray-500" /> {evt.location}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#2e3132] flex items-center justify-between text-[10px] font-mono text-gray-400">
            <span>Feed Protocol: MQTT / AES-256</span>
            <span className="text-emerald-400 font-bold">Connected • Nominal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
