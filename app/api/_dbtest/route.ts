import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function GET() {
  return NextResponse.json({
    hasUrl: !!process.env.DATABASE_URL,
    len: (process.env.DATABASE_URL || "").length,
    starts: (process.env.DATABASE_URL || "").slice(0, 12),
  });
}
