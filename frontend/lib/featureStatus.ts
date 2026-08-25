export type FeatureStatus = "live" | "local" | "simulation" | "concept";

export const STATUS_META: Record<FeatureStatus, { label: string; text: string; border: string; bg: string; dot: string }> = {
  live: {
    label: "Live on Ritual",
    text: "text-ritual-green",
    border: "border-ritual-green/40",
    bg: "bg-ritual-green/10",
    dot: "bg-ritual-green",
  },
  local: {
    label: "Real local computation",
    text: "text-ritual-purple",
    border: "border-ritual-purple/40",
    bg: "bg-ritual-purple/10",
    dot: "bg-ritual-purple",
  },
  simulation: {
    label: "Interactive simulation",
    text: "text-ritual-gold",
    border: "border-ritual-gold/40",
    bg: "bg-ritual-gold/10",
    dot: "bg-ritual-gold",
  },
  concept: {
    label: "Concept / reference",
    text: "text-gray-400",
    border: "border-gray-700",
    bg: "bg-gray-800/60",
    dot: "bg-gray-500",
  },
};
