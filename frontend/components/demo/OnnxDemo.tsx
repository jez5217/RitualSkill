"use client";

import { useState } from "react";
import { PrecompileBadge } from "@/components/site/PrecompileBadge";

const POSITIVE = [
  "good", "great", "love", "amazing", "excellent", "happy", "fast", "trust", "secure",
  "awesome", "wonderful", "best", "smooth", "reliable", "impressive", "delightful",
];
const NEGATIVE = [
  "bad", "hate", "slow", "broken", "terrible", "sad", "insecure", "buggy", "fail",
  "awful", "worst", "frustrating", "confusing", "crash", "disappointing",
];

const EXAMPLES: { label: string; text: string }[] = [
  { label: "Positive", text: "Ritual makes on-chain AI feel fast and secure." },
  { label: "Negative", text: "The checkout kept crashing and the whole flow felt broken." },
  { label: "Neutral", text: "The block was produced at the expected interval." },
  { label: "Mixed", text: "The UI is great but the sync was really slow and buggy." },
];

interface ClassifyResult {
  label: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  confidence: number;
}

interface HistoryEntry extends ClassifyResult {
  id: string;
  text: string;
}

function classify(text: string): ClassifyResult {
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

function HighlightedText({ text }: { text: string }) {
  const tokens = text.split(/(\W+)/);
  return (
    <p className="text-sm leading-relaxed text-gray-300 break-words">
      {tokens.map((token, i) => {
        const lower = token.toLowerCase();
        if (POSITIVE.includes(lower)) {
          return (
            <span key={i} className="text-ritual-green bg-ritual-green/10 rounded px-0.5">
              {token}
            </span>
          );
        }
        if (NEGATIVE.includes(lower)) {
          return (
            <span key={i} className="text-red-400 bg-red-400/10 rounded px-0.5">
              {token}
            </span>
          );
        }
        return <span key={i}>{token}</span>;
      })}
    </p>
  );
}

function labelColor(label: ClassifyResult["label"]) {
  if (label === "POSITIVE") return { text: "text-ritual-green", bar: "bg-ritual-green" };
  if (label === "NEGATIVE") return { text: "text-red-400", bar: "bg-red-400" };
  return { text: "text-gray-400", bar: "bg-gray-400" };
}

export function OnnxDemo() {
  const [text, setText] = useState(EXAMPLES[0].text);
  const [result, setResult] = useState<ClassifyResult | null>(null);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  function run(input: string) {
    setRunning(true);
    // Synchronous precompile — settles inline, no executor round trip. Tiny delay just for UX feedback.
    setTimeout(() => {
      const r = classify(input);
      setResult(r);
      setHistory((h) => [{ id: crypto.randomUUID(), text: input, ...r }, ...h].slice(0, 6));
      setRunning(false);
    }, 150);
  }

  function runExample(example: string) {
    setText(example);
    run(example);
  }

  function restore(entry: HistoryEntry) {
    setText(entry.text);
    setResult({ label: entry.label, confidence: entry.confidence });
  }

  const colors = result ? labelColor(result.label) : null;

  return (
    <div className="bg-ritual-elevated border border-gray-800 rounded-xl shadow-card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-display text-base text-gray-100">Classical Inference (ONNX)</h3>
        <PrecompileBadge address="0x0800" label="synchronous" color="green" />
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Synchronous — executes inline in the same block, no TEE round trip. This demo simulates a
        tiny sentiment classifier locally.
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            onClick={() => runExample(ex.text)}
            disabled={running}
            className="text-xs px-2.5 py-1 rounded-full border border-gray-700 text-gray-400
                       hover:border-ritual-green/50 hover:text-ritual-green disabled:opacity-40
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ritual-green/50"
          >
            {ex.label}
          </button>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        className="w-full bg-ritual-surface border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-300
                   resize-none mb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ritual-green/50"
      />

      <button
        onClick={() => run(text)}
        disabled={running || !text.trim()}
        className="w-full sm:w-auto px-4 py-2 border border-ritual-green text-ritual-green hover:bg-ritual-green/10
                   disabled:opacity-40 rounded-lg text-sm font-semibold
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ritual-green/50"
      >
        {running ? "Running…" : "Run Inference"}
      </button>

      {result && colors && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-sm font-mono ${colors.text}`}>{result.label}</span>
            <span className="text-xs text-gray-500 font-mono">{(result.confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="h-1.5 bg-ritual-surface rounded-full overflow-hidden mb-3">
            <div className={`h-full ${colors.bar}`} style={{ width: `${result.confidence * 100}%` }} />
          </div>
          <div className="bg-ritual-surface border border-gray-800 rounded-lg px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wide text-gray-600 mb-1.5">Matched signal words</p>
            <HighlightedText text={text} />
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-[10px] uppercase tracking-wide text-gray-600 mb-2">Recent runs</p>
          <ul className="space-y-1.5">
            {history.map((entry) => {
              const c = labelColor(entry.label);
              return (
                <li key={entry.id}>
                  <button
                    onClick={() => restore(entry)}
                    className="w-full flex items-center gap-2 text-left px-2.5 py-1.5 rounded-lg
                               hover:bg-ritual-surface focus-visible:outline-none focus-visible:ring-2
                               focus-visible:ring-ritual-green/50"
                  >
                    <span className={`text-[10px] font-mono shrink-0 w-14 ${c.text}`}>{entry.label}</span>
                    <span className="text-xs text-gray-500 truncate flex-1">{entry.text}</span>
                    <span className="text-[10px] text-gray-600 font-mono shrink-0">
                      {(entry.confidence * 100).toFixed(0)}%
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
