const CACHE_NAME = 'vibes-cache-v1';
const urlsToCache = [
  `/`,
  `/index.html`,
  `/document.css`,
  `/document.html`,
  `/logo.png`,
  `/manifest.json`,
  `/robots.txt`,
  `/404.html`,
  `/CNAME`,
  `/logo.svg`,
  `/assets/vibes-android-chrome-192x192.png`,
  `/assets/vibes-android-chrome-256x256.png`,
  `/assets/vibes-apple-touch-icon.png`,
  `/assets/vibes-mstile-150x150.png`,
  `/assets/vibes-safari-pinned-tab.svg`,
];

// Install the service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.info('Opened cache');
      return cache.addAll(urlsToCache);
    }),
  );
});

// Cache and return requests
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return the cached response
      if (response) {
        return response;
      }

      // Clone the request to fetch and cache it
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest, { redirect: 'follow' })
        .then((response) => {
          // Check if we received a valid response
          if (
            !response ||
            response.status !== 200 ||
            response.type !== 'basic'
          ) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch((error) => {
          console.error('Fetch failed:', error);
          return new Response('Network error occurred', {
            status: 408,
            statusText: 'Network error',
          });
        });
    }),
  );
});

// Update the service worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
