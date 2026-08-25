import type { Intent } from "@/lib/intentModel";

/** Small canned-response generator standing in for the LLM precompile (0x0802) in Demo Mode. */

// Cycled by turn count (not random, so it stays deterministic) rather than
// one fixed string per bucket -- a single hardcoded "ritual" reply meant any
// two different questions containing that word (e.g. "what is ritual" and
// "ritual team") came back byte-identical, which read as broken when tested
// with more than one message.
const RITUAL_REPLIES = [
  "Ritual Chain enshrines AI/ML compute as native precompiles — HTTP, LLM, agents, and " +
    "multimodal generation all execute inside TEEs, with results attested and verified " +
    "on-chain. This reply itself is simulated (Demo Mode) — a live call would route to the " +
    "zai-org/GLM-4.7-FP8 model via the Ritual gateway, no API key required.",
  "Ritual's core idea is TEE-verified execution: every precompile call — this chat included, " +
    "in live mode — runs inside a trusted execution environment, and the result comes back " +
    "with an attestation a contract can check on-chain before trusting it.",
  "The team behind Ritual builds toward one goal: making AI compute a first-class citizen of " +
    "a smart contract, not a bolt-on oracle. LLM inference, ML inference, and multimodal " +
    "generation are precompiles here, called the same way you'd call any other opcode.",
  "Ritual's agent primitives sit on top of the same TEE-execution model: a Sovereign Agent " +
    "runs a one-shot job (like the research flow on /agents), while a Persistent Agent keeps " +
    "DA-backed memory across turns. Both settle their results back on-chain via callback.",
];

const GREETING_REPLIES = [
  "Hey! I'm a simulated stand-in for Ritual's LLM precompile (0x0802). Ask me something to see streaming output.",
  "Hi there — this chat mimics token-by-token streaming from the LLM precompile, but nothing here calls a real model.",
];

function questionReply(msg: string, turn: number): string {
  const question = msg.replace(/\?+$/, "");
  const variants = [
    `That's a good question about "${question}". In a live deployment this would be answered by the ` +
      "model configured for this request — Ritual currently confirms zai-org/GLM-4.7-FP8 live on the " +
      "gateway, with a 64K operational context window. This response is generated locally for the demo, not by a real model.",
    `"${question}" — worth asking. On a real call, that prompt gets ABI-encoded into the LLM precompile's ` +
      "request struct and dispatched to whichever model the caller configured; here it's just pattern-matched text, no inference happened.",
  ];
  return variants[turn % variants.length];
}

function defaultReply(msg: string, turn: number): string {
  const variants = [
    `Noted: "${msg}". In live mode this prompt would be ABI-encoded into the LLM precompile's ` +
      "30-field request (message JSON, model, temperature, max tokens, ...), submitted async, and " +
      "settled in the same transaction via the SPC (simulated precompile call) mechanism.",
    `Got it: "${msg}". This demo just echoes locally — the real path is the same async precompile ` +
      "flow every other feature on this site uses: submit, TEE executor picks it up, callback " +
      "delivers the result on-chain.",
  ];
  return variants[turn % variants.length];
}

/**
 * Pure, dependency-free fallback used only if the real intent classifier
 * (lib/intentModel.ts, a trained ONNX model) fails to load — e.g. offline on
 * first visit before the model is cached. Keeps the demo from ever breaking,
 * at the cost of the cruder substring matching the real model replaced.
 */
export function keywordIntentFallback(userMessage: string): Intent {
  const lower = userMessage.trim().toLowerCase();
  if (lower.includes("ritual")) return "RITUAL";
  if (lower.includes("hello") || lower.includes("hi") || userMessage.trim().length < 8) return "GREETING";
  if (lower.includes("?")) return "QUESTION";
  return "OTHER";
}

export function generateDemoReply(userMessage: string, intent: Intent, turn = 0): string {
  const msg = userMessage.trim();
  switch (intent) {
    case "RITUAL":
      return RITUAL_REPLIES[turn % RITUAL_REPLIES.length];
    case "GREETING":
      return GREETING_REPLIES[turn % GREETING_REPLIES.length];
    case "QUESTION":
      return questionReply(msg, turn);
    default:
      return defaultReply(msg, turn);
  }
}
