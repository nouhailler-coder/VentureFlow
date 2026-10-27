import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Monitor,
  Share2,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [deviceTab, setDeviceTab] = useState<'desktop' | 'android' | 'ios'>(
    isIOS ? 'ios' : 'desktop'
  );
  const [installedSuccess, setInstalledSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDirectInstall = async () => {
    const success = await install();
    if (success) {
      setInstalledSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-5 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl text-slate-800 dark:text-slate-100 flex flex-col overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Installer VentureFlow sur votre appareil
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ajoutez l'application sur votre écran d'accueil (Mobile ou Desktop)
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

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Quick 1-Click Install if supported natively */}
          {isInstallable && !installedSuccess && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-2">
              <div className="font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Installation automatique détectée</span>
              </div>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
                Votre navigateur supporte l'installation directe en 1 clic. Cliquez ci-dessous pour ajouter immédiatement VentureFlow à vos applications.
              </p>
              <button
                type="button"
                onClick={handleDirectInstall}
                className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Installer l'application maintenant</span>
              </button>
            </div>
          )}

          {installedSuccess && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>Application installée avec succès ! Vous pouvez maintenant la lancer depuis votre écran d'accueil.</span>
            </div>
          )}

          {/* Device Tabs for Step-by-Step Instructions */}
          <div className="space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Instructions pas à pas selon votre appareil :
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setDeviceTab('desktop')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  deviceTab === 'desktop'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Ordinateur (PC / Mac)</span>
              </button>

              <button
                type="button"
                onClick={() => setDeviceTab('android')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  deviceTab === 'android'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile Android</span>
              </button>

              <button
                type="button"
                onClick={() => setDeviceTab('ios')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  deviceTab === 'ios'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>iPhone / iPad</span>
              </button>
            </div>

            {/* Desktop Guide */}
            {deviceTab === 'desktop' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-[11px] leading-relaxed">
                <ol className="list-decimal list-inside space-y-1.5">
                  <li>Sur <strong>Google Chrome</strong>, <strong>Microsoft Edge</strong> ou <strong>Brave</strong>, repérez l'icône d'installation dans la barre d'adresse à droite (ordinateur avec une flèche vers le bas).</li>
                  <li>Cliquez sur <strong>« Installer VentureFlow »</strong>.</li>
                  <li>Une fenêtre autonome dédiée s'ouvrira, indépendante de votre navigateur habituel, avec une icône dans votre barre des tâches / Dock.</li>
                </ol>
              </div>
            )}

            {/* Android Guide */}
            {deviceTab === 'android' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-[11px] leading-relaxed">
                <ol className="list-decimal list-inside space-y-1.5">
                  <li>Ouvrez l'application dans <strong>Google Chrome</strong> sur votre smartphone.</li>
                  <li>Touchez le menu des <strong>trois points verticaux (⋮)</strong> en haut à droite.</li>
                  <li>Sélectionnez <strong>« Ajouter à l'écran d'accueil »</strong> ou <strong>« Installer l'application »</strong>.</li>
                  <li>L'icône VentureFlow apparaîtra parmi vos applications avec support hors ligne complet.</li>
                </ol>
              </div>
            )}

            {/* iOS Guide */}
            {deviceTab === 'ios' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-[11px] leading-relaxed">
                <ol className="list-decimal list-inside space-y-1.5">
                  <li>Ouvrez le site dans <strong>Safari</strong> (les autres navigateurs iOS ne permettent pas l'installation native).</li>
                  <li>Touchez l'icône de <strong>Partage</strong> (le carré avec une flèche vers le haut au centre de la barre d'outils inférieure).</li>
                  <li>Faites défiler vers le bas et touchez <strong>« Sur l'écran d'accueil »</strong>.</li>
                  <li>Touchez <strong>« Ajouter »</strong> en haut à droite. L'icône VentureFlow sera accessible directement sur votre écran comme une application native.</li>
                </ol>
              </div>
            )}
          </div>

          {/* Benefits */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>100% Fonctionnel Hors Ligne</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
              <span>Lancement instantané</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 flex justify-end">
          <button
            type="button"
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
