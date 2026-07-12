import MessengerSubList from "@/components/messaging/MessengerSubList";
import { Users } from "lucide-react";

export default function GroupsPage() {
  return <MessengerSubList title="Groups" kind="GROUP" icon={Users} cta={{ label: "New Group", href: "/messenger/direct" }} />;
}
