"use client";

import { keccak256, toHex, type Address } from "viem";

// Real WebAuthn (P-256) helpers — ritual-dapp-passkey skill, sections 2-4.
// Every call here hits the actual browser platform authenticator (Face ID /
// Touch ID / Windows Hello); nothing in this file is simulated.

export function isPasskeySupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential !== "undefined" &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function"
  );
}

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isPasskeySupported()) return false;
  return window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
}

export interface WebAuthnErrorResult {
  error: string;
  code: "CANCELLED" | "WRONG_DOMAIN" | "DUPLICATE" | "UNSUPPORTED" | "UNKNOWN";
}

export async function safeWebAuthnCall<T>(fn: () => Promise<T>): Promise<{ result: T } | WebAuthnErrorResult> {
  try {
    return { result: await fn() };
  } catch (err) {
    if (err instanceof DOMException) {
      switch (err.name) {
        case "NotAllowedError":
          return { error: "You cancelled the biometric prompt, or it timed out.", code: "CANCELLED" };
        case "SecurityError":
          return { error: "WebAuthn blocked — the RP ID doesn't match this domain.", code: "WRONG_DOMAIN" };
        case "InvalidStateError":
          return { error: "A credential already exists for this session.", code: "DUPLICATE" };
        case "NotSupportedError":
          return { error: "This browser/device doesn't support the requested authenticator.", code: "UNSUPPORTED" };
        default:
          return { error: `WebAuthn error: ${err.name} — ${err.message}`, code: "UNKNOWN" };
      }
    }
    return { error: String(err), code: "UNKNOWN" };
  }
}

export interface PasskeyCredential {
  credentialId: string;
  rawCredentialId: ArrayBuffer;
  x: Uint8Array;
  y: Uint8Array;
  /** Uncompressed SEC1 point: 0x04 || x || y — what the SECP256R1 precompile and WebCrypto both expect. */
  uncompressedPubkey: Uint8Array;
}

/** Extracts the raw P-256 (x, y) point from an attestation's COSE public key. */
function extractP256PublicKey(attestation: AuthenticatorAttestationResponse): Uint8Array {
  const der = attestation.getPublicKey?.();
  if (!der) throw new Error("This browser doesn't expose getPublicKey() — try Chrome or Edge.");
  const bytes = new Uint8Array(der);
  // SubjectPublicKeyInfo for P-256: last 65 bytes = 0x04 || x(32) || y(32).
  const uncompressed = bytes.slice(-65);
  if (uncompressed[0] !== 0x04) throw new Error("Expected an uncompressed P-256 key.");
  return uncompressed;
}

/** Registers a brand-new passkey bound to this device — triggers a real biometric prompt. */
export async function createPasskey(rpName: string): Promise<PasskeyCredential> {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  // Random per-session handle so repeat demo visits never collide with a
  // previously-created resident credential for the same rp+user pair.
  const userId = crypto.getRandomValues(new Uint8Array(16));
  const username = `ritual-demo-${toHex(userId).slice(2, 10)}`;

  const credential = (await navigator.credentials.create({
    publicKey: {
      rp: { name: rpName, id: window.location.hostname },
      user: { id: userId, name: username, displayName: username },
      challenge,
      pubKeyCredParams: [{ alg: -7, type: "public-key" }], // ES256 = P-256 + SHA-256
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "required",
        userVerification: "required",
      },
      attestation: "none",
    },
  })) as PublicKeyCredential;

  const attestation = credential.response as AuthenticatorAttestationResponse;
  const uncompressedPubkey = extractP256PublicKey(attestation);

  return {
    credentialId: credential.id,
    rawCredentialId: credential.rawId,
    x: uncompressedPubkey.slice(1, 33),
    y: uncompressedPubkey.slice(33, 65),
    uncompressedPubkey,
  };
}

// P-256 curve order — signatures with s > n/2 are the malleable "high-s" form.
const P256_N = 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n;
const P256_HALF_N = P256_N / 2n;

function bytesToBigInt(bytes: Uint8Array): bigint {
  return BigInt("0x" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join(""));
}

function bigIntToBytes32(n: bigint): Uint8Array {
  const hex = n.toString(16).padStart(64, "0");
  return new Uint8Array(hex.match(/.{2}/g)!.map((b) => parseInt(b, 16)));
}

function normalizeS(s: Uint8Array): Uint8Array {
  const sBigInt = bytesToBigInt(s);
  return sBigInt > P256_HALF_N ? bigIntToBytes32(P256_N - sBigInt) : s;
}

function padTo32(bytes: Uint8Array): Uint8Array {
  if (bytes.length === 32) return bytes;
  if (bytes.length === 33 && bytes[0] === 0x00) return bytes.slice(1);
  if (bytes.length < 32) {
    const padded = new Uint8Array(32);
    padded.set(bytes, 32 - bytes.length);
    return padded;
  }
  throw new Error(`Unexpected integer length: ${bytes.length}`);
}

/** Parses a DER-encoded ECDSA signature (0x30 <len> 0x02 <rLen> <r> 0x02 <sLen> <s>) into raw (r, s). */
function parseDerSignature(der: Uint8Array): { r: Uint8Array; s: Uint8Array } {
  let offset = 2; // skip 0x30 + total length
  if (der[offset] !== 0x02) throw new Error("Invalid DER signature");
  offset++;
  const rLen = der[offset++];
  const rRaw = der.slice(offset, offset + rLen);
  offset += rLen;

  if (der[offset] !== 0x02) throw new Error("Invalid DER signature");
  offset++;
  const sLen = der[offset++];
  const sRaw = der.slice(offset, offset + sLen);

  return { r: padTo32(rRaw), s: padTo32(sRaw) };
}

export interface PasskeyAssertion {
  r: Uint8Array;
  s: Uint8Array;
  authenticatorData: Uint8Array;
  clientDataJSONBytes: Uint8Array;
}

/** Signs a fresh random challenge with the registered passkey — triggers a real biometric prompt. */
export async function signWithPasskey(rawCredentialId: ArrayBuffer): Promise<PasskeyAssertion> {
  const challenge = crypto.getRandomValues(new Uint8Array(32));

  const assertion = (await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [{ id: rawCredentialId, type: "public-key" }],
      userVerification: "required",
    },
  })) as PublicKeyCredential;

  const response = assertion.response as AuthenticatorAssertionResponse;
  const { r, s } = parseDerSignature(new Uint8Array(response.signature));

  return {
    r,
    s: normalizeS(s),
    authenticatorData: new Uint8Array(response.authenticatorData),
    clientDataJSONBytes: new Uint8Array(response.clientDataJSON),
  };
}

/**
 * Reconstructs exactly what the authenticator signed: authenticatorData ||
 * SHA-256(clientDataJSON). The SECP256R1 precompile takes this as its raw
 * `message` and SHA-256s it internally — so this, unhashed, is the correct
 * input, not a further-hashed digest.
 */
export async function buildSignedMessage(a: PasskeyAssertion): Promise<Uint8Array> {
  const clientDataHash = new Uint8Array(await crypto.subtle.digest("SHA-256", a.clientDataJSONBytes as BufferSource));
  const message = new Uint8Array(a.authenticatorData.length + clientDataHash.length);
  message.set(a.authenticatorData, 0);
  message.set(clientDataHash, a.authenticatorData.length);
  return message;
}

/** Local cross-check via WebCrypto — independent of the on-chain precompile call. */
export async function verifyLocally(uncompressedPubkey: Uint8Array, a: PasskeyAssertion): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    uncompressedPubkey.buffer.slice(
      uncompressedPubkey.byteOffset,
      uncompressedPubkey.byteOffset + uncompressedPubkey.byteLength
    ) as BufferSource,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["verify"]
  );
  const clientDataHash = await crypto.subtle.digest("SHA-256", a.clientDataJSONBytes as BufferSource);
  const toVerify = new Uint8Array(a.authenticatorData.length + 32);
  toVerify.set(a.authenticatorData, 0);
  toVerify.set(new Uint8Array(clientDataHash), a.authenticatorData.length);

  const ieee1363Signature = new Uint8Array(64);
  ieee1363Signature.set(a.r, 0);
  ieee1363Signature.set(a.s, 32);

  return crypto.subtle.verify({ name: "ECDSA", hash: { name: "SHA-256" } }, key, ieee1363Signature, toVerify);
}

/** Deterministic Ritual Chain address for a P-256 public key — no registration step needed. */
export function passkeyToAddress(x: Uint8Array, y: Uint8Array): Address {
  const combined = new Uint8Array(64);
  combined.set(x, 0);
  combined.set(y, 32);
  const hash = keccak256(combined);
  return `0x${hash.slice(26)}` as Address;
}
