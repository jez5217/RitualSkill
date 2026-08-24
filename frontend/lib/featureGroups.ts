export interface FeatureGroup {
  slug: string;
  href: string;
  name: string;
  tagline: string;
  description: string;
  color: "green" | "pink" | "lime" | "gold";
  precompiles: { address: string; name: string }[];
}

/** Mirrors the grouping used in Ritual's own docs (docs.ritualfoundation.org). */
export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    slug: "think",
    href: "/think",
    name: "Think",
    tagline: "AI & inference",
    description: "LLM chat, classical ML inference, and computation on encrypted tensors — all settled on-chain.",
    color: "pink",
    precompiles: [
      { address: "0x0802", name: "LLM Inference" },
      { address: "0x0800", name: "ONNX (Classical ML)" },
      { address: "0x0807", name: "FHE Inference" },
    ],
  },
  {
    slug: "act",
    href: "/act",
    name: "See · Hear · Act",
    tagline: "Real-world compute & multimodal generation",
    description: "Reach out to the live internet, and generate images, audio, and video — with TEE attestation.",
    color: "green",
    precompiles: [
      { address: "0x0801", name: "HTTP Call" },
      { address: "0x0805", name: "Long-Running HTTP" },
      { address: "0x0818", name: "Image Generation" },
      { address: "0x0819", name: "Audio Generation" },
      { address: "0x081A", name: "Video Generation" },
    ],
  },
  {
    slug: "agents",
    href: "/agents",
    name: "Autonomous Agents",
    tagline: "Agents that live on-chain",
    description: "One-shot research jobs and long-lived, revivable agents with memory and identity.",
    color: "pink",
    precompiles: [
      { address: "0x080C", name: "Sovereign Agent" },
      { address: "0x0820", name: "Persistent Agent" },
    ],
  },
  {
    slug: "remember",
    href: "/remember",
    name: "Remember",
    tagline: "Scheduling & identity",
    description: "Recurring self-invocation and deterministic key derivation for agent identity.",
    color: "gold",
    precompiles: [
      { address: "Scheduler", name: "Recurring Execution" },
      { address: "0x081B", name: "DKMS Key Derivation" },
    ],
  },
  {
    slug: "authenticate",
    href: "/authenticate",
    name: "Authenticate",
    tagline: "Signatures & identity",
    description: "Passkey-native transactions and signature verification for Solana, SSH, and DKIM.",
    color: "lime",
    precompiles: [
      { address: "0x77 / 0x0100", name: "Passkey (WebAuthn)" },
      { address: "0x0009", name: "Ed25519 Verify" },
    ],
  },
  {
    slug: "secrets",
    href: "/secrets",
    name: "Keep Secrets",
    tagline: "Privacy & keys",
    description: "ECIES-encrypted API keys, template substitution, PII redaction, and pay-per-call APIs.",
    color: "gold",
    precompiles: [
      { address: "ECIES", name: "Secret Encryption" },
      { address: "X402", name: "Micropayments" },
    ],
  },
];
