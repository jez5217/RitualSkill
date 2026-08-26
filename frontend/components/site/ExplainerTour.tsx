"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PrecompileBadge } from "@/components/site/PrecompileBadge";
import { TOUR_SCENES } from "@/lib/tourScenes";
import { pickFemaleVoice } from "@/lib/femaleVoice";
import { ACCENT } from "@/lib/accentColors";

// Fallback-only: used when a scene's prerecorded audio fails to load/play at
// all. Guards against a browser speechSynthesis utterance's `onend` firing
// almost instantly (no voice ever resolved), and is the flat duration used
// when there's no narration to time against (captions-only).
const MIN_SCENE_DURATION = 7000;
const VOICE_TIMEOUT_MS = 2000;
const CROSSFADE_MS = 700;
const WAVEFORM_BARS = 20;

export function ExplainerTour() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [supported, setSupported] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voiceTimedOut, setVoiceTimedOut] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);

  // Two-layer crossfade: whichever layer isn't "front" gets the new image
  // while hidden, then front/back swap to fade between them. The <Image>
  // inside each layer still remounts on scene change (key={imgA}/{imgB}) so
  // its ken-burns zoom animation replays every visit, not just once.
  const [front, setFront] = useState<"A" | "B">("A");
  const [imgA, setImgA] = useState(0);
  const [imgB, setImgB] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingRef = useRef(false);
  const sceneStartRef = useRef(0);
  const sceneDurationRef = useRef(MIN_SCENE_DURATION);
  const rafRef = useRef<number | null>(null);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  const scene = TOUR_SCENES[sceneIndex];
  const isLast = sceneIndex === TOUR_SCENES.length - 1;
  // Next.js serves <Image> through its own optimized /_next/image URL, not the raw file path —
  // so the actual preload has to be a same-shaped <Image> too, or it warms a cache entry the
  // real one never requests and the swap still stalls.
  const nextIndex = (sceneIndex + 1) % TOUR_SCENES.length;
  const accent = ACCENT[scene.color];
  // speechSynthesis fallback only kicks in once we know audio has failed; this
  // just decides whether that fallback can attempt real speech at all.
  const canUseSpeechFallback = supported && !muted && (voice || !voiceTimedOut);

  // Voice discovery for the speechSynthesis fallback — getVoices() is async
  // and unpopulated on first call in most browsers.
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      setVoiceTimedOut(true);
      return;
    }
    setSupported(true);
    function loadVoices() {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length) setVoice(pickFemaleVoice(voices));
    }
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    const timeout = setTimeout(() => setVoiceTimedOut(true), VOICE_TIMEOUT_MS);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      clearTimeout(timeout);
    };
  }, []);

  // Chrome silently cuts off long speechSynthesis utterances (~15s) unless nudged periodically.
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

  // Preload every scene's narration audio up front so playback never stalls mid-tour.
  useEffect(() => {
    TOUR_SCENES.forEach((s) => {
      const a = new Audio();
      a.preload = "auto";
      a.src = s.audio;
    });
  }, []);

  // Crossfade: load the new scene into the back layer, then flip fronts one frame later.
  useEffect(() => {
    const backIsA = front === "B";
    if (backIsA) setImgA(sceneIndex);
    else setImgB(sceneIndex);
    const raf = requestAnimationFrame(() => setFront(backIsA ? "A" : "B"));
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIndex]);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function stopAudio() {
    const a = audioRef.current;
    if (a) {
      a.onplaying = null;
      a.onended = null;
      a.onerror = null;
      a.pause();
      audioRef.current = null;
    }
  }

  function stopEverything() {
    clearTimer();
    stopAudio();
    if (supported) window.speechSynthesis.cancel();
  }

  // Lazily created on first Play (user gesture) and reused across scenes —
  // each new Audio element still needs its own MediaElementSourceNode.
  function ensureAudioGraph() {
    if (!audioContextRef.current) {
      try {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new Ctx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.connect(ctx.destination);
        audioContextRef.current = ctx;
        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
      } catch {
        // Web Audio API unavailable — the waveform just won't animate; playback is unaffected.
      }
    }
    return audioContextRef.current && analyserRef.current
      ? { ctx: audioContextRef.current, analyser: analyserRef.current }
      : null;
  }

  function connectVisualizer(audio: HTMLAudioElement) {
    const graph = ensureAudioGraph();
    if (!graph) return;
    if (graph.ctx.state === "suspended") graph.ctx.resume().catch(() => {});
    try {
      const source = graph.ctx.createMediaElementSource(audio);
      source.connect(graph.analyser);
    } catch {
      // Safe to ignore — visualizer is cosmetic.
    }
  }

  function setBarHeights(px: number[]) {
    barRefs.current.forEach((el, i) => {
      if (el) el.style.height = `${px[i] ?? 8}px`;
    });
  }

  function progressTick() {
    const audio = audioRef.current;
    let p: number;
    if (audio && Number.isFinite(audio.duration) && audio.duration > 0) {
      p = audio.currentTime / audio.duration;
    } else {
      p = (performance.now() - sceneStartRef.current) / sceneDurationRef.current;
    }
    setProgress(Math.min(1, Math.max(0, p)));

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    if (analyser && dataArray && audio && !audio.paused) {
      analyser.getByteFrequencyData(dataArray);
      const step = Math.max(1, Math.floor(dataArray.length / WAVEFORM_BARS));
      setBarHeights(Array.from({ length: WAVEFORM_BARS }, (_, i) => 8 + (dataArray[i * step] / 255) * 28));
    } else {
      const t = performance.now() / 400;
      setBarHeights(
        Array.from({ length: WAVEFORM_BARS }, (_, i) => 8 + (0.5 + 0.5 * Math.sin(t + i * 0.5)) * 10)
      );
    }

    rafRef.current = requestAnimationFrame(progressTick);
  }

  function startProgressLoop() {
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(progressTick);
  }

  function stopProgressLoop() {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setProgress(0);
    setBarHeights(Array(WAVEFORM_BARS).fill(8));
  }

  function advanceFrom(index: number) {
    if (!playingRef.current) return;
    if (index >= TOUR_SCENES.length - 1) {
      setPlaying(false);
      playingRef.current = false;
      stopProgressLoop();
      return;
    }
    setSceneIndex(index + 1);
    playScene(index + 1);
  }

  // Last-resort path: no audio, no (usable) speech — just hold the caption for a fixed duration.
  function playCaptionsOnly(index: number) {
    setStatus(supported ? "Narration unavailable — continuing with captions" : "Captions only — no speech synthesis");
    sceneStartRef.current = performance.now();
    sceneDurationRef.current = MIN_SCENE_DURATION;
    timerRef.current = setTimeout(() => advanceFrom(index), MIN_SCENE_DURATION);
  }

  // Fallback path when this scene's audio file fails: try the browser voice, guaranteeing
  // a minimum duration regardless of how quickly `onend` fires; otherwise captions-only.
  function playWithSpeechFallback(index: number) {
    if (!canUseSpeechFallback) {
      playCaptionsOnly(index);
      return;
    }
    setStatus(voice ? `Narration unavailable — using ${voice.name}` : "loading voice…");
    sceneStartRef.current = performance.now();
    sceneDurationRef.current = MIN_SCENE_DURATION;
    const startedAt = Date.now();
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(TOUR_SCENES[index].narration);
    if (voice) utter.voice = voice;
    utter.rate = 0.98;
    utter.pitch = 1.03;
    function advance() {
      const elapsed = Date.now() - startedAt;
      timerRef.current = setTimeout(() => advanceFrom(index), Math.max(0, MIN_SCENE_DURATION - elapsed));
    }
    utter.onend = advance;
    utter.onerror = advance;
    window.speechSynthesis.speak(utter);
  }

  // Primary path: play this scene's prerecorded narration; only fall back on real failure.
  function playScene(index: number) {
    clearTimer();
    stopAudio();
    setSceneIndex(index);
    setProgress(0);
    sceneStartRef.current = performance.now();
    sceneDurationRef.current = MIN_SCENE_DURATION;

    if (muted) {
      setStatus("Sound off — continuing with captions");
      timerRef.current = setTimeout(() => advanceFrom(index), MIN_SCENE_DURATION);
      return;
    }

    const audio = new Audio(TOUR_SCENES[index].audio);
    audio.preload = "auto";
    audioRef.current = audio;
    connectVisualizer(audio);

    audio.onplaying = () => setStatus("Narration playing");
    audio.onended = () => advanceFrom(index);
    audio.onerror = () => playWithSpeechFallback(index);

    audio.play().catch(() => playWithSpeechFallback(index));
  }

  useEffect(() => {
    return () => {
      stopEverything();
      stopProgressLoop();
      audioContextRef.current?.close().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePlay() {
    const startIndex = isLast ? 0 : sceneIndex;
    setPlaying(true);
    playingRef.current = true;
    startProgressLoop();
    playScene(startIndex);
  }

  function handlePause() {
    setPlaying(false);
    playingRef.current = false;
    setStatus("");
    stopEverything();
    stopProgressLoop();
  }

  function jumpTo(i: number) {
    stopEverything();
    if (playingRef.current) {
      playScene(i);
    } else {
      setSceneIndex(i);
    }
  }

  function step(delta: number) {
    jumpTo(Math.min(TOUR_SCENES.length - 1, Math.max(0, sceneIndex + delta)));
  }

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <h2 className="font-display text-xl text-gray-100">Watch the tour</h2>
        <span className="text-xs text-gray-400 font-mono">{status}</span>
      </div>

      <div
        className="feature-card overflow-hidden"
        style={{ "--card-border-override": `${accent.hex}66` } as React.CSSProperties}
      >
        <div className="animate-scene-in">
          <div className="tourVisual">
            <div
              className="absolute inset-0"
              style={{ opacity: front === "A" ? 1 : 0, transition: `opacity ${CROSSFADE_MS}ms ease` }}
            >
              <Image
                key={imgA}
                src={TOUR_SCENES[imgA].image}
                alt=""
                fill
                priority={imgA === 0}
                sizes="(max-width: 768px) 100vw, 1100px"
                className="tourImage"
              />
            </div>
            <div
              className="absolute inset-0"
              style={{ opacity: front === "B" ? 1 : 0, transition: `opacity ${CROSSFADE_MS}ms ease` }}
            >
              <Image
                key={imgB}
                src={TOUR_SCENES[imgB].image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 1100px"
                className="tourImage"
              />
            </div>

            {/* Not shown — same URL shape as the visible layers above, so the browser/Next.js
                image cache is warm by the time this scene becomes current via Next/Prev. */}
            <Image
              key={`preload-${nextIndex}`}
              src={TOUR_SCENES[nextIndex].image}
              alt=""
              fill
              loading="eager"
              sizes="(max-width: 768px) 100vw, 1100px"
              className="absolute inset-0 opacity-0 pointer-events-none"
            />

            <div className="tourOverlay" />

            <div className="absolute top-0 inset-x-0 h-1 bg-white/10">
              <div
                className={`h-full ${accent.dot}`}
                style={{ width: `${progress * 100}%`, transition: playing ? "width 100ms linear" : "none" }}
              />
            </div>

            <div key={scene.id} className="tourContent animate-scene-in">
              <p className={`text-xs uppercase tracking-widest mb-1.5 ${accent.text}`}>{scene.eyebrow}</p>
              <h3 className="font-display text-lg sm:text-xl text-gray-100 mb-1.5">{scene.title}</h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-2">{scene.caption}</p>
              <div className="flex items-end gap-[3px] h-9" aria-hidden>
                {Array.from({ length: WAVEFORM_BARS }, (_, i) => (
                  <div
                    key={i}
                    ref={(el) => {
                      barRefs.current[i] = el;
                    }}
                    className={`w-[3px] rounded-full ${accent.dot} opacity-70`}
                    style={{ height: "8px" }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
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
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-200 list-none">
                  Show transcript
                </summary>
                <p className="text-xs text-gray-400 leading-relaxed mt-2 max-w-2xl">{scene.narration}</p>
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

          <button
            onClick={() => {
              const next = !muted;
              setMuted(next);
              if (playingRef.current) {
                // Restart the current scene under the new mode instead of waiting for it to end.
                playScene(sceneIndex);
              }
            }}
            className="px-2.5 py-1.5 border border-gray-700 text-gray-400 rounded-lg text-xs
                       hover:border-gray-600 focus-visible:outline-none focus-visible:ring-2
                       focus-visible:ring-ritual-green/50"
          >
            {muted ? "🔇 Sound off" : "🔊 Sound on"}
          </button>

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
