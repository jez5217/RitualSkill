import type { Metadata } from "next";
import { PageHeader } from "@/components/site/PageHeader";
import { DemoNote } from "@/components/site/DemoNote";
import { InfoCard } from "@/components/site/InfoCard";
import { DemoWalletBalanceCard } from "@/components/demo/DemoWalletBalanceCard";
import { AsyncLifecycleDemo } from "@/components/demo/AsyncLifecycleDemo";
import { ChainGuard } from "@/components/ChainGuard";
import { WalletBalanceCard } from "@/components/WalletBalanceCard";
import { DEMO_MODE } from "@/lib/demoMode";

export const metadata: Metadata = {
  title: "RitualWallet & Job Lifecycle",
  description:
    "How every precompile call is prepaid through RitualWallet, and the 9-state lifecycle every async job passes through from submission to settlement.",
  alternates: { canonical: "/wallet" },
};

export default function WalletPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <PageHeader
        eyebrow="Infrastructure"
        title="RitualWallet & Job Lifecycle"
        description="Every precompile call is prepaid through RitualWallet, and every async call is tracked through the same 9-state lifecycle — the plumbing every feature on this site sits on top of."
        color="gold"
      />
      {DEMO_MODE ? (
        <DemoNote>
          Connect the demo wallet (top right) and deposit below — it&apos;s shared across every
          page on this site.
        </DemoNote>
      ) : (
        <DemoNote>
          This is the real RitualWallet system contract at{" "}
          <code className="font-mono">0x532F…3948</code> — connect a real wallet (top right) on
          Ritual Chain (id 1979) and deposit sends an actual transaction.
        </DemoNote>
      )}

      <div className="space-y-6">
        {DEMO_MODE ? (
          <DemoWalletBalanceCard />
        ) : (
          <ChainGuard>
            <WalletBalanceCard />
          </ChainGuard>
        )}
        <AsyncLifecycleDemo />
        <InfoCard title="TEEServiceRegistry" address="0x9644…7F" color="green">
          The on-chain directory of registered TEE executors and their attestations. Contracts
          query it by capability (HTTP, LLM, image, …) to select an executor at call time — never
          hardcoded, so requests survive executor churn and restarts.
        </InfoCard>
      </div>
    </main>
  );
}
