// FarmWise Service Worker
// Provides offline capabilities and caching for the PWA

const CACHE_NAME = 'farmwise-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.log('Cache addAll error:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip API requests (they should be handled by the app)
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        // Return offline response for API calls
        return new Response(
          JSON.stringify({ error: 'Offline' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Serve from cache, fallback to network
  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request).then(response => {
        // Cache successful responses
        if (response.ok) {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, clonedResponse);
          });
        }
        return response;
      });
    }).catch(() => {
      // Return offline page if available
      return caches.match('/index.html');
    })
  );
});
