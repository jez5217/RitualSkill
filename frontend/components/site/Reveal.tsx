"use client";

import { motion, useMotionValue, useReducedMotion, useTransform, type Variants } from "framer-motion";
import type { MouseEvent, ReactNode } from "react";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

/** Wraps a grid/flex container; its RevealItem children fade+slide in, staggered, the first time it scrolls into view. */
export function RevealGroup({ className, children }: { className?: string; children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={container}
      initial={reduceMotion ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}

/** Fades in (via the parent RevealGroup's stagger) and continuously tilts toward the cursor on hover. */
export function RevealItem({ className, children }: { className?: string; children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useTransform(py, [0, 1], [7, -7]);
  const rotateY = useTransform(px, [0, 1], [-7, 7]);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }
  function handleMouseLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.div
      className={className}
      variants={item}
      style={reduceMotion ? undefined : { rotateX, rotateY, transformPerspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}
