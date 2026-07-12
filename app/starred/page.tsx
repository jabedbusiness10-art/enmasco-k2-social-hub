import MessengerSubList from "@/components/messaging/MessengerSubList";
import { Star } from "lucide-react";

export default function StarredPage() {
  return <MessengerSubList title="Starred" icon={Star} filter={(c) => c.isStarred} />;
}
