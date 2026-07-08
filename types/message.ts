export type MessageStatus = "SENT" | "DELIVERED" | "READ";

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  status: MessageStatus;
}

export interface Channel {
  id: string;
  name: string;
  type: "PUBLIC" | "PRIVATE";
}
