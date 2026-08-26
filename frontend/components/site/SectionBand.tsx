import type { ReactNode } from "react";

/**
 * Full-bleed colored background band (breaks out of the page's max-w-6xl
 * container edge-to-edge, content stays constrained inside it) — gives each
 * homepage section its own tinted dark surface instead of every section
 * sharing one flat black background.
 */
export function SectionBand({
  bg,
  innerClassName,
  ambient,
  children,
}: {
  bg: string;
  innerClassName?: string;
  /** Renders a slow-drifting, low-opacity background image behind this band's content. */
  ambient?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative left-1/2 -translate-x-1/2 w-screen isolate overflow-hidden" style={{ background: bg }}>
      {ambient && (
        <>
          <div
            className="absolute inset-[-6%] -z-20 bg-cover bg-center opacity-[0.17]
                       animate-[worldDrift_28s_ease-in-out_infinite_alternate] motion-reduce:animate-none"
            style={{ backgroundImage: `url(${ambient})` }}
          />
          <div
            className="absolute inset-0 -z-10"
            style={{
              background: `linear-gradient(to bottom, ${bg} 0%, transparent 20%, transparent 75%, ${bg} 100%),
                           radial-gradient(circle at 70% 45%, rgba(41,242,154,.10), transparent 42%)`,
            }}
          />
        </>
      )}
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 ${innerClassName ?? ""}`}>{children}</div>
    </div>
  );
}
