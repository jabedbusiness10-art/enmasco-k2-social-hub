"use client";

import { useSession } from "next-auth/react";
import { MessengerSocketProvider } from "@/components/messaging/MessengerSocketProvider";

export default function MessengerLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const user = (session?.user as any) ?? null;
  return <MessengerSocketProvider user={user}>{children}</MessengerSocketProvider>;
}
