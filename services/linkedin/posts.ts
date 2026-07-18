import { prisma } from "@/lib/db";
import { IntegrationError } from "@/services/integrations/errors";
import { requireLinkedInAccount, markLinkedInOperationError } from "./account";
import { linkedinRequest, organizationUrn } from "./client";
import { uploadLinkedInImage, uploadLinkedInVideo } from "./media";

export interface LinkedInPublishInput {
  title?: string;
  caption: string;
  hashtags?: string[];
  link?: string;
  mediaUrls?: string[];
}

function commentary(input: LinkedInPublishInput): string {
  const tags = (input.hashtags ?? []).map((tag) => tag.startsWith("#") ? tag : `#${tag}`).join(" ");
  return [input.caption.trim(), tags].filter(Boolean).join("\n\n").slice(0, 3_000);
}

function isVideo(url: string): boolean {
  return /\.(mp4)(?:\?|$)/i.test(url);
}

export async function publishLinkedInOrganization(accountId: string, input: LinkedInPublishInput) {
  try {
    const { account, accessToken } = await requireLinkedInAccount(accountId, "publishPosts", true);
    const author = organizationUrn(account.organizationId!);
    const mediaUrls = input.mediaUrls ?? [];
    const payload: any = {
      author,
      commentary: commentary(input),
      visibility: "PUBLIC",
      distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    };

    if (mediaUrls.length) {
      const videos = mediaUrls.filter(isVideo);
      if (videos.length && mediaUrls.length !== 1) {
        throw new IntegrationError("LINKEDIN", "CONTENT_REJECTED", "LinkedIn video posts support one video per organic post", 422, false, "Publish the video separately from images.");
      }
      if (videos.length === 1) {
        const video = await uploadLinkedInVideo(accessToken, account.organizationId!, videos[0]);
        payload.content = { media: { id: video, title: input.title ?? "Video" } };
      } else {
        const images: { id: string; altText?: string }[] = [];
        for (const [index, url] of mediaUrls.slice(0, 20).entries()) {
          images.push({ id: await uploadLinkedInImage(accessToken, account.organizationId!, url), altText: input.title ? `${input.title} ${index + 1}` : undefined });
        }
        payload.content = images.length === 1 ? { media: { id: images[0].id, title: input.title ?? "Image" } } : { multiImage: { images } };
      }
    } else if (input.link) {
      payload.content = { article: { source: input.link, title: input.title ?? input.link, description: input.caption.slice(0, 200) } };
    }

    const { data, headers } = await linkedinRequest<any>("/posts", accessToken, { method: "POST", body: JSON.stringify(payload) }, { retries: 0 });
    const id = data?.id ?? headers.get("x-restli-id");
    if (!id) throw new IntegrationError("LINKEDIN", "API_ERROR", "LinkedIn did not return a post identifier", 502, true, "Check the organization post through LinkedIn and retry only if absent.");
    await prisma.companySocialAccount.update({ where: { id: accountId }, data: { lastPublishAt: new Date(), lastError: null, lastValidatedAt: new Date() } });
    return { platform: "LINKEDIN", ok: true as const, platformPostId: String(id), liveUrl: `https://www.linkedin.com/feed/update/${id}` };
  } catch (error) {
    await markLinkedInOperationError(accountId, error);
    return { platform: "LINKEDIN", ok: false as const, error: error instanceof IntegrationError ? `${error.message} [${error.code}]` : "LinkedIn publishing failed [API_ERROR]" };
  }
}
