"use client";

import { useAccount, useReadContract } from "wagmi";
import { asyncJobTrackerAbi } from "@/lib/abi";
import { ASYNC_JOB_TRACKER } from "@/lib/addresses";

/** Ritual allows only one pending async job per sender address at a time. */
export function useSenderLock() {
  const { address } = useAccount();

  const { data: isLocked, refetch } = useReadContract({
    address: ASYNC_JOB_TRACKER,
    abi: asyncJobTrackerAbi,
    functionName: "hasPendingJobForSender",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5_000 },
  });

  return {
    isLocked: isLocked ?? false,
    refetch,
    message: isLocked
      ? "You have a research job in flight — wait for it to settle before submitting another."
      : null,
  };
}
