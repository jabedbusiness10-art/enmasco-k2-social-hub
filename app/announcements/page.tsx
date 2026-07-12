import MessengerSubList from "@/components/messaging/MessengerSubList";
import { Megaphone } from "lucide-react";

export default function AnnouncementsPage() {
  return <MessengerSubList title="Announcements" kind="ANNOUNCEMENT" icon={Megaphone} />;
}
