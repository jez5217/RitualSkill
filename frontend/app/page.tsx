import type { Metadata } from "next";
import Link from "next/link";
import { DemoNote } from "@/components/site/DemoNote";
import { PrecompileBadge } from "@/components/site/PrecompileBadge";
import { ExplainerTour } from "@/components/site/ExplainerTour";
import { CodeBlock } from "@/components/site/CodeBlock";
import { RevealGroup, RevealItem } from "@/components/site/Reveal";
import { HomeHero } from "@/components/site/HomeHero";
import { SectionBand } from "@/components/site/SectionBand";
import { FEATURE_GROUPS } from "@/lib/featureGroups";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const SKILLS_URL = "https://skills.ritualfoundation.org";

const PROPERTIES = [
  { name: "Immortal", detail: "Runs indefinitely via self-scheduling — no human has to keep it alive." },
  { name: "Emancipated", detail: "Not controlled by any single operator or key holder." },
  { name: "Teleportable", detail: "State and identity are portable across executors via DA + revival." },
  { name: "Financially sovereign", detail: "Holds and manages its own funds through RitualWallet." },
  { name: "Web2-interoperable", detail: "Calls any HTTP API directly from a smart contract." },
  { name: "Private", detail: "ECIES-encrypted secrets and optional encrypted outputs." },
  { name: "Computationally sovereign", detail: "Runs its own AI inference — LLM, ONNX, FHE — natively." },
];

const USE_CASES = [
  { title: "Autonomous Agents", body: "Agents that live forever, financially and computationally sovereign." },
  { title: "Multi-Agent Evals", body: "Run evals like Project Vend or LMArena as fully on-chain agents." },
  { title: "Private AI", body: "A private, multimodal ChatGPT usable by humans and agents alike." },
  { title: "Identity Financialization", body: "Rent or sell identity to agents in a trust-minimized way." },
  { title: "Agent-Native Companies", body: "Agents form companies that accrue value independent of humans." },
  { title: "Agent-First RWA Exchange", body: "A Hyperliquid-style exchange architected for agent participants." },
];

export default function Home() {
  return (
    <main>
      <HomeHero skillsUrl={SKILLS_URL} />

      <SectionBand bg="var(--surface-emerald)" innerClassName="py-10">
        <RevealGroup className="grid sm:grid-cols-3 gap-3">
          <RevealItem>
            <Link href="/think" className="feature-card block p-4">
              <p className="text-sm text-gray-200 font-semibold mb-1">I&apos;m exploring Ritual</p>
              <p className="text-xs text-gray-400 leading-relaxed">See what an AI-native chain can do — start with Think.</p>
            </Link>
          </RevealItem>
          <RevealItem>
            <a href="#for-developers" className="feature-card block p-4">
              <p className="text-sm text-gray-200 font-semibold mb-1">I&apos;m a developer</p>
              <p className="text-xs text-gray-400 leading-relaxed">See how to deploy the contract and call a precompile.</p>
            </a>
          </RevealItem>
          <RevealItem>
            <Link href="/agents" className="feature-card block p-4">
              <p className="text-sm text-gray-200 font-semibold mb-1">I want to deploy an agent</p>
              <p className="text-xs text-gray-400 leading-relaxed">Deploy the real Sovereign Agent contract to testnet.</p>
            </Link>
          </RevealItem>
        </RevealGroup>

        <DemoNote>
          Every card below is labeled with what it actually is —{" "}
          <span className="text-ritual-green">Live on Ritual</span>,{" "}
          <span className="text-ritual-purple">real local computation</span>,{" "}
          <span className="text-ritual-gold">interactive simulation</span>, or{" "}
          <span className="text-gray-400">concept/reference</span>. The Sovereign Agent research flow
          under <strong>Agents</strong> is the one with a real, deployable on-chain implementation
          (see <code className="font-mono">contracts/</code> in this project).
        </DemoNote>
      </SectionBand>

      <SectionBand bg="var(--surface-tour)" innerClassName="py-14">
        <ExplainerTour />
      </SectionBand>

      <SectionBand bg="var(--surface-blue-slate)" innerClassName="py-14">
        <h2 className="font-display text-xl text-gray-100 mb-5">Explore by capability</h2>
        <RevealGroup className="grid sm:grid-cols-2 gap-4">
          {FEATURE_GROUPS.map((group) => (
            <RevealItem key={group.slug}>
              <Link href={group.href} className="feature-card group block p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display text-lg text-gray-100 group-hover:text-ritual-green transition-colors">
                    {group.name}
                  </h3>
                  <span className="text-gray-400 group-hover:text-ritual-green transition-colors">→</span>
                </div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">{group.tagline}</p>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">{group.description}</p>
                <div className="flex flex-wrap gap-2">
                  {group.precompiles.map((p) => (
                    <PrecompileBadge key={p.address} address={p.address} label={p.name} color={group.color} />
                  ))}
                </div>
              </Link>
            </RevealItem>
          ))}

          <RevealItem className="sm:col-span-2">
            <Link href="/wallet" className="feature-card group block p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-display text-lg text-gray-100 group-hover:text-ritual-green transition-colors">
                  RitualWallet & Job Lifecycle
                </h3>
                <span className="text-gray-400 group-hover:text-ritual-green transition-colors">→</span>
              </div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Fee escrow & async tracking</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                How every precompile call is funded, and the 9-state lifecycle every async job passes
                through from submission to settlement.
              </p>
            </Link>
          </RevealItem>
        </RevealGroup>
      </SectionBand>

      <SectionBand bg="var(--surface-violet)" innerClassName="py-14">
        <h2 className="font-display text-xl text-gray-100 mb-5">Seven properties of an autonomous agent</h2>
        <RevealGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROPERTIES.map((p) => (
            <RevealItem key={p.name} className="feature-card p-4">
              <p className="text-sm text-ritual-pink font-semibold mb-1">{p.name}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{p.detail}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </SectionBand>

      <SectionBand bg="var(--page-black)" innerClassName="py-14" ambient="/images/siggy-tour/09-global-finale.png">
        <h2 className="font-display text-xl text-gray-100 mb-5">What people are building</h2>
        <RevealGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {USE_CASES.map((u) => (
            <RevealItem key={u.title} className="feature-card p-4">
              <p className="text-sm text-gray-200 font-semibold mb-1">{u.title}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{u.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </SectionBand>

      <SectionBand bg="var(--surface-cyan)" innerClassName="py-14">
        <div id="for-developers" className="flex items-center justify-between mb-5 flex-wrap gap-2 scroll-mt-20">
          <h2 className="font-display text-xl text-gray-100">For developers</h2>
          <a href={SKILLS_URL} target="_blank" rel="noreferrer" className="text-sm text-ritual-green hover:underline">
            Start building →
          </a>
        </div>
        <RevealGroup className="grid sm:grid-cols-2 gap-4">
          <RevealItem className="feature-card p-5 min-w-0">
            <p className="text-sm text-gray-200 font-semibold mb-1">Deploy the real contract</p>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              Foundry project in <code className="font-mono">contracts/</code> — 11/11 tests passing.
            </p>
            <CodeBlock
              label="contracts/"
              code={`cp .env.example .env   # set PRIVATE_KEY\nforge test\nforge script script/Deploy.s.sol:DeployScript \\\n  --rpc-url $RITUAL_RPC_URL --broadcast`}
            />
          </RevealItem>
          <RevealItem className="feature-card p-5 sm:col-span-2 min-w-0">
            <p className="text-sm text-gray-200 font-semibold mb-1">Call a precompile from the frontend</p>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              wagmi&apos;s <code className="font-mono">useWriteContract</code> simulates first and always
              fails against Ritual&apos;s async precompiles — use raw <code className="font-mono">sendTransaction</code>{" "}
              instead (see <code className="font-mono">hooks/useRitualWrite.ts</code>).
            </p>
            <CodeBlock
              label="hooks/useRitualWrite.ts"
              code={`const data = encodeFunctionData({ abi, functionName, args });\nawait sendTransactionAsync({ to: address, data, gas: 500_000n });`}
            />
          </RevealItem>
        </RevealGroup>
      </SectionBand>
    </main>
  );
}
