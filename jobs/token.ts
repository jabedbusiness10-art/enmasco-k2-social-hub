import { prisma } from "@/lib/db";
import { refreshAccount } from "@/services/social/accounts";

/**
 * TASK-57 — Token job handlers.
 * Real OAuth token refresh for connected accounts (YouTube/Meta/LinkedIn).
 * Refreshes before expiry to avoid dead connections.
 */
export async function handleToken(job: { name: string; data: any }): Promise<any> {
  if (job.name === "token:expiry-check") {
    const scope = job.data?.scope ?? "all";
    const where = scope === "all" ? {} : { provider: scope };
    const rows = await prisma.companySocialAccount.findMany({
      where: { ...where, status: "CONNECTED" },
      select: { id: true, expiresAt: true, provider: true },
    });
    const due = rows.filter((r) => {
      if (!r.expiresAt) return false;
      const hoursLeft = (r.expiresAt.getTime() - Date.now()) / 3_600_000;
      return hoursLeft <= 24; // refresh if expiring within 24h
    });
    const results = [];
    for (const r of due) {
      try {
        await refreshAccount(r.id);
        results.push({ id: r.id, provider: r.provider, refreshed: true });
      } catch (e: any) {
        results.push({ id: r.id, provider: r.provider, refreshed: false, error: e.message });
      }
    }
    return { checked: rows.length, refreshed: results };
  }

  if (job.name === "token:refresh") {
    const { accountId } = job.data ?? {};
    if (!accountId) throw new Error("token:refresh missing accountId");
    return refreshAccount(accountId);
  }

  // token:expiry-check default
  return { ok: true };
}
