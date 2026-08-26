"use client";

import { useState } from "react";
import { PrecompileBadge } from "@/components/site/PrecompileBadge";
import { StatusBadge } from "@/components/site/StatusBadge";
import { gradientFromPrompt, waveformBars } from "@/lib/demoMultimodal";

type Modality = "image" | "audio" | "video";

const MODALITY_CONFIG: Record<Modality, { address: string; label: string }> = {
  image: { address: "0x0818", label: "Image Generation" },
  audio: { address: "0x0819", label: "Audio Generation" },
  video: { address: "0x081A", label: "Video Generation" },
};

export function MultimodalDemo() {
  const [modality, setModality] = useState<Modality>("image");
  const [prompt, setPrompt] = useState("a glowing enclave protecting a stream of data, dark background");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ modality: Modality; prompt: string } | null>(null);

  function generate() {
    setGenerating(true);
    setResult(null);
    setTimeout(
      () => {
        setResult({ modality, prompt });
        setGenerating(false);
      },
      1_800 + Math.random() * 1_200,
    );
  }

  return (
    <div className="feature-card p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-display text-base text-gray-100">Multimodal Generation</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status="simulation" />
          <PrecompileBadge
            address={MODALITY_CONFIG[modality].address}
            label={MODALITY_CONFIG[modality].label}
            color="pink"
          />
        </div>
      </div>

      <div className="flex gap-1 mb-4 text-xs">
        {(["image", "audio", "video"] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setModality(m);
              setResult(null);
            }}
            className={`px-3 py-1.5 rounded-lg border capitalize ${
              modality === m ? "border-ritual-pink text-ritual-pink" : "border-gray-700 text-gray-400"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={2}
        className="w-full bg-ritual-surface border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-300
                   resize-none mb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ritual-pink/50"
      />

      <button
        onClick={generate}
        disabled={generating || !prompt.trim()}
        className="px-4 py-2.5 border border-ritual-pink text-ritual-pink hover:bg-ritual-pink/10
                   disabled:opacity-40 rounded-lg text-sm font-semibold
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ritual-pink/50"
      >
        {generating ? "Generating…" : `Generate ${modality}`}
      </button>

      {generating && (
        <div className="mt-4 h-40 rounded-lg bg-ritual-surface animate-pulse flex items-center justify-center">
          <span className="text-xs text-gray-400">Executor rendering in TEE…</span>
        </div>
      )}

      {result && !generating && (
        <div className="mt-4">
          {result.modality === "image" && (
            <div
              className="h-48 rounded-lg border border-ritual-pink/20"
              style={{ background: gradientFromPrompt(result.prompt) }}
            />
          )}
          {result.modality === "audio" && (
            <div className="h-32 rounded-lg border border-ritual-pink/20 bg-black flex items-end gap-[3px] p-4">
              {waveformBars(result.prompt).map((h, i) => (
                <div key={i} className="flex-1 bg-ritual-pink/70 rounded-sm" style={{ height: `${h * 100}%` }} />
              ))}
            </div>
          )}
          {result.modality === "video" && (
            <div
              className="h-48 rounded-lg border border-ritual-pink/20 flex items-center justify-center"
              style={{ background: gradientFromPrompt(result.prompt) }}
            >
              <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center text-gray-100 text-xl">
                ▶
              </div>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Simulated {result.modality} output for &ldquo;{result.prompt}&rdquo; · in live mode this
            would upload to a DA provider (GCS/HF/Pinata) and return a content-addressed URI.
          </p>
        </div>
      )}
    </div>
  );
}
