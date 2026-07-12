"use client";

import MessengerSubList from "@/components/messaging/MessengerSubList";
import { MessengerSocketProvider } from "@/components/messaging/MessengerSocketProvider";
import { useSession } from "next-auth/react";
import { Megaphone } from "lucide-react";

export default function AnnouncementsPage() {
  const { data: session } = useSession();
  const user = (session?.user as any) ?? null;
  return (
    <MessengerSocketProvider user={user}>
      <MessengerSubList title="Announcements" kind="ANNOUNCEMENT" icon={Megaphone} />
    </MessengerSocketProvider>
  );
}
