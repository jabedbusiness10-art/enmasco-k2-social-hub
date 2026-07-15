"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { NAV_TARGETS, filterByRole } from "@/lib/search/navigation";
import { COMMANDS } from "@/lib/search/commands";
import { rank, fuzzyScore } from "@/lib/search/engine";
import { loadHistory, pushHistory, loadRecents } from "@/lib/search/history";
import { hasPermission, type UserRole } from "@/services/auth/permissions";
import type { NavTarget } from "@/lib/search/navigation";
import type { Command } from "@/lib/search/commands";

export interface SearchResult {
  id: string;
  label: string;
  sub?: string;
  href?: string;
  category: string;
  kind: "nav" | "command" | "entity";
  icon?: string;
  run?: Command["run"];
}

export function useCommandPalette() {
  const { data: session } = useSession();
  const role = ((session?.user as any)?.role as UserRole) || "VIEWER";
  const hasPerm = (p: any) => hasPermission(role, p);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [recents, setRecents] = useState<any[]>([]);
  const [entities, setEntities] = useState<SearchResult[]>([]);
  const [loadingEntities, setLoadingEntities] = useState(false);

  const allowedNav = filterByRole<NavTarget>(NAV_TARGETS, hasPerm);
  const allowedCmds = filterByRole<Command>(COMMANDS, hasPerm);

  // --- Global keyboard: CTRL/CMD + K, also CTRL+SHIFT+P ---
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && (k === "k" || (k === "p" && e.shiftKey))) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // --- Load client history/recents when opened ---
  useEffect(() => {
    if (open) { setHistory(loadHistory()); setRecents(loadRecents()); }
  }, [open]);

  // --- Debounced entity search via API ---
  useEffect(() => {
    if (!query.trim()) { setEntities([]); return; }
    setLoadingEntities(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { cache: "no-store" });
        const j = await r.json();
        setEntities((j.results ?? []).map((x: any) => ({
          id: x.id, label: x.label, sub: x.sub, href: x.href, category: x.kind, kind: "entity" as const, icon: "Search",
        })));
      } catch { setEntities([]); } finally { setLoadingEntities(false); }
    }, 180);
    return () => clearTimeout(t);
  }, [query]);

  // --- Local (nav + command) ranking ---
  const localResults: SearchResult[] = (() => {
    if (!query.trim()) {
      // empty: show pinned commands + recents
      const pinned = allowedCmds.filter((c) => c.pinned).map((c) => ({ id: c.id, label: c.label, category: c.category, kind: "command" as const, icon: c.icon, run: c.run }));
      const rec = recents.map((r) => ({ id: r.id, label: r.label, sub: r.category, href: r.href, category: r.category, kind: "nav" as const, icon: "Clock" }));
      return [...pinned, ...rec];
    }
    const nav = rank(query, allowedNav, (n) => n.label, (n) => n.keywords ?? []).map((s) => ({ id: s.item.id, label: s.item.label, href: s.item.href, category: s.item.category, kind: "nav" as const, icon: "Compass" }));
    const cmds = rank(query, allowedCmds, (c) => c.label, (c) => c.keywords ?? []).map((s) => ({ id: s.item.id, label: s.item.label, category: s.item.category, kind: "command" as const, icon: s.item.icon, run: s.item.run }));
    return [...nav, ...cmds].sort((a, b) => fuzzyScore(query, b.label) - fuzzyScore(query, a.label));
  })();

  const results = [...localResults, ...entities].slice(0, 40);

  const execute = useCallback((r: SearchResult) => {
    pushHistory(query);
    setOpen(false);
    setQuery("");
    if (r.href) { window.location.href = r.href; return; }
    if (r.run?.kind === "navigate") { window.location.href = r.run.href; return; }
    if (r.run?.kind === "action") {
      window.dispatchEvent(new CustomEvent("k2kai:command", { detail: r.run.id }));
    }
  }, [query]);

  return {
    open, setOpen, query, setQuery, active, setActive,
    results, history, recents, loadingEntities,
    execute, role,
  };
}
