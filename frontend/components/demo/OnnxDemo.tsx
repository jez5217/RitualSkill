"use client";

import { useState } from "react";
import { PrecompileBadge } from "@/components/site/PrecompileBadge";

const POSITIVE = ["good", "great", "love", "amazing", "excellent", "happy", "fast", "trust", "secure"];
const NEGATIVE = ["bad", "hate", "slow", "broken", "terrible", "sad", "insecure", "buggy", "fail"];

function classify(text: string): { label: string; confidence: number } {
  const words = text.toLowerCase().split(/\W+/);
  let score = 0;
  for (const w of words) {
    if (POSITIVE.includes(w)) score += 1;
    if (NEGATIVE.includes(w)) score -= 1;
  }
  const magnitude = Math.min(1, Math.abs(score) / 3);
  if (score > 0) return { label: "POSITIVE", confidence: 0.55 + magnitude * 0.4 };
  if (score < 0) return { label: "NEGATIVE", confidence: 0.55 + magnitude * 0.4 };
  return { label: "NEUTRAL", confidence: 0.5 + Math.random() * 0.15 };
}

export function OnnxDemo() {
  const [text, setText] = useState("Ritual makes on-chain AI feel fast and secure.");
  const [result, setResult] = useState<{ label: string; confidence: number } | null>(null);
  const [running, setRunning] = useState(false);

  function run() {
    setRunning(true);
    // Synchronous precompile — settles inline, no executor round trip. Tiny delay just for UX feedback.
    setTimeout(() => {
      setResult(classify(text));
      setRunning(false);
    }, 150);
  }

  const textColor =
    result?.label === "POSITIVE"
      ? "text-ritual-green"
      : result?.label === "NEGATIVE"
        ? "text-red-400"
        : "text-gray-400";
  const barColor =
    result?.label === "POSITIVE"
      ? "bg-ritual-green"
      : result?.label === "NEGATIVE"
        ? "bg-red-400"
        : "bg-gray-400";

  return (
    <div className="bg-ritual-elevated border border-gray-800 rounded-xl shadow-card p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-display text-base text-gray-100">Classical Inference (ONNX)</h3>
        <PrecompileBadge address="0x0800" label="synchronous" color="green" />
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Synchronous — executes inline in the same block, no TEE round trip. This demo simulates a
        tiny sentiment classifier locally.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        className="w-full bg-ritual-surface border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-300
                   resize-none mb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ritual-green/50"
      />

      <button
        onClick={run}
        disabled={running || !text.trim()}
        className="px-4 py-2 border border-ritual-green text-ritual-green hover:bg-ritual-green/10
                   disabled:opacity-40 rounded-lg text-sm font-semibold
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ritual-green/50"
      >
        {running ? "Running…" : "Run Inference"}
      </button>

      {result && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-sm font-mono ${textColor}`}>{result.label}</span>
            <span className="text-xs text-gray-500 font-mono">{(result.confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="h-1.5 bg-ritual-surface rounded-full overflow-hidden">
            <div className={`h-full ${barColor}`} style={{ width: `${result.confidence * 100}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
