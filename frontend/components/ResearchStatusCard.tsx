"use client";

import { useResearchJob, type ResearchJobStatus } from "@/hooks/useResearchJob";

const STATUS_CONFIG: Record<ResearchJobStatus, { label: string; icon: string; color: string; pulse: boolean }> = {
  pending_commitment: { label: "Awaiting Executor", icon: "◌", color: "text-ritual-gold", pulse: true },
  processing: { label: "Agent Running", icon: "⟳", color: "text-ritual-green", pulse: true },
  settled_success: { label: "Settled", icon: "✔", color: "text-ritual-green", pulse: false },
  settled_failed: { label: "Failed", icon: "✕", color: "text-red-400", pulse: false },
};

function truncate(hex: string) {
  return `${hex.slice(0, 10)}…${hex.slice(-8)}`;
}

export function ResearchStatusCard({ jobId }: { jobId: `0x${string}` }) {
  const { state } = useResearchJob(jobId);

  const config = state ? STATUS_CONFIG[state.status] : STATUS_CONFIG.pending_commitment;

  return (
    <div className="bg-ritual-elevated border border-gray-800 rounded-xl shadow-card p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2" role="status" aria-label={`Job status: ${config.label}`}>
          <span className={`${config.color} ${config.pulse ? "animate-pulse" : ""} text-lg`}>{config.icon}</span>
          <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
        </div>
        <span className="font-mono text-xs text-gray-500">{truncate(jobId)}</span>
      </div>

      {state?.topic && <p className="text-sm text-gray-300 mb-3">&ldquo;{state.topic}&rdquo;</p>}

      {state?.status === "settled_success" && (
        <div className="border-t border-ritual-pink/20 pt-3 mt-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-ritual-pink">◇</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider">AI Output</span>
          </div>
          <p className="text-sm text-gray-300 whitespace-pre-wrap max-w-[65ch] leading-relaxed">{state.report}</p>
        </div>
      )}

      {state?.status === "settled_failed" && (
        <p className="text-sm text-red-400 mt-2">{state.errorMessage || "The agent run did not complete."}</p>
      )}

      {!state && <p className="text-sm text-gray-500">Waiting for the executor to commit to this job…</p>}
    </div>
  );
}
