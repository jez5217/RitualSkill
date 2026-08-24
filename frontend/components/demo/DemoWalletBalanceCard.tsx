"use client";

import { useState } from "react";
import { useDemoStore } from "@/hooks/demo/useDemoStore";

export function DemoWalletBalanceCard() {
  const connected = useDemoStore((s) => s.connected);
  const balance = useDemoStore((s) => s.balance);
  const deposit = useDemoStore((s) => s.deposit);
  const [amount, setAmount] = useState("2");
  const [depositing, setDepositing] = useState(false);

  if (!connected) return null;

  async function handleDeposit() {
    setDepositing(true);
    await new Promise((r) => setTimeout(r, 900));
    deposit(Number(amount) || 0);
    setDepositing(false);
  }

  return (
    <div className="bg-ritual-elevated border border-gray-800 rounded-xl shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg text-gray-100">RitualWallet</h2>
        <span
          className={`text-xs uppercase tracking-wider px-2 py-1 rounded ${
            balance > 0 ? "text-ritual-green bg-ritual-green/10" : "text-ritual-gold bg-ritual-gold/10"
          }`}
        >
          {balance > 0 ? "Funded" : "Needs deposit"}
        </span>
      </div>

      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Balance</p>
      <p className="text-sm text-gray-300 font-mono mb-4">{balance.toFixed(4)} RITUAL</p>

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
          disabled={depositing}
          className="px-4 py-2.5 border border-ritual-green text-ritual-green hover:bg-ritual-green/10
                     rounded-lg text-sm font-semibold whitespace-nowrap
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ritual-green/50"
        >
          {depositing ? "Depositing…" : "Deposit RITUAL"}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">Simulated deposit — no transaction is sent.</p>
    </div>
  );
}
