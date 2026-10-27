import React, { useState } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed in standalone mode, suppress
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 rounded-md hover:bg-emerald-900/50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        title="Installer VentureFlow en PWA locale"
      >
        <Download className="w-3.5 h-3.5 text-emerald-400" />
        <span>Installer PWA</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 border border-slate-700/80 rounded-md hover:bg-slate-700/60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          title="Installer sur iPhone ou iPad"
        >
          <Share2 className="w-3.5 h-3.5 text-slate-300" />
          <span>Installer iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-semibold text-slate-100">Installer sur iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-4 text-xs text-slate-300 leading-relaxed space-y-2">
                Pour exécuter VentureFlow hors-ligne avec la sécurité WebAuthn locale :
              </p>
              <ol className="mt-3 text-xs text-slate-300 space-y-2 list-decimal list-inside bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <li>Touchez l'icône de <strong>Partage</strong> dans Safari.</li>
                <li>Faites défiler puis touchez <strong>Sur l'écran d'accueil</strong>.</li>
                <li>Validez : l'icône autonome apparaîtra sur votre appareil.</li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-md bg-slate-800 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
