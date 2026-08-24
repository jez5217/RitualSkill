"use client";

import { useState } from "react";
import { ChainGuard } from "@/components/ChainGuard";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { WalletBalanceCard } from "@/components/WalletBalanceCard";
import { ResearchForm } from "@/components/ResearchForm";
import { ResearchStatusCard } from "@/components/ResearchStatusCard";
import { ResearchHistoryList } from "@/components/ResearchHistoryList";
import { useTrackedJobs } from "@/hooks/useTrackedJobs";
import { RESEARCH_REGISTRY_CONFIGURED } from "@/lib/addresses";

export function LiveApp() {
  const trackedJobIds = useTrackedJobs((s) => s.jobIds);
  const [activeJobId, setActiveJobId] = useState<`0x${string}` | null>(trackedJobIds[0] ?? null);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl text-gray-100 tracking-tight">
            Ritual Research Agent
          </h1>
          <p className="text-sm text-gray-500 mt-1">Autonomous research, settled on-chain.</p>
        </div>
        <ConnectWalletButton />
      </header>

      {!RESEARCH_REGISTRY_CONFIGURED && (
        <div className="mb-8 border border-ritual-gold/40 bg-ritual-gold/5 text-ritual-gold text-sm rounded-lg p-4">
          <strong>Not deployed yet.</strong> Run <code className="font-mono">forge script script/Deploy.s.sol</code>{" "}
          in <code className="font-mono">contracts/</code> and set{" "}
          <code className="font-mono">NEXT_PUBLIC_RESEARCH_REGISTRY</code> in{" "}
          <code className="font-mono">frontend/.env.local</code>.
        </div>
      )}

      <ChainGuard>
        <div className="space-y-6">
          <WalletBalanceCard />
          <ResearchForm
            onSubmitted={(jobId) => {
              setActiveJobId(jobId);
            }}
          />
          {activeJobId && <ResearchStatusCard jobId={activeJobId} />}
          <ResearchHistoryList />
        </div>
      </ChainGuard>
    </main>
  );
}
