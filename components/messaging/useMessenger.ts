"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useMessengerSocket } from "@/components/messaging/MessengerSocketProvider";
import type { ConversationDTO, MessageDTO } from "@/types/messenger";

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function useMessenger() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const { emit } = useMessengerSocket();
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const convUpdateRef = useRef<(c: ConversationDTO) => void>(() => {});

  const loadConversations = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await fetchJSON<{ conversations: ConversationDTO[] }>("/api/messenger/conversations");
      setConversations(data.conversations);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) loadConversations();
  }, [user?.id, loadConversations]);

  // Attach a socket listener that refreshes a single conversation + bumps unread.
  useEffect(() => {
    if (!user?.id) return;
    convUpdateRef.current = (c: ConversationDTO) => {
      setConversations((prev) => {
        const idx = prev.findIndex((x) => x.id === c.id);
        const next = idx >= 0 ? [...prev] : [c, ...prev];
        if (idx >= 0) next[idx] = { ...next[idx], ...c };
        return next.sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt));
      });
    };
  }, []);

  const sendMessage = useCallback(
    async (conversationId: string, content: string, opts?: { replyToId?: string; mentions?: string[]; attachments?: any[]; voice?: any; forwardedFromId?: string }) => {
      // optimistic
      const optimistic: MessageDTO = {
        id: `temp-${Date.now()}`,
        conversationId,
        senderId: user?.id,
        senderName: user?.name ?? "You",
        content,
        status: "SENT",
        isEdited: false, isDeleted: false, isPinned: false, isStarred: false, isBookmarked: false, isRecalled: false,
        mentions: opts?.mentions ?? [], translations: null,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        attachments: opts?.attachments ?? [], reactions: [], voice: opts?.voice ?? null,
        replyToId: opts?.replyToId ?? null, replyTo: null, readReceipts: [],
      };
      // emit to socket server (persists + broadcasts)
      emit("message:send", { conversationId, content, replyToId: opts?.replyToId ?? null, mentions: opts?.mentions ?? [], attachments: opts?.attachments, voice: opts?.voice, forwardedFromId: opts?.forwardedFromId ?? null });
      return optimistic;
    },
    [emit, user?.id, user?.name],
  );

  return { user, conversations, loading, error, loadConversations, sendMessage };
}

export async function loadMessages(conversationId: string, take = 50, cursor?: string) {
  const qs = new URLSearchParams({ take: String(take) });
  if (cursor) qs.set("cursor", cursor);
  return fetchJSON<{ conversation: ConversationDTO; messages: MessageDTO[]; hasMore: boolean }>(
    `/api/messenger/conversations/${conversationId}?${qs.toString()}`,
  );
}
