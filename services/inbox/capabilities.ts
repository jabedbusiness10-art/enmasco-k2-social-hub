import { prisma } from "@/lib/db";

type CapabilityState = "SUPPORTED_AUTHORIZED" | "SUPPORTED_NOT_APPROVED" | "UNSUPPORTED" | "TEMPORARILY_UNAVAILABLE";

function state(available: boolean, approved: boolean, connected: boolean): CapabilityState {
  if (!connected) return "TEMPORARILY_UNAVAILABLE";
  if (!available) return "UNSUPPORTED";
  return approved ? "SUPPORTED_AUTHORIZED" : "SUPPORTED_NOT_APPROVED";
}

export async function getInboxCapabilities() {
  const [accounts, websites] = await Promise.all([
    prisma.companySocialAccount.findMany({ where: { isActive: true }, select: { id: true, platform: true, provider: true, status: true, permissions: true, providerCapabilities: true, permissionStatus: true, accountName: true } }),
    prisma.websiteConnection.findMany({ select: { id: true, websiteName: true, status: true, providerCapabilities: true, webhookStatus: true } }),
  ]);
  const result = accounts.map((account) => {
    const caps = (account.providerCapabilities ?? {}) as Record<string, any>;
    const connected = account.status === "CONNECTED";
    if (account.platform === "FACEBOOK") return { accountId: account.id, provider: "FACEBOOK", accountName: account.accountName, receive: state(true, account.permissions.includes("pages_messaging"), connected), reply: state(true, account.permissions.includes("pages_messaging"), connected), comments: state(true, account.permissions.some((p) => ["pages_manage_engagement", "pages_read_user_content"].includes(p)), connected), directMessages: true };
    if (account.platform === "INSTAGRAM") return { accountId: account.id, provider: "INSTAGRAM", accountName: account.accountName, receive: state(true, account.permissions.some((p) => p.includes("instagram_manage_messages")), connected), reply: state(true, account.permissions.some((p) => p.includes("instagram_manage_messages")), connected), comments: state(true, account.permissions.some((p) => p.includes("instagram_manage_comments")), connected), directMessages: true };
    if (account.platform === "YOUTUBE") return { accountId: account.id, provider: "YOUTUBE", accountName: account.accountName, receive: state(true, account.permissions.some((p) => p.includes("youtube")), connected), reply: state(true, account.permissions.some((p) => p.includes("youtube.force-ssl")), connected), comments: state(true, account.permissions.some((p) => p.includes("youtube")), connected), directMessages: false, limitation: "YouTube does not provide a general private DM API." };
    if (account.platform === "LINKEDIN") return { accountId: account.id, provider: "LINKEDIN", accountName: account.accountName, receive: state(true, caps.inboxComments === true && account.permissionStatus === "AUTHORIZED", connected), reply: state(true, caps.inboxComments === true && account.permissionStatus === "AUTHORIZED", connected), comments: state(true, caps.inboxComments === true && account.permissionStatus === "AUTHORIZED", connected), directMessages: false, limitation: "Only approved Community Management comments are available; LinkedIn private messages are not exposed." };
    if (account.platform === "TIKTOK") return { accountId: account.id, provider: "TIKTOK", accountName: account.accountName, receive: state(caps.businessMessaging === true, caps.businessMessagingApproved === true, connected), reply: state(caps.businessMessaging === true, caps.businessMessagingApproved === true, connected), comments: state(caps.comments === true, caps.commentsApproved === true, connected), directMessages: caps.businessMessaging === true, limitation: caps.businessMessagingApproved === true ? undefined : "TikTok interaction APIs are disabled until the app and account are approved." };
    return null;
  }).filter(Boolean);
  result.push(...websites.map((website) => {
    const caps = (website.providerCapabilities ?? {}) as Record<string, any>;
    const connected = website.status === "CONNECTED";
    return { accountId: website.id, provider: "WEBSITE", accountName: website.websiteName, receive: state(true, website.webhookStatus, connected), reply: state(Boolean(caps.inboxReplyUrl), Boolean(caps.inboxReplyUrl), connected), comments: "UNSUPPORTED" as CapabilityState, directMessages: Boolean(caps.liveChat), limitation: caps.inboxReplyUrl ? undefined : "Inbound inquiries are supported; outbound reply requires a configured signed reply webhook." };
  }));
  return result;
}
