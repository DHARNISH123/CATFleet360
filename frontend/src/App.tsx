import React from 'react';
import { NavigationRail } from './components/layout/NavigationRail';
import { CommandBar } from './components/layout/CommandBar';
import { OperationsOverview } from './features/dashboard/OperationsOverview';
import { EquipmentExplorer } from './features/equipment/EquipmentExplorer';
import { AssetLifecycleView } from './features/lifecycle/AssetLifecycleView';
import { LiveOperationsCenter } from './features/operations/LiveOperationsCenter';
import { MaintenanceWorkspace } from './features/maintenance/MaintenanceWorkspace';
import { RentalManagement } from './features/rentals/RentalManagement';
import { OperatorManagement } from './features/operators/OperatorManagement';
import { DemandForecasting } from './features/forecast/DemandForecasting';
import { AssetDetailDrawer } from './features/equipment/AssetDetailDrawer';
import { CommandPaletteModal } from './components/common/CommandPaletteModal';
import { SmartAlertsDrawer } from './components/common/SmartAlertsDrawer';
import { QRCodeCheckInModal } from './components/common/QRCodeCheckInModal';
import { CreateAssetModal } from './features/equipment/CreateAssetModal';
import { useApp } from './context/AppContext';

export function App() {
  const { activeTab, isQRModalOpen, setIsQRModalOpen, qrModalAsset } = useApp();

  const renderActiveWorkspace = () => {
    switch (activeTab) {
      case 'overview':
        return <OperationsOverview />;
      case 'equipment':
        return <EquipmentExplorer />;
      case 'lifecycle':
        return <AssetLifecycleView />;
      case 'forecast':
        return <DemandForecasting />;
      case 'operations':
        return <LiveOperationsCenter />;
      case 'maintenance':
        return <MaintenanceWorkspace />;
      case 'rentals':
        return <RentalManagement />;
      case 'operators':
        return <OperatorManagement />;
      default:
        return <OperationsOverview />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#121314] text-gray-100 overflow-hidden font-sans">
      {/* Navigation Rail */}
      <NavigationRail />

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <CommandBar />

        {/* Dynamic Workspace Container */}
        <main className="flex-1 overflow-y-auto bg-[#121314]">
          {renderActiveWorkspace()}
        </main>
      </div>

      {/* Contextual Modals & Sliding Drawers */}
      <AssetDetailDrawer />
      <CommandPaletteModal />
      <SmartAlertsDrawer />
      <CreateAssetModal />
      <QRCodeCheckInModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} asset={qrModalAsset} />
    </div>
  );
}

export default App;
