"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Send, Paperclip, Smile, Phone, Video, Info, Star, Pin,
  Crown, Hash, Users, Lock, MoreVertical, Mic, Zap, Languages, Reply,
  Forward, Bookmark, Copy, Trash2, Edit3, Pencil, Check, X, Settings2,
} from "lucide-react";
import { useMessengerSocket } from "@/components/messaging/MessengerSocketProvider";
import { useMessenger, loadMessages } from "@/components/messaging/useMessenger";
import type { ConversationDTO, MessageDTO, ReactionEmoji } from "@/types/messenger";
import { REACTION_EMOJIS, LANG_LABELS } from "@/types/messenger";

function PresenceDot({ status }: { status?: string }) {
  const color =
    status === "ONLINE" ? "bg-emerald-400" :
    status === "BUSY" ? "bg-red-500" :
    status === "AWAY" ? "bg-amber-400" :
    status === "DND" ? "bg-rose-500" : "bg-slate-500";
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color} shadow-[0_0_8px_rgba(255,255,255,0.4)]`} />;
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function MessengerPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const router = useRouter();
  const { conversations, loading, sendMessage } = useMessenger();
  const { emit, presence, typing, connected, notifications, unread, markNotificationRead } = useMessengerSocket();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [conv, setConv] = useState<ConversationDTO | null>(null);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [showRight, setShowRight] = useState(true);
  const [rightTab, setRightTab] = useState<"details" | "media" | "files">("details");
  const [replyTo, setReplyTo] = useState<MessageDTO | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [reactFor, setReactFor] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiType, setAiType] = useState<string>("reply");
  const [translateFor, setTranslateFor] = useState<string | null>(null);
  const [translateLang, setTranslateLang] = useState<"ar" | "bn" | "hi" | "en">("bn");
  const [translateResult, setTranslateResult] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(() => conversations.find((c) => c.id === selectedId) ?? null, [conversations, selectedId]);

  const filtered = useMemo(() => {
    if (!search) return conversations;
    return conversations.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));
  }, [conversations, search]);

  const totalUnread = useMemo(
    () => conversations.reduce((s, c) => s + (c.unreadCount || 0), 0) + Object.values(unread).reduce((a, b) => a + b, 0),
    [conversations, unread],
  );

  const openConversation = useCallback(async (c: ConversationDTO) => {
    setSelectedId(c.id);
    setConv(c);
    setShowRight(true);
    setRightTab("details");
    emit("conversation:join", c.id);
    const data = await loadMessages(c.id, 50);
    setMessages(data.messages);
    // mark read
    fetch("/api/messenger/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read", conversationId: c.id }),
    }).catch(() => {});
  }, [emit]);

  // Realtime: append new messages / updates for the open conversation
  useEffect(() => {
    if (!selectedId) return;
    const { io } = { io: null };
  }, [selectedId]);

  // Deep-link: ?c=<conversationId> from sub-list pages
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("c");
    if (c && conversations.length && !selectedId) {
      const conv = conversations.find((x) => x.id === c);
      if (conv) openConversation(conv);
    }
  }, [conversations, selectedId, openConversation]);

  useEffect(() => {
    if (!selectedId || typeof window === "undefined") return;
    let active = true;
    (async () => {
      const { io } = await import("socket.io-client");
      const WS_URL = process.env.NEXT_PUBLIC_MESSENGER_WS ?? "http://localhost:3001";
      const socket = io(WS_URL, { transports: ["websocket", "polling"] });
      const join = () => socket.emit("conversation:join", selectedId);
      socket.on("connect", join);

      socket.on("message:new", (m: MessageDTO) => {
        if (m.conversationId !== selectedId) return;
        setMessages((prev) => {
          if (prev.some((p) => p.id === m.id)) return prev;
          return [...prev, m];
        });
        emit("receipt:send", { messageId: m.id, status: "READ" });
      });
      socket.on("message:updated", (m: MessageDTO) => {
        if (m.conversationId !== selectedId) return;
        setMessages((prev) => prev.map((p) => (p.id === m.id ? m : p)));
      });
      socket.on("message:deleted", ({ id }: any) => {
        setMessages((prev) => prev.map((p) => (p.id === id ? { ...p, isDeleted: true, content: "" } : p)));
      });
      socket.on("reaction:update", ({ messageId, reactions }: any) => {
        setMessages((prev) => prev.map((p) => (p.id === messageId ? { ...p, reactions } : p)));
      });
      socket.on("receipt:update", ({ messageId, status }: any) => {
        setMessages((prev) => prev.map((p) => (p.id === messageId ? { ...p, status } : p)));
      });

      // rejoin on mount
      join();
      return () => { socket.disconnect(); };
    })();
    return () => {};
  }, [selectedId, emit]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!draft.trim() || !selectedId) return;
    const content = draft.trim();
    setDraft("");
    const optimistic = await sendMessage(selectedId, content, { replyToId: replyTo?.id ?? undefined });
    setMessages((prev) => [...prev, optimistic]);
    setReplyTo(null);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length || !selectedId) return;
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    const res = await fetch("/api/messenger/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.attachments?.length) {
      await sendMessage(selectedId, "[attachment]", { attachments: data.attachments });
    }
  };

  const react = async (messageId: string, emoji: ReactionEmoji) => {
    setReactFor(null);
    setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, reactions: m.reactions } : m));
    fetch("/api/messenger/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "react", messageId, emoji }),
    }).catch(() => {});
  };

  const doAI = async () => {
    if (!draft.trim()) return;
    setAiLoading(true); setAiResult(null);
    try {
      const res = await fetch("/api/messenger/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: aiType, text: draft }),
      });
      const data = await res.json();
      setAiResult(data.result ?? "");
    } catch { setAiResult("AI unavailable"); }
    finally { setAiLoading(false); }
  };

  const doTranslate = async (messageId: string, text: string) => {
    setTranslateFor(messageId); setTranslateResult(null);
    try {
      const res = await fetch("/api/messenger/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, to: translateLang }),
      });
      const data = await res.json();
      setTranslateResult(data.translated ?? "");
    } catch { setTranslateResult("translate failed"); }
  };

  const toggleStar = (m: MessageDTO) => {
    fetch("/api/messenger/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "react", messageId: m.id, emoji: "LIKE" }),
    }).catch(() => {});
  };

  const deleteMsg = (m: MessageDTO) => {
    setMenuFor(null);
    fetch("/api/messenger/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", messageId: m.id }),
    }).catch(() => {});
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="flex items-center gap-3">
          <MessageCircleIcon />
          <div>
            <h1 className="text-lg font-semibold text-white">K2 Messenger</h1>
            <p className="flex items-center gap-2 text-xs text-white/50">
              <span className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "bg-red-500"}`} />
              {connected ? "Realtime connected" : "Connecting…"}
            </p>
          </div>
        </div>
        <div className="relative flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setNotifOpen((v) => !v)} className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/70 hover:text-white">
              <BellIcon />
              {notifications.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{notifications.length}</span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-white/10 bg-[#0b0b0f] p-2 shadow-2xl">
                {notifications.length === 0 ? <div className="p-4 text-center text-xs text-white/50">No notifications</div> :
                  notifications.map((n) => (
                    <button key={n.id} onClick={() => { markNotificationRead(n.id); setNotifOpen(false); if (n.conversationId) { const c = conversations.find((x) => x.id === n.conversationId); if (c) openConversation(c); } }}
                      className="mb-1 flex w-full items-start gap-2 rounded-xl border border-white/5 bg-white/[0.03] p-2 text-left hover:bg-white/[0.06]">
                      {n.priority === "CEO" && <Crown className="mt-0.5 h-4 w-4 text-red-400" />}
                      <div>
                        <div className="text-xs font-semibold text-white">{n.title}</div>
                        <div className="text-[11px] text-white/60">{n.body}</div>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…"
              className="h-9 w-56 rounded-xl border border-white/10 bg-white/[0.06] pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-sky-400" />
          </div>
        </div>
      </div>

      {/* 3-column */}
      <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[18rem_1fr_18rem]">
        {/* Left: conversation list */}
        <div className="flex flex-col border-r border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-1 border-b border-white/5 p-2">
            <QuickTab label="Direct" href="/dashboard/messenger/direct" />
            <QuickTab label="Groups" href="/dashboard/messenger/groups" />
            <QuickTab label="Chan" href="/dashboard/messenger/channels" />
            <QuickTab label="More" href="/dashboard/messenger/announcements" />
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto p-2">
            {loading ? <div className="p-4 text-center text-xs text-white/40">Loading…</div> :
              filtered.map((c) => (
                <button key={c.id} onClick={() => openConversation(c)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left transition ${selectedId === c.id ? "border-sky-400/40 bg-sky-400/[0.08]" : "border-transparent hover:bg-white/[0.05]"}`}>
                  <div className="relative">
                    <Avatar conv={c} />
                    {c.kind === "DIRECT" && <span className="absolute -bottom-0.5 -right-0.5"><PresenceDot status={presence[c.members[0]?.id ?? ""] ?? c.members[0]?.status} /></span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      {c.isCeoChannel && <Crown className="h-3 w-3 text-red-400" />}
                      {c.kind === "CHANNEL" && <Hash className="h-3 w-3 text-white/50" />}
                      {c.kind === "GROUP" && <Users className="h-3 w-3 text-white/50" />}
                      {c.isEncrypted && <Lock className="h-3 w-3 text-emerald-400/70" />}
                      <span className="truncate text-sm font-medium text-white">{c.title}</span>
                    </div>
                    <div className="truncate text-xs text-white/50">{c.lastMessage ? `${c.lastMessage.senderName}: ${c.lastMessage.content}` : "No messages yet"}</div>
                  </div>
                  {c.hasUnread && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-500 px-1 text-[10px] font-bold text-white">{c.unreadCount}</span>}
                </button>
              ))}
          </div>
          <div className="border-t border-white/5 p-2">
            <NewChatButton />
          </div>
        </div>

        {/* Center: chat */}
        <div className="flex h-full flex-col">
          {selected ? (
            <>
              <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <Avatar conv={selected} />
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
                      {selected.isCeoChannel && <Crown className="h-3.5 w-3.5 text-red-400" />}
                      {selected.title}
                    </div>
                    <div className="text-xs text-white/50">
                      {selected.kind === "DIRECT" ? "Direct message" : `${selected.memberCount} members`}
                      {typing[selected.id] && Object.values(typing[selected.id]).some(Boolean) && " • typing…"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <IconBtn onClick={() => emit("presence:set", "BUSY")} title="Busy"><Phone className="h-4 w-4" /></IconBtn>
                  <IconBtn title="Call"><Video className="h-4 w-4" /></IconBtn>
                  <IconBtn onClick={() => setShowRight((v) => !v)} title="Details"><Info className="h-4 w-4" /></IconBtn>
                </div>
              </div>

              {replyTo && (
                <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.03] px-4 py-1.5 text-xs text-white/60">
                  <Reply className="h-3.5 w-3.5" /> Replying to <span className="font-medium text-white">{replyTo.senderName}</span>
                  <button onClick={() => setReplyTo(null)} className="ml-auto text-white/40 hover:text-white"><X className="h-3.5 w-3.5" /></button>
                </div>
              )}

              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((m) => (
                  <MessageRow
                    key={m.id} m={m} mine={m.senderId === user?.id}
                    onReply={() => setReplyTo(m)}
                    onReact={(emoji: ReactionEmoji) => react(m.id, emoji)}
                    onMenu={() => setMenuFor(menuFor === m.id ? null : m.id)}
                    onTranslate={() => doTranslate(m.id, m.content)}
                    translateResult={translateFor === m.id ? translateResult : null}
                    translateLang={translateLang}
                    menuOpen={menuFor === m.id}
                    onDelete={() => deleteMsg(m)}
                    onForward={() => { setMenuFor(null); }}
                    onCopy={() => { navigator.clipboard?.writeText(m.content); setMenuFor(null); }}
                    onStar={() => toggleStar(m)}
                  />
                ))}
              </div>

              {/* AI assist bar */}
              <AnimatePresence>
                {(aiResult || aiLoading) && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-4 mb-2 rounded-2xl border border-sky-400/20 bg-sky-400/[0.06] p-3">
                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-sky-200"><Zap className="h-3.5 w-3.5" /> AI {aiType} {aiLoading && "…"}</div>
                    <p className="whitespace-pre-wrap text-sm text-white/80">{aiResult}</p>
                    <button onClick={() => { if (aiResult) { setDraft(aiResult); setAiResult(null); } }} className="mt-2 text-xs font-medium text-sky-300 hover:text-sky-200">Use suggestion</button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Composer */}
              <div className="border-t border-white/10 bg-white/[0.02] p-3">
                <div className="flex items-end gap-2">
                  <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                  <IconBtn onClick={() => fileRef.current?.click()} title="Attach"><Paperclip className="h-4 w-4" /></IconBtn>
                  <IconBtn onClick={() => setRecording((v) => !v)} title={recording ? "Stop" : "Voice"} className={recording ? "text-red-400" : ""}><Mic className="h-4 w-4" /></IconBtn>
                  <div className="relative flex-1">
                    <textarea
                      value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      rows={1} placeholder="Type a secure message…"
                      className="max-h-32 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/40 focus:border-sky-400"
                    />
                  </div>
                  <div className="relative">
                    <IconBtn onClick={() => setReactFor(reactFor ? null : "composer")} title="React"><Smile className="h-4 w-4" /></IconBtn>
                    {reactFor === "composer" && <ReactionPicker onPick={() => {}} onClose={() => setReactFor(null)} />}
                  </div>
                  <select value={aiType} onChange={(e) => setAiType(e.target.value)} className="h-9 rounded-xl border border-white/10 bg-white/[0.06] px-2 text-xs text-white/70 outline-none">
                    <option value="reply">Reply</option>
                    <option value="rewrite">Rewrite</option>
                    <option value="grammar">Grammar</option>
                    <option value="summary">Summary</option>
                    <option value="tasks">Tasks</option>
                  </select>
                  <IconBtn onClick={doAI} title="AI assist" className="text-sky-300"><Zap className="h-4 w-4" /></IconBtn>
                  <button onClick={handleSend} className="flex h-9 items-center gap-1 rounded-xl bg-sky-500 px-3 text-sm font-medium text-white shadow-[0_0_22px_rgba(56,189,248,0.35)] hover:bg-sky-400">
                    <Send className="h-4 w-4" /> Send
                  </button>
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-[11px] text-white/40">
                  <Languages className="h-3 w-3" /> Default translate to
                  <select value={translateLang} onChange={(e) => setTranslateLang(e.target.value as any)} className="rounded border border-white/10 bg-white/[0.06] px-1 text-white/70 outline-none">
                    {(["en", "ar", "bn", "hi"] as const).map((l) => <option key={l} value={l}>{LANG_LABELS[l]}</option>)}
                  </select>
                  {selected.isEncrypted && <span className="ml-auto flex items-center gap-1 text-emerald-400/70"><Lock className="h-3 w-3" /> End-to-end encrypted</span>}
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-white/50">
              <Hash className="h-10 w-10" />
              <p className="text-sm">Select a conversation to start messaging</p>
              <NewChatButton />
            </div>
          )}
        </div>

        {/* Right: details / media / files */}
        {showRight && selected && (
          <div className="hidden flex-col border-l border-white/10 bg-white/[0.02] lg:flex">
            <div className="flex items-center gap-1 border-b border-white/5 p-2">
              <button onClick={() => setRightTab("details")} className={tabCls(rightTab === "details")}>Details</button>
              <button onClick={() => setRightTab("media")} className={tabCls(rightTab === "media")}>Media</button>
              <button onClick={() => setRightTab("files")} className={tabCls(rightTab === "files")}>Files</button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {rightTab === "details" && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-2">
                    <Avatar conv={selected} large />
                    <div className="text-center text-sm font-semibold text-white">{selected.title}</div>
                    <div className="text-xs text-white/50">{selected.kind}</div>
                  </div>
                  <div className="flex items-center justify-around text-center">
                    <button className="flex flex-col items-center gap-1 text-white/60 hover:text-white"><Star className="h-4 w-4" /><span className="text-[10px]">Star</span></button>
                    <button className="flex flex-col items-center gap-1 text-white/60 hover:text-white"><Pin className="h-4 w-4" /><span className="text-[10px]">Pin</span></button>
                    <button className="flex flex-col items-center gap-1 text-white/60 hover:text-white"><Bookmark className="h-4 w-4" /><span className="text-[10px]">Save</span></button>
                    <button className="flex flex-col items-center gap-1 text-white/60 hover:text-white"><Settings2 className="h-4 w-4" /><span className="text-[10px]">Manage</span></button>
                  </div>
                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">Members ({selected.memberCount})</div>
                    <div className="flex flex-wrap gap-2">
                      {selected.members.map((mem) => (
                        <div key={mem.id} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] py-1 pl-1 pr-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white">{initials(mem.name)}</span>
                          <div className="leading-tight">
                            <div className="text-xs font-medium text-white">{mem.name}</div>
                            <div className="text-[10px] text-white/50">{mem.role}</div>
                          </div>
                          <PresenceDot status={presence[mem.id] ?? mem.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {rightTab === "media" && (
                <div className="grid grid-cols-2 gap-2">
                  {messages.flatMap((m) => m.attachments.filter((a) => a.kind === "IMAGE")).map((a) => (
                    <img key={a.id} src={a.url} alt={a.originalName} className="aspect-square w-full rounded-lg object-cover" />
                  ))}
                  {messages.flatMap((m) => m.attachments.filter((a) => a.kind === "IMAGE")).length === 0 && <div className="col-span-2 p-4 text-center text-xs text-white/40">No media</div>}
                </div>
              )}
              {rightTab === "files" && (
                <div className="space-y-2">
                  {messages.flatMap((m) => m.attachments).filter((a) => a.kind !== "IMAGE").map((a) => (
                    <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2 hover:bg-white/[0.07]">
                      <Paperclip className="h-4 w-4 text-white/60" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-medium text-white">{a.originalName}</div>
                        <div className="text-[10px] text-white/50">{a.kind} • {(a.fileSize / 1024).toFixed(0)} KB</div>
                      </div>
                    </a>
                  ))}
                  {messages.flatMap((m) => m.attachments).filter((a) => a.kind !== "IMAGE").length === 0 && <div className="p-4 text-center text-xs text-white/40">No files</div>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- sub-components ---
function tabCls(active: boolean) { return `flex-1 rounded-lg px-2 py-1.5 text-xs font-medium ${active ? "bg-white/[0.08] text-white" : "text-white/50 hover:text-white"}`; }
function QuickTab({ label, href }: { label: string; href: string }) {
  const router = useRouter();
  return <button onClick={() => router.push(href)} className="flex-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-white/60 hover:bg-white/[0.06] hover:text-white">{label}</button>;
}
function IconBtn({ children, onClick, title, className = "" }: any) {
  return <button onClick={onClick} title={title} className={`flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/70 transition hover:text-white ${className}`}>{children}</button>;
}
function Avatar({ conv, large }: { conv: ConversationDTO; large?: boolean }) {
  const size = large ? "h-16 w-16 text-lg" : "h-10 w-10 text-xs";
  if (conv.avatarUrl) return <img src={conv.avatarUrl} alt={conv.title} className={`${size} rounded-full object-cover`} />;
  if (conv.kind === "DIRECT" && conv.members[0]) return <span className={`${size} flex items-center justify-center rounded-full bg-gradient-to-br from-sky-500/30 to-red-500/30 font-bold text-white`}>{initials(conv.members[0].name)}</span>;
  return <span className={`${size} flex items-center justify-center rounded-full bg-gradient-to-br from-sky-500/30 to-red-500/30 font-bold text-white`}>{conv.kind === "CHANNEL" ? "#" : initials(conv.title)}</span>;
}
function ReactionPicker({ onPick, onClose }: { onPick: (e: ReactionEmoji) => void; onClose: () => void }) {
  return (
    <div className="absolute bottom-11 right-0 z-50 flex gap-1 rounded-2xl border border-white/10 bg-[#0b0b0f] p-2 shadow-2xl">
      {REACTION_EMOJIS.map((r) => (
        <button key={r.key} onClick={() => onPick(r.key)} className="rounded-lg px-1.5 py-1 text-lg hover:bg-white/[0.08]">{r.char}</button>
      ))}
      <button onClick={onClose} className="px-1 text-white/40 hover:text-white"><X className="h-4 w-4" /></button>
    </div>
  );
}
function MessageRow({ m, mine, onReply, onReact, onMenu, onTranslate, translateResult, translateLang, menuOpen, onDelete, onForward, onCopy, onStar }: any) {
  const [reactOpen, setReactOpen] = useState(false);
  if (m.isRecalled) return <div className="text-center text-xs italic text-white/30">Message recalled</div>;
  return (
    <div className={`group flex flex-col ${mine ? "items-end" : "items-start"}`}>
      <div className={`flex max-w-[78%] items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
        {!mine && <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white">{initials(m.senderName)}</span>}
        <div className={`relative rounded-2xl border px-3 py-2 ${mine ? "border-sky-400/30 bg-sky-500/15" : "border-white/10 bg-white/[0.05]"}`}>
          {m.replyTo && <div className="mb-1 border-l-2 border-white/20 pl-2 text-[11px] text-white/50">{m.replyTo.senderName}: {m.replyTo.content}</div>}
          {m.isDeleted ? <span className="text-xs italic text-white/40">This message was deleted</span> :
            <p className="whitespace-pre-wrap text-sm text-white/90">{m.content}{m.isEdited && <span className="ml-1 text-[10px] text-white/40">(edited)</span>}</p>}
          {m.attachments?.map((a: any) => a.kind === "IMAGE"
            ? <img key={a.id} src={a.url} alt={a.originalName} className="mt-2 max-h-48 rounded-lg" />
            : <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-1.5 text-xs text-white/80"><Paperclip className="h-3.5 w-3.5" />{a.originalName}</a>)}
          {m.voice && <audio src={m.voice.url} controls className="mt-2 h-9 w-48" />}
          <div className="mt-1 flex items-center gap-2 text-[10px] text-white/40">
            <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            {mine && <span>{m.status}</span>}
          </div>

          {/* reactions */}
          {m.reactions?.some((r: any) => r.count > 0) && (
            <div className="mt-1 flex flex-wrap gap-1">
              {m.reactions.filter((r: any) => r.count > 0).map((r: any) => (
                <button key={r.emoji} onClick={() => onReact(r.emoji)} className={`rounded-full border px-1.5 py-0.5 text-[10px] ${r.reactedByMe ? "border-sky-400/50 bg-sky-400/20 text-white" : "border-white/10 bg-white/[0.05] text-white/70"}`}>
                  {REACTION_EMOJIS.find((x) => x.key === r.emoji)?.char} {r.count}
                </button>
              ))}
            </div>
          )}

          {/* hover actions */}
          <div className={`absolute -top-3 ${mine ? "left-0" : "right-0"} flex translate-y-1 items-center gap-0.5 rounded-full border border-white/10 bg-[#0b0b0f] p-0.5 opacity-0 shadow-xl transition group-hover:translate-y-0 group-hover:opacity-100`}>
            <button onClick={onReply} title="Reply" className="rounded-full p-1 text-white/60 hover:text-white"><Reply className="h-3.5 w-3.5" /></button>
            <button onClick={() => setReactOpen((v) => !v)} title="React" className="rounded-full p-1 text-white/60 hover:text-white"><Smile className="h-3.5 w-3.5" /></button>
            <button onClick={onTranslate} title="Translate" className="rounded-full p-1 text-white/60 hover:text-white"><Languages className="h-3.5 w-3.5" /></button>
            <button onClick={onStar} title="Star" className="rounded-full p-1 text-white/60 hover:text-white"><Star className="h-3.5 w-3.5" /></button>
            <button onClick={onForward} title="Forward" className="rounded-full p-1 text-white/60 hover:text-white"><Forward className="h-3.5 w-3.5" /></button>
            <button onClick={onCopy} title="Copy" className="rounded-full p-1 text-white/60 hover:text-white"><Copy className="h-3.5 w-3.5" /></button>
            {mine && <button onClick={onDelete} title="Delete" className="rounded-full p-1 text-red-400/70 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>}
          </div>
          {reactOpen && (
            <div className="absolute -top-12 right-0 z-40 flex gap-0.5 rounded-2xl border border-white/10 bg-[#0b0b0f] p-1 shadow-2xl">
              {REACTION_EMOJIS.map((r) => <button key={r.key} onClick={() => { onReact(r.key); setReactOpen(false); }} className="rounded-lg px-1 py-0.5 text-base hover:bg-white/[0.08]">{r.char}</button>)}
            </div>
          )}

          {translateResult && (
            <div className="mt-1 rounded-lg border border-sky-400/20 bg-sky-400/[0.06] p-1.5 text-xs text-sky-100">
              <span className="font-semibold">{translateLang}: </span>{translateResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function MessageCircleIcon() { return <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200/30 bg-sky-500/10 text-sky-100 shadow-[0_0_24px_rgba(56,189,248,0.35)]"><Hash className="h-5 w-5" /></span>; }
function BellIcon() { return <span className="flex h-5 w-5 items-center justify-center text-white/70"><Users className="h-4 w-4" /></span>; }
function NewChatButton() {
  const router = useRouter();
  return <button onClick={() => router.push("/messenger/direct")} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.03] py-2 text-sm text-white/70 hover:bg-white/[0.06] hover:text-white"><Users className="h-4 w-4" /> New Conversation</button>;
}
