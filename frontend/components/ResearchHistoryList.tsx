"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useResearchFeed } from "@/hooks/useResearchFeed";

function truncate(hex: string) {
  return `${hex.slice(0, 10)}…${hex.slice(-8)}`;
}

export function ResearchHistoryList() {
  const { address } = useAccount();
  const [scope, setScope] = useState<"all" | "mine">("all");
  const { entries } = useResearchFeed(scope === "mine" && address ? { user: address } : "all");

  return (
    <div className="bg-ritual-elevated border border-gray-800 rounded-xl shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg text-gray-100">Research Feed</h2>
        <div className="flex gap-1 text-xs">
          <button
            onClick={() => setScope("all")}
            className={`px-3 py-1.5 rounded-lg border ${
              scope === "all" ? "border-ritual-green text-ritual-green" : "border-gray-700 text-gray-500"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setScope("mine")}
            disabled={!address}
            className={`px-3 py-1.5 rounded-lg border disabled:opacity-30 ${
              scope === "mine" ? "border-ritual-green text-ritual-green" : "border-gray-700 text-gray-500"
            }`}
          >
            Mine
          </button>
        </div>
      </div>

      {entries.length === 0 && <p className="text-sm text-gray-500">No research submitted yet.</p>}

      <ul className="space-y-3">
        {entries.map((entry) => (
          <li key={entry.jobId} className="border-b border-gray-800 pb-3 last:border-none last:pb-0">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs text-gray-500">{truncate(entry.jobId)}</span>
              {!entry.delivered ? (
                <span className="text-xs text-ritual-gold">pending</span>
              ) : entry.success ? (
                <span className="text-xs text-ritual-green">✔ settled</span>
              ) : (
                <span className="text-xs text-red-400">✕ failed</span>
              )}
            </div>
            <p className="text-sm text-gray-300">{entry.topic}</p>
            {entry.delivered && entry.success && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{entry.report}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
