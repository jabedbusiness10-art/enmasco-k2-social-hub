"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Users, Hash, Paperclip } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import ChatSidebar from "@/components/messaging/ChatSidebar";
import ChatWindow from "@/components/messaging/ChatWindow";
import ChatInput from "@/components/messaging/ChatInput";
import ConversationHeader from "@/components/messaging/ConversationHeader";
import ConversationDetails from "@/components/messaging/ConversationDetails";
import NotificationBell from "@/components/messaging/NotificationBell";
import type { Channel, Message } from "@/types/message";
import { channels as initialChannels, messages as initialMessages } from "@/data/messages";

export default function MessagesPage() {
  const [channels] = useState<Channel[]>(initialChannels);
  const [selectedChannelId, setSelectedChannelId] = useState(channels[0]?.id ?? "");
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const selectedChannel = channels.find((channel) => channel.id === selectedChannelId) ?? channels[0];

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: "me",
      senderName: "You",
      content,
      createdAt: new Date().toISOString(),
      status: "SENT",
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      {/* Top Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <div>
          <h1 className="text-xl font-semibold text-white">Messages</h1>
          <p className="text-xs text-slate-400">Secure team collaboration.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="h-9 w-64 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-sky-400 focus:ring-0"
            placeholder="Search message..."
          />
          <NotificationBell />
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 px-4 py-4 sm:grid-cols-2 xl:grid-cols-4">
        <GlassCard className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-sky-100 shadow-[0_0_22px_rgba(56,189,248,0.18)]">
            <MessageSquare className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div>
            <div className="text-2xl font-semibold text-white">128</div>
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-white/60">Messages Today</div>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-emerald-100 shadow-[0_0_22px_rgba(52,211,153,0.18)]">
            <Users className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div>
            <div className="text-2xl font-semibold text-white">12</div>
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-white/60">Online Employees</div>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-amber-100 shadow-[0_0_22px_rgba(251,191,36,0.18)]">
            <Hash className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div>
            <div className="text-2xl font-semibold text-white">7</div>
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-white/60">Active Channels</div>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-red-100 shadow-[0_0_22px_rgba(248,113,113,0.18)]">
            <Paperclip className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div>
            <div className="text-2xl font-semibold text-white">36</div>
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-white/60">Shared Files</div>
          </div>
        </GlassCard>
      </div>

      {/* Main Layout */}
      <div className="mt-2 grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[16rem_1fr_16rem]">
        <ChatSidebar
          channels={channels}
          selectedChannelId={selectedChannelId}
          onSelectChannel={setSelectedChannelId}
        />
        <div className="flex h-full flex-col border-r border-white/5">
          {selectedChannel ? (
            <>
              <ConversationHeader channelName={selectedChannel.name} />
              <ChatWindow messages={messages.filter((message) => message.senderName !== undefined)} />
              <ChatInput onSendMessage={handleSendMessage} />
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-white/60">Select a channel</div>
          )}
        </div>
        <div className="hidden lg:block">
          {selectedChannel ? <ConversationDetails channel={selectedChannel} /> : null}
        </div>
      </div>
    </div>
  );
}
