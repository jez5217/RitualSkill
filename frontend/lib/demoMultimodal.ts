function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function gradientFromPrompt(prompt: string): string {
  const h = hashString(prompt || "ritual");
  const hue1 = h % 360;
  const hue2 = (h * 7) % 360;
  const hue3 = (h * 13) % 360;
  return `linear-gradient(135deg, hsl(${hue1} 70% 45%), hsl(${hue2} 70% 35%), hsl(${hue3} 70% 22%))`;
}

export function waveformBars(prompt: string, count = 48): number[] {
  const h = hashString(prompt || "ritual");
  return Array.from({ length: count }, (_, i) => {
    const v = Math.sin((h + i * 37) * 0.15) * 0.5 + 0.5;
    return 0.12 + v * 0.88;
  });
}
