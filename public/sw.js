const CACHE_VERSION = '1769014074609'; // Increment this for each deployment
const CACHE_NAME = `math-invaders-v${CACHE_VERSION}`;
const STATIC_CACHE = `math-invaders-static-v${CACHE_VERSION}`;
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.ts',
  '/src/style.css',
  '/src/pwa-install.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/offline.html'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Failed to cache resources during install:', err);
      })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Fetch event - network-first for app files, cache-first for static assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Only handle http/https requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Update cache with fresh content
          if (response.ok && event.request.url.startsWith('http')) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache))
              .catch(err => console.warn('Failed to cache navigation request:', err));
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache, then offline page
          return caches.match(event.request)
            .then(cachedResponse => cachedResponse || caches.match('/offline.html'));
        })
    );
    return;
  }

  // Network-first for app files (JS, CSS, TS)
  if (url.pathname.includes('/src/') || url.pathname.endsWith('.ts') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok && event.request.url.startsWith('http')) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache))
              .catch(err => console.warn('Failed to cache app file:', err));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // Cache-first for static assets (images, manifest, etc.)
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Only cache HTTP(S) requests
          if (!event.request.url.startsWith('http')) {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(STATIC_CACHE)
            .then(cache => {
              cache.put(event.request, responseToCache);
            })
            .catch(err => console.warn('Failed to cache static asset:', err));

          return response;
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Keep current cache and static cache, delete others
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// Handle messages from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});