import { encodeAbiParameters, toFunctionSelector, type Address, type Hex } from "viem";
import { storageRefComponents } from "./abi";

export const CLI_TYPE = {
  CLAUDE_CODE: 0,
  CRUSH: 5,
  ZEROCLAW: 6,
} as const;

/** Default model for the Ritual-hosted gateway (LLM_PROVIDER: "ritual") — no API key needed. */
export const DEFAULT_MODEL = "zai-org/GLM-4.7-FP8";

export const RESEARCH_CALLBACK_SELECTOR: Hex = toFunctionSelector(
  "onSovereignAgentResult(bytes32,bytes)",
);

const EMPTY_STORAGE_REF = { platform: "", path: "", keyRef: "" } as const;

/** The 23-field SovereignAgentParams ABI (0x080C), per ritual-dapp-agents. */
const SOVEREIGN_AGENT_PARAMS = [
  { type: "address" }, // 0 executor
  { type: "uint256" }, // 1 ttl
  { type: "bytes" }, // 2 userPublicKey
  { type: "uint64" }, // 3 pollIntervalBlocks
  { type: "uint64" }, // 4 maxPollBlock
  { type: "string" }, // 5 taskIdMarker
  { type: "address" }, // 6 deliveryTarget
  { type: "bytes4" }, // 7 deliverySelector
  { type: "uint256" }, // 8 deliveryGasLimit
  { type: "uint256" }, // 9 deliveryMaxFeePerGas
  { type: "uint256" }, // 10 deliveryMaxPriorityFeePerGas
  { type: "uint16" }, // 11 cliType
  { type: "string" }, // 12 prompt
  { type: "bytes" }, // 13 encryptedSecrets
  { type: "tuple", components: storageRefComponents }, // 14 convoHistory
  { type: "tuple", components: storageRefComponents }, // 15 output
  { type: "tuple[]", components: storageRefComponents }, // 16 skills
  { type: "tuple", components: storageRefComponents }, // 17 systemPrompt
  { type: "string" }, // 18 model
  { type: "string[]" }, // 19 tools
  { type: "uint16" }, // 20 maxTurns
  { type: "uint32" }, // 21 maxTokens
  { type: "string" }, // 22 rpcUrls
] as const;

export interface AgentCallParams {
  executor: Address;
  deliveryTarget: Address;
  prompt: string;
  encryptedSecrets: Hex;
  model?: string;
  ttl?: bigint;
  pollIntervalBlocks?: bigint;
  maxPollBlock?: bigint;
  maxTurns?: number;
  maxTokens?: number;
}

/**
 * Encodes a one-shot, stateless Sovereign Agent (0x080C) request: ZeroClaw harness, no DA-backed
 * memory/artifacts/skills/system-prompt (empty StorageRefs — each call starts fresh).
 */
export function encodeAgentCallRequest(params: AgentCallParams): Hex {
  return encodeAbiParameters(SOVEREIGN_AGENT_PARAMS, [
    params.executor,
    params.ttl ?? 500n,
    "0x",
    params.pollIntervalBlocks ?? 5n,
    params.maxPollBlock ?? 6000n,
    "RESEARCH_TASK",
    params.deliveryTarget,
    RESEARCH_CALLBACK_SELECTOR,
    3_000_000n,
    1_000_000_000n,
    100_000_000n,
    CLI_TYPE.ZEROCLAW,
    params.prompt,
    params.encryptedSecrets,
    EMPTY_STORAGE_REF,
    EMPTY_STORAGE_REF,
    [],
    EMPTY_STORAGE_REF,
    params.model ?? DEFAULT_MODEL,
    [],
    params.maxTurns ?? 30,
    params.maxTokens ?? 4096,
    "",
  ]);
}

export function buildResearchPrompt(topic: string): string {
  return (
    `Research the following topic thoroughly using your available tools and produce a clear, ` +
    `well-structured written report with section headings. Be concrete and factual, and note ` +
    `any important uncertainty or caveats.\n\nTopic: ${topic}`
  );
}
