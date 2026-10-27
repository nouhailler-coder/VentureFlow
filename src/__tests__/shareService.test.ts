import { describe, it, expect } from 'vitest';
import {
  prepareSelectiveDataPackage,
  createEncryptedPackage,
  decryptExportPackage,
  generateAutonomousHtmlReport,
  escapeHtml,
} from '../services/shareService';
import { Startup, StartupAnalysis, ShareExportFilter } from '../types';

describe('VentureFlow Sharing & XSS Security Subsystem', () => {
  const dummyStartup: Startup = {
    id: 'st-01',
    name: 'CyberShield <script>alert("xss")</script>',
    sector: 'Cybersécurité',
    stage: 'Série A',
    country: 'France',
    city: 'Paris',
    foundedYear: 2024,
    website: 'https://cybershield.example',
    tags: ['cyber', 'saas'],
    description: 'Plateforme EDR automatisée',
    valueProposition: 'Détection en 10ms',
    founders: [{ name: 'Alice', role: 'CEO' }, { name: 'Bob', role: 'CTO' }],
    targetAmount: 3000000,
    valuationAsked: 12000000,
    currency: 'EUR',
    pipelineStage: 'analyse_preliminaire',
    confidentialNotes: 'CONFIDENTIAL: Trésorerie tendue au Q3',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };

  const dummyAnalysis: StartupAnalysis = {
    startupId: 'st-01',
    criteria: [],
    compositeScore: 84,
    thesisFit: 'Excellente adéquation',
    keyStrengths: ['Équipe technique solide'],
    keyWeaknesses: ['CAC encore élevé'],
    regulatoryTechRisks: 'Faible',
    recommendation: 'favorable',
    recommendationNotes: 'CONFIDENTIAL: Négocier une décote de 15%',
    analyzedAt: '2026-01-02',
  };

  it('strictly excludes private confidential notes by default', () => {
    const filter: ShareExportFilter = {
      startupId: dummyStartup.id,
      includeGeneralInfo: true,
      includeFinancials: false,
      includeValuation: false,
      includeDueDiligence: false,
      includePrivateNotes: false, // DEFAULT RULE
    };

    const pkg = prepareSelectiveDataPackage(filter, dummyStartup, dummyAnalysis);
    expect(pkg.startup.confidentialNotes).toBeUndefined();
    expect(pkg.analysis?.recommendationNotes).toBeUndefined();
    expect(pkg.startup.name).toBe(dummyStartup.name);
  });

  it('includes private notes only when explicitly authorized by user', () => {
    const filter: ShareExportFilter = {
      startupId: dummyStartup.id,
      includeGeneralInfo: true,
      includeFinancials: false,
      includeValuation: false,
      includeDueDiligence: false,
      includePrivateNotes: true, // EXPLICIT OPT-IN
    };

    const pkg = prepareSelectiveDataPackage(filter, dummyStartup, dummyAnalysis);
    expect(pkg.startup.confidentialNotes).toBe('CONFIDENTIAL: Trésorerie tendue au Q3');
    expect(pkg.analysis?.recommendationNotes).toBe('CONFIDENTIAL: Négocier une décote de 15%');
  });

  it('creates and decrypts an encrypted export bundle (.ventureflow)', async () => {
    const filter: ShareExportFilter = {
      startupId: dummyStartup.id,
      includeGeneralInfo: true,
      includeFinancials: false,
      includeValuation: false,
      includeDueDiligence: false,
      includePrivateNotes: false,
    };
    const pkg = prepareSelectiveDataPackage(filter, dummyStartup, dummyAnalysis);
    const passphrase = 'RecipientPassphrase_2026!#';

    const encFile = await createEncryptedPackage(pkg, passphrase);
    expect(encFile.format).toBe('VENTUREFLOW_ENCRYPTED_REPORT_V2');
    expect(encFile.ciphertextBase64).toBeTruthy();

    const decrypted = await decryptExportPackage(encFile, passphrase);
    expect(decrypted.startup.name).toBe(dummyStartup.name);
    expect(decrypted.startup.confidentialNotes).toBeUndefined();
  });

  it('fails decryption if recipient passphrase is wrong', async () => {
    const filter: ShareExportFilter = {
      startupId: dummyStartup.id,
      includeGeneralInfo: true,
      includeFinancials: false,
      includeValuation: false,
      includeDueDiligence: false,
      includePrivateNotes: false,
    };
    const pkg = prepareSelectiveDataPackage(filter, dummyStartup, dummyAnalysis);
    const encFile = await createEncryptedPackage(pkg, 'CorrectPassword');

    await expect(decryptExportPackage(encFile, 'WrongPassword')).rejects.toThrow();
  });

  it('prevents XSS injections in autonomous HTML report export', async () => {
    const filter: ShareExportFilter = {
      startupId: dummyStartup.id,
      includeGeneralInfo: true,
      includeFinancials: false,
      includeValuation: false,
      includeDueDiligence: false,
      includePrivateNotes: false,
    };
    const pkg = prepareSelectiveDataPackage(filter, dummyStartup, dummyAnalysis);
    const encFile = await createEncryptedPackage(pkg, 'SafeKey123');

    const maliciousName = 'MaliciousCorp <script>alert("XSS")</script>';
    const htmlReport = generateAutonomousHtmlReport(encFile, maliciousName);

    // 1. Title must be HTML-escaped
    expect(htmlReport).toContain('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    expect(htmlReport).not.toContain('<title>VentureFlow — Rapport Confidentiel : MaliciousCorp <script>');

    // 2. Strict Content Security Policy must be present
    expect(htmlReport).toContain('http-equiv="Content-Security-Policy"');
    expect(htmlReport).toContain("default-src 'none'");

    // 3. Must use safe DOM manipulation (textContent) rather than dangerous innerHTML for user data
    expect(htmlReport).toContain("document.getElementById('dealName').textContent = s.name");
    expect(htmlReport).toContain("document.getElementById('dealDescription').textContent");
  });

  it('correctly escapes HTML special characters with escapeHtml', () => {
    expect(escapeHtml('<div class="test">Foo & Bar</div>')).toBe(
      '&lt;div class=&quot;test&quot;&gt;Foo &amp; Bar&lt;/div&gt;'
    );
  });
});
