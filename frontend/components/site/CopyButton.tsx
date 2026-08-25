"use client";

import { useState } from "react";

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can be denied/unavailable — silently ignore, button just won't confirm.
    }
  }

  return (
    <button
      onClick={copy}
      className={`text-[10px] uppercase tracking-wide px-2 py-1 rounded border transition-colors ${
        copied
          ? "border-ritual-green/40 text-ritual-green bg-ritual-green/10"
          : "border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-600"
      } ${className ?? ""}`}
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}
