import { prisma } from "@/lib/db";
import { syncMetaInbox, syncYouTubeComments } from "@/services/inbox/providers";

export async function handleInboxSync() {
  const accounts = await prisma.companySocialAccount.findMany({ where: { isActive: true, status: "CONNECTED", platform: { in: ["FACEBOOK", "INSTAGRAM", "YOUTUBE"] } }, select: { id: true, platform: true } });
  const results: any[] = [];
  for (const account of accounts) {
    try {
      const result = account.platform === "YOUTUBE" ? await syncYouTubeComments(account.id, 1) : await syncMetaInbox(account.id, 1);
      results.push({ accountId: account.id, platform: account.platform, ok: true, result });
    } catch (error) {
      const message = error instanceof Error ? error.message.slice(0, 500) : "Inbox reconciliation failed";
      await prisma.companySocialAccount.update({ where: { id: account.id }, data: { lastError: message } }).catch(() => {});
      results.push({ accountId: account.id, platform: account.platform, ok: false, error: message });
    }
  }
  return { checked: accounts.length, results };
}
