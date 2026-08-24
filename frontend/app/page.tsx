import Link from "next/link";
import { DemoNote } from "@/components/site/DemoNote";
import { PrecompileBadge } from "@/components/site/PrecompileBadge";
import { FEATURE_GROUPS } from "@/lib/featureGroups";

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
      <div className="max-w-2xl mb-10">
        <p className="text-xs text-ritual-green uppercase tracking-widest mb-3">Ritual Chain</p>
        <h1 className="font-display text-4xl sm:text-5xl text-gray-100 tracking-tight leading-[1.05] mb-5">
          Smart contracts that think, see, hear, and act.
        </h1>
        <p className="text-base text-gray-400 leading-relaxed">
          Ritual is a TEE-verified L1 with enshrined AI/ML precompiles — the schelling point for
          autonomous agents. This site is an interactive tour of what it can do.
        </p>
      </div>

      <DemoNote>
        Every feature below runs as a client-side simulation — no wallet, RPC, or live testnet
        required. The Sovereign Agent research flow under <strong>Agents</strong> also has a real,
        deployable on-chain implementation (see the repo&apos;s <code className="font-mono">contracts/</code>).
      </DemoNote>

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
                <span className="text-gray-600 group-hover:text-ritual-green transition-colors">→</span>
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
              <span className="text-gray-600 group-hover:text-ritual-green transition-colors">→</span>
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

      <section>
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
    </main>
  );
}
