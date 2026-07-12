"use client";

import MessengerSubList from "@/components/messaging/MessengerSubList";
import { MessengerSocketProvider } from "@/components/messaging/MessengerSocketProvider";
import { useSession } from "next-auth/react";
import { Star } from "lucide-react";

export default function StarredPage() {
  const { data: session } = useSession();
  const user = (session?.user as any) ?? null;
  return (
    <MessengerSocketProvider user={user}>
      <MessengerSubList title="Starred" icon={Star} filter={(c) => c.isStarred} />
    </MessengerSocketProvider>
  );
}
