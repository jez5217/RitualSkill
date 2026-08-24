export const DEMO_WALLET_ADDRESS = "0xDEC0DE00000000000000000000000000005EED" as const;

export interface DemoFeedSeed {
  jobId: `0x${string}`;
  topic: string;
  report: string;
}

/** Pre-seeded example entries so the feed doesn't look empty on first load. */
export const DEMO_SEED_FEED: DemoFeedSeed[] = [
  {
    jobId: "0x1a2b3c4d5e6f00112233445566778899aabbccddeeff0011223344556677aa",
    topic: "Summarize the current landscape of TEE-verified on-chain AI inference",
    report:
      "TEE-verified on-chain AI inference — represented by projects like Ritual — lets smart " +
      "contracts call AI/ML precompiles (HTTP, LLM, agents, image/audio/video) while a Trusted " +
      "Execution Environment attests that the computation ran untampered. This sidesteps the " +
      "classic blockchain constraint that execution must be deterministic: an enclave produces a " +
      "signed result, and the chain verifies the attestation rather than re-executing the model. " +
      "Compared to prior approaches (oracle networks relaying off-chain AI output, or ZK-proved " +
      "inference), TEE attestation trades some cryptographic strength for practicality — it is " +
      "cheap enough to run LLMs and agents natively, at the cost of trusting the hardware " +
      "manufacturer's attestation root rather than a pure math proof.",
  },
  {
    jobId: "0x2b3c4d5e6f00112233445566778899aabbccddeeff0011223344556677aabb",
    topic: "What are the tradeoffs between Sovereign Agent and Persistent Agent precompiles on Ritual?",
    report:
      "Sovereign Agent (0x080C) is a job primitive: a single async run — submit a prompt, get a " +
      "report back via callback, done. Persistent Agent (0x0820) is a service primitive: a " +
      "long-lived identity with DA-backed memory, liveness monitoring, and revival semantics. " +
      "Use Sovereign Agent for task-shaped work (research, code generation, one-off analysis) " +
      "where a fresh container per call is fine. Use Persistent Agent when the product surface is " +
      "\"my agent\" — something users expect to keep existing, remember prior context, and be " +
      "operated over time (e.g. a Telegram-connected assistant). The cost model differs too: " +
      "Sovereign Agent bills per iteration/tool-call for that one run, while Persistent Agent " +
      "requires ongoing DKMS-funded upkeep for its identity and heartbeat.",
  },
  {
    jobId: "0x3c4d5e6f00112233445566778899aabbccddeeff0011223344556677aabbcc",
    topic: "Explain why only one short-running async precompile call is allowed per transaction",
    report:
      "Short-running async precompiles (HTTP, LLM, DKMS) work by having the block builder simulate " +
      "your transaction, detect the precompile call, defer it while a TEE executor produces a " +
      "result off-chain, then re-execute your original transaction with that result injected " +
      "(\"fulfilled replay\"). That replay mechanism only has a slot for one externally-produced " +
      "result — there's no protocol path to coordinate two independent executor results landing " +
      "in the same deferred re-execution. Workflows needing two async steps (e.g. HTTP fetch then " +
      "LLM summarize) must split across two transactions, typically chained via the Scheduler.",
  },
];

const REPORT_TEMPLATES = [
  (topic: string) =>
    `Research summary for "${topic}": this is a simulated Sovereign Agent report generated in ` +
    "Demo Mode — no live TEE executor was contacted. In live mode, the ZeroClaw harness would run " +
    "against the Ritual-hosted model gateway, reason over the prompt across up to 30 turns, and " +
    "return a structured written report exactly like the delivered results in the feed below.",
  (topic: string) =>
    `Demo report on "${topic}". This text stands in for what the Sovereign Agent precompile ` +
    "(0x080C) would return via its async callback after running in a TEE. Deploy the contract and " +
    "switch off Demo Mode to see a real run.",
];

export function generateDemoReport(topic: string): string {
  const pick = REPORT_TEMPLATES[topic.length % REPORT_TEMPLATES.length];
  return pick(topic);
}

export function randomDemoJobId(): `0x${string}` {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}` as `0x${string}`;
}
