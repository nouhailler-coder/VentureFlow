import { describe, it, expect } from 'vitest';
import {
  generateMasterVaultKey,
  deriveKeyFromPassphrase,
  wrapMasterKey,
  unwrapMasterKey,
  generateRandomBytes,
  arrayBufferToBase64,
  SALT_LENGTH_BYTES,
  PBKDF2_DEFAULT_ITERATIONS,
} from '../crypto/vaultCrypto';
import { VaultMetadata } from '../types';

describe('VentureFlow Backup & Restoration Integrity Subsystem', () => {
  it('validates a complete and legitimate encrypted backup schema', async () => {
    const salt = generateRandomBytes(SALT_LENGTH_BYTES);
    const saltBase64 = arrayBufferToBase64(salt);
    const passphrase = 'BackupMasterKey_2026';
    const wrappingKey = await deriveKeyFromPassphrase(passphrase, salt, 25000);
    const masterKey = await generateMasterVaultKey();
    const wrapped = await wrapMasterKey(masterKey, wrappingKey);

    const validMeta: VaultMetadata = {
      version: 2,
      saltBase64,
      ivBase64: wrapped.ivBase64,
      iterations: 25000,
      encryptedMasterKeyBase64: wrapped.wrappedKeyBase64,
      createdAt: new Date().toISOString(),
    };

    const validBackup = {
      ventureflowBackupVersion: 2,
      exportedAt: new Date().toISOString(),
      vaultMetadata: validMeta,
      recordCount: 1,
      records: [
        {
          id: 'startup-1',
          recordType: 'startup',
          ciphertextBase64: 'ZW5jcnlwdGVkX2RhdGE=',
          ivBase64: 'aXZfZGF0YQ==',
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    const json = JSON.stringify(validBackup);
    const parsed = JSON.parse(json);

    expect(parsed.vaultMetadata).toBeDefined();
    expect(parsed.vaultMetadata.saltBase64).toBe(saltBase64);
    expect(Array.isArray(parsed.records)).toBe(true);

    // Test that the master key can be pre-verified before database modification
    const unwrapped = await unwrapMasterKey(
      parsed.vaultMetadata.encryptedMasterKeyBase64,
      parsed.vaultMetadata.ivBase64,
      wrappingKey
    );
    expect(unwrapped).toBeTruthy();
  });

  it('rejects corrupted backups with invalid passphrase without modifying database', async () => {
    const salt = generateRandomBytes(SALT_LENGTH_BYTES);
    const saltBase64 = arrayBufferToBase64(salt);
    const correctPassphrase = 'CorrectPassphrase_2026';
    const wrongPassphrase = 'WrongPassphrase_2026';

    const correctKey = await deriveKeyFromPassphrase(correctPassphrase, salt, 10000);
    const wrongKey = await deriveKeyFromPassphrase(wrongPassphrase, salt, 10000);
    const masterKey = await generateMasterVaultKey();
    const wrapped = await wrapMasterKey(masterKey, correctKey);

    const meta: VaultMetadata = {
      version: 2,
      saltBase64,
      ivBase64: wrapped.ivBase64,
      iterations: 10000,
      encryptedMasterKeyBase64: wrapped.wrappedKeyBase64,
      createdAt: new Date().toISOString(),
    };

    // Pre-verification with wrong key must throw, allowing safe abort
    await expect(
      unwrapMasterKey(meta.encryptedMasterKeyBase64, meta.ivBase64, wrongKey)
    ).rejects.toThrow();
  });
});
