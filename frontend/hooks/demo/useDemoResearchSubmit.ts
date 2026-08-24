"use client";

import { useCallback, useState } from "react";
import { useDemoStore } from "./useDemoStore";

export type DemoSubmitStage = "idle" | "finding_executor" | "encrypting" | "awaiting_signature" | "submitted";

const STAGE_SEQUENCE: { stage: DemoSubmitStage; delayMs: number }[] = [
  { stage: "finding_executor", delayMs: 300 },
  { stage: "encrypting", delayMs: 500 },
  { stage: "awaiting_signature", delayMs: 700 },
];

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Mirrors the shape of hooks/useResearchSubmit.ts but simulates every step locally. */
export function useDemoResearchSubmit() {
  const submitResearch = useDemoStore((s) => s.submitResearch);
  const [stage, setStage] = useState<DemoSubmitStage>("idle");

  const submit = useCallback(
    async (topic: string) => {
      for (const step of STAGE_SEQUENCE) {
        setStage(step.stage);
        await wait(step.delayMs);
      }
      const jobId = submitResearch(topic);
      setStage("submitted");
      return jobId;
    },
    [submitResearch],
  );

  return { submit, stage };
}
