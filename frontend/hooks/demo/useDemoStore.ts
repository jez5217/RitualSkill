"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEMO_SEED_FEED, DEMO_WALLET_ADDRESS, generateDemoReport, randomDemoJobId } from "@/lib/demoData";

export type DemoJobStatus = "pending_commitment" | "processing" | "settled_success" | "settled_failed";

export interface DemoJob {
  jobId: `0x${string}`;
  requester: `0x${string}`;
  topic: string;
  status: DemoJobStatus;
  report: string;
  errorMessage: string;
}

interface DemoState {
  connected: boolean;
  address: `0x${string}` | null;
  balance: number;
  jobs: Record<string, DemoJob>;
  jobOrder: `0x${string}`[];
  connect: () => void;
  disconnect: () => void;
  deposit: (amountRitual: number) => void;
  submitResearch: (topic: string) => `0x${string}`;
}

function seedJobs(): { jobs: Record<string, DemoJob>; jobOrder: `0x${string}`[] } {
  const jobs: Record<string, DemoJob> = {};
  const jobOrder: `0x${string}`[] = [];
  for (const seed of DEMO_SEED_FEED) {
    jobs[seed.jobId] = {
      jobId: seed.jobId,
      requester: DEMO_WALLET_ADDRESS,
      topic: seed.topic,
      status: "settled_success",
      report: seed.report,
      errorMessage: "",
    };
    jobOrder.push(seed.jobId);
  }
  return { jobs, jobOrder };
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      connected: false,
      address: null,
      balance: 0,
      ...seedJobs(),

      connect: () => set({ connected: true, address: DEMO_WALLET_ADDRESS }),
      disconnect: () => set({ connected: false, address: null }),

      deposit: (amountRitual) => set((s) => ({ balance: s.balance + amountRitual })),

      submitResearch: (topic) => {
        const jobId = randomDemoJobId();
        const requester = get().address ?? DEMO_WALLET_ADDRESS;

        set((s) => ({
          jobs: {
            ...s.jobs,
            [jobId]: { jobId, requester, topic, status: "pending_commitment", report: "", errorMessage: "" },
          },
          jobOrder: [jobId, ...s.jobOrder],
        }));

        setTimeout(() => {
          const job = get().jobs[jobId];
          if (job) set((s) => ({ jobs: { ...s.jobs, [jobId]: { ...job, status: "processing" } } }));
        }, 1_500);

        const willFail = Math.random() < 0.15;
        setTimeout(
          () => {
            const job = get().jobs[jobId];
            if (!job) return;
            set((s) => ({
              jobs: {
                ...s.jobs,
                [jobId]: willFail
                  ? { ...job, status: "settled_failed", errorMessage: "executor timeout (simulated)" }
                  : { ...job, status: "settled_success", report: generateDemoReport(topic) },
              },
            }));
          },
          6_000 + Math.random() * 4_000,
        );

        return jobId;
      },
    }),
    { name: "ritual-research-demo-state" },
  ),
);
