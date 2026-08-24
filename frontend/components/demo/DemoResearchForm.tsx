"use client";

import { useState } from "react";
import { useDemoStore } from "@/hooks/demo/useDemoStore";
import { useDemoResearchSubmit, type DemoSubmitStage } from "@/hooks/demo/useDemoResearchSubmit";

const STAGE_LABEL: Record<DemoSubmitStage, string> = {
  idle: "",
  finding_executor: "Finding a TEE executor…",
  encrypting: "Encrypting request…",
  awaiting_signature: "Confirm in your wallet…",
  submitted: "Submitted",
};

export function DemoResearchForm({ onSubmitted }: { onSubmitted: (jobId: `0x${string}`) => void }) {
  const connected = useDemoStore((s) => s.connected);
  const balance = useDemoStore((s) => s.balance);
  const { submit, stage } = useDemoResearchSubmit();
  const [topic, setTopic] = useState("");

  const busy = stage !== "idle" && stage !== "submitted";
  const disabled = !connected || balance <= 0 || busy || topic.trim().length === 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    const jobId = await submit(topic.trim());
    onSubmitted(jobId);
    setTopic("");
  }

  return (
    <form onSubmit={handleSubmit} className="bg-ritual-elevated border border-gray-800 rounded-xl shadow-card p-6">
      <h2 className="font-display text-lg text-gray-100 mb-1">New Research</h2>
      <p className="text-sm text-gray-500 mb-4">
        Simulates Ritual&apos;s Sovereign Agent precompile (
        <span className="font-mono text-xs">0x080C</span>) end to end.
      </p>

      <label htmlFor="demo-topic" className="text-xs text-gray-500 uppercase tracking-wider">
        Topic
      </label>
      <textarea
        id="demo-topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="e.g. Summarize the current landscape of TEE-verified on-chain AI inference"
        rows={3}
        className="w-full mt-1 mb-4 bg-ritual-surface border border-gray-700 rounded-lg px-4 py-3 text-sm
                   text-gray-300 resize-none
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ritual-pink/50"
      />

      {!connected && <p className="text-xs text-gray-500 mb-3">Connect a wallet to submit research.</p>}
      {connected && balance <= 0 && (
        <p className="text-xs text-ritual-gold mb-3">Deposit RITUAL above before submitting.</p>
      )}

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
