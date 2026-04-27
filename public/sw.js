// AmIFree service worker — Phase 44.
//
// Minimal install-to-home-screen support: a tiny fetch handler that
// serves the cached app shell when offline, plus a network-first
// strategy for everything else so live data wins when online.
//
// Push notifications come in a follow-up phase — this file is a
// foundation, not a full push pipeline.

const CACHE_VERSION = "amifree-v1";

const APP_SHELL_URLS = [
  "/calendar",
  "/manifest.webmanifest",
  "/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      // Activate immediately so the new SW takes over without a
      // hard reload.
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_VERSION)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Only cache GETs; mutations go straight to the network.
  if (req.method !== "GET") return;
  // Skip non-http(s) (chrome-extension://, etc.).
  const url = new URL(req.url);
  if (!url.protocol.startsWith("http")) return;
  // Skip API routes — they should always hit the server.
  if (url.pathname.startsWith("/api/")) return;
  // Skip Supabase + auth callbacks — same reason.
  if (url.hostname.includes("supabase.co")) return;

  event.respondWith(
    fetch(req)
      .then((response) => {
        // Stash a copy of successful navigations and static assets so
        // they're available offline next time.
        if (
          response.ok &&
          (req.mode === "navigate" || /\.(svg|png|jpg|jpeg|webp|css|js)$/i.test(url.pathname))
        ) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(req).then(
          (cached) =>
            cached ||
            // Last-resort offline fallback for navigations.
            (req.mode === "navigate"
              ? caches.match("/calendar")
              : Response.error()),
        ),
      ),
  );
});
