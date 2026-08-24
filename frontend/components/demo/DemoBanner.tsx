export function DemoBanner() {
  return (
    <div className="mb-8 border border-ritual-pink/40 bg-ritual-pink/5 text-sm rounded-lg p-4 flex gap-3 items-start">
      <span className="text-ritual-pink text-lg leading-none">◇</span>
      <div className="text-gray-300">
        <span className="text-ritual-pink font-semibold">Demo Mode.</span> Wallet, deposits, and
        research results below are simulated locally — no RPC, wallet, or live contract required.
        This showcases the intended UX while the Ritual testnet is unavailable. Set{" "}
        <code className="font-mono text-xs">NEXT_PUBLIC_DEMO_MODE=false</code> once you have a live
        RPC and deployed contract.
      </div>
    </div>
  );
}
