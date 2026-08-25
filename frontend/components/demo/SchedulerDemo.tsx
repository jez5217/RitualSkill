"use client";

import { useEffect, useRef, useState } from "react";
import { PrecompileBadge } from "@/components/site/PrecompileBadge";
import { StatusBadge } from "@/components/site/StatusBadge";

type CallState = "scheduled" | "executing" | "completed" | "cancelled" | "expired";

const STATE_STYLE: Record<CallState, string> = {
  scheduled: "text-ritual-gold",
  executing: "text-ritual-green animate-pulse",
  completed: "text-ritual-green",
  cancelled: "text-gray-400",
  expired: "text-gray-400",
};

const STATE_ICON: Record<CallState, string> = {
  scheduled: "◌",
  executing: "⟳",
  completed: "✔",
  cancelled: "⊘",
  expired: "⊘",
};

export function SchedulerDemo() {
  const [numCalls, setNumCalls] = useState(5);
  const [ticks, setTicks] = useState<CallState[] | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!ticks) return;
    const nextIdx = ticks.findIndex((t) => t === "scheduled");
    if (nextIdx === -1) return;

    const t1 = setTimeout(() => {
      if (cancelledRef.current) return;
      setTicks((prev) => prev!.map((t, i) => (i === nextIdx ? "executing" : t)));
    }, 400);
    const t2 = setTimeout(() => {
      if (cancelledRef.current) return;
      setTicks((prev) => prev!.map((t, i) => (i === nextIdx ? "completed" : t)));
    }, 1_400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [ticks]);

  function schedule() {
    cancelledRef.current = false;
    setTicks(Array.from({ length: numCalls }, () => "scheduled"));
  }

  function cancel() {
    cancelledRef.current = true;
    setTicks((prev) => (prev ? prev.map((t) => (t === "scheduled" || t === "executing" ? "cancelled" : t)) : prev));
  }

  const running = ticks?.some((t) => t === "scheduled" || t === "executing") ?? false;

  return (
    <div className="bg-ritual-elevated border border-gray-800 rounded-xl shadow-card p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-display text-base text-gray-100">Scheduler</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status="simulation" />
          <PrecompileBadge address="Scheduler" label="recurring self-invocation" color="gold" />
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        A contract schedules a future call to itself — recurring or one-shot — enforced at the
        consensus layer, no off-chain cron or keeper network needed.
      </p>

      <div className="flex items-center gap-3 mb-4">
        <label className="text-xs text-gray-500">Calls</label>
        <input
          type="number"
          min={1}
          max={10}
          value={numCalls}
          onChange={(e) => setNumCalls(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
          disabled={running}
          className="w-16 bg-ritual-surface border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-300
                     disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ritual-gold/50"
        />
        <button
          onClick={schedule}
          disabled={running}
          className="px-4 py-1.5 border border-ritual-gold text-ritual-gold hover:bg-ritual-gold/10
                     disabled:opacity-40 rounded-lg text-sm font-semibold"
        >
          Schedule
        </button>
        <button
          onClick={cancel}
          disabled={!running}
          className="px-4 py-1.5 border border-gray-700 text-gray-400 hover:text-gray-200
                     disabled:opacity-30 rounded-lg text-sm"
        >
          Cancel
        </button>
      </div>

      {ticks && (
        <div className="flex flex-wrap gap-2">
          {ticks.map((state, i) => (
            <div key={i} className="flex flex-col items-center gap-1 border border-gray-800 rounded-lg px-3 py-2 min-w-[72px]">
              <span className={`text-lg ${STATE_STYLE[state]}`}>{STATE_ICON[state]}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">{state}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
