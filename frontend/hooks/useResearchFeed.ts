"use client";

import { useMemo } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import { researchAgentRegistryAbi } from "@/lib/abi";
import { RESEARCH_REGISTRY } from "@/lib/addresses";

export interface FeedEntry {
  jobId: `0x${string}`;
  requester: `0x${string}`;
  topic: string;
  delivered: boolean;
  success: boolean;
  report: string;
  errorMessage: string;
}

/**
 * Reads the on-chain job list straight from ResearchAgentRegistry — the contract is its own
 * indexer, so no backend/off-chain database is needed for history.
 */
export function useResearchFeed(scope: "all" | { user: `0x${string}` }, limit = 10) {
  const { data: jobIds, refetch: refetchIds } = useReadContract({
    address: RESEARCH_REGISTRY,
    abi: researchAgentRegistryAbi,
    functionName: scope === "all" ? "getAllJobIds" : "getUserRequests",
    args: scope === "all" ? undefined : [scope.user],
    query: { refetchInterval: 15_000 },
  });

  const recentIds = useMemo(() => [...(jobIds ?? [])].reverse().slice(0, limit), [jobIds, limit]);

  const { data: requestResults, refetch: refetchRequests } = useReadContracts({
    contracts: recentIds.map((jobId) => ({
      address: RESEARCH_REGISTRY,
      abi: researchAgentRegistryAbi,
      functionName: "requests" as const,
      args: [jobId] as const,
    })),
    query: { enabled: recentIds.length > 0, refetchInterval: 15_000 },
  });

  const entries: FeedEntry[] = useMemo(
    () =>
      recentIds
        .map((jobId, i) => {
          const result = requestResults?.[i];
          if (!result || result.status !== "success") return null;
          const [requester, topic, , delivered, success, report, errorMessage] = result.result;
          return { jobId, requester, topic, delivered, success, report, errorMessage };
        })
        .filter((e): e is FeedEntry => e !== null),
    [recentIds, requestResults],
  );

  return {
    entries,
    refetch: () => {
      refetchIds();
      refetchRequests();
    },
  };
}
