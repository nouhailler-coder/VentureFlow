import React, { useState } from 'react';
import {
  Settings,
  RefreshCw,
  Zap,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowUpCircle,
  X,
} from 'lucide-react';
import { useSystemUpdate, APP_VERSION, APP_RELEASE_DATE } from '../../context/SystemUpdateContext';

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    version,
    releaseDate,
    lastCheckDate,
    isChecking,
    status,
    statusMessage,
    autoCheckEnabled,
    autoCheckIntervalMinutes,
    setAutoCheckEnabled,
    setAutoCheckIntervalMinutes,
    checkForUpdates,
    forceUpdate,
  } = useSystemUpdate();

  const [confirmForce, setConfirmForce] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-5 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl text-slate-800 dark:text-slate-100 flex flex-col overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Paramètres Système & Mises à Jour
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Gestion des versions applicatives, caches PWA et vérifications d'arrière-plan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-xs overflow-y-auto">
          {/* Release & Version Card */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span>Date de sortie de l'application</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {releaseDate}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Version stable : v{version}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-500" />
                <span>Dernière vérification</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                {lastCheckDate}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Vérification locale active
              </div>
            </div>
          </div>

          {/* Status Message feedback if any */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                status === 'up-to-date'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300'
                  : status === 'update-available'
                  ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800/60 text-cyan-900 dark:text-cyan-300'
                  : 'bg-slate-100 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              {status === 'up-to-date' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
              {status === 'update-available' && <ArrowUpCircle className="w-4 h-4 text-cyan-500 shrink-0" />}
              {status === 'checking' && <RefreshCw className="w-4 h-4 text-emerald-500 animate-spin shrink-0" />}
              <span className="text-xs leading-relaxed">{statusMessage}</span>
            </div>
          )}

          {/* Action Buttons: "Vérifier les mises à jour" & "Forcer la mise à jour" */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Actions de Mise à Jour du Système
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => checkForUpdates(true)}
                disabled={isChecking}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                <span>Vérifier les mises à jour</span>
              </button>

              {!confirmForce ? (
                <button
                  type="button"
                  onClick={() => setConfirmForce(true)}
                  disabled={isChecking}
                  className="py-2.5 px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Forcer la mise à jour</span>
                </button>
              ) : (
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => forceUpdate()}
                    className="flex-1 py-2 px-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                  >
                    Confirmer purge & recharge
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmForce(false)}
                    className="px-2.5 py-2 bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] rounded-lg"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Le bouton <strong>Forcer la mise à jour</strong> purge l'ensemble des caches de scripts du navigateur (Service Worker & CacheStorage) pour forcer le téléchargement immédiat des derniers modules. Vos données financières chiffrées dans IndexedDB sont préservées intactes.
            </p>
          </div>

          {/* Background Auto-Update Configuration */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-xs">
                  Mises à Jour Automatiques en Arrière-Plan
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Vérifie périodiquement les nouvelles versions et applique le nouveau cache de manière transparente.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCheckEnabled}
                  onChange={(e) => setAutoCheckEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {autoCheckEnabled && (
              <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800/80 text-[11px]">
                <span className="text-slate-600 dark:text-slate-300">Fréquence de vérification en arrière-plan :</span>
                <select
                  value={autoCheckIntervalMinutes}
                  onChange={(e) => setAutoCheckIntervalMinutes(parseInt(e.target.value, 10))}
                  className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-emerald-600 dark:text-emerald-400 font-medium cursor-pointer"
                >
                  <option value={5}>Toutes les 5 minutes</option>
                  <option value={15}>Toutes les 15 minutes (Recommandé)</option>
                  <option value={30}>Toutes les 30 minutes</option>
                  <option value={60}>Toutes les 60 minutes</option>
                </select>
              </div>
            )}
          </div>

          {/* Technical Diagnostics */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <div className="flex justify-between">
              <span>Moteur Cryptographique :</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Web Crypto AES-256-GCM Natif</span>
            </div>
            <div className="flex justify-between">
              <span>Stockage Local :</span>
              <span className="text-slate-700 dark:text-slate-300">IndexedDB (ventureflow_vault)</span>
            </div>
            <div className="flex justify-between">
              <span>Service Worker PWA :</span>
              <span className="text-slate-700 dark:text-slate-300">
                {'serviceWorker' in navigator ? 'Disponible (Actif)' : 'Non supporté'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Politique Réseau :</span>
              <span className="text-cyan-600 dark:text-cyan-400">Zero Cloud Data Transmission</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
