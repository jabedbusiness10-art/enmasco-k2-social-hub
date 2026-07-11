import type { ConversationStatus } from "@/types/inbox";
import { STATUS_META } from "./platformMeta";

export default function StatusBadge({ status }: { status: ConversationStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${meta.soft} ${meta.text} ${meta.border}`}
    >
      {meta.label}
    </span>
  );
}
