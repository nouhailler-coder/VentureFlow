import React, { useState, useEffect } from 'react';
import { VaultProvider, useVault } from './context/VaultContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { SystemUpdateProvider } from './context/SystemUpdateContext';
import { Header, ActiveTab } from './components/layout/Header';
import { HamburgerMenu } from './components/layout/HamburgerMenu';
import { SystemSettingsModal } from './components/system/SystemSettingsModal';
import { LegalOnboardingModal } from './components/onboarding/LegalOnboardingModal';
import { InstallAppModal } from './components/common/InstallAppModal';
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
  const [isHamburgerOpen, setIsHamburgerOpen] = useState<boolean>(false);
  const [isSystemSettingsOpen, setIsSystemSettingsOpen] = useState<boolean>(false);
  const [isLegalOnboardingOpen, setIsLegalOnboardingOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);

  // Check onboarding on initial render
  useEffect(() => {
    const accepted = localStorage.getItem('ventureflow_legal_onboarding_accepted');
    if (!accepted) {
      setIsLegalOnboardingOpen(true);
    }
  }, []);

  // Loading skeleton
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 animate-pulse flex items-center justify-center" />
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
        <LegalOnboardingModal
          isOpen={isLegalOnboardingOpen}
          onAccept={() => setIsLegalOnboardingOpen(false)}
        />
        <InstallAppModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
        />
      </>
    );
  }

  // Unlocked Application
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-700 dark:selection:text-emerald-300 transition-colors">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenHamburger={() => setIsHamburgerOpen(true)}
        onOpenSystemSettings={() => setIsSystemSettingsOpen(true)}
        onOpenLegalOnboarding={() => setIsLegalOnboardingOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

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

      {/* Hamburger Navigation Drawer */}
      <HamburgerMenu
        isOpen={isHamburgerOpen}
        onClose={() => setIsHamburgerOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSystemSettings={() => setIsSystemSettingsOpen(true)}
        onOpenLegalOnboarding={() => setIsLegalOnboardingOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* System Settings & Updates Modal */}
      <SystemSettingsModal
        isOpen={isSystemSettingsOpen}
        onClose={() => setIsSystemSettingsOpen(false)}
      />

      {/* Legal Onboarding & Disclaimer Modal */}
      <LegalOnboardingModal
        isOpen={isLegalOnboardingOpen}
        onAccept={() => setIsLegalOnboardingOpen(false)}
        isRevisit={localStorage.getItem('ventureflow_legal_onboarding_accepted') === 'true'}
      />

      {/* Install Application Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

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
    <ThemeProvider>
      <SystemUpdateProvider>
        <VaultProvider>
          <MainAppContent />
        </VaultProvider>
      </SystemUpdateProvider>
    </ThemeProvider>
  );
}
