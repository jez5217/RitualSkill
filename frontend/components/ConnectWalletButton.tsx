"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

function truncate(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
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

  const connector = connectors[0];

  return (
    <button
      onClick={() => connector && connect({ connector })}
      disabled={!connector || isPending}
      className="px-4 py-2.5 border border-ritual-green text-ritual-green hover:bg-ritual-green/10
                 rounded-lg text-sm font-semibold shadow-glow-green
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ritual-green/50
                 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      {isPending ? "Connecting…" : connector ? "Connect Wallet" : "No wallet found"}
    </button>
  );
}
