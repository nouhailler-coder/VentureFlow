import React from 'react';
import {
  LayoutDashboard,
  Building,
  Kanban,
  Calculator,
  FileCheck2,
  Briefcase,
  Share2,
  Lock,
  Settings,
  Scale,
  Download,
  Sun,
  Moon,
  ShieldCheck,
  ChevronRight,
  X,
  ExternalLink,
} from 'lucide-react';
import { ActiveTab } from './Header';
import { useTheme } from '../../context/ThemeContext';
import { useVault } from '../../context/VaultContext';
import { useSystemUpdate } from '../../context/SystemUpdateContext';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSystemSettings: () => void;
  onOpenLegalOnboarding: () => void;
  onOpenInstallModal: () => void;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onOpenSystemSettings,
  onOpenLegalOnboarding,
  onOpenInstallModal,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { startups, lockVault } = useVault();
  const { version } = useSystemUpdate();

  if (!isOpen) return null;

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 flex flex-col h-full shadow-2xl z-10 transition-colors animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                VentureFlow
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">v{version} · Local-First</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Categories */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5 text-xs">
          {/* CATEGORY 1: GESTION & CRM */}
          <div className="space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Gestion des Investissements & CRM
            </div>

            <button
              onClick={() => handleSelectTab('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-50 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-slate-800'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Tableau de Bord Exécutif</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </button>

            <button
              onClick={() => handleSelectTab('startups')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                activeTab === 'startups'
                  ? 'bg-emerald-50 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-slate-800'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Répertoire Startups & CRM</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                {startups.length}
              </span>
            </button>

            <button
              onClick={() => handleSelectTab('pipeline')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                activeTab === 'pipeline'
                  ? 'bg-emerald-50 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-slate-800'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Kanban className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Pipeline (9 Étapes)</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </button>
          </div>

          {/* CATEGORY 2: ANALYSE FINANCIÈRE */}
          <div className="space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Analyse Financière & Évaluation
            </div>

            <button
              onClick={() => handleSelectTab('valuation')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                activeTab === 'valuation'
                  ? 'bg-emerald-50 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-slate-800'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calculator className="w-4 h-4 text-cyan-500 shrink-0" />
                <span>Atelier de Valorisation (6 Méthodes)</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </button>

            <button
              onClick={() => handleSelectTab('duediligence')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                activeTab === 'duediligence'
                  ? 'bg-emerald-50 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-slate-800'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-4 h-4 text-cyan-500 shrink-0" />
                <span>Due Diligence & Data Room Chiffrée</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </button>
          </div>

          {/* CATEGORY 3: PORTEFEUILLE */}
          <div className="space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Portefeuille & Suivi
            </div>

            <button
              onClick={() => handleSelectTab('portfolio')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                activeTab === 'portfolio'
                  ? 'bg-emerald-50 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-slate-800'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Participations & Multiples MOIC</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </button>
          </div>

          {/* CATEGORY 4: PARTAGE */}
          <div className="space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Partage Sélectif & Collaboration
            </div>

            <button
              onClick={() => handleSelectTab('sharing')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                activeTab === 'sharing'
                  ? 'bg-emerald-50 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-slate-800'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Share2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Centre de Partage (Modes A & B)</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </button>
          </div>

          {/* CATEGORY 5: SÉCURITÉ & SYSTÈME */}
          <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800/80">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Sécurité, Système & Conformité
            </div>

            <button
              onClick={() => handleSelectTab('security')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-emerald-50 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-slate-800'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Coffre-Fort & Chiffrement AES-256</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenSystemSettings();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Paramètres Système & Mises à Jour</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenLegalOnboarding();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Scale className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Mentions Légales & Non-Responsabilité</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenInstallModal();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-900/60 text-emerald-700 dark:text-emerald-400 font-medium transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4 shrink-0" />
                <span>Installer l'application (PWA)</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </button>
          </div>
        </div>

        {/* Drawer Footer with Theme Toggle & Emergency Lock */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-2">
          <div className="flex items-center justify-between px-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Thème de l'interface :</span>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium cursor-pointer shadow-xs hover:border-emerald-500 transition-colors"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mode Clair</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Mode Sombre</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              lockVault();
            }}
            className="w-full py-2 px-3 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Verrouiller le coffre maintenant</span>
          </button>
        </div>
      </div>
    </div>
  );
};
