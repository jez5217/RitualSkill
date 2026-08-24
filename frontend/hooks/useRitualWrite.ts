"use client";

import { encodeFunctionData, type Abi } from "viem";
import { useSendTransaction } from "wagmi";

/**
 * wagmi's `useWriteContract` runs `eth_call` simulation first, which always fails against Ritual
 * async precompiles ("call to non-contract address") even though the real transaction succeeds.
 * Bypass simulation with a raw `sendTransaction` instead. See ritual-dapp-frontend.
 */
export function useRitualWrite() {
  const { sendTransactionAsync, isPending } = useSendTransaction();

  async function write(options: {
    address: `0x${string}`;
    abi: Abi;
    functionName: string;
    args?: readonly unknown[];
    value?: bigint;
    gas?: bigint;
  }) {
    const data = encodeFunctionData({
      abi: options.abi,
      functionName: options.functionName,
      args: options.args as unknown[],
    });
    return sendTransactionAsync({
      to: options.address,
      data,
      value: options.value,
      gas: options.gas ?? 500_000n,
    });
  }

  return { write, isPending };
}
