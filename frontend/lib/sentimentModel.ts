"use client";

// onnxruntime-web's npm package cannot be `import()`-ed here: every entry
// point (root, "/wasm", etc.) embeds a Node-only ESM chunk that Next's
// production build tries to bundle and Terser then fails to parse
// ("'import'/'export' cannot be used outside of module code") — a known
// bundler-compatibility issue with this package, not code this project owns.
// Instead we load its prebuilt UMD bundle via a plain <script> tag (the
// pattern onnxruntime-web's own browser examples use), which keeps webpack
// from ever touching its internals. `import type` below is compile-time
// only and is erased before webpack sees this file.
import type * as OrtNS from "onnxruntime-web/wasm";

const ORT_SCRIPT_SRC = "/ort/ort.wasm.min.js";
// Must match the onnxruntime-web version pinned in package.json — used to
// point the WASM runtime loader at the matching jsdelivr build for the
// (large) actual .wasm binary; only the small JS shim above is self-hosted.
const ORT_VERSION = "1.29.0";

declare global {
  interface Window {
    ort?: typeof OrtNS;
  }
}

export type SentimentLabel = "NEGATIVE" | "NEUTRAL" | "POSITIVE";

export interface WordContribution {
  word: string;
  weight: number; // learned coefficient for the predicted class; sign/magnitude drive highlighting
}

export interface SentimentResult {
  label: SentimentLabel;
  confidence: number;
  probabilities: Record<SentimentLabel, number>;
  contributions: WordContribution[];
}

interface VocabMeta {
  classes: SentimentLabel[];
  vocab: string[];
  weights: number[][]; // [vocabIndex][classIndex]
}

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/\W+/).filter(Boolean);
}

let ortModulePromise: Promise<typeof OrtNS> | null = null;
let sessionPromise: Promise<OrtNS.InferenceSession> | null = null;
let vocabPromise: Promise<VocabMeta> | null = null;

async function loadOrt(): Promise<typeof OrtNS> {
  if (!ortModulePromise) {
    ortModulePromise = new Promise((resolve, reject) => {
      if (window.ort) {
        resolve(window.ort);
        return;
      }
      const script = document.createElement("script");
      script.src = ORT_SCRIPT_SRC;
      script.async = true;
      script.onload = () => {
        if (!window.ort) {
          reject(new Error("onnxruntime-web script loaded but window.ort was not set"));
          return;
        }
        window.ort.env.wasm.wasmPaths = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`;
        resolve(window.ort);
      };
      script.onerror = () => reject(new Error("Failed to load onnxruntime-web script"));
      document.head.appendChild(script);
    });
  }
  return ortModulePromise;
}

async function loadVocab(): Promise<VocabMeta> {
  if (!vocabPromise) {
    vocabPromise = fetch("/models/sentiment/vocab.json").then((r) => {
      if (!r.ok) throw new Error(`Failed to load vocab.json: ${r.status}`);
      return r.json();
    });
  }
  return vocabPromise;
}

async function loadSession(): Promise<OrtNS.InferenceSession> {
  if (!sessionPromise) {
    sessionPromise = loadOrt().then((ort) =>
      ort.InferenceSession.create("/models/sentiment/model.onnx", { executionProviders: ["wasm"] })
    );
  }
  return sessionPromise;
}

/** Kicks off model + vocab download early (e.g. when the demo card mounts) so the first real run feels instant. */
export function preloadSentimentModel(): void {
  void loadSession();
  void loadVocab();
}

export async function runSentiment(text: string): Promise<SentimentResult> {
  const [ort, session, vocab] = await Promise.all([loadOrt(), loadSession(), loadVocab()]);

  const vocabIndex = new Map(vocab.vocab.map((w, i) => [w, i]));
  const tokens = tokenize(text);

  const vector = new Float32Array(vocab.vocab.length);
  for (const tok of tokens) {
    const idx = vocabIndex.get(tok);
    if (idx !== undefined) vector[idx] += 1;
  }

  const inputTensor = new ort.Tensor("float32", vector, [1, vocab.vocab.length]);
  const outputs = await session.run({ input: inputTensor });
  const probs = outputs.probabilities.data as Float32Array;

  const probabilities = Object.fromEntries(
    vocab.classes.map((c, i) => [c, probs[i]])
  ) as Record<SentimentLabel, number>;

  let bestIdx = 0;
  for (let i = 1; i < probs.length; i++) if (probs[i] > probs[bestIdx]) bestIdx = i;
  const label = vocab.classes[bestIdx];

  const seen = new Set<string>();
  const contributions: WordContribution[] = [];
  for (const tok of tokens) {
    if (seen.has(tok)) continue;
    const idx = vocabIndex.get(tok);
    if (idx === undefined) continue;
    seen.add(tok);
    contributions.push({ word: tok, weight: vocab.weights[idx][bestIdx] });
  }

  return { label, confidence: probs[bestIdx], probabilities, contributions };
}
