const CACHE = "gps-khankot-lms-v20";
const SHELL = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// App shell: cache-first (so the app opens with no network).
// Firebase/Firestore requests are left alone — Firestore has its own offline cache.
self.addEventListener("fetch", (e) => {
  const url = e.request.url;
  if (url.includes("firestore.googleapis.com") || url.includes("googleapis.com")) return;
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request).then((res) => {
      const resClone = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, resClone));
      return res;
    }).catch(() => cached))
  );
});
