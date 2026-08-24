"use client";

import { useReadContract } from "wagmi";
import type { Address, Hex } from "viem";
import { teeServiceRegistryAbi } from "@/lib/abi";
import { TEE_SERVICE_REGISTRY, HTTP_CALL_CAPABILITY } from "@/lib/addresses";

export interface SelectedExecutor {
  teeAddress: Address;
  publicKey: Hex;
}

/**
 * Sovereign Agent jobs route through HTTP_CALL-capability executors (see ritual-dapp-agents).
 * Never hardcode an executor address — always resolve at call time so requests survive executor
 * churn.
 */
export function useExecutor() {
  const { data, isLoading, error, refetch } = useReadContract({
    address: TEE_SERVICE_REGISTRY,
    abi: teeServiceRegistryAbi,
    functionName: "getServicesByCapability",
    args: [HTTP_CALL_CAPABILITY, true],
    query: { refetchInterval: 30_000 },
  });

  const valid = (data ?? []).filter((svc) => svc.isValid);
  const executor: SelectedExecutor | null = valid[0]
    ? { teeAddress: valid[0].node.teeAddress, publicKey: valid[0].node.publicKey as Hex }
    : null;

  return {
    executor,
    executorCount: valid.length,
    isLoading,
    error,
    refetch,
    message: !isLoading && !executor ? "No Sovereign Agent executors are currently registered." : null,
  };
}
