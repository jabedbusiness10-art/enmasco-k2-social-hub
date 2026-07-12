import MessengerSubList from "@/components/messaging/MessengerSubList";
import { Hash } from "lucide-react";

export default function DirectPage() {
  return <MessengerSubList title="Direct Messages" kind="DIRECT" icon={Hash} cta={{ label: "New Chat", href: "/messenger/direct" }} />;
}
