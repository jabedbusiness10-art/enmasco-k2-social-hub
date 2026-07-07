"use client";

import { useState, useEffect } from "react";

import Image from "next/image";

export default function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const day = now.toLocaleDateString("en-US", { weekday: "short" });
  const date = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="text-center">
      <div className="font-mono text-lg font-semibold tracking-wider text-white">
        {time}
      </div>
      <div className="text-[10px] uppercase tracking-widest text-neutral-400">
        {day} • {date}
      </div>
    </div>
  );
}
