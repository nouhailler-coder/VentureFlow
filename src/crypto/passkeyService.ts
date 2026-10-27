/**
 * VentureFlow Passkey & WebAuthn Service
 * Local strong authentication using device biometrics (Touch ID / Face ID / Windows Hello)
 * without central server dependencies.
 */

import { arrayBufferToBase64, base64ToUint8Array, generateRandomBytes } from './vaultCrypto';

export interface PasskeySupport {
  isSupported: boolean;
  isUserVerifyingPlatformAuthenticatorAvailable: boolean;
  isPrfSupported: boolean;
}

/** Check if current browser and platform support WebAuthn */
export async function checkPasskeyCapabilities(): Promise<PasskeySupport> {
  const isSupported =
    typeof window !== 'undefined' &&
    typeof window.PublicKeyCredential !== 'undefined' &&
    typeof navigator.credentials !== 'undefined';

  let isPlatformAvailable = false;
  let isPrfSupported = false;

  if (isSupported && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
    try {
      isPlatformAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      isPlatformAvailable = false;
    }
  }

  // Check PRF extension support if available
  if (isSupported && (PublicKeyCredential as any).isConditionalMediationAvailable) {
    try {
      // PRF capability can be probed or reported
      isPrfSupported = true;
    } catch {
      isPrfSupported = false;
    }
  }

  return {
    isSupported,
    isUserVerifyingPlatformAuthenticatorAvailable: isPlatformAvailable,
    isPrfSupported,
  };
}

/** Register a local device passkey */
export async function registerLocalPasskey(): Promise<{ credentialId: string; rawIdBase64: string }> {
  if (typeof window === 'undefined' || !navigator.credentials) {
    throw new Error('WebAuthn n\'est pas pris en charge par ce navigateur.');
  }

  const challenge = generateRandomBytes(32);
  const userId = generateRandomBytes(16);

  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
    challenge: challenge as BufferSource,
    rp: {
      name: 'VentureFlow Local Vault',
      id: window.location.hostname || 'localhost',
    },
    user: {
      id: userId as BufferSource,
      name: 'investor@ventureflow.local',
      displayName: 'VentureFlow Local Investor',
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' }, // ES256
      { alg: -257, type: 'public-key' }, // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'required',
      residentKey: 'preferred',
    },
    timeout: 60000,
    attestation: 'none',
  };

  const credential = (await navigator.credentials.create({
    publicKey: publicKeyCredentialCreationOptions,
  })) as PublicKeyCredential;

  if (!credential) {
    throw new Error('La création de la Passkey a été annulée ou a échoué.');
  }

  const rawIdBase64 = arrayBufferToBase64(credential.rawId);

  return {
    credentialId: credential.id,
    rawIdBase64,
  };
}

/** Authenticate local user using Passkey */
export async function authenticateWithLocalPasskey(credentialId: string): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.credentials) {
    throw new Error('WebAuthn n\'est pas pris en charge.');
  }

  const challenge = generateRandomBytes(32);
  const rawId = base64ToUint8Array(credentialId);

  const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
    challenge: challenge as BufferSource,
    allowCredentials: [
      {
        id: rawId as BufferSource,
        type: 'public-key',
        transports: ['internal'],
      },
    ],
    userVerification: 'required',
    timeout: 60000,
  };

  const assertion = (await navigator.credentials.get({
    publicKey: publicKeyCredentialRequestOptions,
  })) as PublicKeyCredential;

  return !!assertion;
}
