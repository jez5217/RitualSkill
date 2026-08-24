"use client";

import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import { researchAgentRegistryAbi } from "@/lib/abi";
import { RESEARCH_REGISTRY } from "@/lib/addresses";
import { buildResearchPrompt, encodeAgentCallRequest } from "@/lib/encoding";
import { encryptAgentSecrets, ritualProviderSecrets } from "@/lib/secrets";
import { useExecutor } from "./useExecutor";
import { useRitualWrite } from "./useRitualWrite";
import { useTrackedJobs } from "./useTrackedJobs";

export type SubmitStage =
  | "idle"
  | "finding_executor"
  | "encrypting"
  | "awaiting_signature"
  | "submitted"
  | "error";

export function useResearchSubmit() {
  const { address } = useAccount();
  const { executor, message: executorMessage } = useExecutor();
  const { write } = useRitualWrite();
  const addJob = useTrackedJobs((s) => s.addJob);

  const [stage, setStage] = useState<SubmitStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastJobId, setLastJobId] = useState<`0x${string}` | null>(null);

  const submit = useCallback(
    async (topic: string) => {
      if (!address) throw new Error("Connect a wallet first");
      setError(null);
      setStage("finding_executor");

      if (!executor) {
        setStage("error");
        setError(executorMessage ?? "No executor available");
        throw new Error(executorMessage ?? "No executor available");
      }

      setStage("encrypting");
      const encryptedSecrets = encryptAgentSecrets(ritualProviderSecrets(), executor.publicKey);

      const encodedAgentRequest = encodeAgentCallRequest({
        executor: executor.teeAddress,
        deliveryTarget: RESEARCH_REGISTRY,
        prompt: buildResearchPrompt(topic),
        encryptedSecrets,
      });

      setStage("awaiting_signature");
      try {
        const hash = await write({
          address: RESEARCH_REGISTRY,
          abi: researchAgentRegistryAbi,
          functionName: "submitResearch",
          args: [topic, encodedAgentRequest],
          gas: 3_500_000n,
        });

        // jobId == this transaction's hash (see ResearchAgentRegistry.sol for why).
        setLastJobId(hash);
        addJob(hash);
        setStage("submitted");
        return hash;
      } catch (err) {
        setStage("error");
        setError(err instanceof Error ? err.message : "Submission failed");
        throw err;
      }
    },
    [address, executor, executorMessage, write, addJob],
  );

  return { submit, stage, error, lastJobId, executorReady: !!executor };
}
