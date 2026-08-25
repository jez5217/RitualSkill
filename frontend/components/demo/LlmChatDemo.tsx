"use client";

import { useEffect, useRef, useState } from "react";
import { PrecompileBadge } from "@/components/site/PrecompileBadge";
import { StatusBadge } from "@/components/site/StatusBadge";
import { generateDemoReply, keywordIntentFallback } from "@/lib/demoLlm";
import { classifyIntent, preloadIntentModel, type IntentResult } from "@/lib/intentModel";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  routedBy?: IntentResult; // set on assistant replies — which bucket + confidence picked this response
}

export function LlmChatDemo() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "seed",
      role: "assistant",
      content: "Ask me anything — responses stream in token-by-token, simulating the LLM precompile.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    preloadIntentModel();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function streamReply(fullText: string, routedBy: IntentResult) {
    const id = crypto.randomUUID();
    setMessages((m) => [...m, { id, role: "assistant", content: "", streaming: true, routedBy }]);

    let i = 0;
    const interval = setInterval(() => {
      i += 2;
      setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, content: fullText.slice(0, i) } : msg)));
      if (i >= fullText.length) {
        clearInterval(interval);
        setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, streaming: false } : msg)));
        setBusy(false);
      }
    }, 18);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    const turn = messages.filter((m) => m.role === "user").length;
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", content: text }]);
    setInput("");
    setBusy(true);

    let routedBy: IntentResult;
    try {
      routedBy = await classifyIntent(text);
    } catch {
      routedBy = { intent: keywordIntentFallback(text), confidence: 0 };
    }

    setTimeout(() => streamReply(generateDemoReply(text, routedBy.intent, turn), routedBy), 400);
  }

  return (
    <div className="bg-ritual-elevated border border-gray-800 rounded-xl shadow-card p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-display text-base text-gray-100">LLM Chat</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status="simulation" />
          <PrecompileBadge address="0x0802" label="zai-org/GLM-4.7-FP8" color="pink" />
        </div>
      </div>
      <p className="text-[11px] text-gray-600 mb-3 -mt-1">
        Replies are canned per category (Demo Mode), but which category is picked is a real ONNX
        intent classifier running locally — not keyword matching.
      </p>

      <div ref={scrollRef} className="flex-1 min-h-[280px] max-h-[380px] overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[85%]">
              {m.routedBy && (
                <p className="text-[10px] font-mono text-gray-600 mb-1">
                  routed as {m.routedBy.intent}
                  {m.routedBy.confidence > 0 ? ` (${(m.routedBy.confidence * 100).toFixed(0)}%)` : ""}
                </p>
              )}
              <div
                className={`rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-ritual-surface text-gray-200"
                    : "bg-ritual-pink/5 border border-ritual-pink/20 text-gray-300"
                }`}
              >
                {m.content}
                {m.streaming && <span className="inline-block w-1.5 h-3.5 bg-ritual-pink/60 ml-0.5 animate-pulse" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Ritual, or anything…"
          className="flex-1 bg-ritual-surface border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-300
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ritual-pink/50"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="px-4 py-2.5 border border-ritual-pink text-ritual-pink hover:bg-ritual-pink/10
                     disabled:opacity-40 rounded-lg text-sm font-semibold
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ritual-pink/50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
