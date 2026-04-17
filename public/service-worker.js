const CACHE_NAME = 'eggcelent-cache-v1';

self.addEventListener('install', (event) => {
  // Activate worker immediately
  event.waitUntil(self.skipWaiting()); 
});

self.addEventListener('activate', event => {
  // Become available to all pages
  event.waitUntil(self.clients.claim()); 
});

self.addEventListener('fetch', event => {
  // We only cache GET requests to our own origin
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Network-first strategy
  event.respondWith(
    (async () => {
      try {
        // Try to fetch from the network
        const networkResponse = await fetch(event.request);
        // If successful, open the cache and store the response
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, networkResponse.clone());
        // Return the network response
        return networkResponse;
      } catch (error) {
        // If the network fails, try to get the response from the cache.
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // If it's not in the cache, the request will fail.
        console.warn('Fetch failed and not in cache:', event.request.url);
        return Response.error();
      }
    })()
  );
});
