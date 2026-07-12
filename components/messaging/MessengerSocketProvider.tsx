"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import type { SessionUser } from "@/lib/auth-server";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  MessageDTO,
  ConversationDTO,
  PresenceStatus,
  ClientNotification,
} from "@/types/messenger";

type Socket = any;

interface MessengerSocketState {
  connected: boolean;
  presence: Record<string, PresenceStatus>;
  typing: Record<string, Record<string, boolean>>; // conversationId -> userId -> typing
  notifications: ClientNotification[];
  unread: Record<string, number>; // conversationId -> count
  emit: (event: keyof ClientToServerEvents, ...args: any[]) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

const MessengerSocketContext = createContext<MessengerSocketState | null>(null);

const WS_URL = process.env.NEXT_PUBLIC_MESSENGER_WS ?? "http://localhost:3001";

export function MessengerSocketProvider({ user, children }: { user: SessionUser | null; children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [presence, setPresence] = useState<Record<string, PresenceStatus>>({});
  const [typing, setTyping] = useState<Record<string, Record<string, boolean>>>({});
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const socketRef = useRef<Socket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userRef = useRef<SessionUser | null>(user);

  const connect = useCallback(() => {
    if (typeof window === "undefined" || !userRef.current) return;
    let socket: Socket;
    (async () => {
      const { io } = await import("socket.io-client");
      socket = io(WS_URL, { transports: ["websocket", "polling"], reconnection: true, reconnectionDelay: 1000, reconnectionAttempts: Infinity });
      socketRef.current = socket;

      socket.on("connect", () => {
        setConnected(true);
        socket.emit("identify", { userId: userRef.current!.id, name: userRef.current!.name });
      });
      socket.on("disconnect", () => setConnected(false));
      socket.on("connect_error", () => {
        setConnected(false);
        if (!reconnectRef.current) {
          reconnectRef.current = setTimeout(() => {
            reconnectRef.current = null;
            connect();
          }, 2500);
        }
      });
      socket.on("presence:update", ({ userId, status }: { userId: string; status: PresenceStatus }) => {
        setPresence((p) => ({ ...p, [userId]: status }));
      });
      socket.on("typing", ({ conversationId, userId, typing }: any) => {
        setTyping((t) => ({
          ...t,
          [conversationId]: { ...(t[conversationId] ?? {}), [userId]: typing },
        }));
      });
      socket.on("unread:update", ({ conversationId, unreadCount }: any) => {
        setUnread((u) => ({ ...u, [conversationId]: unreadCount }));
      });
      socket.on("notification:new", (n: ClientNotification) => {
        setNotifications((list) => [n, ...list].slice(0, 50));
      });
    })();
  }, []);

  useEffect(() => {
    userRef.current = user;
    if (user) connect();
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      socketRef.current = null;
    };
  }, [user, connect]);

  const emit = useCallback((event: keyof ClientToServerEvents, ...args: any[]) => {
    if (socketRef.current) socketRef.current.emit(event, ...args);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((list) => list.filter((n) => n.id !== id));
  }, []);
  const clearNotifications = useCallback(() => setNotifications([]), []);

  const value: MessengerSocketState = {
    connected, presence, typing, notifications, unread, emit, markNotificationRead, clearNotifications,
  };
  return <MessengerSocketContext.Provider value={value}>{children}</MessengerSocketContext.Provider>;
}

export function useMessengerSocket() {
  const ctx = useContext(MessengerSocketContext);
  if (!ctx) throw new Error("useMessengerSocket must be used within MessengerSocketProvider");
  return ctx;
}
