"use client";

import { motion } from "framer-motion";

export default function OnlineUsers() {
  const users = [
    { name: "MD Kazim", status: "online" },
    { name: "Lipton", status: "online" },
    { name: "Arif", status: "online" },
    { name: "Sumon", status: "away" },
    { name: "MD Kazim", status: "offline" },
  ];

  return (
    <div className="space-y-2 p-3 text-sm text-white/80">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Online Users</div>
      {users.map((user, index) => (
        <motion.div
          key={user.name}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.04 }}
          className="flex items-center gap-2"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              user.status === "online" ? "bg-emerald-400" : user.status === "away" ? "bg-amber-400" : "bg-red-400"
            }`}
          />
          {user.name}
        </motion.div>
      ))}
    </div>
  );
}
