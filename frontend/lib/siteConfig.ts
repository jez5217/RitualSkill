// Set NEXT_PUBLIC_SITE_URL in the Vercel project's environment variables if
// this ever moves off ritual-skill.vercel.app (e.g. a custom domain) —
// canonical URLs, Open Graph tags, and the sitemap all key off this. The
// fallback below is the actual current production URL, not localhost, so
// metadata is still correct in prod even if that env var is never set.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ritual-skill.vercel.app";

export const SITE_NAME = "Ritual Chain Feature Playground";
export const SITE_DESCRIPTION =
  "An interactive, demo-mode tour of Ritual Chain's AI precompiles — LLM chat, ML inference, autonomous agents, scheduling, encrypted secrets, and more. No wallet or testnet required.";
