"use client";

import { useState } from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { DemoNote } from "@/components/site/DemoNote";
import { PrecompileBadge } from "@/components/site/PrecompileBadge";
import { PersistentAgentDemo } from "@/components/demo/PersistentAgentDemo";
import { DemoWalletBalanceCard } from "@/components/demo/DemoWalletBalanceCard";
import { DemoResearchForm } from "@/components/demo/DemoResearchForm";
import { DemoResearchStatusCard } from "@/components/demo/DemoResearchStatusCard";
import { DemoResearchHistoryList } from "@/components/demo/DemoResearchHistoryList";
import { ChainGuard } from "@/components/ChainGuard";
import { WalletBalanceCard } from "@/components/WalletBalanceCard";
import { ResearchForm } from "@/components/ResearchForm";
import { ResearchStatusCard } from "@/components/ResearchStatusCard";
import { ResearchHistoryList } from "@/components/ResearchHistoryList";
import { useTrackedJobs } from "@/hooks/useTrackedJobs";
import { RESEARCH_REGISTRY_CONFIGURED } from "@/lib/addresses";
import { DEMO_MODE } from "@/lib/demoMode";

function SovereignAgentSection() {
  const trackedJobIds = useTrackedJobs((s) => s.jobIds);
  const [demoJobId, setDemoJobId] = useState<`0x${string}` | null>(null);
  const [liveJobId, setLiveJobId] = useState<`0x${string}` | null>(trackedJobIds[0] ?? null);

  if (DEMO_MODE) {
    return (
      <div className="space-y-4">
        <DemoWalletBalanceCard />
        <DemoResearchForm onSubmitted={setDemoJobId} />
        {demoJobId && <DemoResearchStatusCard jobId={demoJobId} />}
        <DemoResearchHistoryList />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!RESEARCH_REGISTRY_CONFIGURED && (
        <div className="border border-ritual-gold/40 bg-ritual-gold/5 text-ritual-gold text-sm rounded-lg p-4">
          <strong>Not deployed yet.</strong> Run <code className="font-mono">forge script script/Deploy.s.sol</code>{" "}
          in <code className="font-mono">contracts/</code> and set{" "}
          <code className="font-mono">NEXT_PUBLIC_RESEARCH_REGISTRY</code>.
        </div>
      )}
      <ChainGuard>
        <div className="space-y-4">
          <WalletBalanceCard />
          <ResearchForm onSubmitted={setLiveJobId} />
          {liveJobId && <ResearchStatusCard jobId={liveJobId} />}
          <ResearchHistoryList />
        </div>
      </ChainGuard>
    </div>
  );
}

export default function AgentsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <PageHeader
        eyebrow="Autonomous Agents"
        title="Agents That Live On-Chain"
        description="Two agent primitives: a one-shot job for task-shaped work, and a long-lived, revivable identity for always-on services."
      />

      <section className="mb-10">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-lg text-gray-100">Sovereign Agent — Research Job</h2>
          <PrecompileBadge address="0x080C" label="ZeroClaw · one-shot" color="pink" />
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Submit a topic; a ZeroClaw-harnessed agent researches it and reports back once.{" "}
          {DEMO_MODE ? (
            <>This is the same flow as the deployable contract in <code className="font-mono">contracts/</code>, running here in Demo Mode.</>
          ) : (
            <>Live Mode is on — this submits a real transaction to the deployed contract.</>
          )}
        </p>
        <SovereignAgentSection />
      </section>

      <section>
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-lg text-gray-100">Persistent Agent — Long-Lived Identity</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          An always-on assistant with memory, identity, and automatic revival if its executor goes
          down. Demo-only — no on-chain implementation in this repo yet.
        </p>
        <DemoNote>Fully simulated — including the crash/revival cycle.</DemoNote>
        <PersistentAgentDemo />
      </section>
    </main>
  );
}
