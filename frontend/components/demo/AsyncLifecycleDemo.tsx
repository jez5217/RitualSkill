"use client";

import { useEffect, useState } from "react";
import { PrecompileBadge } from "@/components/site/PrecompileBadge";
import { StatusBadge } from "@/components/site/StatusBadge";

const STATES = [
  { name: "SUBMITTING", detail: "Local — wallet interaction, transaction not yet sent." },
  { name: "PENDING_COMMITMENT", detail: "Transaction sent, awaiting executor commitment." },
  { name: "COMMITTED", detail: "JobAdded event fired — an executor has claimed the job." },
  { name: "EXECUTOR_PROCESSING", detail: "Executor is running the work inside a TEE." },
  { name: "RESULT_READY", detail: "Long-running only: Phase 1 settled, task ID assigned." },
  { name: "PENDING_SETTLEMENT", detail: "Awaiting the Phase 2 delivery callback." },
  { name: "SETTLED", detail: "Final result delivered and stored on-chain. ✔" },
  { name: "FAILED", detail: "Executor error, delivery failure, or callback revert." },
  { name: "EXPIRED", detail: "TTL passed with no settlement — cleaned up." },
] as const;

export function AsyncLifecycleDemo() {
  const [active, setActive] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    if (active === null) {
      setActive(0);
      return;
    }
    if (active >= 6) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setActive((a) => (a ?? 0) + 1), 900);
    return () => clearTimeout(t);
  }, [playing, active]);

  return (
    <div className="bg-ritual-elevated border border-gray-800 rounded-xl shadow-card p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-display text-base text-gray-100">Async Job Lifecycle</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status="simulation" />
          <PrecompileBadge address="AsyncJobTracker" label="9 states" color="green" />
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Every async precompile call — HTTP, LLM, agents, multimodal — moves through this state
        machine. Short-running calls skip straight from COMMITTED to SETTLED.
      </p>

      <button
        onClick={() => {
          setActive(null);
          setPlaying(true);
        }}
        className="mb-4 px-4 py-1.5 border border-ritual-green text-ritual-green hover:bg-ritual-green/10 rounded-lg text-sm font-semibold"
      >
        Play walkthrough
      </button>

      <ol className="space-y-1.5">
        {STATES.map((s, i) => (
          <li
            key={s.name}
            className={`flex items-baseline gap-3 rounded-lg px-3 py-2 transition-colors ${
              active === i ? "bg-ritual-green/10 border border-ritual-green/30" : "border border-transparent"
            }`}
          >
            <span className={`font-mono text-xs w-40 shrink-0 ${active === i ? "text-ritual-green" : "text-gray-400"}`}>
              {s.name}
            </span>
            <span className="text-xs text-gray-500">{s.detail}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
