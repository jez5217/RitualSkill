"use client";

import { useMemo, useState } from "react";
import { PrivateKey, decrypt, encrypt } from "eciesjs";
import { bytesToHex, hexToBytes } from "viem";
import { PrecompileBadge } from "@/components/site/PrecompileBadge";
// Importing lib/secrets.ts sets ECIES_CONFIG.symmetricNonceLength = 12 as a module side effect,
// so this demo uses the exact same encryption config as the real submit flow.
import "@/lib/secrets";

export function SecretsDemo() {
  // A throwaway keypair generated in-browser, standing in for a TEE executor's ECIES keypair.
  // Real code never has access to the executor's private key — it's only here so this demo can
  // show a genuine, working decrypt round-trip.
  const executorKey = useMemo(() => new PrivateKey(), []);

  const [secretValue, setSecretValue] = useState("sk-demo-1234567890abcdef");
  const [ciphertext, setCiphertext] = useState<string | null>(null);
  const [decrypted, setDecrypted] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function runEncrypt() {
    setBusy(true);
    setDecrypted(null);
    setTimeout(() => {
      const json = JSON.stringify({ API_KEY: secretValue });
      const encrypted = encrypt(executorKey.publicKey.toBytes(), new TextEncoder().encode(json));
      setCiphertext(bytesToHex(encrypted));
      setBusy(false);
    }, 400);
  }

  function runDecrypt() {
    if (!ciphertext) return;
    const plain = decrypt(executorKey.secret, hexToBytes(ciphertext as `0x${string}`));
    setDecrypted(new TextDecoder().decode(plain));
  }

  return (
    <div className="bg-ritual-elevated border border-gray-800 rounded-xl shadow-card p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-display text-base text-gray-100">Secret Encryption</h3>
        <PrecompileBadge address="ECIES" label="real crypto, demo keypair" color="gold" />
      </div>
      <p className="text-xs text-gray-500 mb-4">
        This runs the actual ECIES encryption used by the app (12-byte AES-GCM nonce, same as
        Ritual expects) against a throwaway keypair generated in your browser — the ciphertext
        below is genuine, not a mock string.
      </p>

      <label className="text-xs text-gray-500 uppercase tracking-wider">Secret value (e.g. an API key)</label>
      <input
        value={secretValue}
        onChange={(e) => setSecretValue(e.target.value)}
        className="w-full mt-1 mb-3 bg-ritual-surface border border-gray-700 rounded-lg px-4 py-2.5 text-sm
                   text-gray-300 font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ritual-gold/50"
      />

      <div className="flex gap-2 mb-4">
        <button
          onClick={runEncrypt}
          disabled={busy || !secretValue}
          className="px-4 py-2 border border-ritual-gold text-ritual-gold hover:bg-ritual-gold/10
                     disabled:opacity-40 rounded-lg text-sm font-semibold"
        >
          {busy ? "Encrypting…" : "Encrypt for executor"}
        </button>
        {ciphertext && (
          <button
            onClick={runDecrypt}
            className="px-4 py-2 border border-gray-700 text-gray-400 hover:text-gray-200 rounded-lg text-sm"
          >
            Decrypt (simulate executor)
          </button>
        )}
      </div>

      {ciphertext && (
        <div className="border-t border-gray-800 pt-3 space-y-2">
          <p className="text-xs text-gray-500">
            Ciphertext ({ciphertext.length / 2 - 1} bytes) — this is what actually goes on-chain:
          </p>
          <p className="font-mono text-xs text-gray-400 break-all bg-black border border-gray-800 rounded-lg p-2.5">
            {ciphertext}
          </p>
          {decrypted && (
            <p className="text-xs text-ritual-green">
              Decrypted inside the (simulated) enclave: <span className="font-mono">{decrypted}</span>
            </p>
          )}
        </div>
      )}

      <p className="text-xs text-gray-600 mt-4 pt-3 border-t border-gray-800">
        In a request, the plaintext key name (e.g. <code className="font-mono">API_KEY</code>) is
        used as a placeholder in headers/URL/body. The executor decrypts this blob inside its TEE
        and replaces every literal occurrence of that placeholder — the real value is never visible
        on-chain.
      </p>
    </div>
  );
}
