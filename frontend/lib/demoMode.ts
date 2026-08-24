/**
 * Demo mode renders the full UX (wallet connect, deposits, research submission, agent status,
 * history feed) entirely client-side with simulated data — no RPC, wallet, or deployed contract
 * required. Useful for showcasing the product while the Ritual testnet is unavailable, or before
 * a contract has been deployed.
 *
 * Defaults ON so the app deploys cleanly with zero environment variables. Set
 * NEXT_PUBLIC_DEMO_MODE=false once you have a live RPC + deployed contract + funded wallets to
 * test against.
 */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
