// Shared visual content for opengraph-image.tsx and twitter-image.tsx. Each of
// those files must still declare its own literal `runtime`/`size`/`alt`
// exports (Next.js's build-time convention scanner requires a string literal
// in that exact file, not a re-export), but the JSX itself is fine to share.
export function OgImageContent() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "#000000",
        padding: "80px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          color: "#19D184",
          fontSize: 28,
          letterSpacing: 6,
          textTransform: "uppercase",
          marginBottom: 28,
          display: "flex",
        }}
      >
        Ritual Chain
      </div>
      <div
        style={{
          color: "#F3F4F6",
          fontSize: 64,
          fontWeight: 800,
          lineHeight: 1.15,
          maxWidth: 900,
          display: "flex",
        }}
      >
        Build an autonomous AI agent that lives on-chain.
      </div>
      <div style={{ color: "#9CA3AF", fontSize: 28, marginTop: 36, display: "flex" }}>
        Interactive Feature Playground · No wallet required
      </div>
    </div>
  );
}
