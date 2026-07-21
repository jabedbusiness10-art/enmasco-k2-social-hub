"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { dashboardHref, routeMetaMap } from "@/navigation/sidebarConfig";

type Crumb = { label: string; href?: string };

export default function Breadcrumb({ items }: { items?: Crumb[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  let crumbs: Crumb[] = [{ label: "Dashboard", href: dashboardHref }];

  if (!items) {
    const view = searchParams.get("view");
    const routeKey = view && routeMetaMap[`${pathname}?view=${view}`] ? `${pathname}?view=${view}` : pathname;
    const meta = routeMetaMap[routeKey];
    if (meta) {
      crumbs = meta.breadcrumbs.map((label, index) => ({
        label,
        href: index === 0 ? dashboardHref : index === 1 && meta.moduleHref !== meta.href ? meta.moduleHref : undefined,
      }));
    } else {
      // fallback: build from path segments
      const segs = pathname.split("/").filter(Boolean);
      let acc = "";
      for (const s of segs) {
        acc += `/${s}`;
        const m = routeMetaMap[acc];
        crumbs.push({ label: m?.label ?? s.charAt(0).toUpperCase() + s.slice(1), href: m ? acc : undefined });
      }
    }
  } else {
    crumbs = items;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-white/50">
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-white/30" />}
            {c.href && !last ? (
              <Link href={c.href} className="transition hover:text-white">
                {i === 0 ? <Home className="h-3.5 w-3.5" /> : c.label}
              </Link>
            ) : (
              <span className={last ? "font-medium text-white/80" : ""}>{i === 0 ? <Home className="h-3.5 w-3.5" /> : c.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
