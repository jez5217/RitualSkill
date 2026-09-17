"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePublicClient } from "wagmi";
import { encodeAbiParameters, decodeAbiParameters, toHex } from "viem";
import { PrecompileBadge } from "@/components/site/PrecompileBadge";
import { StatusBadge } from "@/components/site/StatusBadge";
import { SECP256R1_PRECOMPILE } from "@/lib/addresses";
import {
  isPasskeySupported,
  createPasskey,
  signWithPasskey,
  buildSignedMessage,
  verifyLocally,
  passkeyToAddress,
  safeWebAuthnCall,
  type PasskeyCredential,
} from "@/lib/passkey";

type Stage = "idle" | "registering" | "registered" | "signing" | "verified" | "error";

export function PasskeyDemo() {
  const publicClient = usePublicClient();
  const [stage, setStage] = useState<Stage>("idle");
  const [credential, setCredential] = useState<PasskeyCredential | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [onChainValid, setOnChainValid] = useState<boolean | null>(null);
  const [localValid, setLocalValid] = useState<boolean | null>(null);
  // isPasskeySupported() reads `window`, which doesn't exist during SSR — computing it directly
  // in the render body would make the server-rendered HTML disagree with the client's first
  // render (always "unsupported" on the server) and corrupt hydration. Defer to a client-only effect.
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(isPasskeySupported());
  }, []);
  const address = credential ? passkeyToAddress(credential.x, credential.y) : null;

  async function register() {
    setStage("registering");
    setErrorMsg(null);
    const outcome = await safeWebAuthnCall(() => createPasskey("Ritual Agent Lab Demo"));
    if ("error" in outcome) {
      setErrorMsg(outcome.error);
      setStage("error");
      return;
    }
    setCredential(outcome.result);
    setStage("registered");
  }

  async function signAndVerify() {
    if (!credential || !publicClient) return;
    setStage("signing");
    setErrorMsg(null);
    setOnChainValid(null);
    setLocalValid(null);

    const outcome = await safeWebAuthnCall(() => signWithPasskey(credential.rawCredentialId));
    if ("error" in outcome) {
      setErrorMsg(outcome.error);
      setStage("error");
      return;
    }
    const assertion = outcome.result;

    // Local verification is pure WebCrypto (no network) — it should essentially never fail once
    // a real assertion comes back, so a thrown error here is treated as a real bug, not a
    // "try again" situation. Kept as its own try/catch so a slow/unreachable RPC below can't
    // wipe out a result that was already computed successfully.
    let message: Uint8Array;
    try {
      const [msg, localOk] = await Promise.all([
        buildSignedMessage(assertion),
        verifyLocally(credential.uncompressedPubkey, assertion),
      ]);
      message = msg;
      setLocalValid(localOk);
      setStage("verified"); // local result is in — show it even if the chain call below is slow/fails
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Local verification failed");
      setStage("error");
      return;
    }

    try {
      const signature = new Uint8Array(64);
      signature.set(assertion.r, 0);
      signature.set(assertion.s, 32);

      const data = encodeAbiParameters(
        [{ type: "bytes" }, { type: "bytes" }, { type: "bytes" }],
        [toHex(credential.uncompressedPubkey), toHex(message), toHex(signature)]
      );

      const result = await publicClient.call({ to: SECP256R1_PRECOMPILE, data });
      const isValid = result.data && result.data !== "0x" ? decodeAbiParameters([{ type: "uint256" }], result.data)[0] === 1n : false;
      setOnChainValid(isValid);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Couldn't reach Ritual Chain to verify on-chain");
    }
  }

  return (
    <div className="feature-card p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-display text-base text-gray-100">Passkey Transaction Signing</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status="live" />
          <PrecompileBadge address="0x0100" label="SECP256R1 · real eth_call" color="lime" />
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-3">
        Register a real passkey with your device (Face ID / Touch ID / Windows Hello), sign with
        it, and this verifies the signature via a genuine <code className="font-mono">eth_call</code>{" "}
        to the real SECP256R1 precompile on Ritual Chain — no wallet or gas needed, since it&apos;s
        a synchronous read.
      </p>
      <p className="text-[11px] text-ritual-lime/80 border border-ritual-lime/20 bg-ritual-lime/5 rounded-lg p-2.5 mb-2">
        🔒 Your fingerprint/face scan never leaves your device&apos;s secure enclave and never
        reaches this page — the WebAuthn API physically only ever hands JavaScript a{" "}
        <strong>public key</strong> and a <strong>signature</strong>. This demo has no way to
        capture, see, or store a real biometric, and doesn&apos;t try to.
      </p>
      <p className="text-[11px] text-ritual-gold/80 border border-ritual-gold/20 bg-ritual-gold/5 rounded-lg p-2.5 mb-4">
        ⚠️ &quot;No seed phrase&quot; doesn&apos;t mean no recovery secret — it moves the recovery
        secret, not away. On most devices this key syncs via iCloud Keychain, Google Password
        Manager, or Windows Hello, so your Apple/Google/Microsoft account becomes the real root of
        recovery. Losing that account (or all devices in its sync ecosystem) loses the key, same as
        losing a seed phrase would. For no cloud dependency at all, use a hardware key (e.g. a
        YubiKey) instead of a synced platform passkey.
      </p>

      {!supported && (
        <p className="text-xs text-ritual-gold border border-ritual-gold/30 bg-ritual-gold/5 rounded-lg p-3">
          This browser/device doesn&apos;t support platform passkeys. Try Chrome, Edge, or Safari on
          a device with Face ID, Touch ID, or Windows Hello.
        </p>
      )}

      {supported && stage === "idle" && (
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

      {stage === "error" && (
        <div className="space-y-3">
          <p className="text-sm text-red-400 border border-red-900/50 bg-red-950/20 rounded-lg p-3">{errorMsg}</p>
          <button
            onClick={() => setStage(credential ? "registered" : "idle")}
            className="px-4 py-2 border border-gray-700 text-gray-400 hover:text-gray-200 rounded-lg text-sm"
          >
            Try again
          </button>
        </div>
      )}

      {(stage === "registered" || stage === "signing" || stage === "verified") && credential && (
        <div className="space-y-3">
          <div className="border border-gray-800 rounded-lg p-3 text-xs font-mono text-gray-400 space-y-1">
            <p>
              credentialId: <span className="text-gray-300">{credential.credentialId.slice(0, 20)}…</span>
            </p>
            <p className="truncate">
              publicKey (P-256): <span className="text-gray-300">{toHex(credential.uncompressedPubkey).slice(0, 24)}…</span>
            </p>
            <p className="truncate">
              Ritual address: <span className="text-ritual-lime">{address}</span>
            </p>
          </div>

          {stage === "registered" && (
            <button
              onClick={signAndVerify}
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
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className={localValid ? "text-ritual-green" : "text-red-400"}>{localValid ? "✔" : "✘"}</span>
                <span className="text-gray-400">Verified locally via WebCrypto ECDSA/P-256</span>
              </div>

              {onChainValid === null && !errorMsg && (
                <p className="text-sm text-gray-400 animate-pulse">Verifying via SECP256R1 precompile on Ritual Chain…</p>
              )}
              {onChainValid !== null && (
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  <span className={onChainValid ? "text-ritual-green" : "text-red-400"}>
                    {onChainValid ? "✔" : "✘"}
                  </span>
                  <span className={onChainValid ? "text-ritual-green" : "text-red-400"}>
                    {onChainValid ? "Verified" : "Rejected"} on-chain via SECP256R1 precompile
                  </span>
                  <span className="text-gray-400">· 3,450 gas · eth_call, no tx sent</span>
                </div>
              )}
              {onChainValid === null && errorMsg && (
                <p className="text-xs text-ritual-gold border border-ritual-gold/30 bg-ritual-gold/5 rounded-lg p-2.5">
                  {errorMsg} — the local WebCrypto check above still holds regardless.
                </p>
              )}

              {onChainValid && (
                <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-400 space-y-1.5">
                  <p>
                    That address (<span className="font-mono text-ritual-lime">{address}</span>) is a real
                    Ritual EOA — no registration step, no seed phrase. What should a familiar sign-in
                    unlock?
                  </p>
                  <p className="flex flex-wrap gap-3">
                    <Link href="/wallet" className="text-ritual-green hover:underline">
                      Check its RitualWallet balance →
                    </Link>
                    <Link href="/agents" className="text-ritual-green hover:underline">
                      Fund a Sovereign Agent run with it →
                    </Link>
                  </p>
                </div>
              )}

              <button
                onClick={signAndVerify}
                className="px-3 py-1.5 border border-gray-700 text-gray-400 hover:text-gray-200 rounded-lg text-xs mt-2"
              >
                Sign again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
