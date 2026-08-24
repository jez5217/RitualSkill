export interface DemoHttpResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  latencyMs: number;
}

const CANNED: Record<string, { status: number; body: unknown }> = {
  "api.example.com/eth-price": { status: 200, body: { symbol: "ETH", price_usd: 3421.57, source: "demo" } },
  "api.example.com/weather": { status: 200, body: { city: "San Francisco", tempC: 17, condition: "foggy" } },
};

function pickCanned(url: string) {
  const key = Object.keys(CANNED).find((k) => url.includes(k));
  return key ? CANNED[key] : null;
}

export function simulateHttpCall(url: string): DemoHttpResponse {
  const canned = pickCanned(url);
  if (canned) {
    return {
      statusCode: canned.status,
      headers: { "content-type": "application/json", "x-ritual-attested": "true" },
      body: JSON.stringify(canned.body, null, 2),
      latencyMs: 800 + Math.random() * 1200,
    };
  }
  return {
    statusCode: 200,
    headers: { "content-type": "application/json", "x-ritual-attested": "true" },
    body: JSON.stringify(
      { requested_url: url, note: "Simulated response — no real request was made.", ts: Date.now() },
      null,
      2,
    ),
    latencyMs: 800 + Math.random() * 1200,
  };
}
