const CACHE_NAME = 'seljuki-encyclopedia-v1';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './articles-data.js',
  './icons/icon-72.png',
  './icons/icon-96.png',
  './icons/icon-128.png',
  './icons/icon-144.png',
  './icons/icon-152.png',
  './icons/icon-192.png',
  './icons/icon-384.png',
  './icons/icon-512.png',
  './articles/arbaa-mahalik.html',
  './articles/article-ardh-najah.html',
  './articles/article-hawariyyun-jahl.html',
  './articles/article-jahl-udhr-v2.html',
  './articles/article-mahkama-ardh-samaa.html',
  './articles/article-min-jubb-ila-arsh.html',
  './articles/article-nafadat-tanzil.html',
  './articles/article-nasij-samaa-qulub.html',
  './articles/article-sawt-yasbiqu-suqut.html',
  './articles/article-yaqub-ruyah.html',
  './articles/article-yasaa-nur.html',
  './articles/article-yaudd-anfas.html',
  './articles/article11-sarab-aldunya.html',
  './articles/hin-yatakallam-alghayb.html',
  './articles/kurds_article.html'
];

// Install: cache the app shell and all articles
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL).catch((err) => {
        console.log('Cache addAll error (some assets may be external/CDN and are skipped gracefully):', err);
        // Try caching one by one so a single failure doesn't block everything
        return Promise.all(
          APP_SHELL.map((url) =>
            cache.add(url).catch((e) => console.log('Failed to cache:', url, e))
          )
        );
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first strategy, fallback to network, then offline fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          // Cache new successful same-origin responses for future offline use
          if (networkResponse && networkResponse.status === 200 && event.request.url.startsWith(self.location.origin)) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback for navigations
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});
