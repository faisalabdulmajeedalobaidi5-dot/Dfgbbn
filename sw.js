const CACHE_NAME = 'seljuki-encyclopedia-v2-flat';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './articles-data.js',
  './icon-72.png',
  './icon-96.png',
  './icon-128.png',
  './icon-144.png',
  './icon-152.png',
  './icon-192.png',
  './icon-384.png',
  './icon-512.png',
  './arbaa-mahalik.html',
  './article-ardh-najah.html',
  './article-hawariyyun-jahl.html',
  './article-jahl-udhr-v2.html',
  './article-mahkama-ardh-samaa.html',
  './article-min-jubb-ila-arsh.html',
  './article-nafadat-tanzil.html',
  './article-nasij-samaa-qulub.html',
  './article-sawt-yasbiqu-suqut.html',
  './article-yaqub-ruyah.html',
  './article-yasaa-nur.html',
  './article-yaudd-anfas.html',
  './article11-sarab-aldunya.html',
  './hin-yatakallam-alghayb.html',
  './kurds_article.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL).catch((err) => {
        console.log('Cache addAll error, retrying one by one:', err);
        return Promise.all(
          APP_SHELL.map((url) =>
            cache.add(url).catch((e) => console.log('Failed to cache:', url, e))
          )
        );
      });
    }).then(() => self.skipWaiting())
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
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && event.request.url.startsWith(self.location.origin)) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});
