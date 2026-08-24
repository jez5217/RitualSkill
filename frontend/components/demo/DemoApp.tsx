"use client";

import { useState } from "react";
import { DemoBanner } from "./DemoBanner";
import { DemoConnectWalletButton } from "./DemoConnectWalletButton";
import { DemoWalletBalanceCard } from "./DemoWalletBalanceCard";
import { DemoResearchForm } from "./DemoResearchForm";
import { DemoResearchStatusCard } from "./DemoResearchStatusCard";
import { DemoResearchHistoryList } from "./DemoResearchHistoryList";

export function DemoApp() {
  const [activeJobId, setActiveJobId] = useState<`0x${string}` | null>(null);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl text-gray-100 tracking-tight">
            Ritual Research Agent
          </h1>
          <p className="text-sm text-gray-500 mt-1">Autonomous research, settled on-chain.</p>
        </div>
        <DemoConnectWalletButton />
      </header>

      <DemoBanner />

      <div className="space-y-6">
        <DemoWalletBalanceCard />
        <DemoResearchForm onSubmitted={setActiveJobId} />
        {activeJobId && <DemoResearchStatusCard jobId={activeJobId} />}
        <DemoResearchHistoryList />
      </div>
    </main>
  );
}
