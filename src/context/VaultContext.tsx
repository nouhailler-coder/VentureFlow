import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import {
  Startup,
  StartupAnalysis,
  FinancialModel,
  ValuationEstimate,
  DueDiligenceItem,
  InvestmentPortfolio,
  Contact,
  Interaction,
  Task,
  EncryptedAttachment,
  VaultMetadata,
} from '../types';
import {
  generateRandomBytes,
  deriveKeyFromPassphrase,
  generateMasterVaultKey,
  wrapMasterKey,
  unwrapMasterKey,
  encryptData,
  decryptData,
  arrayBufferToBase64,
  base64ToUint8Array,
  SALT_LENGTH_BYTES,
  PBKDF2_DEFAULT_ITERATIONS,
} from '../crypto/vaultCrypto';
import {
  getVaultMetadata,
  saveVaultMetadata,
  getEncryptedRecords,
  putEncryptedRecord,
  deleteEncryptedRecord,
  clearEntireVault,
  inspectStorageLeakage,
} from '../storage/db';
import {
  INITIAL_DEMO_STARTUPS,
  INITIAL_DEMO_ANALYSES,
  INITIAL_DEMO_FINANCIALS,
  INITIAL_DEMO_VALUATIONS,
  INITIAL_DEMO_DUE_DILIGENCE,
  INITIAL_DEMO_PORTFOLIO,
  INITIAL_DEMO_CONTACTS,
  INITIAL_DEMO_INTERACTIONS,
  INITIAL_DEMO_TASKS,
} from '../data/mockDeals';
import {
  registerLocalPasskey,
  authenticateWithLocalPasskey,
  checkPasskeyCapabilities,
  deriveKeyFromPrfBytes,
  PasskeySupport,
} from '../crypto/passkeyService';

export type VaultStatus = 'loading' | 'uninitialized' | 'locked' | 'unlocked';

interface VaultContextType {
  status: VaultStatus;
  metadata: VaultMetadata | null;
  passkeySupport: PasskeySupport;
  hasPasskeyEnrolled: boolean;
  autoLockMinutes: number;
  setAutoLockMinutes: (min: number) => void;
  
  // Vault lifecycle
  initializeVault: (passphrase: string, enrollPasskey?: boolean, loadDemoData?: boolean) => Promise<void>;
  unlockWithPassphrase: (passphrase: string) => Promise<boolean>;
  unlockWithPasskey: () => Promise<boolean>;
  lockVault: () => void;
  changePassphrase: (currentPassphrase: string, newPassphrase: string) => Promise<boolean>;
  enrollPasskey: (currentPassphrase: string) => Promise<boolean>;
  removePasskey: () => Promise<void>;
  resetEntireVault: () => Promise<void>;

  // Backups
  exportEncryptedBackup: () => Promise<string>;
  importEncryptedBackup: (jsonContent: string, passphrase?: string) => Promise<boolean>;

  // Domain data
  startups: Startup[];
  analyses: Record<string, StartupAnalysis>;
  financials: Record<string, FinancialModel>;
  valuations: Record<string, ValuationEstimate[]>;
  dueDiligence: Record<string, DueDiligenceItem[]>;
  portfolio: Record<string, InvestmentPortfolio>;
  contacts: Contact[];
  interactions: Interaction[];
  tasks: Task[];
  attachments: EncryptedAttachment[];

  // Mutations
  saveStartup: (startup: Startup) => Promise<void>;
  deleteStartup: (startupId: string) => Promise<void>;
  saveAnalysis: (analysis: StartupAnalysis) => Promise<void>;
  saveFinancialModel: (model: FinancialModel) => Promise<void>;
  saveValuation: (val: ValuationEstimate) => Promise<void>;
  deleteValuation: (valId: string, startupId: string) => Promise<void>;
  saveDueDiligenceItem: (item: DueDiligenceItem) => Promise<void>;
  saveInvestmentPortfolio: (inv: InvestmentPortfolio) => Promise<void>;
  saveContact: (contact: Contact) => Promise<void>;
  deleteContact: (contactId: string) => Promise<void>;
  saveInteraction: (interaction: Interaction) => Promise<void>;
  saveTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addAttachment: (startupId: string, file: File, itemId?: string) => Promise<void>;
  loadDemoSeedData: () => Promise<void>;

  // Security audit
  runSecurityAudit: () => Promise<{
    totalIndexedDbRecords: number;
    totalLocalStorageItems: number;
    unencryptedBusinessStringsFound: string[];
    isClean: boolean;
    sampleCiphertextHashes: string[];
  }>;
}

const VaultContext = createContext<VaultContextType | null>(null);

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<VaultStatus>('loading');
  const [metadata, setMetadata] = useState<VaultMetadata | null>(null);
  const [passkeySupport, setPasskeySupport] = useState<PasskeySupport>({
    isSupported: false,
    isUserVerifyingPlatformAuthenticatorAvailable: false,
    isPrfSupported: false,
  });
  const [autoLockMinutes, setAutoLockMinutes] = useState<number>(15);

  // In-memory master key (never stored in plaintext on disk)
  const masterKeyRef = useRef<CryptoKey | null>(null);
  const autoLockTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Business state
  const [startups, setStartups] = useState<Startup[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, StartupAnalysis>>({});
  const [financials, setFinancials] = useState<Record<string, FinancialModel>>({});
  const [valuations, setValuations] = useState<Record<string, ValuationEstimate[]>>({});
  const [dueDiligence, setDueDiligence] = useState<Record<string, DueDiligenceItem[]>>({});
  const [portfolio, setPortfolio] = useState<Record<string, InvestmentPortfolio>>({});
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [attachments, setAttachments] = useState<EncryptedAttachment[]>([]);

  // Check hardware and vault presence on mount
  useEffect(() => {
    async function init() {
      try {
        const support = await checkPasskeyCapabilities();
        setPasskeySupport(support);

        const meta = await getVaultMetadata();
        if (!meta) {
          setStatus('uninitialized');
        } else {
          setMetadata(meta);
          setStatus('locked');
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setStatus('uninitialized');
      }
    }
    init();
  }, []);

  // Lock vault action: zeroizes references in memory
  const lockVault = useCallback(() => {
    masterKeyRef.current = null;
    setStartups([]);
    setAnalyses({});
    setFinancials({});
    setValuations({});
    setDueDiligence({});
    setPortfolio({});
    setContacts([]);
    setInteractions([]);
    setTasks([]);
    setAttachments([]);
    if (autoLockTimerRef.current) {
      clearTimeout(autoLockTimerRef.current);
      autoLockTimerRef.current = null;
    }
    setStatus('locked');
  }, []);

  // Inactivity auto-lock and background tab blur handler
  const resetInactivityTimer = useCallback(() => {
    if (status !== 'unlocked') return;
    if (autoLockTimerRef.current) {
      clearTimeout(autoLockTimerRef.current);
    }
    if (autoLockMinutes > 0) {
      autoLockTimerRef.current = setTimeout(() => {
        lockVault();
      }, autoLockMinutes * 60 * 1000);
    }
  }, [status, autoLockMinutes, lockVault]);

  useEffect(() => {
    if (status !== 'unlocked') return;

    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    const handleVisibilityChange = () => {
      // Automatic lock when tab goes into background as mandated in Section 3.3
      if (document.visibilityState === 'hidden') {
        lockVault();
      }
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    resetInactivityTimer();

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (autoLockTimerRef.current) {
        clearTimeout(autoLockTimerRef.current);
      }
    };
  }, [status, resetInactivityTimer, lockVault]);

  // Load and decrypt all records from IndexedDB using master key
  const loadAndDecryptAllData = async (key: CryptoKey) => {
    const envelopes = await getEncryptedRecords();
    const stList: Startup[] = [];
    const anMap: Record<string, StartupAnalysis> = {};
    const finMap: Record<string, FinancialModel> = {};
    const valMap: Record<string, ValuationEstimate[]> = {};
    const ddMap: Record<string, DueDiligenceItem[]> = {};
    const portMap: Record<string, InvestmentPortfolio> = {};
    const cList: Contact[] = [];
    const iList: Interaction[] = [];
    const tList: Task[] = [];
    const attList: EncryptedAttachment[] = [];

    for (const env of envelopes) {
      try {
        const payload = await decryptData<any>(env.ciphertextBase64, env.ivBase64, key);
        switch (env.recordType) {
          case 'startup':
            stList.push(payload);
            break;
          case 'analysis':
            anMap[payload.startupId] = payload;
            break;
          case 'financials':
            finMap[payload.startupId] = payload;
            break;
          case 'valuation':
            if (!valMap[payload.startupId]) valMap[payload.startupId] = [];
            valMap[payload.startupId].push(payload);
            break;
          case 'due_diligence':
            if (!ddMap[payload.startupId]) ddMap[payload.startupId] = [];
            ddMap[payload.startupId].push(payload);
            break;
          case 'investment':
            portMap[payload.startupId] = payload;
            break;
          case 'contact':
            cList.push(payload);
            break;
          case 'interaction':
            iList.push(payload);
            break;
          case 'task':
            tList.push(payload);
            break;
          case 'document':
            attList.push(payload);
            break;
        }
      } catch (decErr) {
        console.warn(`Unable to decrypt record ${env.id}:`, decErr);
      }
    }

    setStartups(stList);
    setAnalyses(anMap);
    setFinancials(finMap);
    setValuations(valMap);
    setDueDiligence(ddMap);
    setPortfolio(portMap);
    setContacts(cList);
    setInteractions(iList);
    setTasks(tList);
    setAttachments(attList);
  };

  // Seed demo data
  const loadDemoSeedData = async () => {
    if (!masterKeyRef.current) return;
    const key = masterKeyRef.current;

    for (const s of INITIAL_DEMO_STARTUPS) {
      const enc = await encryptData(s, key);
      await putEncryptedRecord(s.id, 'startup', enc.ciphertextBase64, enc.ivBase64);
    }
    for (const an of Object.values(INITIAL_DEMO_ANALYSES)) {
      const enc = await encryptData(an, key);
      await putEncryptedRecord(`analysis_${an.startupId}`, 'analysis', enc.ciphertextBase64, enc.ivBase64);
    }
    for (const fin of Object.values(INITIAL_DEMO_FINANCIALS)) {
      const enc = await encryptData(fin, key);
      await putEncryptedRecord(`financials_${fin.startupId}`, 'financials', enc.ciphertextBase64, enc.ivBase64);
    }
    for (const [stId, vals] of Object.entries(INITIAL_DEMO_VALUATIONS)) {
      for (const v of vals) {
        const enc = await encryptData(v, key);
        await putEncryptedRecord(v.id, 'valuation', enc.ciphertextBase64, enc.ivBase64);
      }
    }
    for (const [stId, dds] of Object.entries(INITIAL_DEMO_DUE_DILIGENCE)) {
      for (const dd of dds) {
        const enc = await encryptData(dd, key);
        await putEncryptedRecord(dd.id, 'due_diligence', enc.ciphertextBase64, enc.ivBase64);
      }
    }
    for (const p of Object.values(INITIAL_DEMO_PORTFOLIO)) {
      const enc = await encryptData(p, key);
      await putEncryptedRecord(`portfolio_${p.startupId}`, 'investment', enc.ciphertextBase64, enc.ivBase64);
    }
    for (const c of INITIAL_DEMO_CONTACTS) {
      const enc = await encryptData(c, key);
      await putEncryptedRecord(c.id, 'contact', enc.ciphertextBase64, enc.ivBase64);
    }
    for (const i of INITIAL_DEMO_INTERACTIONS) {
      const enc = await encryptData(i, key);
      await putEncryptedRecord(i.id, 'interaction', enc.ciphertextBase64, enc.ivBase64);
    }
    for (const t of INITIAL_DEMO_TASKS) {
      const enc = await encryptData(t, key);
      await putEncryptedRecord(t.id, 'task', enc.ciphertextBase64, enc.ivBase64);
    }

    await loadAndDecryptAllData(key);
  };

  // Initialize brand new vault
  const initializeVault = async (
    passphrase: string,
    enrollPasskey = false,
    loadDemoData = true
  ) => {
    if (passphrase.length < 8) {
      throw new Error('La phrase secrète doit comporter au moins 8 caractères.');
    }

    const salt = generateRandomBytes(SALT_LENGTH_BYTES);
    const saltBase64 = arrayBufferToBase64(salt);
    const wrappingKey = await deriveKeyFromPassphrase(passphrase, salt, PBKDF2_DEFAULT_ITERATIONS);
    const masterKey = await generateMasterVaultKey();
    const wrapped = await wrapMasterKey(masterKey, wrappingKey);

    let passkeyCredId: string | undefined = undefined;
    let passkeyPrfEnabled: boolean | undefined = undefined;
    let passkeyPrfSaltBase64: string | undefined = undefined;
    let encryptedMasterKeyPasskey: { wrappedKeyBase64: string; ivBase64: string } | undefined = undefined;

    if (enrollPasskey && passkeySupport.isSupported) {
      try {
        const prfSalt = generateRandomBytes(32);
        const pk = await registerLocalPasskey(prfSalt);
        passkeyCredId = pk.credentialId;
        passkeyPrfEnabled = pk.prfEnabled;

        if (pk.prfEnabled && pk.prfKeyMaterial) {
          const prfWrappingKey = await deriveKeyFromPrfBytes(pk.prfKeyMaterial);
          encryptedMasterKeyPasskey = await wrapMasterKey(masterKey, prfWrappingKey);
          passkeyPrfSaltBase64 = arrayBufferToBase64(prfSalt);
        }
      } catch (pkErr) {
        console.warn('Passkey enrollment failed, proceeding with passphrase only:', pkErr);
      }
    }

    const meta: VaultMetadata = {
      version: 2,
      saltBase64,
      ivBase64: wrapped.ivBase64,
      iterations: PBKDF2_DEFAULT_ITERATIONS,
      encryptedMasterKeyBase64: wrapped.wrappedKeyBase64,
      passkeyCredentialId: passkeyCredId,
      passkeyPrfEnabled,
      passkeyPrfSaltBase64,
      encryptedMasterKeyPasskey,
      createdAt: new Date().toISOString(),
      lastUnlockedAt: new Date().toISOString(),
    };

    await saveVaultMetadata(meta);
    setMetadata(meta);
    masterKeyRef.current = masterKey;
    setStatus('unlocked');

    if (loadDemoData) {
      await loadDemoSeedData();
    }
  };

  // Unlock with Passphrase
  const unlockWithPassphrase = async (passphrase: string): Promise<boolean> => {
    const meta = metadata || (await getVaultMetadata());
    if (!meta) throw new Error('Aucun coffre configuré');

    try {
      const salt = base64ToUint8Array(meta.saltBase64);
      const wrappingKey = await deriveKeyFromPassphrase(passphrase, salt, meta.iterations);
      const masterKey = await unwrapMasterKey(
        meta.encryptedMasterKeyBase64,
        meta.ivBase64,
        wrappingKey
      );

      masterKeyRef.current = masterKey;
      await loadAndDecryptAllData(masterKey);

      // Update last unlocked timestamp
      const updatedMeta = { ...meta, lastUnlockedAt: new Date().toISOString() };
      await saveVaultMetadata(updatedMeta);
      setMetadata(updatedMeta);

      setStatus('unlocked');
      return true;
    } catch (err) {
      console.error('Déchiffrement échoué:', err);
      return false;
    }
  };

  // Unlock with Passkey (Separates user authentication from cryptographic decryption)
  const unlockWithPasskey = async (): Promise<boolean> => {
    const meta = metadata || (await getVaultMetadata());
    if (!meta || !meta.passkeyCredentialId) {
      throw new Error('Aucune passkey enregistrée pour ce coffre.');
    }

    // Branch 1: Passkey was enrolled with hardware PRF extension
    if (meta.passkeyPrfEnabled && meta.passkeyPrfSaltBase64 && meta.encryptedMasterKeyPasskey) {
      try {
        const prfSalt = base64ToUint8Array(meta.passkeyPrfSaltBase64);
        const authResult = await authenticateWithLocalPasskey(meta.passkeyCredentialId, prfSalt);

        if (!authResult.authenticated) {
          return false;
        }

        if (!authResult.prfKeyMaterial) {
          throw new Error(
            "L'authentification biométrique a réussi, mais votre matériel n'a pas renvoyé la clé cryptographique PRF. Déverrouillez avec votre phrase secrète."
          );
        }

        // Derive wrapping key from PRF bytes
        const prfWrappingKey = await deriveKeyFromPrfBytes(authResult.prfKeyMaterial);

        let wrappedKeyBase64: string;
        let ivBase64: string;
        if (typeof meta.encryptedMasterKeyPasskey === 'string') {
          wrappedKeyBase64 = meta.encryptedMasterKeyPasskey;
          ivBase64 = meta.ivBase64;
        } else {
          wrappedKeyBase64 = meta.encryptedMasterKeyPasskey.wrappedKeyBase64;
          ivBase64 = meta.encryptedMasterKeyPasskey.ivBase64;
        }

        const masterKey = await unwrapMasterKey(wrappedKeyBase64, ivBase64, prfWrappingKey);
        masterKeyRef.current = masterKey;
        await loadAndDecryptAllData(masterKey);

        const updatedMeta = { ...meta, lastUnlockedAt: new Date().toISOString() };
        await saveVaultMetadata(updatedMeta);
        setMetadata(updatedMeta);

        setStatus('unlocked');
        return true;
      } catch (err: any) {
        console.error('Erreur déverrouillage passkey PRF:', err);
        throw err;
      }
    } else {
      // Branch 2: Passkey without PRF extension
      const authResult = await authenticateWithLocalPasskey(meta.passkeyCredentialId);
      if (authResult.authenticated) {
        throw new Error(
          "Authentification biométrique réussie. Toutefois, sans extension PRF matérielle sur cet appareil, la clé maîtresse doit être déchiffrée avec votre phrase secrète."
        );
      }
      return false;
    }
  };

  // Change master passphrase (re-wraps DEK)
  const changePassphrase = async (
    currentPassphrase: string,
    newPassphrase: string
  ): Promise<boolean> => {
    if (!masterKeyRef.current) throw new Error('Le coffre doit être déverrouillé.');
    if (newPassphrase.length < 8) {
      throw new Error('La nouvelle phrase secrète doit comporter au moins 8 caractères.');
    }

    const meta = metadata || (await getVaultMetadata());
    if (!meta) throw new Error('Métadonnées introuvables.');

    // Verify current passphrase
    const oldSalt = base64ToUint8Array(meta.saltBase64);
    const oldWrappingKey = await deriveKeyFromPassphrase(currentPassphrase, oldSalt, meta.iterations);
    try {
      await unwrapMasterKey(meta.encryptedMasterKeyBase64, meta.ivBase64, oldWrappingKey);
    } catch {
      throw new Error('La phrase secrète actuelle est incorrecte.');
    }

    // Generate fresh salt and new wrapping key
    const newSalt = generateRandomBytes(SALT_LENGTH_BYTES);
    const newWrappingKey = await deriveKeyFromPassphrase(newPassphrase, newSalt, PBKDF2_DEFAULT_ITERATIONS);
    const reWrapped = await wrapMasterKey(masterKeyRef.current, newWrappingKey);

    const updatedMeta: VaultMetadata = {
      ...meta,
      saltBase64: arrayBufferToBase64(newSalt),
      ivBase64: reWrapped.ivBase64,
      iterations: PBKDF2_DEFAULT_ITERATIONS,
      encryptedMasterKeyBase64: reWrapped.wrappedKeyBase64,
    };

    await saveVaultMetadata(updatedMeta);
    setMetadata(updatedMeta);
    return true;
  };

  // Enroll device Passkey
  const enrollPasskey = async (currentPassphrase: string): Promise<boolean> => {
    if (!masterKeyRef.current) throw new Error('Le coffre doit être déverrouillé.');
    const meta = metadata || (await getVaultMetadata());
    if (!meta) throw new Error('Métadonnées introuvables.');

    // Verify passphrase first
    const salt = base64ToUint8Array(meta.saltBase64);
    const wrappingKey = await deriveKeyFromPassphrase(currentPassphrase, salt, meta.iterations);
    const masterKey = await unwrapMasterKey(meta.encryptedMasterKeyBase64, meta.ivBase64, wrappingKey);

    const prfSalt = generateRandomBytes(32);
    const pk = await registerLocalPasskey(prfSalt);

    let encryptedMasterKeyPasskey: { wrappedKeyBase64: string; ivBase64: string } | undefined = undefined;
    let passkeyPrfSaltBase64: string | undefined = undefined;

    if (pk.prfEnabled && pk.prfKeyMaterial) {
      const prfWrappingKey = await deriveKeyFromPrfBytes(pk.prfKeyMaterial);
      encryptedMasterKeyPasskey = await wrapMasterKey(masterKey, prfWrappingKey);
      passkeyPrfSaltBase64 = arrayBufferToBase64(prfSalt);
    }

    const updatedMeta: VaultMetadata = {
      ...meta,
      passkeyCredentialId: pk.credentialId,
      passkeyPrfEnabled: pk.prfEnabled,
      passkeyPrfSaltBase64,
      encryptedMasterKeyPasskey,
    };

    await saveVaultMetadata(updatedMeta);
    setMetadata(updatedMeta);
    return true;
  };

  // Remove enrolled passkey
  const removePasskey = async () => {
    const meta = metadata || (await getVaultMetadata());
    if (!meta) return;
    const updatedMeta: VaultMetadata = {
      ...meta,
      passkeyCredentialId: undefined,
      passkeyPrfEnabled: undefined,
      passkeyPrfSaltBase64: undefined,
      encryptedMasterKeyPasskey: undefined,
    };
    await saveVaultMetadata(updatedMeta);
    setMetadata(updatedMeta);
  };

  // Wipe entire vault
  const resetEntireVault = async () => {
    await clearEntireVault();
    lockVault();
    setMetadata(null);
    setStatus('uninitialized');
  };

  // Export full encrypted backup
  const exportEncryptedBackup = async (): Promise<string> => {
    const meta = metadata || (await getVaultMetadata());
    if (!meta) throw new Error('Métadonnées introuvables');
    const records = await getEncryptedRecords();

    const backupPayload = {
      ventureflowBackupVersion: 2,
      exportedAt: new Date().toISOString(),
      vaultMetadata: meta,
      recordCount: records.length,
      records,
    };

    return JSON.stringify(backupPayload, null, 2);
  };

  // Import full encrypted backup safely without silent data loss
  const importEncryptedBackup = async (
    jsonContent: string,
    passphrase?: string
  ): Promise<boolean> => {
    // 1. Strict format and schema validation
    let parsed: any;
    try {
      parsed = JSON.parse(jsonContent);
    } catch {
      throw new Error("Le fichier sélectionné n'est pas un JSON valide.");
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Structure de sauvegarde invalide.');
    }

    const { vaultMetadata, records } = parsed;
    if (
      !vaultMetadata ||
      typeof vaultMetadata !== 'object' ||
      !vaultMetadata.saltBase64 ||
      !vaultMetadata.ivBase64 ||
      !vaultMetadata.encryptedMasterKeyBase64 ||
      !Array.isArray(records)
    ) {
      throw new Error('Structure de sauvegarde corrompue : métadonnées ou enregistrements manquants.');
    }

    // Validate each record envelope structure
    for (let i = 0; i < records.length; i++) {
      const rec = records[i];
      if (
        !rec ||
        typeof rec !== 'object' ||
        !rec.id ||
        !rec.recordType ||
        typeof rec.ciphertextBase64 !== 'string' ||
        typeof rec.ivBase64 !== 'string'
      ) {
        throw new Error(`Enregistrement #${i} invalide dans la sauvegarde.`);
      }
    }

    // 2. Pre-validate passphrase if provided BEFORE modifying database
    let preVerifiedMasterKey: CryptoKey | null = null;
    if (passphrase) {
      try {
        const salt = base64ToUint8Array(vaultMetadata.saltBase64);
        const testWrappingKey = await deriveKeyFromPassphrase(
          passphrase,
          salt,
          vaultMetadata.iterations || PBKDF2_DEFAULT_ITERATIONS
        );
        preVerifiedMasterKey = await unwrapMasterKey(
          vaultMetadata.encryptedMasterKeyBase64,
          vaultMetadata.ivBase64,
          testWrappingKey
        );
      } catch {
        throw new Error('Phrase secrète incorrecte pour cette sauvegarde chiffrée. Les données existantes restent inchangées.');
      }
    }

    // 3. Snapshot existing data in memory for rollback
    const previousMeta = metadata || (await getVaultMetadata());
    const previousRecords = await getEncryptedRecords();

    try {
      await clearEntireVault();
      await saveVaultMetadata(vaultMetadata);

      for (const rec of records) {
        await putEncryptedRecord(rec.id, rec.recordType, rec.ciphertextBase64, rec.ivBase64);
      }

      setMetadata(vaultMetadata);

      if (preVerifiedMasterKey) {
        masterKeyRef.current = preVerifiedMasterKey;
        await loadAndDecryptAllData(preVerifiedMasterKey);
        setStatus('unlocked');
        return true;
      } else {
        setStatus('locked');
        return true;
      }
    } catch (restoreErr: any) {
      // Rollback to previous state on failure
      try {
        await clearEntireVault();
        if (previousMeta) {
          await saveVaultMetadata(previousMeta);
        }
        for (const pr of previousRecords) {
          await putEncryptedRecord(pr.id, pr.recordType, pr.ciphertextBase64, pr.ivBase64);
        }
      } catch (rollbackErr) {
        console.error('Échec critique du rollback de sauvegarde:', rollbackErr);
      }
      throw new Error(`Échec de la restauration : ${restoreErr?.message || 'Erreur interne'}. Restauration annulée.`);
    }
  };

  // Entity mutations with automatic client-side AES-256-GCM encryption
  const saveStartup = async (startup: Startup) => {
    if (!masterKeyRef.current) throw new Error('Coffre verrouillé');
    const now = new Date().toISOString();
    const updated: Startup = { ...startup, updatedAt: now };

    const enc = await encryptData(updated, masterKeyRef.current);
    await putEncryptedRecord(updated.id, 'startup', enc.ciphertextBase64, enc.ivBase64);

    setStartups((prev) => {
      const idx = prev.findIndex((s) => s.id === updated.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [updated, ...prev];
    });
  };

  const deleteStartup = async (startupId: string) => {
    await deleteEncryptedRecord(startupId);
    setStartups((prev) => prev.filter((s) => s.id !== startupId));
  };

  const saveAnalysis = async (analysis: StartupAnalysis) => {
    if (!masterKeyRef.current) throw new Error('Coffre verrouillé');
    const enc = await encryptData(analysis, masterKeyRef.current);
    await putEncryptedRecord(`analysis_${analysis.startupId}`, 'analysis', enc.ciphertextBase64, enc.ivBase64);
    setAnalyses((prev) => ({ ...prev, [analysis.startupId]: analysis }));
  };

  const saveFinancialModel = async (model: FinancialModel) => {
    if (!masterKeyRef.current) throw new Error('Coffre verrouillé');
    const enc = await encryptData(model, masterKeyRef.current);
    await putEncryptedRecord(`financials_${model.startupId}`, 'financials', enc.ciphertextBase64, enc.ivBase64);
    setFinancials((prev) => ({ ...prev, [model.startupId]: model }));
  };

  const saveValuation = async (val: ValuationEstimate) => {
    if (!masterKeyRef.current) throw new Error('Coffre verrouillé');
    const enc = await encryptData(val, masterKeyRef.current);
    await putEncryptedRecord(val.id, 'valuation', enc.ciphertextBase64, enc.ivBase64);
    setValuations((prev) => {
      const existing = prev[val.startupId] || [];
      const idx = existing.findIndex((v) => v.id === val.id);
      let updated: ValuationEstimate[];
      if (idx >= 0) {
        updated = [...existing];
        updated[idx] = val;
      } else {
        updated = [val, ...existing];
      }
      return { ...prev, [val.startupId]: updated };
    });
  };

  const deleteValuation = async (valId: string, startupId: string) => {
    await deleteEncryptedRecord(valId);
    setValuations((prev) => ({
      ...prev,
      [startupId]: (prev[startupId] || []).filter((v) => v.id !== valId),
    }));
  };

  const saveDueDiligenceItem = async (item: DueDiligenceItem) => {
    if (!masterKeyRef.current) throw new Error('Coffre verrouillé');
    const enc = await encryptData(item, masterKeyRef.current);
    await putEncryptedRecord(item.id, 'due_diligence', enc.ciphertextBase64, enc.ivBase64);
    setDueDiligence((prev) => {
      const existing = prev[item.startupId] || [];
      const idx = existing.findIndex((d) => d.id === item.id);
      let updated: DueDiligenceItem[];
      if (idx >= 0) {
        updated = [...existing];
        updated[idx] = item;
      } else {
        updated = [...existing, item];
      }
      return { ...prev, [item.startupId]: updated };
    });
  };

  const saveInvestmentPortfolio = async (inv: InvestmentPortfolio) => {
    if (!masterKeyRef.current) throw new Error('Coffre verrouillé');
    const enc = await encryptData(inv, masterKeyRef.current);
    await putEncryptedRecord(`portfolio_${inv.startupId}`, 'investment', enc.ciphertextBase64, enc.ivBase64);
    setPortfolio((prev) => ({ ...prev, [inv.startupId]: inv }));
  };

  const saveContact = async (contact: Contact) => {
    if (!masterKeyRef.current) throw new Error('Coffre verrouillé');
    const enc = await encryptData(contact, masterKeyRef.current);
    await putEncryptedRecord(contact.id, 'contact', enc.ciphertextBase64, enc.ivBase64);
    setContacts((prev) => {
      const idx = prev.findIndex((c) => c.id === contact.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = contact;
        return copy;
      }
      return [contact, ...prev];
    });
  };

  const deleteContact = async (contactId: string) => {
    await deleteEncryptedRecord(contactId);
    setContacts((prev) => prev.filter((c) => c.id !== contactId));
  };

  const saveInteraction = async (interaction: Interaction) => {
    if (!masterKeyRef.current) throw new Error('Coffre verrouillé');
    const enc = await encryptData(interaction, masterKeyRef.current);
    await putEncryptedRecord(interaction.id, 'interaction', enc.ciphertextBase64, enc.ivBase64);
    setInteractions((prev) => [interaction, ...prev]);
  };

  const saveTask = async (task: Task) => {
    if (!masterKeyRef.current) throw new Error('Coffre verrouillé');
    const enc = await encryptData(task, masterKeyRef.current);
    await putEncryptedRecord(task.id, 'task', enc.ciphertextBase64, enc.ivBase64);
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === task.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = task;
        return copy;
      }
      return [task, ...prev];
    });
  };

  const deleteTask = async (taskId: string) => {
    await deleteEncryptedRecord(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const addAttachment = async (startupId: string, file: File, itemId?: string) => {
    if (!masterKeyRef.current) throw new Error('Coffre verrouillé');
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const base64File = arrayBufferToBase64(bytes);

    const attachmentRecord: EncryptedAttachment = {
      id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      startupId,
      itemId,
      filename: file.name,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream',
      encryptedBase64: '',
      ivBase64: '',
      uploadedAt: new Date().toISOString(),
    };

    // Encrypt the payload containing the file base64 data
    const enc = await encryptData({ base64Content: base64File, meta: attachmentRecord }, masterKeyRef.current);
    attachmentRecord.encryptedBase64 = enc.ciphertextBase64;
    attachmentRecord.ivBase64 = enc.ivBase64;

    await putEncryptedRecord(attachmentRecord.id, 'document', enc.ciphertextBase64, enc.ivBase64);
    setAttachments((prev) => [attachmentRecord, ...prev]);
  };

  const runSecurityAudit = async () => {
    return inspectStorageLeakage();
  };

  return (
    <VaultContext.Provider
      value={{
        status,
        metadata,
        passkeySupport,
        hasPasskeyEnrolled: !!metadata?.passkeyCredentialId,
        autoLockMinutes,
        setAutoLockMinutes,
        initializeVault,
        unlockWithPassphrase,
        unlockWithPasskey,
        lockVault,
        changePassphrase,
        enrollPasskey,
        removePasskey,
        resetEntireVault,
        exportEncryptedBackup,
        importEncryptedBackup,
        startups,
        analyses,
        financials,
        valuations,
        dueDiligence,
        portfolio,
        contacts,
        interactions,
        tasks,
        attachments,
        saveStartup,
        deleteStartup,
        saveAnalysis,
        saveFinancialModel,
        saveValuation,
        deleteValuation,
        saveDueDiligenceItem,
        saveInvestmentPortfolio,
        saveContact,
        deleteContact,
        saveInteraction,
        saveTask,
        deleteTask,
        addAttachment,
        loadDemoSeedData,
        runSecurityAudit,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export function useVault(): VaultContextType {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
}
