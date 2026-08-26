"use client";

import { motion, useReducedMotion } from "framer-motion";

const ACCENT_TEXT: Record<string, string> = {
  green: "text-ritual-green",
  pink: "text-ritual-pink",
  lime: "text-ritual-lime",
  gold: "text-ritual-gold",
};
const ACCENT_BG: Record<string, string> = {
  green: "bg-ritual-green",
  pink: "bg-ritual-pink",
  lime: "bg-ritual-lime",
  gold: "bg-ritual-gold",
};

export function PageHeader({
  eyebrow,
  title,
  description,
  color = "green",
}: {
  eyebrow: string;
  title: string;
  description: string;
  color?: "green" | "pink" | "lime" | "gold";
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="mb-10 sm:mb-14"
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className={`h-px w-8 ${ACCENT_BG[color]}`} />
        <p className={`text-xs uppercase tracking-[0.2em] ${ACCENT_TEXT[color]}`}>{eyebrow}</p>
      </div>
      <h1 className="font-display text-4xl sm:text-6xl text-gray-100 tracking-tight leading-[1.02] mb-4 max-w-3xl">
        {title}
      </h1>
      <p className="text-base text-gray-500 max-w-[65ch] leading-relaxed">{description}</p>
    </motion.div>
  );
}
