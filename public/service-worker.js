const CACHE_NAME = "eggcelent-cache-v1";

self.addEventListener("install", (event) => {
  // Skip waiting so the new service worker activates immediately.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Claim clients to take control immediately.
  event.waitUntil(self.clients.claim());
  // Clean up old caches.
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  // Check if the request is a navigation to a new page.
  if (event.request.mode === "navigate") {
    // Network-first for navigation.
    event.respondWith(
      (async () => {
        try {
          // First, try to fetch from the network.
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          // If the network fails, try to serve from the cache.
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(event.request);
          // If a cached response is found, return it. Otherwise, this will fail.
          return cachedResponse;
        }
      })()
    );
  } else if (
    // Check if the request is for a static asset (CSS, JS, worker, image).
    event.request.destination === "style" ||
    event.request.destination === "script" ||
    event.request.destination === "worker" ||
    event.request.destination === "image"
  ) {
    // Stale-while-revalidate for static assets.
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchedResponse = fetch(event.request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });

          // Return the cached response if it's available, otherwise wait for the network.
          return cachedResponse || fetchedResponse;
        });
      })
    );
  } else {
    // For other types of requests, just fetch from the network.
    return;
  }
});
