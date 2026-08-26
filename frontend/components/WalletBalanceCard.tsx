"use client";

import { useState } from "react";
import { useAccount, useBlockNumber } from "wagmi";
import { useRitualWallet } from "@/hooks/useRitualWallet";
import { StatusBadge } from "@/components/site/StatusBadge";

export function WalletBalanceCard() {
  const { address } = useAccount();
  const { balance, balanceFormatted, lockUntilBlock, deposit, isConfirming, refetch } = useRitualWallet();
  const { data: currentBlock } = useBlockNumber({ watch: true });
  const [amount, setAmount] = useState("2");
  const [depositing, setDepositing] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  if (!address) return null;

  const isLocked = currentBlock !== undefined && lockUntilBlock > currentBlock;
  const isFunded = balance > 0n;

  async function handleDeposit() {
    setTxError(null);
    setDepositing(true);
    try {
      const hash = await deposit(amount);
      // Give the chain a moment to settle before re-reading balance.
      setTimeout(refetch, 4_000);
      console.log("RitualWallet deposit tx:", hash);
    } catch (err) {
      setTxError(err instanceof Error ? err.message : "Deposit failed");
    } finally {
      setDepositing(false);
    }
  }

  return (
    <div className="feature-card p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="font-display text-lg text-gray-100">RitualWallet</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status="live" />
          <span
            className={`text-xs uppercase tracking-wider px-2 py-1 rounded ${
              isFunded ? "text-ritual-green bg-ritual-green/10" : "text-ritual-gold bg-ritual-gold/10"
            }`}
          >
            {isFunded ? "Funded" : "Needs deposit"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Balance</p>
          <p className="text-sm text-gray-300 font-mono">{Number(balanceFormatted).toFixed(4)} RITUAL</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Locked until</p>
          <p className="text-sm text-gray-300 font-mono">
            {isLocked ? `block ${lockUntilBlock.toString()}` : "unlocked"}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          min="0"
          step="0.1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1 bg-ritual-surface border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-300
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ritual-green/50"
        />
        <button
          onClick={handleDeposit}
          disabled={depositing || isConfirming}
          className="px-4 py-2.5 border border-ritual-green text-ritual-green hover:bg-ritual-green/10
                     rounded-lg text-sm font-semibold whitespace-nowrap
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ritual-green/50"
        >
          {depositing || isConfirming ? "Depositing…" : "Deposit RITUAL"}
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        A sovereign agent research run costs roughly 0.5–1 RITUAL. Deposits lock for ~9.7 hours
        (100,000 blocks) and can be withdrawn once unlocked.
      </p>
      {txError && <p className="text-xs text-red-400 mt-2">{txError}</p>}
    </div>
  );
}
