"use client";

import { useDemoStore, type DemoJobStatus } from "@/hooks/demo/useDemoStore";

const STATUS_CONFIG: Record<DemoJobStatus, { label: string; icon: string; color: string; pulse: boolean }> = {
  pending_commitment: { label: "Awaiting Executor", icon: "◌", color: "text-ritual-gold", pulse: true },
  processing: { label: "Agent Running", icon: "⟳", color: "text-ritual-green", pulse: true },
  settled_success: { label: "Settled", icon: "✔", color: "text-ritual-green", pulse: false },
  settled_failed: { label: "Failed", icon: "✕", color: "text-red-400", pulse: false },
};

function truncate(hex: string) {
  return `${hex.slice(0, 10)}…${hex.slice(-8)}`;
}

export function DemoResearchStatusCard({ jobId }: { jobId: `0x${string}` }) {
  const job = useDemoStore((s) => s.jobs[jobId]);
  if (!job) return null;

  const config = STATUS_CONFIG[job.status];

  return (
    <div className="bg-ritual-elevated border border-gray-800 rounded-xl shadow-card p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2" role="status" aria-label={`Job status: ${config.label}`}>
          <span className={`${config.color} ${config.pulse ? "animate-pulse" : ""} text-lg`}>{config.icon}</span>
          <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
        </div>
        <span className="font-mono text-xs text-gray-500">{truncate(jobId)}</span>
      </div>

      <p className="text-sm text-gray-300 mb-3">&ldquo;{job.topic}&rdquo;</p>

      {job.status === "settled_success" && (
        <div className="border-t border-ritual-pink/20 pt-3 mt-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-ritual-pink">◇</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider">AI Output (simulated)</span>
          </div>
          <p className="text-sm text-gray-300 whitespace-pre-wrap max-w-[65ch] leading-relaxed">{job.report}</p>
        </div>
      )}

      {job.status === "settled_failed" && <p className="text-sm text-red-400 mt-2">{job.errorMessage}</p>}
    </div>
  );
}
