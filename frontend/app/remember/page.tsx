import { PageHeader } from "@/components/site/PageHeader";
import { DemoNote } from "@/components/site/DemoNote";
import { InfoCard } from "@/components/site/InfoCard";
import { SchedulerDemo } from "@/components/demo/SchedulerDemo";

export default function RememberPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <PageHeader
        eyebrow="Remember"
        title="Scheduling & Identity"
        description="How Ritual gives contracts a sense of time — recurring self-invocation — and gives agents a persistent, derivable identity."
      />
      <DemoNote>The schedule below ticks on an accelerated demo clock, not real block times.</DemoNote>

      <div className="space-y-6">
        <SchedulerDemo />
        <InfoCard title="DKMS Key Derivation" address="0x081B" color="gold">
          Deterministically derives a secp256k1 keypair inside a TEE from an owner address + salt —
          used to give agents their own wallet/identity without a human ever holding the private
          key. The Sovereign/Persistent Agent factory contracts (see <code className="font-mono">ritual-dapp-agents</code>) use this to fund and control agent-owned addresses.
        </InfoCard>
      </div>
    </main>
  );
}
