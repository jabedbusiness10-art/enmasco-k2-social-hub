"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import InboxHeader from "@/components/inbox/InboxHeader";
import InboxStats from "@/components/inbox/InboxStats";
import ConversationList from "@/components/inbox/ConversationList";
import ChatWindow from "@/components/inbox/ChatWindow";
import MessageComposer from "@/components/inbox/MessageComposer";
import CustomerProfilePanel from "@/components/inbox/CustomerProfile";
import QuickReplies from "@/components/inbox/QuickReplies";
import InboxFilters from "@/components/inbox/InboxFilters";
import { conversations, messages, customerProfiles, quickReplies, kpis } from "@/data/inbox";
import type { Conversation, InboxMessage, CustomerProfile } from "@/types/inbox";

export default function InboxPage() {
  const [activeId, setActiveId] = useState<string>("c1");
  const activeConversation = conversations.find((c) => c.id === activeId) || conversations[0];
  const conversationMessages = messages.filter((m) => m.conversationId === activeConversation.id);
  const profile = customerProfiles[activeConversation.id];

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <InboxHeader />
      <div className="mt-4 flex flex-col gap-4 overflow-y-auto px-4">
        <InboxStats items={kpis} />
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <aside className="flex flex-col gap-3">
            <InboxFilters />
            <ConversationList conversations={conversations} activeId={activeId} onSelect={setActiveId} />
          </aside>
          <div className="flex h-[560px] flex-col gap-3 xl:h-auto">
            <ChatWindow conversation={activeConversation} messages={conversationMessages} />
            <MessageComposer onSend={(text) => alert("Reply sent: " + text)} />
            <QuickReplies replies={quickReplies} onSelect={(text) => alert("Quick reply: " + text)} />
          </div>
          <div className="flex flex-col gap-3">
            {profile ? <CustomerProfilePanel profile={profile} /> : <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-xs text-white/60">Select a conversation to view customer details.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
