import { encrypt, ECIES_CONFIG } from "eciesjs";
import { bytesToHex, type Hex } from "viem";

// MANDATORY for Ritual: executors expect a 12-byte AES-GCM nonce. eciesjs defaults to 16.
ECIES_CONFIG.symmetricNonceLength = 12;

/**
 * ECIES-encrypts a secrets JSON object to a TEE executor's public key. Only that executor's
 * enclave can decrypt it. For the Sovereign Agent precompile this is a single opaque blob
 * (unlike HTTP's `bytes[]` array) — see ritual-dapp-agents.
 */
export function encryptAgentSecrets(secrets: Record<string, string>, executorPublicKey: Hex): Hex {
  const json = JSON.stringify(secrets);
  const encrypted = encrypt(executorPublicKey.slice(2), new TextEncoder().encode(json));
  return bytesToHex(encrypted);
}

/** Secrets payload for the Ritual-hosted model gateway — no external LLM API key required. */
export function ritualProviderSecrets(): Record<string, string> {
  return { LLM_PROVIDER: "ritual" };
}
