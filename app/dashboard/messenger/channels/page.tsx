"use client";

import MessengerSubList from "@/components/messaging/MessengerSubList";
import { MessengerSocketProvider } from "@/components/messaging/MessengerSocketProvider";
import { useSession } from "next-auth/react";
import { Hash } from "lucide-react";

export default function ChannelsPage() {
  const { data: session } = useSession();
  const user = (session?.user as any) ?? null;
  return (
    <MessengerSocketProvider user={user}>
      <MessengerSubList title="Channels" kind="CHANNEL" icon={Hash} cta={{ label: "New Channel", href: "/dashboard/messenger/direct" }} />
    </MessengerSocketProvider>
  );
}
