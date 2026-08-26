import type { Metadata } from "next";
import { PageHeader } from "@/components/site/PageHeader";
import { DemoNote } from "@/components/site/DemoNote";
import { InfoCard } from "@/components/site/InfoCard";
import { SecretsDemo } from "@/components/demo/SecretsDemo";

export const metadata: Metadata = {
  title: "Keep Secrets — Privacy & Keys",
  description:
    "Real ECIES encryption, generated and verified right in your browser — plus access control and micropayments for secret-gated APIs.",
  alternates: { canonical: "/secrets" },
};

export default function SecretsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <PageHeader
        eyebrow="Keep Secrets"
        title="Privacy & Keys"
        description="API keys and other secrets are ECIES-encrypted to an executor's TEE public key — visible on-chain only as ciphertext, decrypted only inside the enclave."
        color="gold"
      />
      <DemoNote>The encryption below is real (using a throwaway in-browser keypair) — everything else on this page is descriptive.</DemoNote>

      <div className="space-y-6">
        <SecretsDemo />
        <InfoCard title="SecretsAccessControl" address="0xf9BF…32FD" color="gold">
          Lets a secret owner grant another address (a contract, a delegate) time-limited,
          policy-scoped access to their encrypted secrets — restricted by destination host, HTTP
          method, path, and headers if desired. The executor checks this on-chain grant before
          decrypting on a delegate&apos;s behalf.
        </InfoCard>
        <InfoCard title="X402 Micropayments" address="X402" color="gold">
          Runs on top of the HTTP precompile: encrypted payment credentials are injected the same
          way as any other secret, enabling pay-per-call access to metered APIs without a
          subscription or a separately managed payment key.
        </InfoCard>
      </div>
    </main>
  );
}
