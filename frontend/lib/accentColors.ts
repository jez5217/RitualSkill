export type AccentColor = "green" | "pink" | "lime" | "gold";

export const ACCENT: Record<AccentColor, { text: string; border: string; dot: string; bg: string; glow: string }> = {
  green: { text: "text-ritual-green", border: "border-ritual-green/40", dot: "bg-ritual-green", bg: "bg-ritual-green", glow: "bg-ritual-green/20" },
  pink: { text: "text-ritual-pink", border: "border-ritual-pink/40", dot: "bg-ritual-pink", bg: "bg-ritual-pink", glow: "bg-ritual-pink/20" },
  lime: { text: "text-ritual-lime", border: "border-ritual-lime/40", dot: "bg-ritual-lime", bg: "bg-ritual-lime", glow: "bg-ritual-lime/20" },
  gold: { text: "text-ritual-gold", border: "border-ritual-gold/40", dot: "bg-ritual-gold", bg: "bg-ritual-gold", glow: "bg-ritual-gold/20" },
};
