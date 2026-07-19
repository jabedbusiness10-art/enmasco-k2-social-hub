"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

type ConnState = "online" | "offline" | "slow" | "reconnecting";

interface PWAState {
  online: boolean;
  conn: ConnState;
  installed: boolean;
  canInstall: boolean;
  updateAvailable: boolean;
  swActive: boolean;
  lastSync: number | null;
  promptInstall: () => void;
  applyUpdate: () => void;
  cacheSize: number | null;
}

const Ctx = createContext<PWAState | null>(null);

export function usePWA() {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePWA must be used within PWAProvider");
  return v;
}

export function PWAProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(true);
  const [conn, setConn] = useState<ConnState>("online");
  const [installed, setInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [swActive, setSwActive] = useState(false);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [cacheSize, setCacheSize] = useState<number | null>(null);

  // install prompt
  const deferredPrompt = typeof window !== "undefined" ? (window as any).__deferredPWA : null;
  const promptInstall = useCallback(() => {
    const dp = (window as any).__deferredPWA;
    if (dp) { dp.prompt(); dp.userChoice.finally(() => { (window as any).__deferredPWA = null; setCanInstall(false); }); }
  }, []);

  const applyUpdate = useCallback(() => {
    const r = (window as any).__pwaRegistration;
    if (r && r.waiting) { r.waiting.postMessage({ type: "SKIP_WAITING" }); r.waiting.addEventListener("statechange", () => { if ((r.waiting as any).state === "activated") location.reload(); }); }
    else location.reload();
  }, []);

  useEffect(() => {
    setInstalled(window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true);
    setOnline(navigator.onLine);
    setConn(navigator.onLine ? "online" : "offline");

    // A service worker must never control the Next.js development server.
    // Cached dev chunks keep obsolete client code alive across HMR/restarts and
    // surface misleading fetch/auth errors from bundles that no longer exist.
    if (process.env.NODE_ENV !== "production") {
      void (async () => {
        if (!("serviceWorker" in navigator)) return;
        const registrations = await navigator.serviceWorker.getRegistrations();
        const hadWorker = Boolean(navigator.serviceWorker.controller) || registrations.length > 0;
        await Promise.all(registrations.map((registration) => registration.unregister()));
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.filter((key) => key.startsWith("k2kai-")).map((key) => caches.delete(key)));
        }

        const reloadKey = "k2kai-dev-sw-cleanup";
        if (hadWorker && sessionStorage.getItem(reloadKey) !== "done") {
          sessionStorage.setItem(reloadKey, "done");
          window.location.reload();
        } else if (!hadWorker) {
          sessionStorage.removeItem(reloadKey);
        }
      })().catch((error) => console.warn("[PWA] Dev cache cleanup failed", error));
      return;
    }

    let onLoad: () => void = () => {};

    const onOnline = () => { setOnline(true); setConn("reconnecting"); setLastSync(Date.now()); setTimeout(() => setConn("online"), 1200); };
    const onOffline = () => { setOnline(false); setConn("offline"); };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    // install prompt capture
    const beforeInstall = (e: any) => { e.preventDefault(); (window as any).__deferredPWA = e; setCanInstall(true); };
    window.addEventListener("beforeinstallprompt", beforeInstall);
    window.addEventListener("appinstalled", () => { setInstalled(true); setCanInstall(false); });

    // SW registration
    if ("serviceWorker" in navigator) {
      onLoad = async () => {
        try {
          const reg = await navigator.serviceWorker.register("/service-worker.js", { scope: "/" });
          (window as any).__pwaRegistration = reg;
          setSwActive(true);
          if (reg.waiting) setUpdateAvailable(true);
          reg.addEventListener("updatefound", () => {
            const n = reg.installing;
            n?.addEventListener("statechange", () => { if ((n as any).state === "installed" && navigator.serviceWorker.controller) setUpdateAvailable(true); });
          });
        } catch (e) { console.error("[PWA] SW register failed", e); }
      };
      if (document.readyState === "complete") void onLoad();
      else window.addEventListener("load", onLoad);
    }

    // slow network detection
    let slowTimer: any;
    const onSlow = () => { setConn("slow"); clearTimeout(slowTimer); slowTimer = setTimeout(() => setConn(navigator.onLine ? "online" : "offline"), 4000); };
    window.addEventListener("slowlink" as any, onSlow);

    // periodic cache size probe
    const probe = () => {
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: "CACHE_SIZE_REQUEST" });
      }
    };
    navigator.serviceWorker?.addEventListener?.("message", (e: any) => { if (e.data?.type === "CACHE_SIZE") setCacheSize(e.data.count); });
    const probeInt = setInterval(probe, 15000);
    probe();

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("beforeinstallprompt", beforeInstall);
      window.removeEventListener("load", onLoad);
      window.removeEventListener("slowlink" as any, onSlow);
      clearInterval(probeInt);
    };
  }, []);

  const value: PWAState = { online, conn, installed, canInstall, updateAvailable, swActive, lastSync, promptInstall, applyUpdate, cacheSize };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
