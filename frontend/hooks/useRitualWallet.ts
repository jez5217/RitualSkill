"use client";

import { useCallback, useState } from "react";
import { useAccount, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther, parseEther } from "viem";
import { ritualWalletAbi } from "@/lib/abi";
import { RITUAL_WALLET } from "@/lib/addresses";
import { useRitualWrite } from "./useRitualWrite";

/** Deposits are only relevant on the signing EOA — see ritual-dapp-wallet. */
export function useRitualWallet() {
  const { address } = useAccount();
  const { write } = useRitualWrite();

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: RITUAL_WALLET,
    abi: ritualWalletAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 12_000 },
  });

  const { data: lockUntilBlock, refetch: refetchLock } = useReadContract({
    address: RITUAL_WALLET,
    abi: ritualWalletAbi,
    functionName: "lockUntil",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 12_000 },
  });

  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | undefined>();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: pendingTxHash,
    query: { enabled: !!pendingTxHash },
  });

  const deposit = useCallback(
    async (amountEther: string, lockDurationBlocks = 100_000n) => {
      const hash = await write({
        address: RITUAL_WALLET,
        abi: ritualWalletAbi,
        functionName: "deposit",
        args: [lockDurationBlocks],
        value: parseEther(amountEther),
        gas: 150_000n,
      });
      setPendingTxHash(hash);
      return hash;
    },
    [write],
  );

  return {
    balance: balance ?? 0n,
    balanceFormatted: balance ? formatEther(balance) : "0",
    lockUntilBlock: lockUntilBlock ?? 0n,
    deposit,
    isConfirming,
    refetch: () => {
      refetchBalance();
      refetchLock();
    },
  };
}
