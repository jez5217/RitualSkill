"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TrackedJobsState {
  jobIds: `0x${string}`[];
  addJob: (jobId: `0x${string}`) => void;
}

/**
 * The chain (via ResearchAgentRegistry) is the source of truth for topic/report/status — this
 * store only remembers which jobIds this browser has submitted, so the status panel survives a
 * page refresh while a multi-minute agent run is still in flight.
 */
export const useTrackedJobs = create<TrackedJobsState>()(
  persist(
    (set, get) => ({
      jobIds: [],
      addJob: (jobId) => {
        if (get().jobIds.includes(jobId)) return;
        set((s) => ({ jobIds: [jobId, ...s.jobIds].slice(0, 20) }));
      },
    }),
    { name: "ritual-research-tracked-jobs" },
  ),
);
