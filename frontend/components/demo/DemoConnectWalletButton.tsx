"use client";

import { useDemoStore } from "@/hooks/demo/useDemoStore";

function truncate(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function DemoConnectWalletButton() {
  const connected = useDemoStore((s) => s.connected);
  const address = useDemoStore((s) => s.address);
  const connect = useDemoStore((s) => s.connect);
  const disconnect = useDemoStore((s) => s.disconnect);

  if (connected && address) {
    return (
      <button
        onClick={() => disconnect()}
        className="px-4 py-2 border border-gray-700 text-gray-400 hover:border-gray-600 rounded-lg
                   text-sm font-mono
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ritual-green/50
                   focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        {truncate(address)}
      </button>
    );
  }

  return (
    <button
      onClick={() => connect()}
      className="px-4 py-2.5 border border-ritual-green text-ritual-green hover:bg-ritual-green/10
                 rounded-lg text-sm font-semibold shadow-glow-green
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ritual-green/50
                 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      Connect Wallet (Demo)
    </button>
  );
}
