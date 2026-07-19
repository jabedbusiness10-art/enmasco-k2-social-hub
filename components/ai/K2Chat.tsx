"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send, Copy, RotateCcw, Square, Trash2, Sparkles, AlertCircle } from "lucide-react";

export interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function MiniMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5 text-sm leading-relaxed text-white/90">
      {lines.map((line, i) => {
        if (line.startsWith("```")) return null;
        if (/^\s*[-*]\s+/.test(line)) {
          return (
            <div key={i} className="flex gap-2 pl-2">
              <span className="text-sky-400">•</span>
              <span>{renderInline(line.replace(/^\s*[-*]\s+/, ""))}</span>
            </div>
          );
        }
        if (/^\s*\d+\.\s+/.test(line)) {
          return (
            <div key={i} className="flex gap-2 pl-2">
              <span className="text-sky-400">{line.match(/^\s*(\d+)\./)?.[1]}.</span>
              <span>{renderInline(line.replace(/^\s*\d+\.\s+/, ""))}</span>
            </div>
          );
        }
        if (/^\s*>\s?/.test(line)) {
          return (
            <div key={i} className="border-l-2 border-sky-400/40 pl-3 text-white/70">
              {renderInline(line.replace(/^\s*>\s?/, ""))}
            </div>
          );
        }
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

function renderInline(s: string) {
  const parts = s.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i} className="font-semibold text-white">{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`")) return <code key={i} className="rounded bg-white/10 px-1 py-0.5 text-xs text-sky-200">{p.slice(1, -1)}</code>;
    return <span key={i}>{p}</span>;
  });
}

export default function K2Chat() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: "w", role: "assistant", content: "**K2Kai এখানে আছে** 👋\n\nআমি ENMASCO K2 SOCIAL-এর Enterprise AI Copilot। আপনার সোশাল ক্যাপশন, কনটেন্ট প্ল্যান, হ্যাশট্যাগ বা অটোমেশন ড্রাফট বানাতে বলুন।" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [convId, setConvId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => setTimeout(() => scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" }), 50);

  const send = useCallback(
    async (text: string, regenerate = false) => {
      const content = text.trim();
      if (!content || busy) return;
      setBusy(true);
      setStreamError(null);
      const history = regenerate
        ? messages.slice(0, -2)
        : messages;
      const userMsg: ChatMsg = { id: `u${Date.now()}`, role: "user", content };
      const assistantId = `a${Date.now()}`;
      const assistantMsg: ChatMsg = { id: assistantId, role: "assistant", content: "" };
      const next = [...history, ...(regenerate ? [] : [userMsg]), assistantMsg];
      setMessages(next);
      setInput("");
      scrollToBottom();

      const ac = new AbortController();
      abortRef.current = ac;
      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: convId, content, systemPrompt: "You are K2Kai, ENMASCO K2 SOCIAL enterprise AI copilot." }),
          signal: ac.signal,
        });
        const cid = res.headers.get("X-Conversation-Id");
        if (cid) setConvId(cid);
        if (!res.ok) {
          const failure = await res.json().catch(() => ({}));
          throw new Error(failure.error ?? `AI request failed (${res.status})`);
        }
        if (!res.body) throw new Error("No stream");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let full = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const json = line.slice(5).trim();
            if (!json) continue;
            try {
              const evt = JSON.parse(json);
              if (evt.delta) {
                full += evt.delta;
                setMessages((m) => m.map((msg) => (msg.id === assistantId ? { ...msg, content: full } : msg)));
                scrollToBottom();
              }
              if (evt.error) {
                const message = String(evt.error);
                setStreamError(message);
                setMessages((m) => m.map((msg) => (msg.id === assistantId ? { ...msg, content: `AI request failed: ${message}` } : msg)));
              }
            } catch {}
          }
        }
      } catch (e: any) {
        if (e.name !== "AbortError") {
          const message = e.message ?? "Generation failed";
          setStreamError(message);
          setMessages((m) => m.map((msg) => (msg.id === assistantId ? { ...msg, content: `AI request failed: ${message}` } : msg)));
        }
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [messages, busy, convId],
  );

  const stop = () => abortRef.current?.abort();
  const clear = () => {
    setMessages([]);
    setConvId(null);
  };
  const copyLast = () => {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (last) navigator.clipboard?.writeText(last.content);
  };

  return (
    <div className="flex h-full flex-col">
      {streamError && (
        <div className="mb-2 flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 text-[11px] text-rose-200">
          <AlertCircle className="h-3.5 w-3.5" /> OpenRouter request failed: {streamError}
        </div>
      )}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                m.role === "user"
                  ? "bg-gradient-to-br from-sky-500/80 to-rose-500/80 text-white"
                  : "border border-white/10 bg-white/[0.04] backdrop-blur-xl"
              }`}
            >
              {m.role === "assistant" ? (
                m.content ? <MiniMarkdown text={m.content} /> : <span className="inline-flex gap-1 text-white/40"><span className="animate-bounce">●</span><span className="animate-bounce delay-100">●</span><span className="animate-bounce delay-200">●</span></span>
              ) : (
                <span className="text-sm">{m.content}</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button onClick={copyLast} className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10" title="Copy last"><Copy className="h-4 w-4" /></button>
        <button onClick={() => { const u = [...messages].reverse().find((m) => m.role === "user"); if (u) send(u.content, true); }} disabled={busy} className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10 disabled:opacity-40" title="Regenerate"><RotateCcw className="h-4 w-4" /></button>
        {busy ? (
          <button onClick={stop} className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-2 text-rose-200 hover:bg-rose-400/20" title="Stop"><Square className="h-4 w-4" /></button>
        ) : (
          <button onClick={clear} className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10" title="Clear"><Trash2 className="h-4 w-4" /></button>
        )}
        <div className="flex flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
          <Sparkles className="h-4 w-4 text-sky-400" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Ask K2Kai to write a caption, plan content, suggest hashtags..."
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
          />
          <button onClick={() => send(input)} disabled={busy} className="rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 p-2 text-white disabled:opacity-40">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
