import type { AccentColor } from "@/lib/accentColors";
import { ACCENT } from "@/lib/accentColors";
import type { SceneVisualKind } from "@/lib/tourScenes";

function Glow({ color }: { color: AccentColor }) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center ${ACCENT[color].glow} blur-3xl rounded-full opacity-40 scale-75`}
      aria-hidden
    />
  );
}

function NetworkVisual({ color }: { color: AccentColor }) {
  const dot = ACCENT[color].dot;
  const satellites = [
    { top: "10%", left: "50%", delay: "0s" },
    { top: "50%", left: "88%", delay: "0.5s" },
    { top: "88%", left: "50%", delay: "1s" },
    { top: "50%", left: "12%", delay: "1.5s" },
  ];
  return (
    <div className="relative w-full h-full">
      <Glow color={color} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 160" aria-hidden>
        {satellites.map((s, i) => (
          <line
            key={i}
            x1="100"
            y1="80"
            x2={(parseFloat(s.left) / 100) * 200}
            y2={(parseFloat(s.top) / 100) * 160}
            className={ACCENT[color].text}
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeWidth="1.5"
          />
        ))}
      </svg>
      <div className={`absolute w-4 h-4 rounded-full ${dot}`} style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
        <div className={`absolute inset-0 rounded-full ${dot} anim-ring`} />
      </div>
      {satellites.map((s, i) => (
        <div
          key={i}
          className={`absolute w-2.5 h-2.5 rounded-full ${dot} anim-float`}
          style={{ top: s.top, left: s.left, transform: "translate(-50%,-50%)", animationDelay: s.delay }}
        />
      ))}
    </div>
  );
}

function ChatVisual({ color }: { color: AccentColor }) {
  const accent = ACCENT[color];
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <Glow color={color} />
      <div className={`relative bg-ritual-surface border ${accent.border} rounded-2xl rounded-bl-sm px-6 py-4 anim-float`}>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${accent.dot} anim-dot-bounce`} style={{ animationDelay: "0s" }} />
          <span className={`w-2 h-2 rounded-full ${accent.dot} anim-dot-bounce`} style={{ animationDelay: "0.15s" }} />
          <span className={`w-2 h-2 rounded-full ${accent.dot} anim-dot-bounce`} style={{ animationDelay: "0.3s" }} />
        </div>
      </div>
    </div>
  );
}

function FlowVisual({ color, nodes, roundtrip }: { color: AccentColor; nodes: string[]; roundtrip?: boolean }) {
  const accent = ACCENT[color];
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center px-6">
      <Glow color={color} />
      <div className="relative w-full max-w-xs h-1 bg-gray-800 rounded-full">
        <div className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${accent.dot} anim-travel shadow-[0_0_8px_currentColor] ${accent.text}`} />
        <div className="absolute inset-0 flex items-center justify-between">
          {nodes.map((_, i) => (
            <span key={i} className={`w-3 h-3 rounded-full border-2 ${accent.border} bg-ritual-elevated -mx-1.5`} />
          ))}
        </div>
      </div>
      <div className="relative w-full max-w-xs flex justify-between mt-3">
        {nodes.map((label) => (
          <span key={label} className="text-[10px] text-gray-500 uppercase tracking-wide text-center w-16 -mx-2">
            {label}
          </span>
        ))}
      </div>
      {roundtrip && <p className="text-[10px] text-gray-600 mt-2">out, then back via callback</p>}
    </div>
  );
}

function ClockVisual({ color }: { color: AccentColor }) {
  const accent = ACCENT[color];
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <Glow color={color} />
      <div className={`relative w-20 h-20 rounded-full border-2 ${accent.border} bg-ritual-surface`}>
        <div
          className={`absolute left-1/2 top-1/2 w-0.5 h-8 ${accent.bg} anim-spin-slower`}
          style={{ transformOrigin: "50% 100%", transform: "translate(-50%, -100%)" }}
        />
        <div className={`absolute left-1/2 top-1/2 w-2 h-2 rounded-full ${accent.dot}`} style={{ transform: "translate(-50%,-50%)" }} />
      </div>
    </div>
  );
}

function FingerprintVisual({ color }: { color: AccentColor }) {
  const accent = ACCENT[color];
  const rings = [
    { r: 30, dash: "40 9" },
    { r: 23, dash: "30 7" },
    { r: 16, dash: "20 6" },
    { r: 9, dash: "12 4" },
  ];
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <Glow color={color} />
      <svg viewBox="0 0 100 100" className={`w-24 h-24 ${accent.text}`} aria-hidden>
        {rings.map(({ r, dash }, i) => (
          <circle
            key={r}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={dash}
            strokeLinecap="round"
            opacity={0.9 - i * 0.12}
          />
        ))}
      </svg>
      <div
        className={`absolute w-24 h-6 opacity-50 anim-sweep ${accent.text}`}
        style={{ background: "linear-gradient(to bottom, transparent, currentColor, transparent)" }}
      />
    </div>
  );
}

function LockVisual({ color }: { color: AccentColor }) {
  const accent = ACCENT[color];
  const glyphs = ["4F", "9A", "C2", "1E", "7B"];
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <Glow color={color} />
      <div className="absolute flex gap-2">
        {glyphs.map((g, i) => (
          <span
            key={i}
            className="font-mono text-[10px] text-gray-500 anim-cipher"
            style={{ animationDelay: `${i * 0.25}s` }}
          >
            {g}
          </span>
        ))}
      </div>
      <div className="relative mt-6">
        <div className={`w-10 h-8 rounded-md ${accent.bg} opacity-90`} />
        <div
          className={`absolute -top-5 left-1/2 -translate-x-1/2 w-6 h-6 border-4 ${accent.border} border-b-0 rounded-t-full anim-shackle`}
          style={{ borderColor: "currentColor" }}
        />
      </div>
    </div>
  );
}

function LedgerVisual({ color }: { color: AccentColor }) {
  const accent = ACCENT[color];
  const states = 9;
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center px-6">
      <Glow color={color} />
      <div className="relative w-full max-w-xs h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div className={`absolute inset-y-0 left-0 w-1/3 ${accent.bg} opacity-70 anim-travel`} />
      </div>
      <div className="flex gap-1.5 mt-3">
        {Array.from({ length: states }).map((_, i) => (
          <span key={i} className={`w-1.5 h-1.5 rounded-full ${accent.dot} opacity-70`} />
        ))}
      </div>
      <p className="text-[10px] text-gray-600 mt-2">9-state async job lifecycle</p>
    </div>
  );
}

export function SceneVisual({ kind, color }: { kind: SceneVisualKind; color: AccentColor }) {
  switch (kind) {
    case "network":
      return <NetworkVisual color={color} />;
    case "chat":
      return <ChatVisual color={color} />;
    case "flow-roundtrip":
      return <FlowVisual color={color} nodes={["Contract", "Live API", "Contract"]} roundtrip />;
    case "flow-relay":
      return <FlowVisual color={color} nodes={["Contract", "TEE", "Callback"]} />;
    case "clock":
      return <ClockVisual color={color} />;
    case "fingerprint":
      return <FingerprintVisual color={color} />;
    case "lock":
      return <LockVisual color={color} />;
    case "ledger":
      return <LedgerVisual color={color} />;
  }
}
