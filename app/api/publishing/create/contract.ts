import { z } from "zod";
import { PUBLISH_PLATFORMS, type PublishPlatform } from "@/services/publishing/engine";

const platformSchema = z.enum(PUBLISH_PLATFORMS);

export const createPostSchema = z.object({
  title: z.string().trim().max(100).optional(),
  caption: z.string().trim().min(1, "Post content is required").max(5_000),
  hashtags: z.array(z.string().trim().min(1).max(100)).max(30).optional(),
  link: z.string().url("Link must be a valid URL").optional(),
  cta: z.string().trim().max(100).optional(),
  location: z.string().trim().max(200).optional(),
  mediaUrls: z.array(z.string().url("Media URL must be a valid public URL")).max(10).optional(),
  platforms: z.array(z.object({
    platform: platformSchema,
    accountId: z.string().trim().optional(),
  })).min(1, "Select at least one connected platform").superRefine((targets, context) => {
    const seen = new Set<string>();
    targets.forEach((target, index) => {
      if (seen.has(target.platform)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${target.platform} can only be selected once`,
          path: [index, "platform"],
        });
      }
      seen.add(target.platform);
    });
  }),
  scheduledAt: z.string().datetime("Invalid scheduled date").optional(),
  timezone: z.string().trim().max(100).optional(),
  requiresApproval: z.boolean().optional(),
  providerOptions: z.object({
    tiktok: z.object({
      privacyLevel: z.string().max(80).optional(),
      disableComment: z.boolean().optional(),
      disableDuet: z.boolean().optional(),
      disableStitch: z.boolean().optional(),
      coverTimestampMs: z.number().int().min(0).optional(),
    }).optional(),
    youtube: z.object({
      title: z.string().max(100).optional(),
      description: z.string().max(5_000).optional(),
      thumbnailUrl: z.string().url().optional(),
      tags: z.array(z.string().max(500)).max(50).optional(),
      playlistId: z.string().max(100).optional(),
      visibility: z.enum(["public", "private", "unlisted"]).optional(),
      publishAt: z.string().datetime().optional(),
      categoryId: z.string().regex(/^\d+$/).optional(),
      madeForKids: z.boolean().optional(),
    }).optional(),
    website: z.object({ status: z.enum(["draft", "publish"]).optional() }).optional(),
  }).optional(),
});

export type CreatePostPayload = z.infer<typeof createPostSchema>;

export type PublishingAccountLookup = {
  id: string;
  platform: PublishPlatform;
  status: string;
  isActive?: boolean;
};

export function normalizeCreatePostPayload(body: any): any {
  if (!body || typeof body !== "object" || Array.isArray(body)) return body;
  const caption = body.caption ?? body.content ?? body.message;
  const platforms = Array.isArray(body.platforms)
    ? body.platforms
    : body.platform
      ? [{ platform: body.platform, accountId: body.accountId ?? body.socialAccountId ?? body.providerAccountId }]
      : body.socialAccountId
        ? [{ platform: body.platform ?? "FACEBOOK", accountId: body.socialAccountId }]
        : body.providerAccountId
          ? [{ platform: body.platform ?? "FACEBOOK", accountId: body.providerAccountId }]
          : body.platforms;
  const mediaUrls = Array.isArray(body.mediaUrls)
    ? body.mediaUrls
    : typeof body.mediaUrl === "string" && body.mediaUrl
      ? [body.mediaUrl]
      : body.mediaUrls;

  return {
    ...body,
    caption,
    platforms,
    mediaUrls,
  };
}

export function summarizePublishingValidationIssues(error: z.ZodError): {
  message: string;
  fieldNames: string[];
  issues: ReturnType<z.ZodError["flatten"]>;
} {
  const fieldNames = [...new Set(error.issues.map((issue) => String(issue.path[0] ?? "request")))];
  const first = error.issues[0];
  return {
    message: first?.message || "Invalid publishing request",
    fieldNames,
    issues: error.flatten(),
  };
}

export function resolvePublishingTargets(
  payload: CreatePostPayload,
  accounts: PublishingAccountLookup[],
): CreatePostPayload {
  const next = {
    ...payload,
    platforms: payload.platforms.map((target) => ({ ...target })),
  };

  next.platforms = next.platforms.map((target) => {
    const explicitId = target.accountId?.trim();
    const account = explicitId
      ? accounts.find((item) => item.id === explicitId)
      : accounts.find((item) => item.platform === target.platform && item.status === "CONNECTED" && item.isActive !== false);

    if (!account) {
      throw new Error(explicitId ? "Selected account is not connected" : "Select at least one connected platform");
    }
    if (account.platform !== target.platform) {
      throw new Error("Selected account does not match the chosen platform");
    }
    if (account.status !== "CONNECTED" || account.isActive === false) {
      throw new Error("Selected account is not connected");
    }

    return { ...target, accountId: account.id };
  });

  return next;
}
