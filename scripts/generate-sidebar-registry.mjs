import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DEPRECATED_ROUTES,
  INTERNAL_ROUTES,
  NAVIGATION_MODULES,
  REMOVED_ROUTES,
  ROUTE_REDIRECTS,
} from "../navigation/registry.mjs";

const output = path.join(process.cwd(), "docs", "architecture", "SIDEBAR-REGISTRY-v1.1.md");
const items = NAVIGATION_MODULES.flatMap((section) => [section, ...section.children]);

const lines = [
  "# K2KAI Social Flow — Sidebar & Route Registry v1.1",
  "",
  "> Generated from `navigation/registry.mjs`. Do not maintain route tables by hand.",
  "",
  "Status: **FROZEN — Enterprise Blueprint v1.1**",
  "",
  "## Governance",
  "",
  "- `navigation/registry.mjs` is the single source for canonical routes, sidebar labels, permissions, breadcrumbs, redirects, and lifecycle status.",
  "- `navigation/sidebarConfig.ts` only maps registry icon names to Lucide components and builds route metadata.",
  "- Sidebar, active state, breadcrumbs, module landings, search navigation, and Next.js redirects consume the registry.",
  "- Every canonical sidebar target has a dedicated `page.tsx`; the generic dashboard placeholder catch-all was removed.",
  "- All `/dashboard/**` pages and `/monitoring` are authenticated by middleware. Admin, Executive, and report routes retain their existing role guards. API permission checks remain owned by their existing `requirePermission` guards.",
  "- Provider APIs are INTERNAL and are not sidebar destinations. The internal `/api/social/facebook/live` integration endpoint is intentionally preserved; the obsolete Facebook Live UI route is removed.",
  "",
  "## Registry totals",
  "",
  "| Classification | Total |",
  "|---|---:|",
  `| Main modules | ${NAVIGATION_MODULES.length} |`,
  `| Submenu items | ${items.length - NAVIGATION_MODULES.length} |`,
  `| Total sidebar items | ${items.length} |`,
  `| ACTIVE canonical routes | ${items.length} |`,
  `| REDIRECT routes | ${ROUTE_REDIRECTS.length} |`,
  `| DEPRECATED routes | ${DEPRECATED_ROUTES.length} |`,
  `| INTERNAL route groups | ${INTERNAL_ROUTES.length} |`,
  `| REMOVED route patterns | ${REMOVED_ROUTES.length} |`,
  "",
  "## Canonical sidebar registry",
  "",
];

for (const [index, section] of NAVIGATION_MODULES.entries()) {
  lines.push(`### ${index + 1}. ${section.label}`, "");
  lines.push("| Item | Kind | Canonical route | Permission | Breadcrumb |", "|---|---|---|---|---|");
  lines.push(`| ${section.label} | Main | \`${section.href}\` | \`${section.permission}\` | ${section.href === "/dashboard" ? "Dashboard" : `Dashboard > ${section.crumb}`} |`);
  for (const child of section.children) {
    lines.push(`| ${child.label} | Submenu | \`${child.href}\` | \`${child.permission}\` | Dashboard > ${section.crumb} > ${child.label} |`);
  }
  lines.push("");
}

lines.push(
  "## Redirect registry",
  "",
  "Every legacy alias is a single permanent redirect to an ACTIVE canonical route. Redirect chains are prohibited.",
  "",
  "| Legacy source | Canonical destination | Status |",
  "|---|---|---|",
);
for (const redirect of ROUTE_REDIRECTS) {
  lines.push(`| \`${redirect.source}\` | \`${redirect.destination}\` | REDIRECT |`);
}

lines.push("", "## Deprecated routes", "");
if (DEPRECATED_ROUTES.length === 0) {
  lines.push("None. Legacy URLs redirect immediately; no deprecated page remains live.");
} else {
  for (const route of DEPRECATED_ROUTES) lines.push(`- \`${route.route}\``);
}

lines.push("", "## Removed routes and pages", "", "| Route | Status | Reason |", "|---|---|---|");
for (const removed of REMOVED_ROUTES) {
  lines.push(`| \`${removed.route}\` | REMOVED | ${removed.reason} |`);
}
lines.push(
  "| `/ceo` page component | REMOVED PAGE | Duplicate page removed; URL redirects to `/dashboard/executive`. |",
  "| `/publishing` page component | REMOVED PAGE | Duplicate page removed; URL redirects to `/dashboard/social/publisher`. |",
  "| `/dashboard/admin/security` page component | REMOVED PAGE | Orphan Account Settings page removed; URL redirects to Security Overview. |",
);

lines.push("", "## Internal routes", "", "| Route/group | Purpose | Classification |", "|---|---|---|");
for (const internal of INTERNAL_ROUTES) {
  lines.push(`| \`${internal.route}\` | ${internal.purpose} | INTERNAL |`);
}

lines.push(
  "",
  "## Inbox architecture",
  "",
  "- `/dashboard/inbox/unified` is the only provider-facing Inbox page.",
  "- Facebook, Instagram, and LinkedIn legacy Inbox URLs permanently redirect to Unified Inbox.",
  "- Facebook, Instagram, LinkedIn, TikTok, YouTube, Website, and WhatsApp filtering remains inside Unified Inbox.",
  "",
  "## Canonical duplicate resolutions",
  "",
  "| Duplicate/inconsistent destination | Resolution |",
  "|---|---|",
  "| Monitoring / System Health | Canonicalized as **System** at `/monitoring`. |",
  "| Company Settings / Workspace Settings / Account Settings | Canonical workspace configuration is **Company Settings** at `/dashboard/admin/company`. |",
  "| Legacy CEO page | Canonicalized as **Executive** at `/dashboard/executive`. |",
  "| Legacy Publishing page | Canonicalized as **Publishing Scheduler** at `/dashboard/social/publisher`. |",
  "| Provider-specific Inbox pages | Canonicalized as **Unified Inbox** at `/dashboard/inbox/unified`. |",
  "| Facebook Live | Removed without replacement. |",
  "",
  "## Verification",
  "",
  "```powershell",
  "npm.cmd run test:sidebar",
  "npx.cmd tsx --test tests/task77c/*.test.ts",
  "npx.cmd tsc --noEmit",
  "npm.cmd run build",
  "```",
  "",
  "The sidebar test fails on duplicate keys, labels, routes, missing pages, missing permissions, missing breadcrumbs, hardcoded redirect duplication, redirect chains, redirect pages, orphan dashboard pages, placeholder catch-all pages, or reintroduced Facebook Live navigation.",
  "",
);

await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${lines.join("\n")}\n`, "utf8");
console.log(`Generated ${path.relative(process.cwd(), output)} (${NAVIGATION_MODULES.length} modules, ${items.length} sidebar items).`);
