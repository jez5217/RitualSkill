"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { ritualChain } from "@/lib/chain";

export function ChainGuard({ children }: { children: React.ReactNode }) {
  const { chain, isConnected } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  if (isConnected && chain?.id !== ritualChain.id) {
    return (
      <button
        onClick={() => switchChain({ chainId: ritualChain.id })}
        disabled={isPending}
        className="px-4 py-2.5 bg-ritual-gold/10 border border-dashed border-ritual-gold text-ritual-gold
                   rounded-lg text-sm font-semibold
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ritual-gold/50
                   focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        {isPending ? "Switching…" : "Switch to Ritual Chain"}
      </button>
    );
  }

  return <>{children}</>;
}
