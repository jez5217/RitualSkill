import type { Metadata } from "next";
import { PageHeader } from "@/components/site/PageHeader";
import { DemoNote } from "@/components/site/DemoNote";
import { InfoCard } from "@/components/site/InfoCard";
import { HttpCallDemo } from "@/components/demo/HttpCallDemo";
import { MultimodalDemo } from "@/components/demo/MultimodalDemo";

export const metadata: Metadata = {
  title: "See · Hear · Act — Real-World Compute & Multimodal",
  description:
    "Call any HTTP API, and generate images, audio, and video — with every result attested inside a trusted execution environment.",
  alternates: { canonical: "/act" },
};

export default function ActPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <PageHeader
        eyebrow="See · Hear · Act"
        title="Real-World Compute & Multimodal"
        description="Reach beyond the chain — call any HTTP API, and generate images, audio, and video — with every result attested inside a TEE."
        color="green"
      />
      <DemoNote>Requests below are simulated locally — nothing leaves your browser.</DemoNote>

      <div className="space-y-6">
        <HttpCallDemo />
        <MultimodalDemo />
        <InfoCard title="Long-Running HTTP" address="0x0805" color="green">
          For APIs that take longer than a single round trip (report generation, batch jobs, slow
          upstreams) — submits, polls a status URL on an interval, and delivers the result via
          callback once ready, instead of blocking one transaction. Same two-phase delivery model
          as the Sovereign Agent demo under <strong>Agents</strong>.
        </InfoCard>
      </div>
    </main>
  );
}
