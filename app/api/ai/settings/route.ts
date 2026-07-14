import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { getSettings, saveSettings } from "@/services/ai";
import { getAIProvider } from "@/services/ai/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requirePermission("VIEW_AI", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const settings = await getSettings();
  const provider = getAIProvider();
  return NextResponse.json({
    settings,
    provider: provider.id,
    providerLabel: provider.label,
    providerConfigured: provider.isConfigured,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission("VIEW_AI", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const settings = await saveSettings(body);
  return NextResponse.json({ settings });
}
