# Ritual Chain — Feature Playground

An interactive tour of [Ritual Chain](https://ritualfoundation.org)'s enshrined AI precompiles —
"the first blockchain where smart contracts can think, see, hear, and act." Every capability in
the [official docs](https://docs.ritualfoundation.org/) has a page here: chat with the LLM
precompile, fetch live data via HTTP, generate images/audio/video, dispatch an autonomous research
agent, talk to a persistent agent with memory, schedule recurring calls, sign with a passkey, and
encrypt secrets — all runnable in **Demo Mode**, no wallet or testnet required.

One feature — the Sovereign Agent research flow — also ships a real, deployable Solidity contract,
built with the [ritual-dapp-skills](https://github.com/ritual-foundation/ritual-dapp-skills)
framework.

## Site map

| Page | Precompiles covered |
|---|---|
| `/` | Landing — positioning, seven properties of an autonomous agent, feature index |
| `/think` | LLM Chat (`0x0802`), Classical Inference/ONNX (`0x0800`), FHE (`0x0807`, info) |
| `/act` | HTTP Call (`0x0801`), Multimodal image/audio/video (`0x0818`/`0x0819`/`0x081A`), Long-Running HTTP (`0x0805`, info) |
| `/agents` | **Sovereign Agent** (`0x080C`, real contract + demo), Persistent Agent (`0x0820`, demo) |
| `/remember` | Scheduler, DKMS (`0x081B`, info) |
| `/authenticate` | Passkey/TxPasskey (`0x77`/`0x0100`), Ed25519 (`0x0009`, info) |
| `/secrets` | ECIES secret encryption (real crypto, demo keypair), SecretsAccessControl & X402 (info) |
| `/wallet` | RitualWallet, AsyncJobTracker 9-state lifecycle, TEEServiceRegistry (info) |

Every page carries a visible "Demo Mode" note. Most demos run a genuinely-implemented simulation
(state machines with realistic timing, real ECIES encryption against a throwaway keypair, a
deterministic "generated art" gradient, etc.) rather than a static screenshot — nothing on these
pages calls a real precompile or LLM.

## The one real feature: Sovereign Agent research

Submit a topic on `/agents` → `ResearchAgentRegistry.submitResearch()` calls the Sovereign Agent
precompile (`0x080C`, direct caller mode, ZeroClaw harness, `LLM_PROVIDER: "ritual"` — no external
API key needed) → a TEE executor researches it → the result lands back on-chain via callback.

```
User (topic) ──▶ ResearchAgentRegistry.submitResearch()
                        │
                        ├─▶ calls Sovereign Agent precompile (0x080C)
                        ▼
              TEE executor runs the agent (30s – several minutes)
                        ▼
      AsyncDelivery calls back ResearchAgentRegistry.onSovereignAgentResult()
                        ▼
        report / success / error stored on-chain, readable by anyone
```

The contract is its own indexer — no backend service or database. `/agents` renders either the
Demo Mode simulation or (with `NEXT_PUBLIC_DEMO_MODE=false` + a deployed contract) the real
on-chain flow, side by side with the always-demo Persistent Agent.

## Project layout

```
contracts/   Foundry project — ResearchAgentRegistry.sol + tests + deploy script
frontend/    Next.js 14 app — 8-page feature showcase, demo-mode by default
```

## Status

- ✅ Contracts: compiled (`forge build`) and tested (`forge test` — 11/11 passing)
- ✅ Frontend: type-checks (`tsc --noEmit`), builds (`next build`), and every route (`/`, `/think`,
  `/act`, `/agents`, `/remember`, `/authenticate`, `/secrets`, `/wallet`) verified serving expected
  content via a running dev server
- ⬜ **Not deployed on-chain.** No funded wallet was provided, so the Sovereign Agent contract has
  not been pushed to Ritual Chain, and the real on-chain flow (executor discovery → ECIES
  encryption → agent execution → callback) has **not** been exercised end-to-end against the live
  chain. Every other feature on the site is demo-only by design (see Site map above) — there's no
  live-chain equivalent to test for those.

## Demo Mode

The whole site runs simulated by default (`NEXT_PUBLIC_DEMO_MODE` unset or `true`) — no RPC,
wallet, or deployed contract required anywhere. This is what deploys on Vercel with zero
environment variables, and what to use while the Ritual testnet is down.

`NEXT_PUBLIC_DEMO_MODE=false` only affects `/agents`' Sovereign Agent section, switching it to the
real on-chain flow (requires `NEXT_PUBLIC_RESEARCH_REGISTRY` + a live RPC). Every other page stays
simulated regardless — they have no on-chain counterpart in this repo.

## Setup

### Run the site (Demo Mode — no setup needed)

```bash
cd frontend
npm install
npm run dev
# open http://localhost:3000
```

### Deploy the Sovereign Agent contract for real (optional)

```bash
cd contracts
cp .env.example .env
# edit .env: set PRIVATE_KEY to a Ritual testnet wallet funded via https://faucet.ritualfoundation.org

source .env
forge script script/Deploy.s.sol:DeployScript --rpc-url $RITUAL_RPC_URL --broadcast -vvvv
# note the deployed address, then in frontend/.env.local:
#   NEXT_PUBLIC_DEMO_MODE=false
#   NEXT_PUBLIC_RESEARCH_REGISTRY=<address from above>
```

## Deploying to Vercel

The Next.js app lives in `frontend/`, not the repo root — set **Settings → General → Root
Directory** to `frontend` in the Vercel project, or the build will fail with "No Next.js version
detected". No environment variables are required for Demo Mode.

## Key design notes

- **No external LLM API key required (real mode).** The Sovereign Agent uses ZeroClaw + the
  Ritual-hosted model gateway (`LLM_PROVIDER: "ritual"`, model `zai-org/GLM-4.7-FP8`), which needs
  no encrypted API key beyond the provider tag itself.
- **`jobId` correlation.** The Sovereign Agent precompile's Phase 2 callback identifies a job by
  the Phase-1 submission transaction's hash. `ResearchAgentRegistry` captures that hash on-chain
  via the TX_HASH precompile (`0x0830`) during submission.
- **Fee deposits are per-EOA, not per-contract.** Ritual checks the RitualWallet balance of the
  *signing wallet*, not the contract address — so users deposit directly.
- **`useSendTransaction`, not `useWriteContract`.** wagmi's simulation (`eth_call`) always fails
  against Ritual's async precompiles, so all writes go through raw `sendTransaction` +
  `encodeFunctionData` (see `frontend/hooks/useRitualWrite.ts`).
- **The `/secrets` demo uses real ECIES encryption**, not a mocked string — it generates a
  throwaway keypair in the browser and encrypts against it with the same 12-byte-nonce config the
  real submit flow uses, so the ciphertext shown is genuine.

## Known limitations / next steps

- Only Sovereign Agent has a real on-chain implementation; the other seven feature pages are
  UX-only demonstrations of what each precompile does, per this task's brief ("implement all
  features in demo mode"). Wiring any of them to real precompile calls would follow the same
  pattern as `contracts/src/ResearchAgentRegistry.sol` + `frontend/hooks/useResearchSubmit.ts`.
- Single injected-wallet connector only (no WalletConnect/RainbowKit) — kept dependency-light.
  Swapping in RainbowKit is a drop-in change to `frontend/lib/wagmiConfig.ts`.
- The Sovereign Agent call has no DA-backed memory (`convoHistory`/`skills`/`systemPrompt` are
  empty) — each research request is stateless by design.
- No contract verification step has been run (needs a deployed address first — see
  `contracts/README.md` for the `forge verify-contract` command).
