"use client";

import { useState } from "react";
import { PrecompileBadge } from "@/components/site/PrecompileBadge";
import { StatusBadge } from "@/components/site/StatusBadge";

type Stage = "idle" | "registering" | "registered" | "signing" | "verified";

function randomHex(bytes: number) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function PasskeyDemo() {
  const [stage, setStage] = useState<Stage>("idle");
  const [credentialId] = useState(() => randomHex(16));
  const [pubkey] = useState(() => `04${randomHex(64)}`);

  function register() {
    setStage("registering");
    setTimeout(() => setStage("registered"), 1_400);
  }

  function signTx() {
    setStage("signing");
    setTimeout(() => setStage("verified"), 1_100);
  }

  return (
    <div className="bg-ritual-elevated border border-gray-800 rounded-xl shadow-card p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-display text-base text-gray-100">Passkey Transaction Signing</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status="simulation" />
          <PrecompileBadge address="0x77 / 0x0100" label="TxPasskey + SECP256R1" color="lime" />
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Sign a Ritual transaction directly with a device passkey (Face ID / Touch ID / Windows
        Hello) — no browser extension wallet, no seed phrase, no ERC-4337 bundler.
      </p>

      {stage === "idle" && (
        <button
          onClick={register}
          className="px-4 py-2.5 border border-ritual-lime text-ritual-lime hover:bg-ritual-lime/10
                     rounded-lg text-sm font-semibold"
        >
          Register Passkey
        </button>
      )}

      {stage === "registering" && (
        <div className="border border-gray-700 rounded-lg p-4 text-sm text-gray-400 animate-pulse">
          Waiting for platform authenticator (Face ID / Touch ID / Windows Hello)…
        </div>
      )}

      {(stage === "registered" || stage === "signing" || stage === "verified") && (
        <div className="space-y-3">
          <div className="border border-gray-800 rounded-lg p-3 text-xs font-mono text-gray-500 space-y-1">
            <p>
              credentialId: <span className="text-gray-300">{credentialId}</span>
            </p>
            <p className="truncate">
              publicKey (P-256): <span className="text-gray-300">{pubkey.slice(0, 24)}…</span>
            </p>
          </div>

          {stage === "registered" && (
            <button
              onClick={signTx}
              className="px-4 py-2 border border-ritual-lime text-ritual-lime hover:bg-ritual-lime/10
                         rounded-lg text-sm font-semibold"
            >
              Sign a test transaction
            </button>
          )}
          {stage === "signing" && (
            <p className="text-sm text-gray-400 animate-pulse">Requesting biometric confirmation…</p>
          )}
          {stage === "verified" && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-ritual-green">✔</span>
              <span className="text-ritual-green">Signature verified via SECP256R1 precompile</span>
              <span className="text-gray-400">· 3,450 gas</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
