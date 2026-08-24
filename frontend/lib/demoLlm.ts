/** Small canned-response generator standing in for the LLM precompile (0x0802) in Demo Mode. */
export function generateDemoReply(userMessage: string): string {
  const msg = userMessage.trim();
  const lower = msg.toLowerCase();

  if (lower.includes("ritual")) {
    return (
      "Ritual Chain enshrines AI/ML compute as native precompiles — HTTP, LLM, agents, and " +
      "multimodal generation all execute inside TEEs, with results attested and verified " +
      "on-chain. This reply itself is simulated (Demo Mode) — a live call would route to the " +
      "zai-org/GLM-4.7-FP8 model via the Ritual gateway, no API key required."
    );
  }
  if (lower.includes("hello") || lower.includes("hi") || msg.length < 8) {
    return "Hey! I'm a simulated stand-in for Ritual's LLM precompile (0x0802). Ask me something to see streaming output.";
  }
  if (lower.includes("?")) {
    return (
      `That's a good question about "${msg.replace(/\?+$/, "")}". In a live deployment this would be ` +
      "answered by the model configured for this request — Ritual currently confirms zai-org/GLM-4.7-FP8 " +
      "live on the gateway, with a 64K operational context window. This response is generated locally " +
      "for the demo, not by a real model."
    );
  }
  return (
    `Noted: "${msg}". In live mode this prompt would be ABI-encoded into the LLM precompile's ` +
    "30-field request (message JSON, model, temperature, max tokens, ...), submitted async, and " +
    "settled in the same transaction via the SPC (simulated precompile call) mechanism."
  );
}
