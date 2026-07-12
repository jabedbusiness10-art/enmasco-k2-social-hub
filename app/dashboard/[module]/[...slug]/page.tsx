"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Construction, ArrowRight } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { routeMetaMap, sidebarConfig } from "@/navigation/sidebarConfig";

/**
 * Generic catch-all for /dashboard/[module]/[...slug] routes that do not yet
 * have a dedicated page. Each route renders its OWN title/description/breadcrumb
 * from the navigation config, so no two menu items share a page (single-responsibility).
 * This prevents dead links while dedicated modules are built out.
 */
export default function GenericModulePage() {
  const pathname = usePathname();
  const meta = routeMetaMap[pathname];

  const moduleKey = meta?.moduleKey ?? pathname.split("/")[2] ?? "";
  const section = sidebarConfig.find((s) => s.key === moduleKey);
  const siblings = section?.children ?? [];

  const title = meta?.label ?? "Page";
  const description =
    meta?.description ?? "This workspace module is being finalized. Its dedicated tools will appear here.";

  return (
    <div>
      <PageHeader title={title} description={description} />

      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-sky-200">
          <Construction className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/55">{description}</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {siblings.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-white/70 transition hover:border-sky-400/30 hover:text-white"
            >
              {c.label}
              <ArrowRight className="h-3 w-3" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
