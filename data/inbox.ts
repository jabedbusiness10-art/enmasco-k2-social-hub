import type { Conversation, InboxMessage, CustomerProfile, QuickReply } from "@/types/inbox";

export const conversations: Conversation[] = [
  { id: "c1", platform: "facebook", customer: "Rahim Uddin", lastMessage: "Need quotation for CCTV package.", unread: 2, status: "OPEN", priority: "HIGH", assignedTo: "Jabed", lastActivity: "2026-07-08 16:20", tags: ["Sales", "CCTV"] },
  { id: "c2", platform: "instagram", customer: "@sara_fashion", lastMessage: "When will the new reel go live?", unread: 0, status: "ASSIGNED", priority: "MEDIUM", assignedTo: "Sara", lastActivity: "2026-07-08 15:40", tags: ["Content"] },
  { id: "c3", platform: "linkedin", customer: "Karim Electronics", lastMessage: "Please share company profile.", unread: 1, status: "OPEN", priority: "MEDIUM", lastActivity: "2026-07-08 14:10", tags: ["B2B"] },
  { id: "c4", platform: "website", customer: "contact@enmasco.com", lastMessage: "Installation request received.", unread: 0, status: "CLOSED", priority: "LOW", lastActivity: "2026-07-08 12:30", tags: ["Support"] },
  { id: "c5", platform: "facebook", customer: "Nasir Hardware", lastMessage: "Follow-up on bulk order.", unread: 3, status: "OPEN", priority: "HIGH", assignedTo: "MD Kazim", lastActivity: "2026-07-08 17:00", tags: ["Sales", "Bulk"] },
];

export const messages: InboxMessage[] = [
  { id: "m1", conversationId: "c1", sender: "CUSTOMER", text: "Hello, I need a CCTV quotation.", sentAt: "2026-07-08 16:15" },
  { id: "m2", conversationId: "c1", sender: "AGENT", text: "Sure, please share your location.", sentAt: "2026-07-08 16:18" },
  { id: "m3", conversationId: "c1", sender: "CUSTOMER", text: "Need quotation for CCTV package.", sentAt: "2026-07-08 16:20" },
  { id: "m4", conversationId: "c2", sender: "CUSTOMER", text: "When will the new reel go live?", sentAt: "2026-07-08 15:40" },
  { id: "m5", conversationId: "c3", sender: "CUSTOMER", text: "Please share company profile.", sentAt: "2026-07-08 14:10" },
];

export const customerProfiles: Record<string, CustomerProfile> = {
  c1: { name: "Rahim Uddin", platform: "facebook", firstContact: "2026-07-01", lastActivity: "2026-07-08 16:20", assignedStaff: "Jabed", status: "OPEN", tags: ["Sales", "CCTV"], notes: "Interested in 8-camera package.", interactionHistory: [{ date: "2026-07-01", action: "First contact" }, { date: "2026-07-08", action: "Quotation request" }] },
  c2: { name: "@sara_fashion", platform: "instagram", firstContact: "2026-07-03", lastActivity: "2026-07-08 15:40", assignedStaff: "Sara", status: "ASSIGNED", tags: ["Content"], notes: "Brand collaboration query.", interactionHistory: [{ date: "2026-07-03", action: "DM received" }] },
  c3: { name: "Karim Electronics", platform: "linkedin", firstContact: "2026-07-05", lastActivity: "2026-07-08 14:10", status: "OPEN", tags: ["B2B"], notes: "Needs partnership deck.", interactionHistory: [{ date: "2026-07-05", action: "LinkedIn message" }] },
  c4: { name: "contact@enmasco.com", platform: "website", firstContact: "2026-07-04", lastActivity: "2026-07-08 12:30", status: "CLOSED", tags: ["Support"], notes: "Installation support ticket closed.", interactionHistory: [{ date: "2026-07-04", action: "Contact form" }] },
  c5: { name: "Nasir Hardware", platform: "facebook", firstContact: "2026-06-28", lastActivity: "2026-07-08 17:00", assignedStaff: "MD Kazim", status: "OPEN", tags: ["Sales", "Bulk"], notes: "Bulk order follow-up pending.", interactionHistory: [{ date: "2026-06-28", action: "Inquiry" }, { date: "2026-07-08", action: "Follow-up" }] },
};

export const quickReplies: QuickReply[] = [
  { id: "qr1", title: "Welcome", text: "Welcome to ENMASCO! How can we help you?" },
  { id: "qr2", title: "Thank You", text: "Thank you for reaching out. We appreciate your interest." },
  { id: "qr3", title: "Quotation Sent", text: "Quotation has been sent. Let us know if you need changes." },
  { id: "qr4", title: "Installation Scheduled", text: "Installation is scheduled. Our team will confirm timing." },
  { id: "qr5", title: "Support Team Will Contact You", text: "Our support team will contact you shortly." },
  { id: "qr6", title: "Custom Reply", text: "" },
];

export const kpis = [
  { label: "Total Conversations", value: conversations.length.toString() },
  { label: "Unread Messages", value: conversations.reduce((sum, c) => sum + c.unread, 0).toString() },
  { label: "Comments Pending", value: "3" },
  { label: "High Priority", value: conversations.filter((c) => c.priority === "HIGH").length.toString() },
  { label: "Assigned to Me", value: conversations.filter((c) => c.assignedTo === "Jabed").length.toString() },
  { label: "Avg Response Time", value: "18m" },
];
