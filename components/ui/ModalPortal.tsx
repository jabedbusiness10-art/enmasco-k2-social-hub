"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

let activeScrollLocks = 0;
let originalBodyOverflow = "";

export default function ModalPortal({
  children,
  lockScroll = true,
}: {
  children: ReactNode;
  lockScroll?: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !lockScroll) return;
    if (activeScrollLocks === 0) {
      originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    activeScrollLocks += 1;

    return () => {
      activeScrollLocks = Math.max(0, activeScrollLocks - 1);
      if (activeScrollLocks === 0) {
        document.body.style.overflow = originalBodyOverflow;
      }
    };
  }, [lockScroll, mounted]);

  if (!mounted) return null;
  return createPortal(children, document.body);
}
