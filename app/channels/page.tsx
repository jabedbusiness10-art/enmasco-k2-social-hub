import MessengerSubList from "@/components/messaging/MessengerSubList";
import { Hash } from "lucide-react";

export default function ChannelsPage() {
  return <MessengerSubList title="Channels" kind="CHANNEL" icon={Hash} cta={{ label: "New Channel", href: "/messenger/direct" }} />;
}
