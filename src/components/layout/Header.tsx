import React from 'react';
import {
  Menu,
  Lock,
  ShieldCheck,
  Sliders,
  Settings,
  Download,
  Sun,
  Moon,
  HelpCircle,
} from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { useTheme } from '../../context/ThemeContext';
import { useSystemUpdate } from '../../context/SystemUpdateContext';
import { Tooltip } from '../common/Tooltip';

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
  onOpenHamburger: () => void;
  onOpenSystemSettings: () => void;
  onOpenLegalOnboarding: () => void;
  onOpenInstallModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenHamburger,
  onOpenSystemSettings,
  onOpenLegalOnboarding,
  onOpenInstallModal,
}) => {
  const { lockVault } = useVault();
  const { theme, toggleTheme } = useTheme();
  const { version, status: updateStatus } = useSystemUpdate();

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 lg:px-8 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Hamburger Button + Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenHamburger}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Menu des fonctionnalités par catégorie"
            aria-label="Ouvrir le menu catégorisé"
          >
            <Menu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline text-xs font-semibold">Menu</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2 text-left cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors whitespace-nowrap">
                VentureFlow
              </span>
            </button>
            <span className="hidden xl:inline text-[11px] font-mono text-slate-400 dark:text-slate-500">
              v{version}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-slate-100 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs border border-slate-200 dark:border-slate-800'
                : 'hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-900/50'
            }`}
          >
            Tableau de bord
          </button>
          <button
            onClick={() => setActiveTab('startups')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'startups'
                ? 'bg-slate-100 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs border border-slate-200 dark:border-slate-800'
                : 'hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-900/50'
            }`}
          >
            Startups & CRM
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'pipeline'
                ? 'bg-slate-100 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs border border-slate-200 dark:border-slate-800'
                : 'hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-900/50'
            }`}
          >
            Pipeline
          </button>
          <button
            onClick={() => setActiveTab('valuation')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'valuation'
                ? 'bg-slate-100 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs border border-slate-200 dark:border-slate-800'
                : 'hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-900/50'
            }`}
          >
            Valorisation
          </button>
          <button
            onClick={() => setActiveTab('duediligence')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'duediligence'
                ? 'bg-slate-100 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs border border-slate-200 dark:border-slate-800'
                : 'hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-900/50'
            }`}
          >
            Due Diligence
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'portfolio'
                ? 'bg-slate-100 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs border border-slate-200 dark:border-slate-800'
                : 'hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-900/50'
            }`}
          >
            Portefeuille
          </button>
          <button
            onClick={() => setActiveTab('sharing')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'sharing'
                ? 'bg-slate-100 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs border border-slate-200 dark:border-slate-800'
                : 'hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-900/50'
            }`}
          >
            Partage
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Install App, Theme Toggle, System Settings, Lock) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Prominent "Installer l'application" Button */}
          <button
            type="button"
            onClick={onOpenInstallModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/80 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all cursor-pointer whitespace-nowrap shadow-xs"
            title="Installer VentureFlow sur l'écran d'accueil mobile ou le bureau d'ordinateur"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Installer l'application</span>
          </button>

          {/* Theme Toggle Button (Light / Dark) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Basculer en thème Clair' : 'Basculer en thème Sombre'}
            aria-label="Basculer le thème"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>

          {/* System Settings & Updates button */}
          <button
            type="button"
            onClick={onOpenSystemSettings}
            className="relative p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Paramètres système et mises à jour"
            aria-label="Ouvrir les paramètres système"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            {updateStatus === 'update-available' && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            )}
          </button>

          {/* Emergency Lock */}
          <button
            type="button"
            onClick={lockVault}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer whitespace-nowrap"
            title="Verrouiller immédiatement et purger la clé de la mémoire vive"
          >
            <Lock className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
            <span className="hidden sm:inline">Verrouiller</span>
          </button>
        </div>
      </div>
    </header>
  );
};
