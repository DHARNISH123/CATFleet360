import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { NavigationRail } from './components/layout/NavigationRail';
import { CommandBar } from './components/layout/CommandBar';
import { OperationsOverview } from './features/dashboard/OperationsOverview';
import { EquipmentExplorer } from './features/equipment/EquipmentExplorer';
import { AssetLifecycleView } from './features/lifecycle/AssetLifecycleView';
import { LiveOperationsCenter } from './features/operations/LiveOperationsCenter';
import { MaintenanceWorkspace } from './features/maintenance/MaintenanceWorkspace';
import { RentalManagement } from './features/rentals/RentalManagement';
import { OperatorManagement } from './features/operators/OperatorManagement';
import { AssetDetailDrawer } from './features/equipment/AssetDetailDrawer';
import { CreateAssetModal } from './features/equipment/CreateAssetModal';
import { CommandPaletteModal } from './components/common/CommandPaletteModal';
import { SmartAlertsDrawer } from './components/common/SmartAlertsDrawer';
import { QRCodeCheckInModal } from './components/common/QRCodeCheckInModal';

const MainContent: React.FC = () => {
  const { activeTab, isQRModalOpen, setIsQRModalOpen, qrModalAsset } = useApp();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#121314] text-gray-100">
      {/* Collapsible Left Navigation Rail */}
      <NavigationRail />

      {/* Main Dynamic Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Universal Top Command Bar */}
        <CommandBar />

        {/* Dynamic Central Workspace Content */}
        <main className="flex-1 overflow-y-auto bg-[#141516] relative">
          {activeTab === 'overview' && <OperationsOverview />}
          {activeTab === 'equipment' && <EquipmentExplorer />}
          {activeTab === 'lifecycle' && <AssetLifecycleView />}
          {activeTab === 'operations' && <LiveOperationsCenter />}
          {activeTab === 'maintenance' && <MaintenanceWorkspace />}
          {activeTab === 'rentals' && <RentalManagement />}
          {activeTab === 'operators' && <OperatorManagement />}
        </main>
      </div>

      {/* Contextual Sliding Drawers & Universal Modals */}
      <AssetDetailDrawer />
      <CreateAssetModal />
      <CommandPaletteModal />
      <SmartAlertsDrawer />
      <QRCodeCheckInModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} asset={qrModalAsset} />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
