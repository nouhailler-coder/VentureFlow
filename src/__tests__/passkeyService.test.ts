import { describe, it, expect } from 'vitest';
import {
  checkPasskeyCapabilities,
  deriveKeyFromPrfBytes,
} from '../crypto/passkeyService';
import { generateMasterVaultKey, wrapMasterKey, unwrapMasterKey, generateRandomBytes } from '../crypto/vaultCrypto';

describe('VentureFlow Passkey & WebAuthn PRF Subsystem', () => {
  it('correctly reports capabilities in current environment', async () => {
    const caps = await checkPasskeyCapabilities();
    expect(caps).toHaveProperty('isSupported');
    expect(caps).toHaveProperty('isUserVerifyingPlatformAuthenticatorAvailable');
    expect(caps).toHaveProperty('isPrfSupported');
    expect(typeof caps.isSupported).toBe('boolean');
  });

  it('derives an AES-GCM 256 wrapping key from PRF bytes using HKDF-SHA-256', async () => {
    const fakePrfOutput = generateRandomBytes(32);
    const prfWrappingKey = await deriveKeyFromPrfBytes(fakePrfOutput);
    expect(prfWrappingKey).toBeTruthy();
    expect(prfWrappingKey.algorithm.name).toBe('AES-GCM');

    // Test that the PRF-derived key can wrap and unwrap a master key
    const masterKey = await generateMasterVaultKey();
    const wrapped = await wrapMasterKey(masterKey, prfWrappingKey);
    const unwrapped = await unwrapMasterKey(wrapped.wrappedKeyBase64, wrapped.ivBase64, prfWrappingKey);
    expect(unwrapped).toBeTruthy();
  });

  it('rejects derivation if PRF output is less than 32 bytes', async () => {
    const truncatedPrfOutput = new Uint8Array(16);
    await expect(deriveKeyFromPrfBytes(truncatedPrfOutput)).rejects.toThrow(
      'min. 32 octets'
    );
  });
});
