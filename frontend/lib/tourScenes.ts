import { FEATURE_GROUPS } from "@/lib/featureGroups";

export interface TourScene {
  id: string;
  eyebrow: string;
  title: string;
  /** Short on-screen line — the background image + voice carry the explanation, this is just a label. */
  caption: string;
  /** Full narration text — also shown in the collapsed transcript for accessibility. */
  narration: string;
  /** Background artwork for this scene, in public/images/siggy-tour/. */
  image: string;
  /** Prerecorded narration audio, in public/audio/siggy-tour/ — primary playback path, not the Web Speech API. */
  audio: string;
  precompiles?: { address: string; name: string }[];
  href?: string;
  color: "green" | "pink" | "lime" | "gold";
}

const think = FEATURE_GROUPS.find((g) => g.slug === "think")!;
const act = FEATURE_GROUPS.find((g) => g.slug === "act")!;
const agents = FEATURE_GROUPS.find((g) => g.slug === "agents")!;
const remember = FEATURE_GROUPS.find((g) => g.slug === "remember")!;
const authenticate = FEATURE_GROUPS.find((g) => g.slug === "authenticate")!;
const secrets = FEATURE_GROUPS.find((g) => g.slug === "secrets")!;

/** Narration is hand-written for pacing, not auto-generated from the feature data below. */
export const TOUR_SCENES: TourScene[] = [
  {
    id: "intro",
    eyebrow: "Ritual Chain",
    title: "Smart contracts that think, see, hear, and act.",
    caption: "A blockchain where contracts think, see, hear, and act.",
    narration:
      "Ritual Chain is a blockchain built around native AI precompiles — smart contracts that can " +
      "think, see, hear, and act. This is a guided tour of every one Ritual ships, built directly " +
      "into the chain itself, running here in Demo Mode — no wallet or testnet required.",
    image: "/images/ritual/ritual-floating-crystal.png",
    audio: "/audio/siggy-tour/01-ritual-introduction.wav",
    color: "green",
  },
  {
    id: think.slug,
    eyebrow: think.name,
    title: think.tagline,
    caption: "LLM chat, classical ML inference, and encrypted computation — on chain.",
    narration:
      "The Think page covers three ways a contract can reason. LLM Chat calls a hosted language " +
      "model directly. Classical Inference runs a small O-N-N-X model synchronously, inline, in " +
      "the same block — and on this site, that demo is backed by a real trained model, not a " +
      "simulation. Fully Homomorphic Encryption inference computes directly on encrypted data " +
      "inside a trusted execution environment, so not even the operator sees your input.",
    image: "/images/siggy-tour/02-ai-inference.png",
    audio: "/audio/siggy-tour/02-ai-inference.wav",
    precompiles: think.precompiles,
    href: think.href,
    color: think.color,
  },
  {
    id: act.slug,
    eyebrow: act.name,
    title: act.tagline,
    caption: "Call any live API, generate media, and run long jobs asynchronously.",
    narration:
      "The See, Hear, Act page is about a contract reaching outward. HTTP Call lets it fetch live " +
      "data from any API. Multimodal generation produces images, audio, and video on demand. And " +
      "Long-Running HTTP handles slower external calls asynchronously, delivering the result back " +
      "on chain through a callback.",
    image: "/images/siggy-tour/03-see-hear-act.png",
    audio: "/audio/siggy-tour/03-see-hear-act.wav",
    precompiles: act.precompiles,
    href: act.href,
    color: act.color,
  },
  {
    id: agents.slug,
    eyebrow: agents.name,
    title: agents.tagline,
    caption: "A real contract dispatches research to a TEE and gets a report back.",
    narration:
      "This is the one feature on the whole site with a real deployed contract behind it. Submit a " +
      "research topic, and the Sovereign Agent precompile dispatches it to a trusted execution " +
      "environment, which researches the topic and calls back with a report — stored on chain, " +
      "readable by anyone, no backend database required. The Persistent Agent alongside it " +
      "demonstrates an agent with memory across conversations.",
    image: "/images/siggy-tour/04-autonomous-agents.png",
    audio: "/audio/siggy-tour/04-autonomous-agents.wav",
    precompiles: agents.precompiles,
    href: agents.href,
    color: agents.color,
  },
  {
    id: remember.slug,
    eyebrow: remember.name,
    title: remember.tagline,
    caption: "Contracts schedule their own recurring calls and derive their own keys.",
    narration:
      "The Scheduler lets a contract register a recurring call, so an agent can act on a timer " +
      "without any off-chain cron job watching it. Decentralized key management, or D-K-M-S, " +
      "handles key derivation for an agent's identity across encrypted workflows.",
    image: "/images/siggy-tour/05-memory-scheduling.png",
    audio: "/audio/siggy-tour/05-memory-scheduling.wav",
    precompiles: remember.precompiles,
    href: remember.href,
    color: remember.color,
  },
  {
    id: authenticate.slug,
    eyebrow: authenticate.name,
    title: authenticate.tagline,
    caption: "Sign in with a passkey. Verify signatures natively, on chain.",
    narration:
      "Passkey login lets a wallet be created and used with device biometrics instead of a seed " +
      "phrase, backed by transaction-level passkey signing. Ed25519 signature verification is " +
      "available directly as a precompile for contracts that need to verify it natively.",
    image: "/images/siggy-tour/06-authentication.png",
    audio: "/audio/siggy-tour/06-authentication.wav",
    precompiles: authenticate.precompiles,
    href: authenticate.href,
    color: authenticate.color,
  },
  {
    id: secrets.slug,
    eyebrow: secrets.name,
    title: secrets.tagline,
    caption: "Real encryption, generated and verified right in your browser.",
    narration:
      "The Secrets page uses real encryption, not a mock. It generates a throwaway key pair right " +
      "in your browser and encrypts against it with the same scheme the live submission flow " +
      "uses, so the ciphertext you see is genuinely encrypted. Access control and the ex-four-oh-" +
      "two micropayment protocol are covered alongside it.",
    image: "/images/siggy-tour/07-secret-encryption.png",
    audio: "/audio/siggy-tour/07-secret-encryption.wav",
    precompiles: secrets.precompiles,
    href: secrets.href,
    color: secrets.color,
  },
  {
    id: "wallet",
    eyebrow: "Wallet",
    title: "RitualWallet & Job Lifecycle",
    caption: "Every wallet is a contract. Every job moves through nine tracked states.",
    narration:
      "Every wallet on Ritual is a smart contract wallet. This page walks through its balance and " +
      "fee model, the nine states an asynchronous job moves through from submission to " +
      "settlement, and the registry of trusted execution environment operators that carry out " +
      "the work.",
    image: "/images/siggy-tour/08-ritual-wallet.png",
    audio: "/audio/siggy-tour/08-ritual-wallet.wav",
    href: "/wallet",
    color: "gold",
  },
  {
    id: "outro",
    eyebrow: "That's the tour",
    title: "Try it yourself",
    caption: "Every precompile Ritual ships today — pick a page above and try one.",
    narration:
      "That's every AI precompile Ritual ships today, all runnable right now with no wallet and " +
      "no testnet. Pick any page from the navigation above and try it for yourself.",
    image: "/images/siggy-tour/09-global-finale.png",
    audio: "/audio/siggy-tour/09-global-finale.wav",
    color: "green",
  },
];
