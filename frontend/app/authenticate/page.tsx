import type { Metadata } from "next";
import { PageHeader } from "@/components/site/PageHeader";
import { DemoNote } from "@/components/site/DemoNote";
import { InfoCard } from "@/components/site/InfoCard";
import { PasskeyDemo } from "@/components/demo/PasskeyDemo";

export const metadata: Metadata = {
  title: "Authenticate — Signatures & Identity",
  description:
    "Native support for the signature schemes the real world already uses — passkeys, Ed25519 (Solana/SSH/DKIM), and P-256.",
  alternates: { canonical: "/authenticate" },
};

export default function AuthenticatePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <PageHeader
        eyebrow="Authenticate"
        title="Signatures & Identity"
        description="Native support for the signature schemes the real world already uses — passkeys, Solana/SSH/DKIM (Ed25519), and P-256."
      />
      <DemoNote>No real WebAuthn prompt is triggered — the flow below is simulated for reliability across browsers.</DemoNote>

      <div className="space-y-6">
        <PasskeyDemo />
        <InfoCard title="Ed25519 Verification" address="0x0009" color="lime">
          Verifies Ed25519 signatures on-chain for 2,000 gas — far cheaper than a Solidity library
          implementation. Enables verifying Solana transactions, SSH-signed commits, and DKIM
          email signatures directly from a smart contract, without an off-chain oracle.
        </InfoCard>
      </div>
    </main>
  );
}
