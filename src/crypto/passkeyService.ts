/**
 * VentureFlow Passkey & WebAuthn Service
 * Local strong authentication & WebAuthn PRF (Pseudo-Random Function) Key Derivation
 * No central server dependencies.
 */

import {
  arrayBufferToBase64,
  base64ToUint8Array,
  generateRandomBytes,
  AES_GCM_KEY_LENGTH,
} from './vaultCrypto';

export interface PasskeySupport {
  isSupported: boolean;
  isUserVerifyingPlatformAuthenticatorAvailable: boolean;
  isPrfSupported: boolean;
}

export interface PasskeyRegistrationResult {
  credentialId: string;
  rawIdBase64: string;
  prfEnabled: boolean;
  prfKeyMaterial?: Uint8Array;
}

export interface PasskeyAuthResult {
  authenticated: boolean;
  prfKeyMaterial?: Uint8Array;
}

/** Check if current browser and platform support WebAuthn and PRF extension */
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

  // Check client capabilities for PRF if the API exists (Chrome 116+, Safari 18+)
  if (isSupported && typeof (PublicKeyCredential as any).getClientCapabilities === 'function') {
    try {
      const caps = await (PublicKeyCredential as any).getClientCapabilities();
      if (caps && caps['prf']) {
        isPrfSupported = true;
      }
    } catch {
      // Fallback
    }
  }

  // If getClientCapabilities is not available, we test if platform authenticator is available.
  // Note: Modern macOS / iOS Safari 17+ and Chrome 116+ on Windows 11 / Mac support PRF.
  // We mark isPrfSupported as true if getClientCapabilities reported true or if user agent indicates modern platform support
  if (!isPrfSupported && isPlatformAvailable && typeof navigator !== 'undefined') {
    const ua = navigator.userAgent;
    const isModernChrome = /Chrome\/([0-9]+)/.test(ua) && parseInt(RegExp.$1, 10) >= 116;
    const isModernSafari = /Version\/([0-9]+)/.test(ua) && parseInt(RegExp.$1, 10) >= 17;
    if (isModernChrome || isModernSafari) {
      isPrfSupported = true;
    }
  }

  return {
    isSupported,
    isUserVerifyingPlatformAuthenticatorAvailable: isPlatformAvailable,
    isPrfSupported,
  };
}

/**
 * Register a local device passkey with optional WebAuthn PRF extension.
 * If PRF is requested and supported by hardware, returns deterministic key material to seal the vault DEK.
 */
export async function registerLocalPasskey(prfSalt?: Uint8Array): Promise<PasskeyRegistrationResult> {
  if (typeof window === 'undefined' || !navigator.credentials) {
    throw new Error('WebAuthn n\'est pas pris en charge par ce navigateur.');
  }

  const challenge = generateRandomBytes(32);
  const userId = generateRandomBytes(16);

  const extensions: any = {};
  if (prfSalt && prfSalt.length === 32) {
    extensions.prf = {
      eval: {
        first: prfSalt as BufferSource,
      },
    };
  } else {
    extensions.prf = {};
  }

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
    extensions,
  };

  const credential = (await navigator.credentials.create({
    publicKey: publicKeyCredentialCreationOptions,
  })) as any;

  if (!credential) {
    throw new Error('La création de la Passkey a été annulée ou a échoué.');
  }

  const rawIdBase64 = arrayBufferToBase64(credential.rawId);
  const clientExtensionResults = credential.getClientExtensionResults ? credential.getClientExtensionResults() : {};
  const prfResult = clientExtensionResults.prf;

  let prfEnabled = false;
  let prfKeyMaterial: Uint8Array | undefined = undefined;

  if (prfResult) {
    if (prfResult.enabled) {
      prfEnabled = true;
    }
    if (prfResult.results && prfResult.results.first) {
      prfKeyMaterial = new Uint8Array(prfResult.results.first);
      prfEnabled = true;
    }
  }

  return {
    credentialId: credential.id,
    rawIdBase64,
    prfEnabled,
    prfKeyMaterial,
  };
}

/**
 * Authenticate local user using Passkey, retrieving PRF derived bytes if salt is provided.
 */
export async function authenticateWithLocalPasskey(
  credentialId: string,
  prfSalt?: Uint8Array
): Promise<PasskeyAuthResult> {
  if (typeof window === 'undefined' || !navigator.credentials) {
    throw new Error('WebAuthn n\'est pas pris en charge.');
  }

  const challenge = generateRandomBytes(32);
  const rawId = base64ToUint8Array(credentialId);

  const extensions: any = {};
  if (prfSalt && prfSalt.length === 32) {
    extensions.prf = {
      eval: {
        first: prfSalt as BufferSource,
      },
    };
  }

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
    extensions: Object.keys(extensions).length > 0 ? extensions : undefined,
  };

  const assertion = (await navigator.credentials.get({
    publicKey: publicKeyCredentialRequestOptions,
  })) as any;

  if (!assertion) {
    return { authenticated: false };
  }

  const clientExtensionResults = assertion.getClientExtensionResults ? assertion.getClientExtensionResults() : {};
  const prfResult = clientExtensionResults.prf;
  let prfKeyMaterial: Uint8Array | undefined = undefined;

  if (prfResult && prfResult.results && prfResult.results.first) {
    prfKeyMaterial = new Uint8Array(prfResult.results.first);
  }

  return {
    authenticated: true,
    prfKeyMaterial,
  };
}

/**
 * Derive an AES-GCM 256 Key from WebAuthn PRF outputs using HKDF-SHA-256
 */
export async function deriveKeyFromPrfBytes(prfBytes: Uint8Array): Promise<CryptoKey> {
  if (prfBytes.length < 32) {
    throw new Error('Sortie PRF insuffisante pour dérivation de clé (min. 32 octets).');
  }

  const crypto = typeof globalThis !== 'undefined' && globalThis.crypto ? globalThis.crypto : (typeof window !== 'undefined' ? window.crypto : undefined);
  if (!crypto) {
    throw new Error('Web Crypto API non disponible.');
  }

  // Import raw PRF output as HKDF key material
  const baseKey = await crypto.subtle.importKey(
    'raw',
    prfBytes as BufferSource,
    { name: 'HKDF' },
    false,
    ['deriveKey']
  );

  const info = new TextEncoder().encode('VentureFlow Vault WebAuthn PRF Master Wrap Key');
  const salt = new Uint8Array(16); // zero salt or domain salt

  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: salt as BufferSource,
      info: info as BufferSource,
    },
    baseKey,
    { name: 'AES-GCM', length: AES_GCM_KEY_LENGTH },
    false,
    ['wrapKey', 'unwrapKey', 'encrypt', 'decrypt']
  );
}
