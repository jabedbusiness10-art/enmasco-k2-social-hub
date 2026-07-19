"use client";

import { useSession } from "next-auth/react";
import { MessengerSocketProvider } from "@/components/messaging/MessengerSocketProvider";

export default function InboxLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  return <MessengerSocketProvider user={(session?.user as any) ?? null}>{children}</MessengerSocketProvider>;
}
