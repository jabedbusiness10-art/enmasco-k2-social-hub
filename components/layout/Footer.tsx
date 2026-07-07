"use client";

import { cn } from "@/lib/utils";
import { SOCIAL_LINKS } from "@/constants/social";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "border-t border-white/5 bg-[#030305]",
        "px-6 py-8"
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-white/90">EnmaSco</p>
          <p className="text-xs text-neutral-500">
            &copy; {year} EnmaSco K2 Social Hub. All rights reserved.
          </p>
        </div>

        <ul className="flex gap-4 text-xs text-neutral-400">
          {SOCIAL_LINKS.map((item) => (
            <li
              key={item.name}
              className="transition hover:text-white"
            >
              <a href={item.href} target="_blank" rel="noreferrer">
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
