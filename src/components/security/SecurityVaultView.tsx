import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Fingerprint,
  Download,
  FileCheck2,
  AlertTriangle,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Printer,
  Lock,
  Eye,
} from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { runCryptographicSelfTests, CryptoTestResult } from '../../crypto/vaultCrypto';

export const SecurityVaultView: React.FC = () => {
  const {
    metadata,
    hasPasskeyEnrolled,
    passkeySupport,
    autoLockMinutes,
    setAutoLockMinutes,
    changePassphrase,
    enrollPasskey,
    removePasskey,
    exportEncryptedBackup,
    resetEntireVault,
    runSecurityAudit,
  } = useVault();

  // Passphrase change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [passphraseStatusMsg, setPassphraseStatusMsg] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Passkey enrollment state
  const [passkeyPassphrase, setPasskeyPassphrase] = useState('');
  const [showPasskeyPrompt, setShowPasskeyPrompt] = useState(false);
  const [passkeyMsg, setPasskeyMsg] = useState<string | null>(null);

  // Self-test suite state
  const [testResults, setTestResults] = useState<CryptoTestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Storage audit state
  const [auditResult, setAuditResult] = useState<{
    totalIndexedDbRecords: number;
    totalLocalStorageItems: number;
    unencryptedBusinessStringsFound: string[];
    isClean: boolean;
    sampleCiphertextHashes: string[];
  } | null>(null);
  const [isRunningAudit, setIsRunningAudit] = useState(false);

  // Emergency sheet modal
  const [showEmergencySheet, setShowEmergencySheet] = useState(false);

  const handleChangePassphrase = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassphraseStatusMsg(null);
    if (newPass.length < 8) {
      setPassphraseStatusMsg({ type: 'error', msg: 'La nouvelle phrase secrète doit comporter au moins 8 caractères.' });
      return;
    }
    if (newPass !== confirmNewPass) {
      setPassphraseStatusMsg({ type: 'error', msg: 'Les nouvelles phrases secrètes ne correspondent pas.' });
      return;
    }

    try {
      await changePassphrase(currentPass, newPass);
      setPassphraseStatusMsg({ type: 'success', msg: 'Phrase secrète mise à jour et clé maîtresse ré-enveloppée avec succès.' });
      setCurrentPass('');
      setNewPass('');
      setConfirmNewPass('');
    } catch (err: any) {
      setPassphraseStatusMsg({ type: 'error', msg: err?.message || 'Erreur lors du changement de phrase secrète.' });
    }
  };

  const handleEnrollPasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasskeyMsg(null);
    try {
      await enrollPasskey(passkeyPassphrase);
      setShowPasskeyPrompt(false);
      setPasskeyPassphrase('');
      setPasskeyMsg('Passkey enregistrée avec succès pour cet appareil.');
    } catch (err: any) {
      setPasskeyMsg('Erreur Passkey : ' + (err?.message || 'Échec'));
    }
  };

  const handleExecuteTests = async () => {
    setIsRunningTests(true);
    try {
      const results = await runCryptographicSelfTests();
      setTestResults(results);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleExecuteAudit = async () => {
    setIsRunningAudit(true);
    try {
      const audit = await runSecurityAudit();
      setAuditResult(audit);
    } finally {
      setIsRunningAudit(false);
    }
  };

  const handleDownloadBackup = async () => {
    const backupJson = await exportEncryptedBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ventureflow-vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Run audit once on mount
  useEffect(() => {
    handleExecuteAudit();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Centre de Sécurité & Coffre Local</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Architecture cryptographique AES-256-GCM, passkeys, sauvegarde souveraine et audits de non-divulgation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmergencySheet(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fiche de Récupération d'Urgence</span>
          </button>
        </div>
      </div>

      {/* Grid: Cryptographic status + Auto-lock interval */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">Algorithme Métier</span>
          <div className="text-lg font-bold text-emerald-400 font-mono mt-1">
            AES-256-GCM
          </div>
          <div className="text-xs text-slate-400 mt-1">
            IV unique 96 bits / Clé DEK 256 bits scellée
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">Dérivation Phrase Secrète</span>
          <div className="text-lg font-bold text-white font-mono mt-1">
            PBKDF2-SHA-256
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {metadata?.iterations.toLocaleString()} itérations · Sel 128 bits
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">Verrouillage d'Inactivité</span>
          <div className="mt-1">
            <select
              value={autoLockMinutes}
              onChange={(e) => setAutoLockMinutes(parseInt(e.target.value))}
              className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-emerald-400 font-medium cursor-pointer"
            >
              <option value={5}>5 minutes</option>
              <option value={15}>15 minutes (Recommandé)</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 heure</option>
              <option value={0}>Désactivé (Non recommandé)</option>
            </select>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Verrouille aussi lors du basculement d'onglet
          </div>
        </div>
      </div>

      {/* Section 11: Cryptographic Self-Tests */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Banc de Tests Cryptographiques (Section 11)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Exécute en direct les vecteurs de test AES-GCM, PBKDF2 et détection de falsification d'authentification
            </p>
          </div>

          <button
            onClick={handleExecuteTests}
            disabled={isRunningTests}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunningTests ? 'Exécution des tests...' : 'Lancer les tests en direct'}</span>
          </button>
        </div>

        {testResults.length === 0 ? (
          <div className="text-xs text-slate-500 italic py-2">
            Cliquez sur "Lancer les tests en direct" pour auditer le moteur cryptographique Web Crypto.
          </div>
        ) : (
          <div className="space-y-2.5">
            {testResults.map((t, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-start justify-between text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-medium text-white">
                    {t.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{t.name}</span>
                  </div>
                  <div className="text-slate-400 text-[11px] pl-6">{t.details}</div>
                </div>

                <div className="font-mono tabular-nums text-slate-500 text-[11px] shrink-0 pl-3">
                  {t.durationMs} ms
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Zero-Leakage Storage Audit Inspector */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Inspecteur de Non-Divulgation en Stockage Local</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Vérification stricte de l'absence de chaînes en clair (startups, valorisations, notes) dans IndexedDB et localStorage
            </p>
          </div>

          <button
            onClick={handleExecuteAudit}
            disabled={isRunningAudit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <span>Ré-inspecter le stockage</span>
          </button>
        </div>

        {auditResult && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs">
              {auditResult.isClean ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <div className="text-slate-200">
                {auditResult.isClean ? (
                  <span>
                    <strong>Statut Conforme :</strong> 100% des {auditResult.totalIndexedDbRecords} enregistrements métier
                    sont des blocs chiffrés AES-256. Zéro donnée financière détectée en clair.
                  </span>
                ) : (
                  <span className="text-rose-400 font-semibold">
                    Anomalie détectée : {auditResult.unencryptedBusinessStringsFound.join(', ')}
                  </span>
                )}
              </div>
            </div>

            {/* Ciphertext samples proof */}
            <div>
              <div className="text-[11px] font-medium text-slate-400 mb-1.5">
                Échantillons des enregistrements persistés au repos (Empreintes de chiffrement) :
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px] text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-800">
                {auditResult.sampleCiphertextHashes.map((s, idx) => (
                  <div key={idx} className="truncate">
                    • {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Passkey enrollment & Passphrase change */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Passkey card */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Fingerprint className="w-4 h-4 text-emerald-400" />
              <span>Passkeys & Biométrie Locale (WebAuthn)</span>
            </h3>
            {hasPasskeyEnrolled ? (
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                Active
              </span>
            ) : (
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                Non configurée
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Permet de déverrouiller ce coffre sur cet appareil avec Touch ID, Face ID ou Windows Hello
            sans renvoyer la biométrie hors de l'OS.
          </p>

          {passkeyMsg && (
            <div className="p-2.5 bg-slate-950 border border-slate-800 text-xs text-emerald-400 rounded">
              {passkeyMsg}
            </div>
          )}

          {hasPasskeyEnrolled ? (
            <button
              onClick={async () => {
                if (confirm('Désactiver la passkey sur cet appareil ?')) {
                  await removePasskey();
                  setPasskeyMsg('Passkey désactivée.');
                }
              }}
              className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-900/50 text-rose-300 rounded text-xs font-medium transition-colors cursor-pointer"
            >
              Désactiver la passkey locale
            </button>
          ) : (
            <div>
              {!showPasskeyPrompt ? (
                <button
                  onClick={() => setShowPasskeyPrompt(true)}
                  disabled={!passkeySupport.isSupported}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 font-semibold text-xs rounded transition-colors cursor-pointer"
                >
                  {passkeySupport.isSupported ? 'Enregistrer une Passkey' : 'WebAuthn non supporté ici'}
                </button>
              ) : (
                <form onSubmit={handleEnrollPasskey} className="space-y-3">
                  <input
                    type="password"
                    placeholder="Confirmez votre phrase secrète..."
                    value={passkeyPassphrase}
                    onChange={(e) => setPasskeyPassphrase(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPasskeyPrompt(false)}
                      className="px-3 py-1 text-xs text-slate-400"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-emerald-600 text-slate-950 text-xs font-semibold rounded"
                    >
                      Autoriser dans le navigateur
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Change Passphrase card */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span>Changement de Phrase Secrète</span>
            </h3>
          </div>

          <form onSubmit={handleChangePassphrase} className="space-y-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Phrase secrète actuelle</label>
              <input
                type="password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Nouvelle phrase secrète (min. 8 car.)</label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Confirmer la nouvelle phrase secrète</label>
              <input
                type="password"
                value={confirmNewPass}
                onChange={(e) => setConfirmNewPass(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                required
              />
            </div>

            {passphraseStatusMsg && (
              <div
                className={`p-2 rounded text-xs ${
                  passphraseStatusMsg.type === 'success'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-900'
                    : 'bg-rose-950/60 text-rose-300 border border-rose-900'
                }`}
              >
                {passphraseStatusMsg.msg}
              </div>
            )}

            <button
              type="submit"
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors cursor-pointer"
            >
              Mettre à jour la clé de coffre
            </button>
          </form>
        </div>
      </div>

      {/* Backup & Wipe Zone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Encrypted Backup */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Sauvegarde Chiffrée Complète</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Téléchargez l'archive intégrale de vos dossiers (startups, valorisations, due diligence).
            Le fichier est chiffré avec votre clé de coffre et ne peut être lu sans votre phrase secrète.
          </p>
          <button
            onClick={handleDownloadBackup}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Télécharger l'archive chiffrée (.json)</span>
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-rose-950/20 border border-rose-900/50 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <Trash2 className="w-4 h-4" />
            <span>Effacement Intégral du Coffre Local</span>
          </h3>
          <p className="text-xs text-rose-300/80 leading-relaxed">
            Supprime définitivement la clé maîtresse, les métadonnées et tous les dossiers d'investissement d'IndexedDB
            sur cette machine. Cette action est irréversible en l'absence de sauvegarde exportée.
          </p>
          <button
            onClick={async () => {
              if (confirm('ATTENTION : Voulez-vous vraiment effacer l\'intégralité du coffre sur ce navigateur ?')) {
                await resetEntireVault();
              }
            }}
            className="px-3.5 py-2 bg-rose-900/80 hover:bg-rose-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Purger définitivement toutes les données locales
          </button>
        </div>
      </div>

      {/* Emergency Sheet Modal */}
      {showEmergencySheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
                Fiche de Récupération d'Urgence VentureFlow
              </h3>
              <button onClick={() => setShowEmergencySheet(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3 text-xs leading-relaxed">
              <div className="font-semibold text-emerald-400">
                Protocole de Récupération en Cas de Perte d'Appareil :
              </div>
              <p>
                1. <strong>Principe de Zéro-Connaissance :</strong> Aucune copie de votre clé ou de votre phrase secrète
                n'est détenue par l'éditeur ou un serveur cloud.
              </p>
              <p>
                2. <strong>Restauration :</strong> Pour restaurer vos dossiers sur un nouvel appareil ou après réinitialisation,
                vous avez impérativement besoin de :
              </p>
              <ul className="list-disc list-inside pl-2 space-y-1 text-slate-300">
                <li>Votre fichier de sauvegarde exporté (ex: <code>ventureflow-vault-backup.json</code>)</li>
                <li>Votre phrase secrète maîtresse</li>
              </ul>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded font-mono text-[11px] text-slate-400 space-y-1">
                <div>Format du Coffre : VentureFlow v2.0</div>
                <div>Algorithme : AES-256-GCM / PBKDF2-SHA-256 ({metadata?.iterations} itérations)</div>
                <div>Sel dérivé : {metadata?.saltBase64.slice(0, 16)}...</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer / Sauvegarder PDF</span>
              </button>
              <button
                onClick={() => setShowEmergencySheet(false)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-semibold rounded cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
