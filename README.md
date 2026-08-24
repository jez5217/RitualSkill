# Ritual Research Agent

An autonomous research dApp on [Ritual Chain](https://ritualfoundation.org) — submit a topic,
Ritual's **Sovereign Agent precompile** (`0x080C`) runs an AI research agent inside a TEE, and the
report is delivered back on-chain.

Built with the [ritual-dapp-skills](https://github.com/ritual-foundation/ritual-dapp-skills)
framework, in **direct precompile caller mode** (no factory/scheduler — each research request is a
single one-shot agent job).

## How it works

```
User (topic) ──▶ ResearchAgentRegistry.submitResearch()
                        │
                        ├─▶ calls Sovereign Agent precompile (0x080C)
                        │     • cliType = ZeroClaw (6)
                        │     • provider = "ritual" (zai-org/GLM-4.7-FP8 — no API key needed)
                        │     • prompt built from the topic
                        │
                        ▼
              TEE executor runs the agent (30s – several minutes)
                        │
                        ▼
      AsyncDelivery calls back ResearchAgentRegistry.onSovereignAgentResult()
                        │
                        ▼
        report / success / error stored on-chain, readable by anyone
```

The contract is its own indexer — no backend service or database. The frontend reads
`requests(jobId)`, `getUserRequests(address)`, and `getAllJobIds()` directly.

## Project layout

```
contracts/   Foundry project — ResearchAgentRegistry.sol + tests + deploy script
frontend/    Next.js 14 app — wallet connect, submit form, live status, on-chain history feed
```

## Status

- ✅ Contracts: compiled (`forge build`) and tested (`forge test` — 11/11 passing)
- ✅ Frontend: type-checks (`tsc --noEmit`), builds (`next build`), and renders correctly in dev
  (verified by curling the running dev server)
- ⬜ **Not deployed on-chain.** No funded wallet was provided, so nothing has been pushed to Ritual
  Chain and the full on-chain flow (executor discovery → ECIES encryption → agent execution →
  callback) has **not** been exercised end-to-end against the live chain. Treat this as
  build-verified, not chain-verified, until you deploy and run it once yourself.

## Demo Mode

The app defaults to **Demo Mode** (`NEXT_PUBLIC_DEMO_MODE` unset or `true`): wallet connect,
RitualWallet deposits, research submission, agent status, and the history feed are all simulated
client-side (`frontend/hooks/demo/`, `frontend/components/demo/`) — no RPC, wallet, or deployed
contract required. This is what deploys on Vercel with zero environment variables, and what to use
while the Ritual testnet is down. A banner on the page makes clear the data is simulated.

Set `NEXT_PUBLIC_DEMO_MODE=false` (plus `NEXT_PUBLIC_RESEARCH_REGISTRY`) once you have a live RPC
and a deployed contract, to switch to the real on-chain flow described below.

## Setup

### 1. Deploy the contract

```bash
cd contracts
cp .env.example .env
# edit .env: set PRIVATE_KEY to a Ritual testnet wallet funded via https://faucet.ritualfoundation.org

source .env
forge script script/Deploy.s.sol:DeployScript --rpc-url $RITUAL_RPC_URL --broadcast -vvvv
# note the deployed address from the output
```

### 2. Configure and run the frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# edit .env.local: set NEXT_PUBLIC_RESEARCH_REGISTRY to the address from step 1

npm run dev
# open http://localhost:3000
```

### 3. Use it

1. Connect an injected wallet (e.g. MetaMask) on Ritual Chain (chain ID `1979` — the app will
   prompt to switch/add it).
2. Deposit a few RITUAL into RitualWallet using the balance card (a research run costs roughly
   0.5–1 RITUAL; get testnet funds from the faucet above).
3. Enter a topic and submit. The status card tracks the job from "awaiting executor" through
   "agent running" to the settled report (this can take anywhere from ~30 seconds to several
   minutes).

## Deploying to Vercel

The Next.js app lives in `frontend/`, not the repo root — set **Settings → General → Root
Directory** to `frontend` in the Vercel project, or the build will fail with "No Next.js version
detected". No environment variables are required for Demo Mode.

## Key design notes

- **No external LLM API key required.** The agent uses ZeroClaw + the Ritual-hosted model gateway
  (`LLM_PROVIDER: "ritual"`, model `zai-org/GLM-4.7-FP8`), which needs no encrypted API key beyond
  the provider tag itself.
- **`jobId` correlation.** The Sovereign Agent precompile's Phase 2 callback identifies a job by
  the Phase-1 submission transaction's hash. `ResearchAgentRegistry` captures that hash on-chain
  via the TX_HASH precompile (`0x0830`) during submission, so it's known immediately — the
  frontend never needs to guess or look it up separately.
- **Fee deposits are per-EOA, not per-contract.** Ritual checks the RitualWallet balance of the
  *signing wallet*, not the contract address — so users deposit directly, and the contract never
  needs to hold or forward funds.
- **`useSendTransaction`, not `useWriteContract`.** wagmi's simulation (`eth_call`) always fails
  against Ritual's async precompiles, so all writes go through raw `sendTransaction` +
  `encodeFunctionData` (see `frontend/hooks/useRitualWrite.ts`).

## Known limitations / next steps

- Single injected-wallet connector only (no WalletConnect/RainbowKit) — kept dependency-light
  since no WalletConnect project ID was supplied. Swapping in RainbowKit is a drop-in change to
  `frontend/lib/wagmiConfig.ts`.
- The agent call has no DA-backed memory (`convoHistory`/`skills`/`systemPrompt` are empty) — each
  research request is stateless by design. Wiring up HuggingFace/GCS/Pinata storage for follow-up
  questions is a natural extension (see `ritual-dapp-agents` skill, "Data Availability" section).
- No contract verification step has been run (needs a deployed address first — see
  `contracts/README.md` for the `forge verify-contract` command).
