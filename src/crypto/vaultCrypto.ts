/**
 * VentureFlow Cryptographic Engine
 * Standard Web Crypto API primitives:
 * - AES-GCM 256 bits
 * - PBKDF2 with SHA-256 (250,000 iterations)
 * - Cryptographically secure IV generation (12 bytes)
 * - HMAC-SHA-256 for integrity verification
 */

export const PBKDF2_DEFAULT_ITERATIONS = 250000;
export const AES_GCM_KEY_LENGTH = 256;
export const IV_LENGTH_BYTES = 12;
export const SALT_LENGTH_BYTES = 16;

/** Convert Uint8Array to Base64 string safely */
export function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/** Convert Base64 string to Uint8Array safely */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = window.atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Generate cryptographically strong random bytes */
export function generateRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  window.crypto.getRandomValues(bytes);
  return bytes;
}

/** Derive an AES-GCM Key from a user passphrase using PBKDF2-SHA-256 */
export async function deriveKeyFromPassphrase(
  passphrase: string,
  salt: Uint8Array,
  iterations = PBKDF2_DEFAULT_ITERATIONS
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passphraseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations,
      hash: 'SHA-256',
    },
    passphraseKey,
    { name: 'AES-GCM', length: AES_GCM_KEY_LENGTH },
    false,
    ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
  );
}

/** Generate an ephemeral/master AES-GCM 256-bit Data Encryption Key (DEK) */
export async function generateMasterVaultKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: AES_GCM_KEY_LENGTH },
    true, // extractable so it can be wrapped and persisted in encrypted form
    ['encrypt', 'decrypt']
  );
}

/** Wrap the master key using a passphrase-derived Key */
export async function wrapMasterKey(
  masterKey: CryptoKey,
  wrappingKey: CryptoKey
): Promise<{ wrappedKeyBase64: string; ivBase64: string }> {
  const iv = generateRandomBytes(IV_LENGTH_BYTES);
  const wrapped = await window.crypto.subtle.wrapKey(
    'raw',
    masterKey,
    wrappingKey,
    { name: 'AES-GCM', iv: iv as BufferSource }
  );

  return {
    wrappedKeyBase64: arrayBufferToBase64(wrapped),
    ivBase64: arrayBufferToBase64(iv),
  };
}

/** Unwrap the master key using the passphrase-derived Key */
export async function unwrapMasterKey(
  wrappedKeyBase64: string,
  ivBase64: string,
  wrappingKey: CryptoKey
): Promise<CryptoKey> {
  const wrappedBuffer = base64ToUint8Array(wrappedKeyBase64);
  const iv = base64ToUint8Array(ivBase64);

  return window.crypto.subtle.unwrapKey(
    'raw',
    wrappedBuffer as BufferSource,
    wrappingKey,
    { name: 'AES-GCM', iv: iv as BufferSource },
    { name: 'AES-GCM', length: AES_GCM_KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

/** Encrypt arbitrary JSON data with AES-256-GCM */
export async function encryptData(
  data: unknown,
  key: CryptoKey
): Promise<{ ciphertextBase64: string; ivBase64: string }> {
  const encoder = new TextEncoder();
  const plaintext = encoder.encode(JSON.stringify(data));
  const iv = generateRandomBytes(IV_LENGTH_BYTES);

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    plaintext
  );

  return {
    ciphertextBase64: arrayBufferToBase64(ciphertext),
    ivBase64: arrayBufferToBase64(iv),
  };
}

/** Decrypt AES-256-GCM ciphertext back into JSON data */
export async function decryptData<T>(
  ciphertextBase64: string,
  ivBase64: string,
  key: CryptoKey
): Promise<T> {
  const ciphertext = base64ToUint8Array(ciphertextBase64);
  const iv = base64ToUint8Array(ivBase64);

  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    ciphertext as BufferSource
  );

  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(decrypted)) as T;
}

/** Compute HMAC-SHA-256 digest of data using a secret passphrase string */
export async function computeHmac(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await window.crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return arrayBufferToBase64(signature);
}

/** Verify HMAC-SHA-256 digest */
export async function verifyHmac(
  data: string,
  hmacBase64: string,
  secret: string
): Promise<boolean> {
  const calculated = await computeHmac(data, secret);
  return calculated === hmacBase64;
}

/** Cryptographic Self-Test Suite for Security Audit in Section 11 */
export interface CryptoTestResult {
  name: string;
  passed: boolean;
  durationMs: number;
  details: string;
}

export async function runCryptographicSelfTests(): Promise<CryptoTestResult[]> {
  const results: CryptoTestResult[] = [];

  // Test 1: AES-GCM 256 Round-Trip
  const t1Start = performance.now();
  try {
    const key = await generateMasterVaultKey();
    const testPayload = { secret: 'VentureFlow Confidential Deal', valuation: 15000000 };
    const { ciphertextBase64, ivBase64 } = await encryptData(testPayload, key);
    const decrypted = await decryptData<typeof testPayload>(ciphertextBase64, ivBase64, key);
    const passed = decrypted.secret === testPayload.secret && decrypted.valuation === testPayload.valuation;
    results.push({
      name: 'Chiffrement/Déchiffrement AES-GCM 256 bits',
      passed,
      durationMs: Math.round(performance.now() - t1Start),
      details: 'Vérification round-trip réussie avec vecteur de test aléatoire.',
    });
  } catch (err: any) {
    results.push({
      name: 'Chiffrement/Déchiffrement AES-GCM 256 bits',
      passed: false,
      durationMs: Math.round(performance.now() - t1Start),
      details: String(err?.message || err),
    });
  }

  // Test 2: PBKDF2-SHA-256 Key Derivation & Wrapping
  const t2Start = performance.now();
  try {
    const salt = generateRandomBytes(SALT_LENGTH_BYTES);
    const wrappingKey = await deriveKeyFromPassphrase('VaultPassphrase_2026!#', salt, 50000);
    const masterKey = await generateMasterVaultKey();
    const { wrappedKeyBase64, ivBase64 } = await wrapMasterKey(masterKey, wrappingKey);
    const unwrappedKey = await unwrapMasterKey(wrappedKeyBase64, ivBase64, wrappingKey);

    // Verify unwrapped key functions properly
    const encrypted = await encryptData({ test: 'integrity' }, unwrappedKey);
    const decrypted = await decryptData<{ test: string }>(encrypted.ciphertextBase64, encrypted.ivBase64, masterKey);

    results.push({
      name: 'Dérivation PBKDF2-SHA-256 & Enveloppement de clé',
      passed: decrypted.test === 'integrity',
      durationMs: Math.round(performance.now() - t2Start),
      details: 'Dérivation conforme, clé maîtresse scellée et déballée sans perte d\'intégrité.',
    });
  } catch (err: any) {
    results.push({
      name: 'Dérivation PBKDF2-SHA-256 & Enveloppement de clé',
      passed: false,
      durationMs: Math.round(performance.now() - t2Start),
      details: String(err?.message || err),
    });
  }

  // Test 3: Tamper Detection (Authentication Tag failure)
  const t3Start = performance.now();
  try {
    const key = await generateMasterVaultKey();
    const { ciphertextBase64, ivBase64 } = await encryptData({ tamper: 'safe' }, key);
    
    // Corrupt one byte of ciphertext
    const bytes = base64ToUint8Array(ciphertextBase64);
    bytes[0] ^= 0x55;
    const tamperedBase64 = arrayBufferToBase64(bytes);

    let failedAsExpected = false;
    try {
      await decryptData(tamperedBase64, ivBase64, key);
    } catch {
      failedAsExpected = true;
    }

    results.push({
      name: 'Détection d\'altération et intégrité AES-GCM (Auth Tag)',
      passed: failedAsExpected,
      durationMs: Math.round(performance.now() - t3Start),
      details: 'Toute modification de bit dans le ciphertext lève une exception d\'authentification sans fuite.',
    });
  } catch (err: any) {
    results.push({
      name: 'Détection d\'altération et intégrité AES-GCM (Auth Tag)',
      passed: false,
      durationMs: Math.round(performance.now() - t3Start),
      details: String(err?.message || err),
    });
  }

  // Test 4: HMAC-SHA-256 Integrity Verification
  const t4Start = performance.now();
  try {
    const data = JSON.stringify({ deal: 'Acme Corp', amount: 5000000 });
    const hmac = await computeHmac(data, 'secret_audit_pass');
    const valid = await verifyHmac(data, hmac, 'secret_audit_pass');
    const invalid = await verifyHmac(data + 'modified', hmac, 'secret_audit_pass');

    results.push({
      name: 'Contrôle d\'intégrité cryptographique HMAC-SHA-256',
      passed: valid && !invalid,
      durationMs: Math.round(performance.now() - t4Start),
      details: 'Calcul et validation HMAC validés; altération immédiatement rejetée.',
    });
  } catch (err: any) {
    results.push({
      name: 'Contrôle d\'intégrité cryptographique HMAC-SHA-256',
      passed: false,
      durationMs: Math.round(performance.now() - t4Start),
      details: String(err?.message || err),
    });
  }

  return results;
}
