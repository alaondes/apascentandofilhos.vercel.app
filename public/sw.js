// Self-destructing Service Worker to clear cached assets and unregister
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      return self.registration.unregister();
    }).then(() => {
      console.log('[PWA] Service Worker self-destructed and cache cleared.');
    })
  );
});
