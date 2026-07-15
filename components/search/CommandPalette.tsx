"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCommandPalette, type SearchResult } from "@/hooks/useCommandPalette";
import { SearchBar } from "./SearchBar";
import { SearchResults } from "./SearchResults";
import { RecentSearches } from "./RecentSearches";
import { QuickActions } from "./QuickActions";

export default function CommandPalette() {
  const pal = useCommandPalette();
  const inputRef = useRef<HTMLInputElement>(null);
  const { open, setOpen, query, setQuery, active, setActive, results, history, loadingEntities, execute } = pal;

  // Reset active index when results change.
  useEffect(() => { setActive(0); }, [results, setActive]);
  // Focus input on open.
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 20); }, [open]);

  // Handle real client actions dispatched via custom event.
  useEffect(() => {
    const onCmd = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      handleAction(id);
    };
    window.addEventListener("k2kai:command", onCmd as EventListener);
    return () => window.removeEventListener("k2kai:command", onCmd as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAction(id: string) {
    switch (id) {
      case "logout": window.location.href = "/api/auth/signout"; break;
      case "upload-media": window.location.href = "/dashboard/media?view=assets&upload=1"; break;
      case "create-collection": window.location.href = "/dashboard/media?view=collections&create=1"; break;
      case "create-tag": window.location.href = "/dashboard/media?view=tags&create=1"; break;
      case "refresh-analytics": window.location.href = "/dashboard/insights/analytics?refresh=1"; break;
      case "restart-queue":
        fetch("/api/queue/pause", { method: "POST" }).then(() => fetch("/api/queue/resume", { method: "POST" })).finally(() => (window.location.href = "/dashboard/queue/health"));
        break;
      default: break;
    }
    setOpen(false);
    setQuery("");
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); const r = results[active]; if (r) execute(r); }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={() => setOpen(false)}
        >
          {/* Animated backdrop blur */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={onKeyDown}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0f]/90 shadow-2xl backdrop-blur-2xl"
          >
            <SearchBar value={query} onChange={setQuery} inputRef={inputRef} />
            <div className="max-h-[60vh] overflow-y-auto">
              {!query.trim() && (
                <>
                  <RecentSearches items={history} onPick={setQuery} />
                  <QuickActions
                    items={results.filter((r) => r.kind === "command" || r.kind === "nav")}
                    activeIndex={active}
                    onHover={setActive}
                    query={query}
                    onRun={execute}
                  />
                </>
              )}
              <SearchResults
                results={results}
                query={query}
                activeIndex={active}
                onHover={setActive}
                loading={loadingEntities}
              />
            </div>
            <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-[10px] text-white/35">
              <span>↑↓ navigate · ↵ select · esc close</span>
              <span>K2KAI Command</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
