import React, { createContext, useContext, useState, useEffect } from 'react';
import { Asset, Role, User, SmartAlert } from '../types';
import { apiService } from '../services/api';

interface AppContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  setUserRole: (role: Role) => void;
  selectedAsset: Asset | null;
  setSelectedAsset: (asset: Asset | null) => void;
  isAssetDrawerOpen: boolean;
  setIsAssetDrawerOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isAlertsDrawerOpen: boolean;
  setIsAlertsDrawerOpen: (open: boolean) => void;
  isCreateAssetOpen: boolean;
  setIsCreateAssetOpen: (open: boolean) => void;
  isCreateMaintenanceOpen: boolean;
  setIsCreateMaintenanceOpen: (open: boolean) => void;
  isCreateRentalOpen: boolean;
  setIsCreateRentalOpen: (open: boolean) => void;
  isCreateOperatorOpen: boolean;
  setIsCreateOperatorOpen: (open: boolean) => void;
  isQRModalOpen: boolean;
  setIsQRModalOpen: (open: boolean) => void;
  qrModalAsset: Asset | null;
  openQRModal: (asset?: Asset | null) => void;
  refreshKey: number;
  triggerRefresh: () => void;
  alerts: SmartAlert[];
  unreadAlertsCount: number;
  openAssetDetail: (asset: Asset) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr-1',
    name: 'Elena Rostova',
    email: 'admin@catfleet360.com',
    role: 'ADMINISTRATOR',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  });
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isAssetDrawerOpen, setIsAssetDrawerOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState(false);
  const [isCreateAssetOpen, setIsCreateAssetOpen] = useState(false);
  const [isCreateMaintenanceOpen, setIsCreateMaintenanceOpen] = useState(false);
  const [isCreateRentalOpen, setIsCreateRentalOpen] = useState(false);
  const [isCreateOperatorOpen, setIsCreateOperatorOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrModalAsset, setQrModalAsset] = useState<Asset | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  const setUserRole = (role: Role) => {
    setCurrentUser(prev => ({ ...prev, role }));
  };

  const openAssetDetail = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsAssetDrawerOpen(true);
  };

  const openQRModal = (asset?: Asset | null) => {
    setQrModalAsset(asset || null);
    setIsQRModalOpen(true);
  };

  // Keyboard shortcut for Command Palette: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch overview alerts on load
  useEffect(() => {
    apiService.getOverview().then(data => {
      if (data?.metrics?.smartAlerts) {
        setAlerts(data.metrics.smartAlerts);
      }
    }).catch(console.error);
  }, [refreshKey]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentUser,
        setCurrentUser,
        setUserRole,
        selectedAsset,
        setSelectedAsset,
        isAssetDrawerOpen,
        setIsAssetDrawerOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isAlertsDrawerOpen,
        setIsAlertsDrawerOpen,
        isCreateAssetOpen,
        setIsCreateAssetOpen,
        isCreateMaintenanceOpen,
        setIsCreateMaintenanceOpen,
        isCreateRentalOpen,
        setIsCreateRentalOpen,
        isCreateOperatorOpen,
        setIsCreateOperatorOpen,
        isQRModalOpen,
        setIsQRModalOpen,
        qrModalAsset,
        openQRModal,
        refreshKey,
        triggerRefresh,
        alerts,
        unreadAlertsCount: alerts.length,
        openAssetDetail
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
