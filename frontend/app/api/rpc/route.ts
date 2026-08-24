import { NextRequest, NextResponse } from "next/server";

// Optional proxy for environments where the Ritual RPC isn't directly browser-accessible.
// Not used by default (the public RPC is browser-accessible) — see lib/wagmiConfig.ts to switch
// the transport to "/api/rpc" if needed.
const RPC_URL = process.env.NEXT_PUBLIC_RITUAL_RPC_URL ?? "https://rpc.ritualfoundation.org";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  return new NextResponse(await res.text(), {
    headers: { "Content-Type": "application/json" },
  });
}
