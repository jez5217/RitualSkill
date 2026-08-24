"use client";

import { useMemo } from "react";
import { useDemoStore } from "./useDemoStore";

export function useDemoResearchFeed(scope: "all" | "mine", limit = 10) {
  const jobs = useDemoStore((s) => s.jobs);
  const jobOrder = useDemoStore((s) => s.jobOrder);
  const address = useDemoStore((s) => s.address);

  const entries = useMemo(() => {
    const list = jobOrder.map((id) => jobs[id]).filter((j): j is NonNullable<typeof j> => !!j);
    const scoped = scope === "mine" && address ? list.filter((j) => j.requester === address) : list;
    return scoped.slice(0, limit);
  }, [jobOrder, jobs, scope, address, limit]);

  return { entries };
}
