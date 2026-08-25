import type { Metadata } from "next";

// app/agents/page.tsx is a Client Component ("use client"), which can't export
// `metadata` itself — a sibling server-component layout is the standard
// Next.js App Router way to attach route metadata to a client page.
export const metadata: Metadata = {
  title: "Agents — Autonomous Agents That Live On-Chain",
  description:
    "Submit a real research job to the Sovereign Agent precompile, and chat with a Persistent Agent that remembers across the conversation.",
  alternates: { canonical: "/agents" },
};

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
