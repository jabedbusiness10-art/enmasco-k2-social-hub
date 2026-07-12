import MessengerSubList from "@/components/messaging/MessengerSubList";
import { Archive } from "lucide-react";

export default function ArchivePage() {
  return <MessengerSubList title="Archive" icon={Archive} filter={(c) => c.isArchived} />;
}
