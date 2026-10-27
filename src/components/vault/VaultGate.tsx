import React, { useState } from 'react';
import { ShieldCheck, Lock, KeyRound, Fingerprint, AlertCircle, FileUp, Sparkles, Check, Sun, Moon } from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { useTheme } from '../../context/ThemeContext';
import { APP_VERSION } from '../../context/SystemUpdateContext';

export const VaultGate: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const {
    status,
    metadata,
    passkeySupport,
    hasPasskeyEnrolled,
    initializeVault,
    unlockWithPassphrase,
    unlockWithPasskey,
    importEncryptedBackup,
  } = useVault();

  // Setup state
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [enablePasskey, setEnablePasskey] = useState(true);
  const [seedDemo, setSeedDemo] = useState(true);

  // Unlock state
  const [unlockPassword, setUnlockPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Backup restore state
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreJson, setRestoreJson] = useState('');
  const [restorePassphrase, setRestorePassphrase] = useState('');

  const handleCreateVault = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (passphrase.length < 8) {
      setErrorMsg('La phrase secrète doit comporter au moins 8 caractères.');
      return;
    }
    if (passphrase !== confirmPassphrase) {
      setErrorMsg('Les phrases secrètes saisies ne correspondent pas.');
      return;
    }

    setIsProcessing(true);
    try {
      await initializeVault(passphrase, enablePasskey, seedDemo);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erreur lors de la création du coffre');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnlockPassphrase = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const ok = await unlockWithPassphrase(unlockPassword);
      if (!ok) {
        setErrorMsg('Phrase secrète incorrecte ou intégrité du coffre compromise.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erreur de déchiffrement');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnlockPasskey = async () => {
    setErrorMsg(null);
    setIsProcessing(true);
    try {
      const ok = await unlockWithPasskey();
      if (!ok) {
        setErrorMsg('Échec de la validation biométrique. Utilisez votre phrase secrète de secours.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erreur Passkey');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setRestoreJson((event.target?.result as string) || '');
    };
    reader.readAsText(file);
  };

  const handleExecuteRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!restoreJson) {
      setErrorMsg('Veuillez sélectionner un fichier de sauvegarde JSON valide.');
      return;
    }

    setIsProcessing(true);
    try {
      const success = await importEncryptedBackup(restoreJson, restorePassphrase);
      if (success) {
        setShowRestoreModal(false);
      } else {
        setErrorMsg('Sauvegarde importée mais déchiffrement échoué : vérifiez votre phrase secrète.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erreur lors de la restauration de la sauvegarde');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-emerald-500/20 transition-colors relative">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs hover:border-emerald-500 transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Basculer en thème Clair' : 'Basculer en thème Sombre'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 mb-3 shadow-lg">
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">VentureFlow</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            CRM & Valorisation de Startups · Architecture Local-First & Chiffrement Client AES-256-GCM
          </p>
        </div>

        {/* Error banner */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {/* State 1: Uninitialized Vault (Setup) */}
        {status === 'uninitialized' && (
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xs transition-colors">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                Initialisation du Coffre Local
              </h2>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
              Aucun compte centralisé n'est requis. Vos données d'investissement, valorisations et notes
              sont chiffrées sur votre appareil avec une clé <strong>AES-256-GCM</strong> scellée par votre phrase secrète.
            </p>

            <form onSubmit={handleCreateVault} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Phrase secrète principale (Master Passphrase)
                </label>
                <input
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Min. 8 caractères recommandés..."
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirmer la phrase secrète
                </label>
                <input
                  type="password"
                  value={confirmPassphrase}
                  onChange={(e) => setConfirmPassphrase(e.target.value)}
                  placeholder="Répétez la phrase secrète..."
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {passkeySupport.isSupported && (
                <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enablePasskey}
                    onChange={(e) => setEnablePasskey(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-0"
                  />
                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                    <span className="font-medium text-slate-900 dark:text-white">Activer le déverrouillage Passkey</span>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      Touch ID / Face ID / Windows Hello pour déverrouiller rapidement sans retaper la phrase.
                    </p>
                  </div>
                </label>
              )}

              <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={seedDemo}
                  onChange={(e) => setSeedDemo(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-0"
                />
                <div className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                  <span className="font-medium text-slate-900 dark:text-white">Charger des dossiers de démonstration</span>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Injecte 4 startups réalistes (Santé IA, Climat, Robotique, Fintech) avec scoring et due diligence.
                  </p>
                </div>
              </label>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 mt-4"
              >
                {isProcessing ? 'Génération de la clé...' : 'Créer et sceller mon coffre local'}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
              <button
                onClick={() => setShowRestoreModal(true)}
                className="text-xs text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>Restaurer une sauvegarde chiffrée existante</span>
              </button>
            </div>
          </div>
        )}

        {/* State 2: Locked Vault (Unlock) */}
        {status === 'locked' && (
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xs transition-colors">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  Coffre Sécurisé Verrouillé
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">v{APP_VERSION || '2.1'} Client Crypto</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
              Vos données financières sont chiffrées au repos dans IndexedDB. Déverrouillez la session pour
              charger la clé de déchiffrement en mémoire vive éphémère.
            </p>

            {hasPasskeyEnrolled && passkeySupport.isSupported && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleUnlockPasskey}
                  disabled={isProcessing}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <Fingerprint className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Déverrouiller avec Passkey / Biométrie</span>
                </button>
                <div className="relative flex py-3 items-center">
                  <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
                  <span className="shrink mx-3 text-slate-400 dark:text-slate-500 text-[11px]">ou phrase secrète</span>
                  <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
                </div>
              </div>
            )}

            <form onSubmit={handleUnlockPassphrase} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Phrase secrète de déverrouillage
                </label>
                <input
                  type="password"
                  value={unlockPassword}
                  onChange={(e) => setUnlockPassword(e.target.value)}
                  placeholder="Saisissez votre phrase secrète..."
                  required
                  autoFocus
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                {isProcessing ? 'Déchiffrement...' : 'Ouvrir le coffre'}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <button
                onClick={() => setShowRestoreModal(true)}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>Restaurer une archive</span>
              </button>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">250 000 itérations PBKDF2</span>
            </div>
          </div>
        )}

        {/* Restore Backup Modal */}
        {showRestoreModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-semibold uppercase tracking-wide">
                  Restaurer une sauvegarde chiffrée
                </h3>
                <button
                  onClick={() => setShowRestoreModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleExecuteRestore} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Fichier de sauvegarde (.json)
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Phrase secrète associée à cette sauvegarde
                  </label>
                  <input
                    type="password"
                    value={restorePassphrase}
                    onChange={(e) => setRestorePassphrase(e.target.value)}
                    placeholder="Phrase secrète du coffre..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRestoreModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing || !restoreJson}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-semibold text-xs rounded transition-colors"
                  >
                    Restaurer le coffre
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Security guarantee footer note */}
        <div className="mt-6 text-center text-[11px] text-slate-400 leading-relaxed px-4">
          <p>
            Conforme au Cahier des charges VentureFlow v2.0 : aucune clé ni donnée financière n'est transmise
            vers des serveurs distants ou des services d'IA sans consentement explicite.
          </p>
        </div>
      </div>
    </div>
  );
};
