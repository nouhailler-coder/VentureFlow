import { describe, it, expect, beforeAll } from 'vitest';
import {
  generateMasterVaultKey,
  deriveKeyFromPassphrase,
  wrapMasterKey,
  unwrapMasterKey,
  encryptData,
  decryptData,
  computeHmac,
  verifyHmac,
  generateRandomBytes,
  arrayBufferToBase64,
  base64ToUint8Array,
  SALT_LENGTH_BYTES,
} from '../crypto/vaultCrypto';

describe('VentureFlow Cryptographic Core (Web Crypto API)', () => {
  it('performs an AES-GCM 256-bit encryption and decryption round-trip', async () => {
    const key = await generateMasterVaultKey();
    const payload = {
      startup: 'QuantumDrive Technologies',
      preMoney: 12500000,
      confidentialNotes: 'Discussions avancées avec fonds souverain',
    };

    const { ciphertextBase64, ivBase64 } = await encryptData(payload, key);
    expect(ciphertextBase64).toBeTruthy();
    expect(ivBase64).toBeTruthy();
    // Ciphertext must not contain plaintext strings
    expect(ciphertextBase64).not.toContain('QuantumDrive');

    const decrypted = await decryptData<typeof payload>(ciphertextBase64, ivBase64, key);
    expect(decrypted).toEqual(payload);
  });

  it('correctly derives keys via PBKDF2-SHA-256 and wraps/unwraps master keys', async () => {
    const salt = generateRandomBytes(SALT_LENGTH_BYTES);
    const passphrase = 'UltraSecureVault_Passphrase_2026!';
    const wrappingKey = await deriveKeyFromPassphrase(passphrase, salt, 25000);
    const masterKey = await generateMasterVaultKey();

    const wrapped = await wrapMasterKey(masterKey, wrappingKey);
    expect(wrapped.wrappedKeyBase64).toBeTruthy();
    expect(wrapped.ivBase64).toBeTruthy();

    const unwrappedKey = await unwrapMasterKey(wrapped.wrappedKeyBase64, wrapped.ivBase64, wrappingKey);
    expect(unwrappedKey).toBeTruthy();

    // Verify unwrapped key can decrypt data encrypted with original master key
    const testSecret = { dealId: 'deal-007', secretNote: 'Top secret thesis' };
    const encrypted = await encryptData(testSecret, masterKey);
    const decrypted = await decryptData<typeof testSecret>(encrypted.ciphertextBase64, encrypted.ivBase64, unwrappedKey);
    expect(decrypted).toEqual(testSecret);
  });

  it('strictly rejects decryption if the passphrase is wrong', async () => {
    const salt = generateRandomBytes(SALT_LENGTH_BYTES);
    const correctPassphrase = 'CorrectPassphrase_2026';
    const wrongPassphrase = 'WrongPassphrase_2026';

    const correctKey = await deriveKeyFromPassphrase(correctPassphrase, salt, 10000);
    const wrongKey = await deriveKeyFromPassphrase(wrongPassphrase, salt, 10000);
    const masterKey = await generateMasterVaultKey();

    const wrapped = await wrapMasterKey(masterKey, correctKey);

    await expect(
      unwrapMasterKey(wrapped.wrappedKeyBase64, wrapped.ivBase64, wrongKey)
    ).rejects.toThrow();
  });

  it('detects tampering and integrity violation (AES-GCM Auth Tag validation)', async () => {
    const key = await generateMasterVaultKey();
    const data = { val: 4200000 };
    const { ciphertextBase64, ivBase64 } = await encryptData(data, key);

    // Corrupt one byte of the ciphertext
    const bytes = base64ToUint8Array(ciphertextBase64);
    bytes[2] ^= 0xff;
    const corruptedBase64 = arrayBufferToBase64(bytes);

    await expect(decryptData(corruptedBase64, ivBase64, key)).rejects.toThrow();
  });

  it('computes and verifies HMAC-SHA-256 integrity digests', async () => {
    const message = JSON.stringify({ audit: 'passed', timestamp: '2026-10-27' });
    const secret = 'HMACSecretToken_2026';

    const hmac = await computeHmac(message, secret);
    const valid = await verifyHmac(message, hmac, secret);
    expect(valid).toBe(true);

    const tampered = await verifyHmac(message + '!', hmac, secret);
    expect(tampered).toBe(false);

    const wrongKey = await verifyHmac(message, hmac, 'different_secret');
    expect(wrongKey).toBe(false);
  });
});
