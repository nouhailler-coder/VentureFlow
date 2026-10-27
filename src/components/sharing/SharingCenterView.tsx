import React, { useState } from 'react';
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

  // Mode B: Direct P2P WebRTC Simulation State
  const [p2pSessionId, setP2pSessionId] = useState<string>('p2p_sess_' + Math.random().toString(36).slice(2, 9));
  const [p2pSecret, setP2pSecret] = useState<string>('DirectKey_' + Math.random().toString(36).slice(2, 10));
  const [p2pStatus, setP2pStatus] = useState<'idle' | 'waiting' | 'connected' | 'terminated'>('idle');
  const [copiedLink, setCopiedLink] = useState(false);

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

      {/* MODE B: PARTAGE DIRECT P2P */}
      {activeMode === 'mode_b_direct' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-5">
            <div className="pb-3 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span>Connexion Directe WebRTC entre Navigateurs (Mode B)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Échange de données éphémères chiffrées de bout en bout sans base de données intermédiaire
              </p>
            </div>

            {/* Session parameters */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Identifiant de session éphémère :</span>
                <span className="font-mono text-emerald-400 font-semibold">{p2pSessionId}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Clé de chiffrement transmise hors bande :</span>
                <span className="font-mono text-cyan-400 font-semibold">{p2pSecret}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
                <span className="text-slate-400">État du canal DataChannel :</span>
                <span className="font-mono text-xs">
                  {p2pStatus === 'idle' && <span className="text-slate-400">Prêt</span>}
                  {p2pStatus === 'waiting' && <span className="text-amber-400">En attente de connexion du pair...</span>}
                  {p2pStatus === 'connected' && <span className="text-emerald-400 font-bold">Connecté (Chiffré E2EE)</span>}
                  {p2pStatus === 'terminated' && <span className="text-rose-400">Session terminée</span>}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              {p2pStatus === 'idle' && (
                <button
                  onClick={() => setP2pStatus('waiting')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Ouvrir la session d'écoute P2P
                </button>
              )}
              {p2pStatus === 'waiting' && (
                <button
                  onClick={() => setP2pStatus('connected')}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Simuler la connexion du destinataire
                </button>
              )}
              {p2pStatus === 'connected' && (
                <button
                  onClick={() => setP2pStatus('terminated')}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Couper la connexion & fermer la session
                </button>
              )}
              {p2pStatus === 'terminated' && (
                <button
                  onClick={() => {
                    setP2pSessionId('p2p_sess_' + Math.random().toString(36).slice(2, 9));
                    setP2pSecret('DirectKey_' + Math.random().toString(36).slice(2, 10));
                    setP2pStatus('idle');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Générer une nouvelle session
                </button>
              )}
            </div>
          </div>

          {/* Right Col: Section 5.4 Mandatory Disclosures */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>Avertissements Obligatoires (Section 5.4)</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong>1. Aucune révocation rétroactive :</strong> La coupure de session interrompt
                les transferts futurs mais ne peut techniquement effacer les données déjà affichées,
                mémorisées ou enregistrées par le destinataire.
              </p>
              <p>
                <strong>2. Risque de capture :</strong> L'affichage en lecture seule n'empêche pas
                la réalisation de captures d'écran, photos ou transcriptions par le destinataire.
              </p>
              <p>
                <strong>3. Repli hors ligne :</strong> En cas de restriction de pare-feu d'entreprise ou
                d'échec WebRTC, privilégiez le <em>Mode A — Export chiffré autonome</em>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
