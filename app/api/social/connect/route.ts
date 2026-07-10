import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { connectAccount } from "@/services/social/accounts";
import { z } from "zod";

export const runtime = "nodejs";

const PlatformEnum = z.enum(["FACEBOOK", "INSTAGRAM", "LINKEDIN", "YOUTUBE", "X", "WEBSITE"]);

const ConnectSchema = z.object({
  platform: PlatformEnum,
  accountName: z.string().min(1),
  accountHandle: z.string().nullable().optional(),
  accountId: z.string().nullable().optional(),
  pageId: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  profileUrl: z.string().url().nullable().optional(),
  accessToken: z.string().min(1),
  refreshToken: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) {
    return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = ConnectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const user = perm.user!;
  const account = await connectAccount({
    ...parsed.data,
    connectedBy: user.name ?? user.email,
    connectedById: user.id,
  });

  return NextResponse.json({ account }, { status: 201 });
}
