"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PrecompileBadge } from "@/components/site/PrecompileBadge";
import { SceneVisual } from "@/components/site/SceneVisual";
import { TOUR_SCENES } from "@/lib/tourScenes";
import { pickFemaleVoice } from "@/lib/femaleVoice";
import { ACCENT } from "@/lib/accentColors";

const MUTED_SCENE_MS = 6000;

export function ExplainerTour() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [supported, setSupported] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scene = TOUR_SCENES[sceneIndex];
  const isLast = sceneIndex === TOUR_SCENES.length - 1;
  const accent = ACCENT[scene.color];

  // Voice discovery — getVoices() is async and unpopulated on first call in most browsers.
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    setSupported(true);
    function loadVoices() {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length) setVoice(pickFemaleVoice(voices));
    }
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  // Chrome silently cuts off long utterances (~15s) unless nudged periodically.
  useEffect(() => {
    if (!supported) return;
    const nudge = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
    return () => clearInterval(nudge);
  }, [supported]);

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function goNext() {
    setSceneIndex((i) => {
      if (i >= TOUR_SCENES.length - 1) {
        setPlaying(false);
        return i;
      }
      return i + 1;
    });
  }

  // Drives narration/auto-advance whenever the active scene or playback state changes.
  useEffect(() => {
    clearTimer();
    if (!playing) return;

    if (muted || !supported) {
      timerRef.current = setTimeout(goNext, MUTED_SCENE_MS);
      return () => clearTimer();
    }

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(scene.narration);
    if (voice) utter.voice = voice;
    utter.rate = 0.98;
    utter.pitch = 1.03;
    utter.onend = goNext;
    utter.onerror = goNext;
    window.speechSynthesis.speak(utter);

    return () => {
      window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIndex, playing, muted, supported, voice]);

  useEffect(() => {
    return () => {
      clearTimer();
      if (supported) window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePlay() {
    if (isLast) setSceneIndex(0);
    setPlaying(true);
  }

  function handlePause() {
    setPlaying(false);
    clearTimer();
    if (supported) window.speechSynthesis.cancel();
  }

  function jumpTo(i: number) {
    setSceneIndex(i);
  }

  function step(delta: number) {
    setSceneIndex((i) => Math.min(TOUR_SCENES.length - 1, Math.max(0, i + delta)));
  }

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <h2 className="font-display text-xl text-gray-100">Watch the tour</h2>
        <span className="text-xs text-gray-600 font-mono">
          {supported ? (voice ? `narrated by ${voice.name}` : "loading voice…") : "captions only — no speech synthesis"}
        </span>
      </div>

      <div className={`bg-ritual-elevated border ${accent.border} rounded-xl shadow-card overflow-hidden`}>
        <div key={scene.id} className="animate-scene-in">
          <div className="h-40 sm:h-48 bg-ritual-surface/40 border-b border-gray-800">
            <SceneVisual kind={scene.visual} color={scene.color} />
          </div>

          <div className="p-6 sm:p-8">
            <p className={`text-xs uppercase tracking-widest mb-2 ${accent.text}`}>{scene.eyebrow}</p>
            <h3 className="font-display text-xl sm:text-2xl text-gray-100 mb-2">{scene.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4 max-w-2xl">{scene.caption}</p>

            {scene.precompiles && (
              <div className="flex flex-wrap gap-2 mb-4">
                {scene.precompiles.map((p) => (
                  <PrecompileBadge key={p.address} address={p.address} label={p.name} color={scene.color} />
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 flex-wrap">
              {scene.href && (
                <Link href={scene.href} className={`text-sm font-semibold hover:underline ${accent.text}`}>
                  Open this page →
                </Link>
              )}
              <details className="group">
                <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-400 list-none">
                  Show transcript
                </summary>
                <p className="text-xs text-gray-500 leading-relaxed mt-2 max-w-2xl">{scene.narration}</p>
              </details>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 px-4 sm:px-6 py-3 flex items-center gap-3 flex-wrap">
          <button
            onClick={playing ? handlePause : handlePlay}
            className="px-3 py-1.5 border border-ritual-green text-ritual-green hover:bg-ritual-green/10
                       rounded-lg text-xs font-semibold focus-visible:outline-none focus-visible:ring-2
                       focus-visible:ring-ritual-green/50"
          >
            {playing ? "⏸ Pause" : isLast ? "↺ Replay tour" : "▶ Play tour"}
          </button>

          <button
            onClick={() => step(-1)}
            disabled={sceneIndex === 0}
            className="px-2.5 py-1.5 border border-gray-700 text-gray-400 rounded-lg text-xs
                       disabled:opacity-30 hover:border-gray-600 focus-visible:outline-none
                       focus-visible:ring-2 focus-visible:ring-ritual-green/50"
          >
            ‹ Prev
          </button>
          <button
            onClick={() => step(1)}
            disabled={isLast}
            className="px-2.5 py-1.5 border border-gray-700 text-gray-400 rounded-lg text-xs
                       disabled:opacity-30 hover:border-gray-600 focus-visible:outline-none
                       focus-visible:ring-2 focus-visible:ring-ritual-green/50"
          >
            Next ›
          </button>

          {supported && (
            <button
              onClick={() => setMuted((m) => !m)}
              className="px-2.5 py-1.5 border border-gray-700 text-gray-400 rounded-lg text-xs
                         hover:border-gray-600 focus-visible:outline-none focus-visible:ring-2
                         focus-visible:ring-ritual-green/50"
            >
              {muted ? "🔇 Sound off" : "🔊 Sound on"}
            </button>
          )}

          <div className="flex-1" />

          <div className="flex items-center gap-1.5">
            {TOUR_SCENES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => jumpTo(i)}
                aria-label={`Go to scene: ${s.eyebrow}`}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === sceneIndex ? `w-4 ${accent.dot}` : "bg-gray-700 hover:bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
