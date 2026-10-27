import React, { useState, useRef, useEffect } from 'react';
import {
  Share2,
  FileCode,
  Wifi,
  Lock,
  Download,
  Eye,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  FolderLock,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Send,
  Inbox,
  Radio,
} from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import {
  prepareSelectiveDataPackage,
  createEncryptedPackage,
  generateAutonomousHtmlReport,
  decryptExportPackage,
  EncryptedExportFile,
  ExportPackageData,
} from '../../services/shareService';
import {
  P2PShareSession,
  P2PConnectionState,
} from '../../services/p2pShareService';
import { ShareExportFilter } from '../../types';

export const SharingCenterView: React.FC = () => {
  const { startups, analyses, financials, valuations, dueDiligence } = useVault();

  type SharingMode = 'mode_a_export' | 'mode_a_viewer' | 'mode_b_direct';
  const [activeMode, setActiveMode] = useState<SharingMode>('mode_a_export');

  // Mode A: Exporter State
  const [selectedStartupId, setSelectedStartupId] = useState<string>(startups[0]?.id || '');
  const [includeGeneralInfo, setIncludeGeneralInfo] = useState(true);
  const [includeFinancials, setIncludeFinancials] = useState(true);
  const [includeValuation, setIncludeValuation] = useState(true);
  const [includeDueDiligence, setIncludeDueDiligence] = useState(true);
  const [includePrivateNotes, setIncludePrivateNotes] = useState(false); // DEFAULT FALSE as mandated
  const [customRecipientNote, setCustomRecipientNote] = useState('');
  const [recipientPassphrase, setRecipientPassphrase] = useState('SecretPartage2026!#');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessNotice, setExportSuccessNotice] = useState<string | null>(null);

  // Mode A: Viewer State (for inspecting received .ventureflow packages)
  const [viewerRawJson, setViewerRawJson] = useState('');
  const [viewerPassphrase, setViewerPassphrase] = useState('');
  const [decryptedViewerData, setDecryptedViewerData] = useState<ExportPackageData | null>(null);
  const [viewerError, setViewerError] = useState<string | null>(null);

  // Mode B: Real WebRTC P2P Direct State
  const [p2pRole, setP2pRole] = useState<'sender' | 'receiver'>('sender');
  const [p2pSessionId, setP2pSessionId] = useState<string>(() => 'p2p_' + Math.random().toString(36).slice(2, 9));
  const [p2pSecret, setP2pSecret] = useState<string>('P2PKey_' + Math.random().toString(36).slice(2, 8));
  const [p2pStatus, setP2pStatus] = useState<P2PConnectionState>('idle');
  const [p2pStatusDetail, setP2pStatusDetail] = useState<string>('Prêt pour partage direct WebRTC.');
  const [p2pOfferToken, setP2pOfferToken] = useState<string>('');
  const [p2pAnswerToken, setP2pAnswerToken] = useState<string>('');
  const [p2pInputToken, setP2pInputToken] = useState<string>('');
  const [p2pReceivedPackage, setP2pReceivedPackage] = useState<EncryptedExportFile | null>(null);
  const [p2pDecryptedData, setP2pDecryptedData] = useState<ExportPackageData | null>(null);
  const [p2pDecryptionKey, setP2pDecryptionKey] = useState<string>('');
  const [p2pError, setP2pError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const p2pSessionRef = useRef<P2PShareSession | null>(null);

  // Clean up P2P session on unmount
  useEffect(() => {
    return () => {
      if (p2pSessionRef.current) {
        p2pSessionRef.current.close();
      }
    };
  }, []);

  const selectedStartup = startups.find((s) => s.id === selectedStartupId);

  // Mode A: Download Autonomous HTML File
  const handleExportHtml = async () => {
    if (!selectedStartup) return;
    if (recipientPassphrase.length < 6) {
      alert('Veuillez définir une phrase secrète de partage d\'au moins 6 caractères.');
      return;
    }

    setIsExporting(true);
    try {
      const filter: ShareExportFilter = {
        startupId: selectedStartup.id,
        includeGeneralInfo,
        includeFinancials,
        includeValuation,
        includeDueDiligence,
        includePrivateNotes,
        customNoteForRecipient: customRecipientNote,
      };

      const pkgData = prepareSelectiveDataPackage(
        filter,
        selectedStartup,
        analyses[selectedStartup.id],
        financials[selectedStartup.id],
        valuations[selectedStartup.id],
        dueDiligence[selectedStartup.id]
      );

      const encPkg = await createEncryptedPackage(pkgData, recipientPassphrase);
      const htmlContent = generateAutonomousHtmlReport(encPkg, selectedStartup.name);

      // Trigger download
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ventureflow-report-${selectedStartup.name.toLowerCase().replace(/\s+/g, '-')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccessNotice(
        `Rapport autonome généré avec succès ! Remettez le fichier et le secret par deux canaux distincts (ex: email + Signal).`
      );
    } catch (err: any) {
      alert('Erreur lors de la génération : ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Mode A: Download Raw Encrypted .ventureflow bundle
  const handleExportJsonBundle = async () => {
    if (!selectedStartup) return;
    setIsExporting(true);
    try {
      const filter: ShareExportFilter = {
        startupId: selectedStartup.id,
        includeGeneralInfo,
        includeFinancials,
        includeValuation,
        includeDueDiligence,
        includePrivateNotes,
        customNoteForRecipient: customRecipientNote,
      };

      const pkgData = prepareSelectiveDataPackage(
        filter,
        selectedStartup,
        analyses[selectedStartup.id],
        financials[selectedStartup.id],
        valuations[selectedStartup.id],
        dueDiligence[selectedStartup.id]
      );

      const encPkg = await createEncryptedPackage(pkgData, recipientPassphrase);

      const blob = new Blob([JSON.stringify(encPkg, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedStartup.name.toLowerCase().replace(/\s+/g, '-')}.ventureflow`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccessNotice('Paquet .ventureflow chiffré téléchargé.');
    } catch (err: any) {
      alert('Erreur : ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Mode A: Decrypt and View Package in In-App Sandbox
  const handleDecryptViewer = async (e: React.FormEvent) => {
    e.preventDefault();
    setViewerError(null);
    try {
      const parsed = JSON.parse(viewerRawJson) as EncryptedExportFile;
      const decrypted = await decryptExportPackage(parsed, viewerPassphrase);
      setDecryptedViewerData(decrypted);
    } catch (err: any) {
      setViewerError(
        'Impossible de déchiffrer : format invalide ou phrase secrète incorrecte.'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Centre de Partage Sélectif & Chiffré</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Transmission en lecture seule sans serveur de stockage tiers · Deux modes conformes au cahier des charges
          </p>
        </div>

        {/* Mode switcher tabs */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setActiveMode('mode_a_export')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeMode === 'mode_a_export' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mode A : Export Autonome
          </button>
          <button
            onClick={() => setActiveMode('mode_a_viewer')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeMode === 'mode_a_viewer' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Visualiseur de Paquet
          </button>
          <button
            onClick={() => setActiveMode('mode_b_direct')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeMode === 'mode_b_direct' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mode B : Partage Direct P2P
          </button>
        </div>
      </div>

      {exportSuccessNotice && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-lg text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{exportSuccessNotice}</span>
          </div>
          <button onClick={() => setExportSuccessNotice(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* MODE A: EXPORT CHIFFRÉ AUTONOME */}
      {activeMode === 'mode_a_export' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-5">
            <div className="pb-3 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-slate-100">
                1. Sélection des Sections & Filtrage des Données
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Sélection granulaire des rubriques autorisées. Le destinataire ne recevra que ce qui est coché.
              </p>
            </div>

            {/* Target Startup select */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Startup concernée
              </label>
              <select
                value={selectedStartupId}
                onChange={(e) => setSelectedStartupId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold text-white cursor-pointer"
              >
                {startups.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.stage} · {s.sector})
                  </option>
                ))}
              </select>
            </div>

            {/* Checkboxes for fields */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeGeneralInfo}
                  onChange={(e) => setIncludeGeneralInfo(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-emerald-500"
                />
                <div className="text-xs">
                  <div className="font-medium text-white">Fiche de présentation & analyse qualitative</div>
                  <div className="text-[11px] text-slate-400">Nom, fondateurs, proposition de valeur, synthèse du marché et grille de scoring.</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFinancials}
                  onChange={(e) => setIncludeFinancials(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-emerald-500"
                />
                <div className="text-xs">
                  <div className="font-medium text-white">Indicateurs financiers & Projections (P&L, ARR, Runway)</div>
                  <div className="text-[11px] text-slate-400">Chiffre d'affaires historique, marges, EBITDA et projection de trésorerie.</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeValuation}
                  onChange={(e) => setIncludeValuation(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-emerald-500"
                />
                <div className="text-xs">
                  <div className="font-medium text-white">Modèles de valorisation retenus & fourchette pré-money</div>
                  <div className="text-[11px] text-slate-400">Multiples d'ARR, méthode VC et corridor d'évaluation calculé.</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDueDiligence}
                  onChange={(e) => setIncludeDueDiligence(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-emerald-500"
                />
                <div className="text-xs">
                  <div className="font-medium text-white">Synthèse des vérifications d'audit (Due Diligence)</div>
                  <div className="text-[11px] text-slate-400">Statut des 10 catégories d'audit et points validés sans les pièces jointes brutes.</div>
                </div>
              </label>

              {/* Private notes strictly opted-out */}
              <label className="flex items-start gap-3 p-3 bg-rose-950/20 border border-rose-900/50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePrivateNotes}
                  onChange={(e) => setIncludePrivateNotes(e.target.checked)}
                  className="mt-0.5 rounded border-rose-700 text-rose-500"
                />
                <div className="text-xs">
                  <div className="font-medium text-rose-300">Inclure les notes confidentielles internes (Déconseillé)</div>
                  <div className="text-[11px] text-rose-400/80">
                    Exclu par défaut. Ne cochez cette case que si le destinataire est un associé habilité du fonds.
                  </div>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Note personnalisée ou préambule d'introduction pour le destinataire
              </label>
              <textarea
                rows={2}
                value={customRecipientNote}
                onChange={(e) => setCustomRecipientNote(e.target.value)}
                placeholder="Ex : Document préparé pour la réunion du 12 novembre..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
              />
            </div>
          </div>

          {/* Right Col: Encryption Key & Output Actions */}
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span>2. Secret de Chiffrement Dédié</span>
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                Ce secret servira à dériver la clé AES-256-GCM du rapport. Le destinataire devra le saisir
                pour ouvrir le fichier.
              </p>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Phrase secrète de déchiffrement</label>
                <input
                  type="text"
                  value={recipientPassphrase}
                  onChange={(e) => setRecipientPassphrase(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-xs text-emerald-400 font-mono"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={handleExportHtml}
                  disabled={isExporting}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileCode className="w-4 h-4" />
                  <span>Télécharger HTML Autonome (.html)</span>
                </button>

                <button
                  onClick={handleExportJsonBundle}
                  disabled={isExporting}
                  className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Exporter paquet brut (.ventureflow)</span>
                </button>
              </div>
            </div>

            {/* Legal Disclaimers box */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-[11px] text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Rappel de Sécurité (Section 5.1 & 5.4)</span>
              </div>
              <p className="leading-relaxed">
                Le fichier exporté est totalement autonome et ne communique avec aucun serveur.
                Une fois remis au destinataire, il reste sous son contrôle et ne peut pas être rappelé
                à distance. Transmettez toujours la phrase secrète par un canal séparé (ex: messagerie chiffrée de bout en bout).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODE A: VIEWER SANDBOX */}
      {activeMode === 'mode_a_viewer' && (
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-5">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-100">
              Visualiseur de Paquet Partagé en Lecture Seule
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ouvrez un rapport chiffré reçu d'un tiers sans créer de compte ni toucher au cloud
            </p>
          </div>

          <form onSubmit={handleDecryptViewer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Contenu JSON du paquet chiffré (.ventureflow)
              </label>
              <textarea
                rows={6}
                value={viewerRawJson}
                onChange={(e) => setViewerRawJson(e.target.value)}
                placeholder="Collez ici le JSON chiffré..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300"
                required
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Phrase secrète fournie par l'émetteur
                </label>
                <input
                  type="password"
                  value={viewerPassphrase}
                  onChange={(e) => setViewerPassphrase(e.target.value)}
                  placeholder="Phrase secrète..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  required
                />
              </div>

              {viewerError && (
                <div className="p-3 bg-rose-950/60 border border-rose-900 rounded-lg text-xs text-rose-300">
                  {viewerError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Déchiffrer le rapport en bac à sable
              </button>
            </div>
          </form>

          {/* Decrypted inspection result */}
          {decryptedViewerData && (
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  Rapport déchiffré : {decryptedViewerData.startup.name}
                </h3>
                <span className="text-xs text-emerald-400 font-mono">Lecture seule certifiée</span>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div>
                  <span className="text-slate-400">Description : </span>
                  <span className="text-slate-200">{decryptedViewerData.startup.description}</span>
                </div>
                {decryptedViewerData.startup.targetAmount && (
                  <div>
                    <span className="text-slate-400">Montant recherché : </span>
                    <span className="text-emerald-400 font-bold font-mono">
                      {decryptedViewerData.startup.targetAmount.toLocaleString()} €
                    </span>
                  </div>
                )}
                {decryptedViewerData.analysis && (
                  <div>
                    <span className="text-slate-400">Score d'analyse : </span>
                    <span className="text-white font-mono font-bold">
                      {decryptedViewerData.analysis.compositeScore}/100
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE B: PARTAGE DIRECT P2P WEBRTC (RÉEL ET OPÉRATIONNEL) */}
      {activeMode === 'mode_b_direct' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 space-y-5 transition-colors shadow-xs">
            <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-emerald-500" />
                  <span>Partage Direct P2P entre Navigateurs (Mode B)</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Échange direct chiffré de bout en bout via WebRTC DataChannel · Zéro serveur de stockage intermédiaire
                </p>
              </div>

              {/* Sender / Receiver Toggle */}
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setP2pRole('sender');
                    setP2pError(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    p2pRole === 'sender'
                      ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Émetteur (Partager)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setP2pRole('receiver');
                    setP2pError(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    p2pRole === 'receiver'
                      ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>Récepteur (Ouvrir)</span>
                </button>
              </div>
            </div>

            {/* Status indicator bar */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">État du canal P2P :</span>
                <span className="font-mono font-semibold flex items-center gap-1.5">
                  {p2pStatus === 'idle' && <span className="text-slate-500">Inactif (Prêt)</span>}
                  {p2pStatus === 'generating_offer' && <span className="text-amber-500 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Préparation de l'offre...</span>}
                  {p2pStatus === 'waiting_for_peer' && <span className="text-amber-500 flex items-center gap-1"><Radio className="w-3.5 h-3.5 animate-pulse" /> En attente du pair...</span>}
                  {p2pStatus === 'connecting' && <span className="text-cyan-500 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Négociation WebRTC...</span>}
                  {p2pStatus === 'connected' && <span className="text-emerald-500 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Connecté (Chiffré E2EE)</span>}
                  {p2pStatus === 'transfer_complete' && <span className="text-emerald-500 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Transfert accompli</span>}
                  {p2pStatus === 'closed' && <span className="text-slate-500">Session fermée</span>}
                  {p2pStatus === 'error' && <span className="text-rose-500 font-bold">Erreur de connexion</span>}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">{p2pStatusDetail}</p>
            </div>

            {p2pError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-800 dark:text-rose-300">
                {p2pError}
              </div>
            )}

            {/* ROLE 1: SENDER FLOW */}
            {p2pRole === 'sender' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Startup à transmettre en direct :
                  </label>
                  <select
                    value={selectedStartupId}
                    onChange={(e) => setSelectedStartupId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  >
                    {startups.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.sector} · {s.stage})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Phrase secrète de déchiffrement (transmise hors-bande au destinataire) :
                  </label>
                  <input
                    type="text"
                    value={p2pSecret}
                    onChange={(e) => setP2pSecret(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl font-mono text-emerald-600 dark:text-emerald-400"
                  />
                </div>

                {p2pStatus === 'idle' && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!selectedStartup) return;
                      setP2pError(null);
                      try {
                        const filter: ShareExportFilter = {
                          startupId: selectedStartup.id,
                          includeGeneralInfo,
                          includeFinancials,
                          includeValuation,
                          includeDueDiligence,
                          includePrivateNotes,
                          customNoteForRecipient: customRecipientNote,
                        };
                        const pkgData = prepareSelectiveDataPackage(
                          filter,
                          selectedStartup,
                          analyses[selectedStartup.id],
                          financials[selectedStartup.id],
                          valuations[selectedStartup.id],
                          dueDiligence[selectedStartup.id]
                        );
                        const encPkg = await createEncryptedPackage(pkgData, p2pSecret);

                        const session = new P2PShareSession(
                          p2pSessionId,
                          (state, detail) => {
                            setP2pStatus(state);
                            if (detail) setP2pStatusDetail(detail);
                          },
                          () => {}
                        );
                        p2pSessionRef.current = session;
                        const offer = await session.createSenderOffer(encPkg);
                        setP2pOfferToken(offer);
                      } catch (err: any) {
                        setP2pError('Impossible de démarrer la session WebRTC : ' + err.message);
                      }
                    }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Wifi className="w-4 h-4" />
                    <span>Créer le canal WebRTC direct & Chiffrer le dossier</span>
                  </button>
                )}

                {/* Offer token box */}
                {p2pOfferToken && (
                  <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Étape 1 : Copiez le Token d'invitation WebRTC
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(p2pOfferToken);
                          setCopiedToken('offer');
                          setTimeout(() => setCopiedToken(null), 2000);
                        }}
                        className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold cursor-pointer"
                      >
                        {copiedToken === 'offer' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedToken === 'offer' ? 'Copié !' : 'Copier le token'}</span>
                      </button>
                    </div>
                    <textarea
                      readOnly
                      rows={3}
                      value={p2pOfferToken}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-[10px] text-slate-600 dark:text-slate-400 select-all"
                    />

                    {p2pStatus === 'waiting_for_peer' && (
                      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          Étape 2 : Collez le Token de réponse du destinataire
                        </span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Collez ici le token généré par le récepteur..."
                            value={p2pInputToken}
                            onChange={(e) => setP2pInputToken(e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              if (!p2pSessionRef.current || !p2pInputToken) return;
                              setP2pError(null);
                              try {
                                await p2pSessionRef.current.acceptReceiverAnswer(p2pInputToken.trim());
                              } catch (err: any) {
                                setP2pError('Token de réponse invalide : ' + err.message);
                              }
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
                          >
                            Valider
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ROLE 2: RECEIVER FLOW */}
            {p2pRole === 'receiver' && (
              <div className="space-y-4 text-xs">
                <div className="space-y-2">
                  <label className="block font-medium text-slate-700 dark:text-slate-300">
                    Collez le Token d'invitation WebRTC fourni par l'émetteur :
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Collez le token d'offre WebRTC reçu..."
                    value={p2pInputToken}
                    onChange={(e) => setP2pInputToken(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl font-mono text-xs"
                  />
                  {p2pStatus === 'idle' && (
                    <button
                      type="button"
                      disabled={!p2pInputToken.trim()}
                      onClick={async () => {
                        setP2pError(null);
                        try {
                          const session = new P2PShareSession(
                            p2pSessionId,
                            (state, detail) => {
                              setP2pStatus(state);
                              if (detail) setP2pStatusDetail(detail);
                            },
                            (receivedPkg) => {
                              setP2pReceivedPackage(receivedPkg);
                            }
                          );
                          p2pSessionRef.current = session;
                          const ansToken = await session.acceptSenderOffer(p2pInputToken.trim());
                          setP2pAnswerToken(ansToken);
                        } catch (err: any) {
                          setP2pError('Impossible de traiter l\'invitation WebRTC : ' + err.message);
                        }
                      }}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Inbox className="w-4 h-4" />
                      <span>Rejoindre la session WebRTC</span>
                    </button>
                  )}
                </div>

                {/* Receiver Answer token box */}
                {p2pAnswerToken && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Renvoyez ce Token de Réponse à l'émetteur :
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(p2pAnswerToken);
                          setCopiedToken('answer');
                          setTimeout(() => setCopiedToken(null), 2000);
                        }}
                        className="flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400 font-semibold cursor-pointer"
                      >
                        {copiedToken === 'answer' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedToken === 'answer' ? 'Copié !' : 'Copier la réponse'}</span>
                      </button>
                    </div>
                    <textarea
                      readOnly
                      rows={3}
                      value={p2pAnswerToken}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-[10px] text-slate-600 dark:text-slate-400 select-all"
                    />
                  </div>
                )}

                {/* Received package decryption prompt */}
                {p2pReceivedPackage && !p2pDecryptedData && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-3">
                    <div className="font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Paquet de données chiffré reçu directement par WebRTC !</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                      Saisissez la clé convenue séparément avec l'émetteur pour déchiffrer le rapport en mémoire vive :
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="Phrase secrète de déchiffrement..."
                        value={p2pDecryptionKey}
                        onChange={(e) => setP2pDecryptionKey(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const decrypted = await decryptExportPackage(p2pReceivedPackage, p2pDecryptionKey);
                            setP2pDecryptedData(decrypted);
                          } catch {
                            setP2pError('Déchiffrement échoué : phrase secrète incorrecte.');
                          }
                        }}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Déchiffrer
                      </button>
                    </div>
                  </div>
                )}

                {/* Display decrypted P2P Report */}
                {p2pDecryptedData && (
                  <div className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {p2pDecryptedData.startup.name}
                      </h3>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                        Lecture Seule P2P
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {p2pDecryptedData.startup.description}
                    </div>
                    {p2pDecryptedData.startup.targetAmount && (
                      <div className="text-xs">
                        <span className="text-slate-500">Montant levée : </span>
                        <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          {p2pDecryptedData.startup.targetAmount.toLocaleString('fr-FR')} €
                        </span>
                      </div>
                    )}
                    {p2pDecryptedData.analysis && (
                      <div className="text-xs">
                        <span className="text-slate-500">Score Composite VC : </span>
                        <span className="font-bold font-mono text-slate-900 dark:text-white">
                          {p2pDecryptedData.analysis.compositeScore}/100
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Session termination button */}
            {p2pStatus !== 'idle' && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (p2pSessionRef.current) {
                      p2pSessionRef.current.close();
                      p2pSessionRef.current = null;
                    }
                    setP2pStatus('closed');
                    setP2pOfferToken('');
                    setP2pAnswerToken('');
                    setP2pInputToken('');
                    setP2pReceivedPackage(null);
                    setP2pDecryptedData(null);
                    setP2pStatusDetail('Session P2P fermée et mémoire purgée.');
                  }}
                  className="px-3.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/50 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Fermer la session P2P & purger la mémoire
                </button>
              </div>
            )}
          </div>

          {/* Right Col: Section 5.4 Mandatory Disclosures */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-xs transition-colors">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>Avertissements Obligatoires (Section 5.4)</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                <strong>1. Aucune révocation rétroactive :</strong> La fermeture du canal DataChannel interrompt les transferts futurs mais ne peut techniquement effacer les données déjà affichées ou mémorisées par le récepteur.
              </p>
              <p>
                <strong>2. Risque de capture d'écran :</strong> L'affichage en lecture seule n'empêche pas la réalisation de captures d'écran ou transcriptions par le destinataire.
              </p>
              <p>
                <strong>3. Repli hors ligne garanti :</strong> Si les pare-feux d'entreprise stricts bloquent l'échange WebRTC direct sans serveur TURN tiers, privilégiez le <em>Mode A — Export chiffré autonome</em>, 100% hors-ligne.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
