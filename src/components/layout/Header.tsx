import React from 'react';
import { Lock, ShieldCheck, Sliders } from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

export type ActiveTab =
  | 'dashboard'
  | 'startups'
  | 'pipeline'
  | 'valuation'
  | 'duediligence'
  | 'portfolio'
  | 'sharing'
  | 'security';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { lockVault, hasPasskeyEnrolled } = useVault();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Zone 1: Brand single text element wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-left cursor-pointer group"
          >
            <span className="text-base font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors whitespace-nowrap">
              VentureFlow
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation links single-line */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-xs font-medium text-slate-400 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-slate-900 text-emerald-400 shadow-xs border border-slate-800'
                : 'hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            Tableau de bord
          </button>
          <button
            onClick={() => setActiveTab('startups')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'startups'
                ? 'bg-slate-900 text-emerald-400 shadow-xs border border-slate-800'
                : 'hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            Startups
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'pipeline'
                ? 'bg-slate-900 text-emerald-400 shadow-xs border border-slate-800'
                : 'hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            Pipeline (9 étapes)
          </button>
          <button
            onClick={() => setActiveTab('valuation')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'valuation'
                ? 'bg-slate-900 text-emerald-400 shadow-xs border border-slate-800'
                : 'hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            Valorisation
          </button>
          <button
            onClick={() => setActiveTab('duediligence')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'duediligence'
                ? 'bg-slate-900 text-emerald-400 shadow-xs border border-slate-800'
                : 'hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            Due Diligence
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'portfolio'
                ? 'bg-slate-900 text-emerald-400 shadow-xs border border-slate-800'
                : 'hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            Portefeuille
          </button>
          <button
            onClick={() => setActiveTab('sharing')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'sharing'
                ? 'bg-slate-900 text-emerald-400 shadow-xs border border-slate-800'
                : 'hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            Partage Sélectif
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Install PWA + Security + Lock) */}
        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton />

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'security'
                ? 'bg-slate-900 text-emerald-400 border-slate-700'
                : 'text-slate-300 bg-slate-900/60 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
            title="Paramètres de sécurité, tests crypto et audit de stockage"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Sécurité & Coffre</span>
          </button>

          <button
            onClick={lockVault}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/40 border border-rose-900/50 rounded-md hover:bg-rose-900/40 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="Verrouiller immédiatement et purger la clé de la mémoire"
          >
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Verrouiller</span>
          </button>
        </div>
      </div>
      
      {/* Mobile Tab row */}
      <div className="md:hidden flex items-center gap-1 overflow-x-auto pt-2.5 mt-2 border-t border-slate-800/60 text-xs">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'startups', label: 'Startups' },
          { id: 'pipeline', label: 'Pipeline' },
          { id: 'valuation', label: 'Valorisation' },
          { id: 'duediligence', label: 'Due Diligence' },
          { id: 'portfolio', label: 'Portefeuille' },
          { id: 'sharing', label: 'Partage' },
          { id: 'security', label: 'Sécurité' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ActiveTab)}
            className={`px-2.5 py-1 rounded whitespace-nowrap shrink-0 ${
              activeTab === tab.id ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};
