"use client";

import { useState } from "react";
import { PrecompileBadge } from "@/components/site/PrecompileBadge";
import { StatusBadge } from "@/components/site/StatusBadge";
import { simulateHttpCall, type DemoHttpResponse } from "@/lib/demoHttp";

type Stage = "idle" | "committing" | "executing" | "settled";

export function HttpCallDemo() {
  const [url, setUrl] = useState("https://api.example.com/eth-price");
  const [stage, setStage] = useState<Stage>("idle");
  const [response, setResponse] = useState<DemoHttpResponse | null>(null);

  function run() {
    setStage("committing");
    setResponse(null);
    setTimeout(() => setStage("executing"), 500);
    setTimeout(() => {
      setResponse(simulateHttpCall(url));
      setStage("settled");
    }, 1_700);
  }

  return (
    <div className="bg-ritual-elevated border border-gray-800 rounded-xl shadow-card p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-display text-base text-gray-100">HTTP Call</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status="simulation" />
          <PrecompileBadge address="0x0801" label="short-running async" color="green" />
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        One request in, one response out — settled in the same transaction via the SPC mechanism.
        Try the ETH price or weather examples below.
      </p>

      <div className="flex gap-2 mb-1">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 bg-ritual-surface border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-300
                     font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ritual-green/50"
        />
        <button
          onClick={run}
          disabled={stage === "committing" || stage === "executing"}
          className="px-4 py-2.5 border border-ritual-green text-ritual-green hover:bg-ritual-green/10
                     disabled:opacity-40 rounded-lg text-sm font-semibold whitespace-nowrap
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ritual-green/50"
        >
          {stage === "committing" || stage === "executing" ? "Fetching…" : "Fetch"}
        </button>
      </div>
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setUrl("https://api.example.com/eth-price")}
          className="text-xs text-gray-500 hover:text-gray-300"
        >
          eth-price
        </button>
        <button
          type="button"
          onClick={() => setUrl("https://api.example.com/weather")}
          className="text-xs text-gray-500 hover:text-gray-300"
        >
          weather
        </button>
      </div>

      {stage !== "idle" && (
        <div className="border-t border-gray-800 pt-3">
          <div className="flex items-center gap-2 text-xs mb-2">
            <span className={stage === "committing" ? "text-ritual-gold animate-pulse" : "text-gray-400"}>
              ◉ commit
            </span>
            <span className="text-gray-700">→</span>
            <span
              className={
                stage === "executing"
                  ? "text-ritual-green animate-pulse"
                  : stage === "settled"
                    ? "text-gray-400"
                    : "text-gray-700"
              }
            >
              ⟳ TEE executor
            </span>
            <span className="text-gray-700">→</span>
            <span className={stage === "settled" ? "text-ritual-green" : "text-gray-700"}>✔ settled</span>
          </div>

          {response && (
            <div className="bg-black border border-gray-800 rounded-lg p-3 font-mono text-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-ritual-green">{response.statusCode}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500">{response.latencyMs.toFixed(0)}ms</span>
                <span className="text-gray-400">·</span>
                <span className="text-ritual-green">TEE attested</span>
              </div>
              <pre className="text-gray-400 whitespace-pre-wrap">{response.body}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
