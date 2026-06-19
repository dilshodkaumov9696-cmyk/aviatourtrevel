// Service worker для офлайн-режима Aviator.
// Стратегия: навигации — network-first (свежий HTML, офлайн → кеш-оболочка);
// статика — stale-while-revalidate. HMR и API не кешируем.
const CACHE = "aviator-v1";
const APP_SHELL = ["/", "/offline.html", "/icon.svg", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Не вмешиваемся в HMR дев-сервера и в API.
  if (url.pathname.startsWith("/api") || url.pathname.includes("hot-update") || url.pathname.startsWith("/_next/webpack")) {
    return;
  }

  // Навигации — network-first с откатом на офлайн-страницу.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("/offline.html"))),
    );
    return;
  }

  // Прочая статика — stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
