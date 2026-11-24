const CACHE_NAME = 'wealth-os-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only intercept GET requests, ignore POST/PUT/DELETE
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Allow Next.js server actions, APIs and dev-server HMR to bypass cache
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/webpack-hmr') ||
    url.pathname.startsWith('/_next/data/')
  ) {
    return;
  }

  // Network-first strategy for dynamic pages with offline cache fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic' &&
          (url.pathname.startsWith('/icons/') || url.pathname.endsWith('.png') || url.pathname.endsWith('.css') || url.pathname.endsWith('.js'))
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});

