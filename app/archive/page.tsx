"use client";

import MessengerSubList from "@/components/messaging/MessengerSubList";
import { MessengerSocketProvider } from "@/components/messaging/MessengerSocketProvider";
import { useSession } from "next-auth/react";
import { Archive } from "lucide-react";

export default function ArchivePage() {
  const { data: session } = useSession();
  const user = (session?.user as any) ?? null;
  return (
    <MessengerSocketProvider user={user}>
      <MessengerSubList title="Archive" icon={Archive} filter={(c) => c.isArchived} />
    </MessengerSocketProvider>
  );
}
