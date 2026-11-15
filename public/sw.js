const SHELL_CACHE = 'taprd-shell-v1';
const ASSET_CACHE = 'taprd-assets-v1';
const IMAGE_CACHE = 'taprd-images-v1';

const SHELL_URLS = ['/', '/index.html', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS)).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const validCaches = new Set([SHELL_CACHE, ASSET_CACHE, IMAGE_CACHE]);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (!validCaches.has(key)) {
            return caches.delete(key);
          }
          return Promise.resolve();
        })
      )
    )
  );
  self.clients.claim();
});

function isBypassHost(url) {
  const host = url.hostname.toLowerCase();
  return (
    host.includes('googleapis.com') && !host.includes('firebasestorage.googleapis.com') ||
    host.includes('firebaseio.com') ||
    host.includes('firebaseapp.com') ||
    host.includes('vercel-insights.com') ||
    host.includes('vercel-scripts.com')
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Nunca cachear endpoints de API ni tráfico dinámico de Firestore/Auth
  if (url.pathname.startsWith('/api/') || isBypassHost(url)) {
    return;
  }

  // 1. Navegación SPA (/p/:slug, etc.): Network-First con fallback a /index.html cacheado
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put('/index.html', copy)).catch(() => undefined);
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match('/index.html');
          return cached || caches.match('/');
        })
    );
    return;
  }

  // 2. Imágenes (logos, fotos de servicios): Network-First con respaldo offline en Cache Storage
  if (request.destination === 'image') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && (response.ok || response.type === 'opaque')) {
            const copy = response.clone();
            caches.open(IMAGE_CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 3. Assets estáticos locales (/assets/*.js, *.css, fuentes): Stale-While-Revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(ASSET_CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
            }
            return response;
          })
          .catch(() => cached);

        return cached || networkFetch;
      })
    );
  }
});
