"use client";

import type * as OrtNS from "onnxruntime-web/wasm";
import { loadOrt } from "@/lib/ortRuntime";

export type SecretLabel = "SAFE" | "SECRET";

export interface SecretClassification {
  label: SecretLabel;
  confidence: number;
}

interface VocabMeta {
  classes: SecretLabel[];
  vocab: string[];
}

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/\W+/).filter(Boolean);
}

let sessionPromise: Promise<OrtNS.InferenceSession> | null = null;
let vocabPromise: Promise<VocabMeta> | null = null;

async function loadVocab(): Promise<VocabMeta> {
  if (!vocabPromise) {
    vocabPromise = fetch("/models/secrets/vocab.json").then((r) => {
      if (!r.ok) throw new Error(`Failed to load secrets vocab.json: ${r.status}`);
      return r.json();
    });
  }
  return vocabPromise;
}

async function loadSession(): Promise<OrtNS.InferenceSession> {
  if (!sessionPromise) {
    sessionPromise = loadOrt().then((ort) =>
      ort.InferenceSession.create("/models/secrets/model.onnx", { executionProviders: ["wasm"] })
    );
  }
  return sessionPromise;
}

/** Kicks off model + vocab download early so the first real classification feels instant. */
export function preloadSecretsClassifier(): void {
  void loadSession();
  void loadVocab();
}

/**
 * Classifies free text as SAFE or SECRET (looks like it discloses an API key,
 * password, or PII) -- a lexical "should this be ECIES-encrypted?" signal,
 * mirroring the real piiEnabled bool on the HTTP (0x0801) and LLM (0x0802)
 * precompiles. Not a regex entity extractor: it recognizes the vocabulary
 * around disclosing a secret, not exact email/phone/SSN structure.
 */
export async function classifySecret(text: string): Promise<SecretClassification> {
  const [ort, session, vocab] = await Promise.all([loadOrt(), loadSession(), loadVocab()]);

  const vocabIndex = new Map(vocab.vocab.map((w, i) => [w, i]));
  const vector = new Float32Array(vocab.vocab.length);
  for (const tok of tokenize(text)) {
    const idx = vocabIndex.get(tok);
    if (idx !== undefined) vector[idx] += 1;
  }

  const inputTensor = new ort.Tensor("float32", vector, [1, vocab.vocab.length]);
  const outputs = await session.run({ input: inputTensor });
  const probs = outputs.probabilities.data as Float32Array;

  let bestIdx = 0;
  for (let i = 1; i < probs.length; i++) if (probs[i] > probs[bestIdx]) bestIdx = i;

  return { label: vocab.classes[bestIdx], confidence: probs[bestIdx] };
}
