"use client";

import { useEffect, useState } from "react";
import { PrecompileBadge } from "@/components/site/PrecompileBadge";
import { StatusBadge } from "@/components/site/StatusBadge";
import { preloadSentimentModel, runSentiment, type SentimentResult } from "@/lib/sentimentModel";

const EXAMPLES: { label: string; text: string }[] = [
  { label: "Positive", text: "Ritual makes on-chain AI feel fast and secure." },
  { label: "Negative", text: "The checkout kept crashing and the whole flow felt broken." },
  { label: "Neutral", text: "The block was produced at the expected interval." },
  { label: "Mixed", text: "The UI is great but the sync was really slow and buggy." },
];

interface HistoryEntry {
  id: string;
  text: string;
  result: SentimentResult;
}

function labelColor(label: SentimentResult["label"]) {
  if (label === "POSITIVE") return { text: "text-ritual-green", bar: "bg-ritual-green" };
  if (label === "NEGATIVE") return { text: "text-red-400", bar: "bg-red-400" };
  return { text: "text-gray-400", bar: "bg-gray-400" };
}

function HighlightedText({ text, result }: { text: string; result: SentimentResult }) {
  const weightByWord = new Map(result.contributions.map((c) => [c.word, c.weight]));
  const tokens = text.split(/(\W+)/);
  const highlightCls =
    result.label === "POSITIVE"
      ? "text-ritual-green bg-ritual-green/10"
      : result.label === "NEGATIVE"
        ? "text-red-400 bg-red-400/10"
        : "text-gray-300 bg-gray-400/15";

  return (
    <p className="text-sm leading-relaxed text-gray-300 break-words">
      {tokens.map((token, i) => {
        const weight = weightByWord.get(token.toLowerCase());
        if (weight === undefined) return <span key={i}>{token}</span>;
        // Negative-for-predicted-class weight means this word actually argued
        // against the winning label — dim it instead of highlighting it.
        if (weight <= 0.02) {
          return (
            <span key={i} className="opacity-40">
              {token}
            </span>
          );
        }
        return (
          <span key={i} className={`${highlightCls} rounded px-0.5`}>
            {token}
          </span>
        );
      })}
    </p>
  );
}

export function OnnxDemo() {
  const [text, setText] = useState(EXAMPLES[0].text);
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    preloadSentimentModel();
  }, []);

  async function run(input: string) {
    setRunning(true);
    setError(null);
    try {
      const r = await runSentiment(input);
      setResult(r);
      setHistory((h) => [{ id: crypto.randomUUID(), text: input, result: r }, ...h].slice(0, 6));
    } catch {
      setError("Couldn't load the model (offline?). Try again once you're back online.");
    } finally {
      setRunning(false);
    }
  }

  function runExample(example: string) {
    setText(example);
    void run(example);
  }

  function restore(entry: HistoryEntry) {
    setText(entry.text);
    setResult(entry.result);
  }

  const colors = result ? labelColor(result.label) : null;

  return (
    <div className="feature-card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-display text-base text-gray-100">Classical Inference (ONNX)</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status="local" />
          <PrecompileBadge address="0x0800" label="synchronous" color="green" />
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Synchronous — executes inline in the same block, no TEE round trip. This demo runs a real,
        trained softmax-regression sentiment model (141-word vocabulary) as genuine ONNX inference,
        entirely in your browser via WebAssembly — not a hardcoded wordlist.
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

      {error && <p className="text-xs text-red-400 mt-3">{error}</p>}

      {result && colors && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-sm font-mono ${colors.text}`}>{result.label}</span>
            <span className="text-xs text-gray-400 font-mono">{(result.confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="h-1.5 bg-ritual-surface rounded-full overflow-hidden mb-3">
            <div className={`h-full ${colors.bar}`} style={{ width: `${result.confidence * 100}%` }} />
          </div>
          <div className="bg-ritual-surface border border-gray-800 rounded-lg px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1.5">
              Words that drove this prediction
            </p>
            <HighlightedText text={text} result={result} />
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-2">Recent runs</p>
          <ul className="space-y-1.5">
            {history.map((entry) => {
              const c = labelColor(entry.result.label);
              return (
                <li key={entry.id}>
                  <button
                    onClick={() => restore(entry)}
                    className="w-full flex items-center gap-2 text-left px-2.5 py-1.5 rounded-lg
                               hover:bg-ritual-surface focus-visible:outline-none focus-visible:ring-2
                               focus-visible:ring-ritual-green/50"
                  >
                    <span className={`text-[10px] font-mono shrink-0 w-14 ${c.text}`}>{entry.result.label}</span>
                    <span className="text-xs text-gray-400 truncate flex-1">{entry.text}</span>
                    <span className="text-[10px] text-gray-400 font-mono shrink-0">
                      {(entry.result.confidence * 100).toFixed(0)}%
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
