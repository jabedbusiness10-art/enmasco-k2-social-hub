"use client";

import { motion } from "framer-motion";
import type { Notification } from "@/types/notification";
import NotificationCard from "@/components/notifications/NotificationCard";

type NotificationListProps = {
  notifications: Notification[];
  onOpen: (id: string) => void;
};

export default function NotificationList({ notifications, onOpen }: NotificationListProps) {
  return (
    <div className="space-y-2">
      {notifications.map((notification, index) => (
        <NotificationCard key={notification.id} notification={notification} onOpen={onOpen} />
      ))}
    </div>
  );
}
