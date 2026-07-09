"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  // Keep it as a placeholder for future auth/session guards.
  // In Phase-2, replace with real session/role checks.
  return <>{children}</>;
}
