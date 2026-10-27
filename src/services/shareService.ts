import {
  Startup,
  StartupAnalysis,
  FinancialModel,
  ValuationEstimate,
  DueDiligenceItem,
  ShareExportFilter,
} from '../types';
import {
  deriveKeyFromPassphrase,
  encryptData,
  decryptData,
  generateRandomBytes,
  arrayBufferToBase64,
  base64ToUint8Array,
  computeHmac,
  SALT_LENGTH_BYTES,
  PBKDF2_DEFAULT_ITERATIONS,
} from '../crypto/vaultCrypto';

export interface ExportPackageData {
  exportedAt: string;
  version: number;
  startup: Partial<Startup>;
  analysis?: Partial<StartupAnalysis>;
  financials?: FinancialModel;
  valuations?: ValuationEstimate[];
  dueDiligence?: DueDiligenceItem[];
  customNote?: string;
  securityNotice: string;
}

export interface EncryptedExportFile {
  format: 'VENTUREFLOW_ENCRYPTED_REPORT_V2';
  exportedAt: string;
  saltBase64: string;
  ivBase64: string;
  ciphertextBase64: string;
  iterations: number;
  integrityHmac: string;
}

/** Prepare sanitized data package according to selective sharing filter */
export function prepareSelectiveDataPackage(
  filter: ShareExportFilter,
  startup: Startup,
  analysis?: StartupAnalysis,
  financials?: FinancialModel,
  valuations?: ValuationEstimate[],
  dueDiligence?: DueDiligenceItem[]
): ExportPackageData {
  // Strip private notes if not explicitly included
  const sanitizedStartup: Partial<Startup> = {
    id: startup.id,
    name: startup.name,
    sector: startup.sector,
    stage: startup.stage,
    country: startup.country,
    city: startup.city,
    website: startup.website,
    foundedYear: startup.foundedYear,
    description: startup.description,
    valueProposition: startup.valueProposition,
    founders: startup.founders,
    targetAmount: startup.targetAmount,
    valuationAsked: startup.valuationAsked,
    currency: startup.currency,
    pipelineStage: startup.pipelineStage,
    tags: startup.tags,
    // Private notes strictly omitted unless user specifically opted in
    confidentialNotes: filter.includePrivateNotes ? startup.confidentialNotes : undefined,
  };

  let sanitizedAnalysis: Partial<StartupAnalysis> | undefined = undefined;
  if (analysis) {
    sanitizedAnalysis = {
      startupId: analysis.startupId,
      criteria: analysis.criteria,
      compositeScore: analysis.compositeScore,
      thesisFit: analysis.thesisFit,
      keyStrengths: analysis.keyStrengths,
      keyWeaknesses: analysis.keyWeaknesses,
      recommendation: analysis.recommendation,
      // Private internal notes omitted unless opted in
      recommendationNotes: filter.includePrivateNotes ? analysis.recommendationNotes : undefined,
    };
  }

  return {
    exportedAt: new Date().toISOString(),
    version: 2,
    startup: sanitizedStartup,
    analysis: filter.includeGeneralInfo ? sanitizedAnalysis : undefined,
    financials: filter.includeFinancials ? financials : undefined,
    valuations: filter.includeValuation ? valuations : undefined,
    dueDiligence: filter.includeDueDiligence ? dueDiligence : undefined,
    customNote: filter.customNoteForRecipient,
    securityNotice:
      'Rapport d\'analyse financière et d\'évaluation VentureFlow — Document strictement confidentiel transmis en lecture seule.',
  };
}

/** Encrypt a package with a dedicated recipient passphrase */
export async function createEncryptedPackage(
  payload: ExportPackageData,
  recipientPassphrase: string
): Promise<EncryptedExportFile> {
  const salt = generateRandomBytes(SALT_LENGTH_BYTES);
  const saltBase64 = arrayBufferToBase64(salt);
  const encryptionKey = await deriveKeyFromPassphrase(
    recipientPassphrase,
    salt,
    PBKDF2_DEFAULT_ITERATIONS
  );

  const enc = await encryptData(payload, encryptionKey);
  const hmac = await computeHmac(enc.ciphertextBase64, recipientPassphrase);

  return {
    format: 'VENTUREFLOW_ENCRYPTED_REPORT_V2',
    exportedAt: new Date().toISOString(),
    saltBase64,
    ivBase64: enc.ivBase64,
    ciphertextBase64: enc.ciphertextBase64,
    iterations: PBKDF2_DEFAULT_ITERATIONS,
    integrityHmac: hmac,
  };
}

/** Decrypt a received export file using recipient passphrase */
export async function decryptExportPackage(
  exportFile: EncryptedExportFile,
  recipientPassphrase: string
): Promise<ExportPackageData> {
  if (exportFile.format !== 'VENTUREFLOW_ENCRYPTED_REPORT_V2') {
    throw new Error('Format de fichier incompatible ou non reconnu.');
  }

  const salt = base64ToUint8Array(exportFile.saltBase64);
  const key = await deriveKeyFromPassphrase(
    recipientPassphrase,
    salt,
    exportFile.iterations || PBKDF2_DEFAULT_ITERATIONS
  );

  return decryptData<ExportPackageData>(
    exportFile.ciphertextBase64,
    exportFile.ivBase64,
    key
  );
}

/** Escape HTML special characters for safe injection into markup */
export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generate Standalone Offline HTML Report (Mode A)
 * Produces an autonomous HTML document with zero external server dependencies,
 * containing the encrypted bundle and an inline Web Crypto decryption viewer.
 * Strictly protected against XSS injections via safe DOM APIs and strict CSP.
 */
export function generateAutonomousHtmlReport(
  encryptedPackage: EncryptedExportFile,
  startupName: string
): string {
  const safeTitle = escapeHtml(startupName);
  const packageJson = JSON.stringify(encryptedPackage)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e');

  return `<!DOCTYPE html>
<html lang="fr" class="bg-slate-950 text-slate-100">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none';">
  <title>VentureFlow — Rapport Confidentiel : ${safeTitle}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #090D16; color: #F1F5F9; line-height: 1.5; padding: 24px; }
    .container { max-width: 900px; margin: 0 auto; }
    .card { background: #0F172A; border: 1px solid #1E293B; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1E293B; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { font-size: 18px; font-weight: 700; color: #10B981; letter-spacing: -0.5px; }
    .badge { font-size: 11px; padding: 4px 8px; border-radius: 4px; background: rgba(16, 185, 129, 0.15); color: #34D399; font-weight: 600; text-transform: uppercase; }
    .input { width: 100%; padding: 10px 14px; background: #020617; border: 1px solid #334155; border-radius: 6px; color: #fff; font-size: 14px; margin-bottom: 12px; }
    .btn { padding: 10px 18px; background: #10B981; color: #020617; font-weight: 600; font-size: 14px; border: none; border-radius: 6px; cursor: pointer; transition: background 0.15s; }
    .btn:hover { background: #34D399; }
    .error { color: #F87171; font-size: 13px; margin-top: 8px; }
    .section-title { font-size: 15px; font-weight: 600; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .stat-box { background: #090D16; border: 1px solid #1E293B; border-radius: 8px; padding: 14px; }
    .stat-val { font-size: 20px; font-weight: 700; color: #F8FAFC; font-variant-numeric: tabular-nums; }
    .stat-lbl { font-size: 12px; color: #64748B; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 12px; }
    th { text-align: left; padding: 8px 12px; color: #64748B; border-bottom: 1px solid #1E293B; font-weight: 500; }
    td { padding: 8px 12px; border-bottom: 1px solid #0F172A; font-variant-numeric: tabular-nums; }
    .hidden { display: none !important; }
    .notice { font-size: 12px; color: #64748B; border-top: 1px solid #1E293B; padding-top: 16px; margin-top: 24px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">VentureFlow <span style="color:#64748B; font-weight:400; font-size:14px;">· Rapport Autonome</span></div>
      <div class="badge">Lecture Seule Chiffrée</div>
    </div>

    <!-- Unlock screen -->
    <div id="unlockSection" class="card">
      <h2 style="font-size: 20px; margin-bottom: 8px;">Dossier d'investissement protégé</h2>
      <p style="color: #94A3B8; font-size: 13px; margin-bottom: 16px;">
        Ce rapport a été chiffré côté client avec AES-256-GCM. Aucun serveur n'a accès à la clé. Saisissez la phrase secrète convenue séparément pour déchiffrer le contenu directement dans votre navigateur.
      </p>
      <form id="unlockForm">
        <input type="password" id="passphraseInput" class="input" placeholder="Entrez la clé de déchiffrement..." required autofocus />
        <button type="submit" class="btn" id="unlockBtn">Déchiffrer le rapport</button>
        <div id="errorMsg" class="error hidden">Phrase secrète incorrecte ou intégrité compromise.</div>
      </form>
    </div>

    <!-- Decrypted content view -->
    <div id="reportSection" class="hidden">
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
          <div>
            <h1 id="dealName" style="font-size:24px; font-weight:700;"></h1>
            <p id="dealSectorStage" style="color:#94A3B8; font-size:13px; margin-top:2px;"></p>
          </div>
          <div style="text-align:right;">
            <div id="dealTarget" style="font-size:20px; font-weight:700; color:#10B981;"></div>
            <div id="dealValuation" style="font-size:12px; color:#64748B;"></div>
          </div>
        </div>
        <p id="dealDescription" style="font-size:14px; color:#CBD5E1; margin-top:12px; line-height:1.6; white-space:pre-wrap;"></p>
      </div>

      <!-- Financials if present -->
      <div id="finBlock" class="card hidden">
        <div class="section-title">Indicateurs Financiers & Projections</div>
        <div class="grid-3" id="kpiGrid"></div>
        <div style="overflow-x:auto;">
          <table id="finTable">
            <thead>
              <tr><th>Année</th><th>Revenus / ARR</th><th>Marge Brute</th><th>EBITDA</th><th>Trésorerie</th><th>Runway</th></tr>
            </thead>
            <tbody id="finTableBody"></tbody>
          </table>
        </div>
      </div>

      <!-- Valuation if present -->
      <div id="valBlock" class="card hidden">
        <div class="section-title">Valorisation & Modèles Retenus</div>
        <div id="valList" style="display:flex; flex-direction:column; gap:12px;"></div>
      </div>

      <!-- Due Diligence if present -->
      <div id="ddBlock" class="card hidden">
        <div class="section-title">Synthèse Due Diligence</div>
        <div id="ddList" style="display:flex; flex-direction:column; gap:8px;"></div>
      </div>

      <div class="notice">
        VentureFlow Mode A — Déchiffré localement dans votre navigateur · Aucune donnée n'a transité sur le réseau.
      </div>
    </div>
  </div>

  <script>
    const packageData = ${packageJson};

    function b64ToUint8(b64) {
      const bin = atob(b64);
      const arr = new Uint8Array(bin.length);
      for(let i=0; i<bin.length; i++) arr[i] = bin.charCodeAt(i);
      return arr;
    }

    async function deriveKey(passphrase, salt, iterations) {
      const enc = new TextEncoder();
      const baseKey = await crypto.subtle.importKey('raw', enc.encode(passphrase), { name: 'PBKDF2' }, false, ['deriveKey']);
      return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: salt, iterations: iterations || 250000, hash: 'SHA-256' },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );
    }

    document.getElementById('unlockForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const pass = document.getElementById('passphraseInput').value;
      const btn = document.getElementById('unlockBtn');
      const err = document.getElementById('errorMsg');
      err.classList.add('hidden');
      btn.innerText = 'Déchiffrement en cours...';

      try {
        const salt = b64ToUint8(packageData.saltBase64);
        const iv = b64ToUint8(packageData.ivBase64);
        const ciphertext = b64ToUint8(packageData.ciphertextBase64);
        const key = await deriveKey(pass, salt, packageData.iterations);

        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ciphertext);
        const data = JSON.parse(new TextDecoder().decode(decrypted));

        renderReport(data);
        document.getElementById('unlockSection').classList.add('hidden');
        document.getElementById('reportSection').classList.remove('hidden');
      } catch (e) {
        console.error(e);
        err.classList.remove('hidden');
        btn.innerText = 'Déchiffrer le rapport';
      }
    });

    function formatCur(val, cur) {
      if (!val && val !== 0) return '—';
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: cur || 'EUR', maximumFractionDigits: 0 }).format(val);
    }

    function createCell(text) {
      const td = document.createElement('td');
      td.textContent = text;
      return td;
    }

    function renderReport(data) {
      const s = data.startup || {};
      document.getElementById('dealName').textContent = s.name || 'Startup';
      document.getElementById('dealSectorStage').textContent = (s.sector || '') + ' · ' + (s.stage || '') + ' · ' + (s.city || '') + ' (' + (s.country || '') + ')';
      document.getElementById('dealTarget').textContent = formatCur(s.targetAmount, s.currency);
      document.getElementById('dealValuation').textContent = s.valuationAsked ? 'Valo demandée : ' + formatCur(s.valuationAsked, s.currency) : '';
      document.getElementById('dealDescription').textContent = (s.description || '') + (s.valueProposition ? '\\n\\n' + s.valueProposition : '');

      if (data.financials && Array.isArray(data.financials.annualData)) {
        const fin = data.financials;
        document.getElementById('finBlock').classList.remove('hidden');
        const tbody = document.getElementById('finTableBody');
        tbody.textContent = '';
        fin.annualData.forEach(p => {
          const row = document.createElement('tr');
          row.appendChild(createCell(p.year + (p.isForecast ? ' (P)' : '')));
          row.appendChild(createCell(formatCur(p.arr || p.revenue, fin.currency)));
          row.appendChild(createCell(formatCur(p.grossMargin, fin.currency) + ' (' + (p.grossMarginPercent || 0) + '%)'));
          row.appendChild(createCell(formatCur(p.ebitda, fin.currency)));
          row.appendChild(createCell(formatCur(p.cashBalance, fin.currency)));
          row.appendChild(createCell(p.runwayMonths > 60 ? 'Cash flow +' : p.runwayMonths + ' mois'));
          tbody.appendChild(row);
        });
      }

      if (data.valuations && Array.isArray(data.valuations) && data.valuations.length) {
        document.getElementById('valBlock').classList.remove('hidden');
        const vList = document.getElementById('valList');
        vList.textContent = '';
        data.valuations.forEach(v => {
          const item = document.createElement('div');
          item.className = 'stat-box';

          const title = document.createElement('div');
          title.style.fontWeight = '600';
          title.style.fontSize = '14px';
          title.style.color = '#F1F5F9';
          title.textContent = v.methodLabel || 'Méthode';
          item.appendChild(title);

          const preMoney = document.createElement('div');
          preMoney.style.fontSize = '18px';
          preMoney.style.fontWeight = '700';
          preMoney.style.color = '#10B981';
          preMoney.style.marginTop = '4px';
          preMoney.textContent = formatCur(v.calculatedPreMoney) + ' Pre-Money';
          item.appendChild(preMoney);

          const range = document.createElement('div');
          range.style.fontSize = '12px';
          range.style.color = '#64748B';
          range.style.marginTop = '2px';
          range.textContent = 'Fourchette : ' + formatCur(v.lowEstimate) + ' — ' + formatCur(v.highEstimate);
          item.appendChild(range);

          vList.appendChild(item);
        });
      }

      if (data.dueDiligence && Array.isArray(data.dueDiligence) && data.dueDiligence.length) {
        document.getElementById('ddBlock').classList.remove('hidden');
        const ddList = document.getElementById('ddList');
        ddList.textContent = '';
        data.dueDiligence.forEach(d => {
          const item = document.createElement('div');
          item.style.padding = '8px 12px';
          item.style.border = '1px solid #1E293B';
          item.style.borderRadius = '6px';
          item.style.fontSize = '13px';

          const cat = document.createElement('span');
          cat.style.color = '#94A3B8';
          cat.textContent = (d.categoryLabel || 'Item') + ' : ';
          item.appendChild(cat);

          const strong = document.createElement('strong');
          strong.textContent = d.title || '';
          item.appendChild(strong);

          const status = document.createTextNode(' · ' + (d.status || '').toUpperCase());
          item.appendChild(status);

          ddList.appendChild(item);
        });
      }
    }
  </script>
</body>
</html>`;
}
