import type { ReactionType } from "@/types/engagement";

const EMOJI: Record<ReactionType | "REACH" | "ENGAGEMENT_RATE", string> = {
  LIKE: "👍",
  LOVE: "❤️",
  HAHA: "😂",
  WOW: "😮",
  SAD: "😢",
  ANGRY: "😡",
  COMMENT: "💬",
  SHARE: "🔄",
  SAVE: "📌",
  REACH: "👀",
  ENGAGEMENT_RATE: "📈",
};

export default function ReactionBadge({
  type,
  size = "sm",
}: {
  type: ReactionType | "REACH" | "ENGAGEMENT_RATE";
  size?: "sm" | "md";
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-white/[0.06] ${
        size === "md" ? "h-7 w-7 text-base" : "h-5 w-5 text-xs"
      }`}
      title={type}
    >
      {EMOJI[type]}
    </span>
  );
}
