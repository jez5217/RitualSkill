"use client";

import type * as OrtNS from "onnxruntime-web/wasm";
import { loadOrt } from "@/lib/ortRuntime";

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

let sessionPromise: Promise<OrtNS.InferenceSession> | null = null;
let vocabPromise: Promise<VocabMeta> | null = null;

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
