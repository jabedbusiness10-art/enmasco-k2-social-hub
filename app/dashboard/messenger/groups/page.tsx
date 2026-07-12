"use client";

import MessengerSubList from "@/components/messaging/MessengerSubList";
import { MessengerSocketProvider } from "@/components/messaging/MessengerSocketProvider";
import { useSession } from "next-auth/react";
import { Users } from "lucide-react";

export default function GroupsPage() {
  const { data: session } = useSession();
  const user = (session?.user as any) ?? null;
  return (
    <MessengerSocketProvider user={user}>
      <MessengerSubList title="Groups" kind="GROUP" icon={Users} cta={{ label: "New Group", href: "/dashboard/messenger/direct" }} />
    </MessengerSocketProvider>
  );
}
