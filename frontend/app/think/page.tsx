import type { Metadata } from "next";
import { PageHeader } from "@/components/site/PageHeader";
import { DemoNote } from "@/components/site/DemoNote";
import { InfoCard } from "@/components/site/InfoCard";
import { LlmChatDemo } from "@/components/demo/LlmChatDemo";
import { OnnxDemo } from "@/components/demo/OnnxDemo";

export const metadata: Metadata = {
  title: "Think — AI & Inference",
  description:
    "Chat with an LLM, run a real trained ONNX model synchronously in your browser, and see how FHE inference computes over encrypted data — all as native Ritual precompiles.",
  alternates: { canonical: "/think" },
};

export default function ThinkPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <PageHeader
        eyebrow="Think"
        title="AI & Inference"
        description="Chat with an LLM, run classical ML inference synchronously, and compute over encrypted data — all as native precompiles a contract can call directly."
      />
      <DemoNote>
        Chat replies are simulated locally — no LLM was called. The classifier below is a real,
        separately trained ONNX model running via WebAssembly, standing in for the on-chain
        Classical Inference precompile.
      </DemoNote>

      <div className="space-y-6">
        <LlmChatDemo />
        <OnnxDemo />
        <InfoCard title="FHE Inference" address="0x0807" color="pink">
          Runs ML inference directly on CKKS-encrypted tensors inside a TEE — the executor never
          sees the plaintext input or output. Long-running (two-phase): submit encrypted input,
          get an encrypted result via callback. Useful when even the TEE operator shouldn&apos;t
          see your data. No interactive demo here — it&apos;s a specialized primitive most dApps
          reach for only when handling sensitive numerical data (health, finance) that must stay
          encrypted end-to-end.
        </InfoCard>
      </div>
    </main>
  );
}
