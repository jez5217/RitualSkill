"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

export function HomeHero({ skillsUrl }: { skillsUrl: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 260]);
  const contentOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.25]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    e.currentTarget.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className="hero-glow relative left-1/2 -translate-x-1/2 w-screen h-[76vh] min-h-[520px] max-h-[820px]
                 overflow-hidden -mt-12 sm:-mt-20 mb-14"
    >
      <motion.div style={{ y }} className="absolute -top-20 -bottom-20 inset-x-0">
        <Image
          src="/images/siggy-tour/01-ritual-introduction.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className={`object-cover ${reduceMotion ? "" : "hero-breathe"}`}
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/25 to-transparent" />

      <motion.div
        style={{ opacity: contentOpacity }}
        className="relative z-10 h-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col justify-end pb-10 sm:pb-16"
      >
        <p className="text-xs text-ritual-green uppercase tracking-[0.2em] mb-4">Ritual Chain</p>
        <h1
          className={`font-display text-5xl sm:text-7xl tracking-tight leading-[0.98] mb-5 max-w-3xl ${
            reduceMotion ? "text-gray-100" : "text-shine"
          }`}
        >
          Build an autonomous AI agent that lives on-chain.
        </h1>
        <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-7 max-w-xl">
          Ritual is a blockchain with AI verified inside trusted hardware built directly into every
          contract call — an LLM, ML inference, and autonomous agents, natively. This site is a
          hands-on tour of what that makes possible.
        </p>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <Link
            href="/agents"
            className="px-5 py-3 bg-ritual-green text-black font-semibold rounded-lg hover:bg-ritual-green/90 transition-colors"
          >
            Try an AI Agent in 60 Seconds
          </Link>
          <a
            href={skillsUrl}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 border border-gray-500 bg-black/30 backdrop-blur text-gray-100
                       hover:border-gray-300 rounded-lg font-semibold transition-colors"
          >
            Start Building →
          </a>
        </div>
        <p className="text-xs text-gray-400">No wallet required · Takes about 60 seconds</p>
      </motion.div>
    </div>
  );
}
