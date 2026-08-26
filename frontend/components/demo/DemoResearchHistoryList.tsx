"use client";

import { useState } from "react";
import { useDemoStore } from "@/hooks/demo/useDemoStore";
import { useDemoResearchFeed } from "@/hooks/demo/useDemoResearchFeed";

function truncate(hex: string) {
  return `${hex.slice(0, 10)}…${hex.slice(-8)}`;
}

export function DemoResearchHistoryList() {
  const connected = useDemoStore((s) => s.connected);
  const [scope, setScope] = useState<"all" | "mine">("all");
  const { entries } = useDemoResearchFeed(scope);

  return (
    <div className="feature-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg text-gray-100">Research Feed</h2>
        <div className="flex gap-1 text-xs">
          <button
            onClick={() => setScope("all")}
            className={`px-3 py-1.5 rounded-lg border ${
              scope === "all" ? "border-ritual-green text-ritual-green" : "border-gray-700 text-gray-400"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setScope("mine")}
            disabled={!connected}
            className={`px-3 py-1.5 rounded-lg border disabled:opacity-30 ${
              scope === "mine" ? "border-ritual-green text-ritual-green" : "border-gray-700 text-gray-400"
            }`}
          >
            Mine
          </button>
        </div>
      </div>

      {entries.length === 0 && <p className="text-sm text-gray-400">No research submitted yet.</p>}

      <ul className="space-y-3">
        {entries.map((entry) => (
          <li key={entry.jobId} className="border-b border-gray-800 pb-3 last:border-none last:pb-0">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs text-gray-400">{truncate(entry.jobId)}</span>
              {entry.status === "settled_success" && <span className="text-xs text-ritual-green">✔ settled</span>}
              {entry.status === "settled_failed" && <span className="text-xs text-red-400">✕ failed</span>}
              {(entry.status === "pending_commitment" || entry.status === "processing") && (
                <span className="text-xs text-ritual-gold">pending</span>
              )}
            </div>
            <p className="text-sm text-gray-300">{entry.topic}</p>
            {entry.status === "settled_success" && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{entry.report}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
