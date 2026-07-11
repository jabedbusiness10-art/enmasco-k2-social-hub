import { NextResponse } from "next/server";
import type { AppSettings } from "@/types/settings";

// Mock persistence layer. In production this would read/write a Prisma
// CompanySettings row or a config service. For now we echo the payload back
// with a server timestamp so the UI behaves like a real backend round-trip.
let STORE: AppSettings | null = null;

export async function GET() {
  const savedAt = new Date().toISOString();
  return NextResponse.json({ settings: STORE, savedAt, source: STORE ? "store" : "defaults" });
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as AppSettings;
    STORE = body;
    return NextResponse.json({ settings: STORE, savedAt: new Date().toISOString(), ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
