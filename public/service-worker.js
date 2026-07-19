/* TASK-64 — Enterprise Service Worker (K2KAI Social Flow)
 * No build step. Hand-written, dependency-free.
 * Strategies:
 *  - static assets      -> Cache First (versioned)
 *  - Next.js _next/static -> Cache First
 *  - images             -> Stale-While-Revalidate
 *  - navigation (HTML)  -> Network First w/ offline fallback
 *  - API requests       -> Network Only (never persist enterprise responses)
 *  - auth/protected     -> Network Only (Security)
 * Automatic versioned cache cleanup. Push + Background Sync stubs ready.
 */
const VERSION = "v1.0.1";
const STATIC_CACHE = `k2kai-static-${VERSION}`;
const RUNTIME_CACHE = `k2kai-runtime-${VERSION}`;
const IMAGE_CACHE = `k2kai-images-${VERSION}`;
const OFFLINE_URL = "/offline";

const PRECACHE = ["/offline", "/dashboard", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((c) => c.addAll(PRECACHE).catch(() => {})),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !k.includes(VERSION)).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

function isAuthOrProtected(url) {
  return url.pathname.startsWith("/api/auth") ||
    url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/api/") && (url.pathname.includes("session"));
}

async function networkFirst(req, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res && res.ok && req.method === "GET") cache.put(req, res.clone());
    return res;
  } catch (e) {
    const cached = await cache.match(req);
    if (cached) return cached;
    if (fallbackUrl) {
      const fb = await cache.match(fallbackUrl);
      if (fb) return fb;
    }
    throw e;
  }
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok && req.method === "GET") cache.put(req, res.clone());
    return res;
  } catch (e) {
    throw e;
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const net = fetch(req).then((res) => {
    if (res && res.ok && req.method === "GET") cache.put(req, res.clone());
    return res;
  }).catch(() => cached);
  return cached || net;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) {
    // cross-origin images (Cloudinary, fbcdn) -> SWR
    if (req.destination === "image") { event.respondWith(staleWhileRevalidate(req, IMAGE_CACHE)); }
    return;
  }

  // Protect auth / sensitive routes: never cache.
  if (isAuthOrProtected(url)) { event.respondWith(fetch(req)); return; }

  // Static build assets
  if (url.pathname.startsWith("/_next/static") || url.pathname.startsWith("/icons/") || url.pathname === "/manifest.webmanifest" || url.pathname.endsWith(".css") || url.pathname.endsWith(".js") || url.pathname.endsWith(".woff2")) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  // Images
  if (req.destination === "image") { event.respondWith(staleWhileRevalidate(req, IMAGE_CACHE)); return; }

  // Enterprise API payloads (activity, session-adjacent data, reporting, etc.)
  // must remain live and must never be served from a stale browser cache.
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(req));
    return;
  }

  // HTML navigations -> network first w/ offline fallback
  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req, RUNTIME_CACHE, OFFLINE_URL));
    return;
  }

  // everything else
  event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
});

// --- Push (Infrastructure Ready) ---
self.addEventListener("push", (event) => {
  let data = { title: "K2KAI Social Flow", body: "Notification", url: "/dashboard" };
  try { if (event.data) data = Object.assign(data, event.data.json()); } catch (e) {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: data.url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/dashboard";
  event.waitUntil(self.clients.matchAll({ type: "window" }).then((cls) => {
    for (const c of cls) if ("focus" in c) return c.focus();
    return self.clients.openWindow(url);
  }));
});

// --- Background Sync (Architecture Ready) ---
self.addEventListener("sync", (event) => {
  if (event.tag === "k2kai-background-sync") {
    // Replay queued mutations stored by the PWA client under IndexedDB "k2kai-sync-queue".
    event.waitUntil(self.clients.matchAll({ type: "window" }).then((cls) => cls.forEach((c) => c.postMessage({ type: "SYNC_REPLAY" }))));
  }
});

// --- Update lifecycle ---
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data && event.data.type === "CACHE_SIZE_REQUEST") {
    caches.keys().then(async (keys) => {
      let total = 0;
      for (const k of keys) { const c = await caches.open(k); const reqs = await c.keys(); total += reqs.length; }
      event.source && event.source.postMessage({ type: "CACHE_SIZE", count: total });
    });
  }
});
