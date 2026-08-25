"use client";

import { useEffect, useRef, useState } from "react";
import { PrecompileBadge } from "@/components/site/PrecompileBadge";

interface Msg {
  id: string;
  role: "user" | "agent";
  content: string;
}

type AgentStatus = "alive" | "offline" | "reviving";

// Fixed, not random: this module is evaluated separately by the server (SSR)
// and the client (hydration) bundles, so Math.random() here produced a
// different string in each render pass — a hydration mismatch (React errors
// #418/#423/#425). It's cosmetic demo flavor text, not a real identity, so a
// stable constant is correct, not a client-only workaround.
const IDENTITY_CID = "bafy2bzacedqj7x4n9k2m8p3q5r1s6t0v";

function remembersReply(history: Msg[], text: string): string {
  const priorUser = history.filter((m) => m.role === "user");
  if (priorUser.length === 0) {
    return `Hi, I'm your persistent agent — identity ${IDENTITY_CID.slice(0, 16)}…. I keep memory across every message, not just this session.`;
  }
  const last = priorUser[priorUser.length - 1]?.content;
  return (
    `Got it — noted alongside what you told me before ("${last?.slice(0, 40)}${(last?.length ?? 0) > 40 ? "…" : ""}"). ` +
    "A live Persistent Agent would append this turn to its DA-backed memory (soul/memory refs) so it's available on the next wakeup, even from a different executor."
  );
}

export function PersistentAgentDemo() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<AgentStatus>("alive");
  const [heartbeatSec, setHeartbeatSec] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setHeartbeatSec((s) => (status === "alive" ? s + 1 : s)), 1_000);
    return () => clearInterval(t);
  }, [status]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || status !== "alive") return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "agent", content: remembersReply(m, text) }]);
    }, 500);
  }

  function simulateCrashAndRevive() {
    setStatus("offline");
    setTimeout(() => setStatus("reviving"), 1_500);
    setTimeout(() => {
      setStatus("alive");
      setHeartbeatSec(0);
    }, 3_500);
  }

  return (
    <div className="bg-ritual-elevated border border-gray-800 rounded-xl shadow-card p-5">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h3 className="font-display text-base text-gray-100">Persistent Agent</h3>
        <PrecompileBadge address="0x0820" label="stateful, revivable" color="pink" />
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Identity: <span className="font-mono">{IDENTITY_CID.slice(0, 20)}…</span> · DA-backed memory
        · liveness monitored by AgentHeartbeat
      </p>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs">
          {status === "alive" && (
            <>
              <span className="w-2 h-2 rounded-full bg-ritual-green animate-pulse" />
              <span className="text-ritual-green">Alive</span>
              <span className="text-gray-600">· last heartbeat {heartbeatSec}s ago</span>
            </>
          )}
          {status === "offline" && (
            <>
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-red-400">Offline — executor unresponsive</span>
            </>
          )}
          {status === "reviving" && (
            <>
              <span className="w-2 h-2 rounded-full bg-ritual-gold animate-pulse" />
              <span className="text-ritual-gold">Reviving from last CID…</span>
            </>
          )}
        </div>
        <button
          onClick={simulateCrashAndRevive}
          disabled={status !== "alive"}
          className="text-xs px-2.5 py-1 border border-gray-700 text-gray-500 hover:text-gray-300 rounded disabled:opacity-30"
        >
          Simulate crash + revival
        </button>
      </div>

      <div ref={scrollRef} className="min-h-[160px] max-h-[280px] overflow-y-auto space-y-2.5 mb-4 pr-1">
        {messages.length === 0 && (
          <p className="text-sm text-gray-600">Say something — this agent remembers it for the rest of the chat.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === "user" ? "bg-ritual-surface text-gray-200" : "bg-ritual-pink/5 border border-ritual-pink/20 text-gray-300"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={status !== "alive"}
          placeholder={status === "alive" ? "Message your agent…" : "Agent is offline…"}
          className="flex-1 bg-ritual-surface border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-300
                     disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ritual-pink/50"
        />
        <button
          type="submit"
          disabled={status !== "alive" || !input.trim()}
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
