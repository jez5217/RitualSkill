"use client";

import { useEffect, useMemo, useState } from "react";
import { PrivateKey, decrypt, encrypt } from "eciesjs";
import { bytesToHex, hexToBytes } from "viem";
import { PrecompileBadge } from "@/components/site/PrecompileBadge";
import { StatusBadge } from "@/components/site/StatusBadge";
// Importing lib/secrets.ts sets ECIES_CONFIG.symmetricNonceLength = 12 as a module side effect,
// so this demo uses the exact same encryption config as the real submit flow.
import "@/lib/secrets";
import { classifySecret, preloadSecretsClassifier, type SecretClassification } from "@/lib/secretsClassifier";

const CLASSIFY_DEBOUNCE_MS = 300;

export function SecretsDemo() {
  // A throwaway keypair generated in-browser, standing in for a TEE executor's ECIES keypair.
  // Real code never has access to the executor's private key — it's only here so this demo can
  // show a genuine, working decrypt round-trip.
  const executorKey = useMemo(() => new PrivateKey(), []);

  const [secretValue, setSecretValue] = useState("sk-demo-1234567890abcdef");
  const [ciphertext, setCiphertext] = useState<string | null>(null);
  const [decrypted, setDecrypted] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [classification, setClassification] = useState<SecretClassification | null>(null);

  useEffect(() => {
    preloadSecretsClassifier();
  }, []);

  useEffect(() => {
    if (!secretValue.trim()) {
      setClassification(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      classifySecret(secretValue).then((result) => {
        if (!cancelled) setClassification(result);
      });
    }, CLASSIFY_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [secretValue]);

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
    <div className="feature-card p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-display text-base text-gray-100">Secret Encryption</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status="local" />
          <PrecompileBadge address="ECIES" label="real crypto, demo keypair" color="gold" />
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        This runs the actual ECIES encryption used by the app (12-byte AES-GCM nonce, same as
        Ritual expects) against a throwaway keypair generated in your browser — the ciphertext
        below is genuine, not a mock string.
      </p>

      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <label className="text-xs text-gray-400 uppercase tracking-wider">Secret value (e.g. an API key)</label>
        {classification && (
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              classification.label === "SECRET"
                ? "border-ritual-gold/40 text-ritual-gold bg-ritual-gold/10"
                : "border-ritual-green/40 text-ritual-green bg-ritual-green/10"
            }`}
          >
            {classification.label === "SECRET" ? "🔒 looks like a secret" : "✓ looks safe"}{" "}
            ({(classification.confidence * 100).toFixed(0)}%)
          </span>
        )}
      </div>
      <input
        value={secretValue}
        onChange={(e) => setSecretValue(e.target.value)}
        className="w-full mt-1 mb-1 bg-ritual-surface border border-gray-700 rounded-lg px-4 py-2.5 text-sm
                   text-gray-300 font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ritual-gold/50"
      />
      <p className="text-[11px] text-gray-400 mb-3">
        That badge is a real ONNX classifier (97% val accuracy, trained on ~300 examples) guessing
        whether this text should be ECIES-encrypted — the same call the <code className="font-mono">piiEnabled</code>{" "}
        flag on the HTTP and LLM precompiles asks a contract to make.
      </p>

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
          <p className="text-xs text-gray-400">
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

      <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-800">
        In a request, the plaintext key name (e.g. <code className="font-mono">API_KEY</code>) is
        used as a placeholder in headers/URL/body. The executor decrypts this blob inside its TEE
        and replaces every literal occurrence of that placeholder — the real value is never visible
        on-chain.
      </p>
    </div>
  );
}
