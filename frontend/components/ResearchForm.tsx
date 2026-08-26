"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useResearchSubmit } from "@/hooks/useResearchSubmit";
import { useSenderLock } from "@/hooks/useSenderLock";

const STAGE_LABEL: Record<string, string> = {
  idle: "",
  finding_executor: "Finding a TEE executor…",
  encrypting: "Encrypting request…",
  awaiting_signature: "Confirm in your wallet…",
  submitted: "Submitted",
  error: "Failed",
};

export function ResearchForm({ onSubmitted }: { onSubmitted: (jobId: `0x${string}`) => void }) {
  const { address } = useAccount();
  const { isLocked, message: lockMessage } = useSenderLock();
  const { submit, stage, error } = useResearchSubmit();
  const [topic, setTopic] = useState("");

  const busy = stage !== "idle" && stage !== "submitted" && stage !== "error";
  const disabled = !address || isLocked || busy || topic.trim().length === 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    try {
      const jobId = await submit(topic.trim());
      onSubmitted(jobId);
      setTopic("");
    } catch {
      // surfaced via `error` from the hook
    }
  }

  return (
    <form onSubmit={handleSubmit} className="feature-card p-6">
      <h2 className="font-display text-lg text-gray-100 mb-1">New Research</h2>
      <p className="text-sm text-gray-400 mb-4">
        Runs on Ritual&apos;s Sovereign Agent precompile (
        <span className="font-mono text-xs">0x080C</span>) inside a TEE.
      </p>

      <label htmlFor="topic" className="text-xs text-gray-400 uppercase tracking-wider">
        Topic
      </label>
      <textarea
        id="topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="e.g. Summarize the current landscape of TEE-verified on-chain AI inference"
        rows={3}
        className="w-full mt-1 mb-4 bg-ritual-surface border border-gray-700 rounded-lg px-4 py-3 text-sm
                   text-gray-300 resize-none
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ritual-pink/50"
      />

      {!address && <p className="text-xs text-gray-400 mb-3">Connect a wallet to submit research.</p>}
      {lockMessage && <p className="text-xs text-ritual-gold mb-3">{lockMessage}</p>}
      {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

      <button
        type="submit"
        disabled={disabled}
        className="w-full sm:w-auto px-5 py-2.5 border border-ritual-pink text-ritual-pink hover:bg-ritual-pink/10
                   disabled:opacity-40 disabled:cursor-not-allowed
                   rounded-lg text-sm font-semibold shadow-glow-pink
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ritual-pink/50"
      >
        {busy ? STAGE_LABEL[stage] : "Dispatch Research Agent"}
      </button>
    </form>
  );
}
