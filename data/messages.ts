import type { Channel, Message } from "@/types/message";

export const channels: Channel[] = [
  { id: "general", name: "General", type: "PUBLIC" },
  { id: "ceo-office", name: "CEO Office", type: "PRIVATE" },
  { id: "sales-team", name: "Sales Team", type: "PUBLIC" },
  { id: "marketing", name: "Marketing", type: "PUBLIC" },
  { id: "security", name: "Security Operations", type: "PUBLIC" },
  { id: "hr", name: "HR Department", type: "PRIVATE" },
  { id: "social-team", name: "Social Media Team", type: "PUBLIC" },
];

export const messages: Message[] = [
  { id: "m1", senderId: "u1", senderName: "MD Kazim", content: "Good morning team.", createdAt: "2026-07-08T09:20:00", status: "READ" },
  { id: "m2", senderId: "u2", senderName: "Lipton", content: "Client meeting at 11 AM.", createdAt: "2026-07-08T09:22:00", status: "READ" },
  { id: "m3", senderId: "u3", senderName: "Arif", content: "Monthly report uploaded.", createdAt: "2026-07-08T09:25:00", status: "READ" },
  { id: "m4", senderId: "u4", senderName: "Sumon", content: "Security inspection completed.", createdAt: "2026-07-08T09:30:00", status: "DELIVERED" },
  { id: "m5", senderId: "u1", senderName: "MD Kazim", content: "New quotation approved.", createdAt: "2026-07-08T09:35:00", status: "SENT" },
  { id: "m6", senderId: "u5", senderName: "MD Kazim", content: "Today's CCTV installation is complete.", createdAt: "2026-07-08T10:45:00", status: "READ" },
  { id: "m7", senderId: "u2", senderName: "Lipton", content: "Great, update the tracker please.", createdAt: "2026-07-08T10:48:00", status: "DELIVERED" },
  { id: "m8", senderId: "u3", senderName: "Arif", content: "I will sync with the team after lunch.", createdAt: "2026-07-08T11:05:00", status: "SENT" },
];
