"use client";

import { useMemo, useState } from "react";
import { useReadContract, useWatchContractEvent } from "wagmi";
import { asyncJobTrackerAbi, researchAgentRegistryAbi } from "@/lib/abi";
import { ASYNC_JOB_TRACKER, RESEARCH_REGISTRY } from "@/lib/addresses";

export type ResearchJobStatus =
  | "pending_commitment"
  | "processing"
  | "settled_success"
  | "settled_failed";

export interface ResearchJobState {
  status: ResearchJobStatus;
  topic: string;
  requester: `0x${string}`;
  delivered: boolean;
  success: boolean;
  report: string;
  errorMessage: string;
  committedBlock: number | null;
}

/**
 * Tracks one Sovereign Agent research job. `registry.requests(jobId)` is the source of truth
 * (polled), events only speed up the "committed" indicator before delivery lands.
 */
export function useResearchJob(jobId: `0x${string}` | null | undefined) {
  const [committedBlock, setCommittedBlock] = useState<number | null>(null);

  useWatchContractEvent({
    address: ASYNC_JOB_TRACKER,
    abi: asyncJobTrackerAbi,
    eventName: "JobAdded",
    enabled: !!jobId,
    args: jobId ? { jobId } : undefined,
    onLogs: (logs) => {
      const log = logs[0];
      if (log) setCommittedBlock(Number(log.args.commitBlock ?? 0n));
    },
  });

  const { data, isLoading, refetch } = useReadContract({
    address: RESEARCH_REGISTRY,
    abi: researchAgentRegistryAbi,
    functionName: "requests",
    args: jobId ? [jobId] : undefined,
    query: { enabled: !!jobId, refetchInterval: (q) => (q.state.data?.[3] ? false : 4_000) },
  });

  const state: ResearchJobState | null = useMemo(() => {
    if (!jobId || !data) return null;
    const [requester, topic, , delivered, success, report, errorMessage] = data;
    let status: ResearchJobStatus;
    if (delivered) status = success ? "settled_success" : "settled_failed";
    else if (committedBlock !== null) status = "processing";
    else status = "pending_commitment";

    return { status, topic, requester, delivered, success, report, errorMessage, committedBlock };
  }, [jobId, data, committedBlock]);

  return { state, isLoading, refetch };
}
