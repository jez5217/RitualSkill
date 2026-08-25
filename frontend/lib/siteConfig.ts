// Set NEXT_PUBLIC_SITE_URL in your deployment environment (e.g. Vercel project
// settings) to the actual production domain once one exists — canonical URLs,
// Open Graph tags, and the sitemap all key off this. Falls back to localhost
// for local dev only.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const SITE_NAME = "Ritual Chain Feature Playground";
export const SITE_DESCRIPTION =
  "An interactive, demo-mode tour of Ritual Chain's AI precompiles — LLM chat, ML inference, autonomous agents, scheduling, encrypted secrets, and more. No wallet or testnet required.";
