import React, { useState } from 'react';
import { VaultProvider, useVault } from './context/VaultContext';
import { Header, ActiveTab } from './components/layout/Header';
import { VaultGate } from './components/vault/VaultGate';
import { DashboardView } from './components/dashboard/DashboardView';
import { StartupsView } from './components/startups/StartupsView';
import { PipelineView } from './components/pipeline/PipelineView';
import { ValuationView } from './components/valuation/ValuationView';
import { DueDiligenceView } from './components/duediligence/DueDiligenceView';
import { PortfolioView } from './components/portfolio/PortfolioView';
import { SharingCenterView } from './components/sharing/SharingCenterView';
import { SecurityVaultView } from './components/security/SecurityVaultView';
import { StartupDetailModal } from './components/startups/StartupDetailModal';
import { NewStartupModal } from './components/startups/NewStartupModal';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';

const MainAppContent: React.FC = () => {
  const { status } = useVault();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modal states
  const [selectedStartupIdForDetail, setSelectedStartupIdForDetail] = useState<string | null>(null);
  const [showNewStartupModal, setShowNewStartupModal] = useState<boolean>(false);

  // Loading skeleton
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 animate-pulse flex items-center justify-center" />
          <div className="text-xs text-slate-500 font-mono">Démarrage du coffre local VentureFlow...</div>
        </div>
      </div>
    );
  }

  // Vault Gate (Setup or Locked)
  if (status === 'uninitialized' || status === 'locked') {
    return (
      <>
        <VaultGate />
        <OfflineIndicator />
      </>
    );
  }

  // Unlocked Application
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            setActiveTab={setActiveTab}
            onOpenStartup={(id) => setSelectedStartupIdForDetail(id)}
            onNewStartup={() => setShowNewStartupModal(true)}
          />
        )}

        {activeTab === 'startups' && (
          <StartupsView
            onOpenStartup={(id) => setSelectedStartupIdForDetail(id)}
            onNewStartup={() => setShowNewStartupModal(true)}
          />
        )}

        {activeTab === 'pipeline' && (
          <PipelineView
            onOpenStartup={(id) => setSelectedStartupIdForDetail(id)}
            onNewStartup={() => setShowNewStartupModal(true)}
          />
        )}

        {activeTab === 'valuation' && <ValuationView />}

        {activeTab === 'duediligence' && <DueDiligenceView />}

        {activeTab === 'portfolio' && <PortfolioView />}

        {activeTab === 'sharing' && <SharingCenterView />}

        {activeTab === 'security' && <SecurityVaultView />}
      </main>

      {/* Startup Detail Modal */}
      {selectedStartupIdForDetail && (
        <StartupDetailModal
          startupId={selectedStartupIdForDetail}
          onClose={() => setSelectedStartupIdForDetail(null)}
          onOpenValuationTab={() => {
            setSelectedStartupIdForDetail(null);
            setActiveTab('valuation');
          }}
          onOpenDueDiligenceTab={() => {
            setSelectedStartupIdForDetail(null);
            setActiveTab('duediligence');
          }}
        />
      )}

      {/* New Startup Creation Modal */}
      {showNewStartupModal && (
        <NewStartupModal
          onClose={() => setShowNewStartupModal(false)}
          onCreated={(newId) => {
            setShowNewStartupModal(false);
            setSelectedStartupIdForDetail(newId);
          }}
        />
      )}

      {/* Offline Status Badge */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <VaultProvider>
      <MainAppContent />
    </VaultProvider>
  );
}
