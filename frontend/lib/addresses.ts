import type { Address } from "viem";

/** System contracts — fixed across every Ritual Chain deployment, safe to hardcode. */
export const RITUAL_WALLET: Address = "0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948";
export const ASYNC_JOB_TRACKER: Address = "0xC069FFCa0389f44eCA2C626e55491b0ab045AEF5";
export const ASYNC_DELIVERY: Address = "0x5A16214fF555848411544b005f7Ac063742f39F6";
export const TEE_SERVICE_REGISTRY: Address = "0x9644e8562cE0Fe12b4deeC4163c064A8862Bf47F";
export const SOVEREIGN_AGENT_PRECOMPILE: Address = "0x000000000000000000000000000000000000080C";

/** This project's deployed contract — changes per deployment, always read from env. */
export const RESEARCH_REGISTRY: Address = (process.env.NEXT_PUBLIC_RESEARCH_REGISTRY ??
  "0x0000000000000000000000000000000000000000") as Address;

export const RESEARCH_REGISTRY_CONFIGURED =
  RESEARCH_REGISTRY !== "0x0000000000000000000000000000000000000000";

export const HTTP_CALL_CAPABILITY = 0;
