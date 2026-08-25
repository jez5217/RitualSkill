import type { Metadata } from "next";
import Link from "next/link";
import { DemoNote } from "@/components/site/DemoNote";
import { PrecompileBadge } from "@/components/site/PrecompileBadge";
import { ExplainerTour } from "@/components/site/ExplainerTour";
import { CodeBlock } from "@/components/site/CodeBlock";
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
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div className="max-w-2xl mb-8">
        <p className="text-xs text-ritual-green uppercase tracking-widest mb-3">Ritual Chain</p>
        <h1 className="font-display text-4xl sm:text-5xl text-gray-100 tracking-tight leading-[1.05] mb-5">
          Build an autonomous AI agent that lives on-chain.
        </h1>
        <p className="text-base text-gray-400 leading-relaxed mb-6">
          Ritual is a blockchain with AI verified inside trusted hardware built directly into every
          contract call — an LLM, ML inference, and autonomous agents, natively. This site is a
          hands-on tour of what that makes possible.
        </p>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <Link
            href="/agents"
            className="px-5 py-3 bg-ritual-green text-black font-semibold rounded-lg hover:bg-ritual-green/90 transition-colors"
          >
            Try an AI Agent in 60 Seconds
          </Link>
          <a
            href={SKILLS_URL}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 border border-gray-700 text-gray-300 hover:border-gray-500 rounded-lg font-semibold transition-colors"
          >
            Start Building →
          </a>
        </div>
        <p className="text-xs text-gray-400">No wallet required · Takes about 60 seconds</p>
      </div>

      <section className="grid sm:grid-cols-3 gap-3 mb-10">
        <Link
          href="/think"
          className="border border-gray-800 hover:border-gray-700 rounded-lg p-4 transition-colors"
        >
          <p className="text-sm text-gray-200 font-semibold mb-1">I&apos;m exploring Ritual</p>
          <p className="text-xs text-gray-500 leading-relaxed">See what an AI-native chain can do — start with Think.</p>
        </Link>
        <a
          href="#for-developers"
          className="border border-gray-800 hover:border-gray-700 rounded-lg p-4 transition-colors"
        >
          <p className="text-sm text-gray-200 font-semibold mb-1">I&apos;m a developer</p>
          <p className="text-xs text-gray-500 leading-relaxed">See how to deploy the contract and call a precompile.</p>
        </a>
        <Link
          href="/agents"
          className="border border-gray-800 hover:border-gray-700 rounded-lg p-4 transition-colors"
        >
          <p className="text-sm text-gray-200 font-semibold mb-1">I want to deploy an agent</p>
          <p className="text-xs text-gray-500 leading-relaxed">Deploy the real Sovereign Agent contract to testnet.</p>
        </Link>
      </section>

      <DemoNote>
        Every card below is labeled with what it actually is —{" "}
        <span className="text-ritual-green">Live on Ritual</span>,{" "}
        <span className="text-ritual-purple">real local computation</span>,{" "}
        <span className="text-ritual-gold">interactive simulation</span>, or{" "}
        <span className="text-gray-400">concept/reference</span>. The Sovereign Agent research flow
        under <strong>Agents</strong> is the one with a real, deployable on-chain implementation
        (see <code className="font-mono">contracts/</code> in this project).
      </DemoNote>

      <ExplainerTour />

      <section className="mb-16">
        <h2 className="font-display text-xl text-gray-100 mb-5">Explore by capability</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURE_GROUPS.map((group) => (
            <Link
              key={group.slug}
              href={group.href}
              className="group bg-ritual-elevated border border-gray-800 hover:border-gray-700 rounded-xl p-5
                         shadow-card transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-display text-lg text-gray-100 group-hover:text-ritual-green transition-colors">
                  {group.name}
                </h3>
                <span className="text-gray-400 group-hover:text-ritual-green transition-colors">→</span>
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">{group.tagline}</p>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">{group.description}</p>
              <div className="flex flex-wrap gap-2">
                {group.precompiles.map((p) => (
                  <PrecompileBadge key={p.address} address={p.address} label={p.name} color={group.color} />
                ))}
              </div>
            </Link>
          ))}

          <Link
            href="/wallet"
            className="group bg-ritual-elevated border border-gray-800 hover:border-gray-700 rounded-xl p-5
                       shadow-card transition-colors sm:col-span-2"
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display text-lg text-gray-100 group-hover:text-ritual-green transition-colors">
                RitualWallet & Job Lifecycle
              </h3>
              <span className="text-gray-400 group-hover:text-ritual-green transition-colors">→</span>
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Fee escrow & async tracking</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              How every precompile call is funded, and the 9-state lifecycle every async job passes
              through from submission to settlement.
            </p>
          </Link>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="font-display text-xl text-gray-100 mb-5">Seven properties of an autonomous agent</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROPERTIES.map((p) => (
            <div key={p.name} className="border border-gray-800 rounded-lg p-4">
              <p className="text-sm text-ritual-pink font-semibold mb-1">{p.name}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{p.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="font-display text-xl text-gray-100 mb-5">What people are building</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {USE_CASES.map((u) => (
            <div key={u.title} className="border border-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-200 font-semibold mb-1">{u.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{u.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="for-developers">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <h2 className="font-display text-xl text-gray-100">For developers</h2>
          <a href={SKILLS_URL} target="_blank" rel="noreferrer" className="text-sm text-ritual-green hover:underline">
            Start building →
          </a>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-ritual-elevated border border-gray-800 rounded-xl p-5">
            <p className="text-sm text-gray-200 font-semibold mb-1">Deploy the real contract</p>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">
              Foundry project in <code className="font-mono">contracts/</code> — 11/11 tests passing.
            </p>
            <CodeBlock
              label="contracts/"
              code={`cp .env.example .env   # set PRIVATE_KEY\nforge test\nforge script script/Deploy.s.sol:DeployScript \\\n  --rpc-url $RITUAL_RPC_URL --broadcast`}
            />
          </div>
          <div className="bg-ritual-elevated border border-gray-800 rounded-xl p-5 sm:col-span-2">
            <p className="text-sm text-gray-200 font-semibold mb-1">Call a precompile from the frontend</p>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">
              wagmi&apos;s <code className="font-mono">useWriteContract</code> simulates first and always
              fails against Ritual&apos;s async precompiles — use raw <code className="font-mono">sendTransaction</code>{" "}
              instead (see <code className="font-mono">hooks/useRitualWrite.ts</code>).
            </p>
            <CodeBlock
              label="hooks/useRitualWrite.ts"
              code={`const data = encodeFunctionData({ abi, functionName, args });\nawait sendTransactionAsync({ to: address, data, gas: 500_000n });`}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
