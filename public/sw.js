const CACHE_NAME = "apascentando-filhos-pwa-v6";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/logo.png",
  "/logomaf.png",
  "/logomaf_192.png",
  "/logomaf_512.png",
  "/manifest.json"
];

// Instalação do Service Worker e Precache dos ativos básicos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pré-carregando os ativos da aplicação");
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Removendo cache antigo:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia Stale-While-Revalidate para requisições de assets locais
self.addEventListener("fetch", (event) => {
  // Ignorar requisições que não sejam GET ou sejam para APIs de terceiros (como Firebase/Firestore/Auth)
  if (
    event.request.method !== "GET" ||
    event.request.url.includes("firestore.googleapis.com") ||
    event.request.url.includes("identitytoolkit.googleapis.com") ||
    event.request.url.includes("securetoken.googleapis.com") ||
    event.request.url.includes("/api/")
  ) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // Se a resposta for válida, armazena no cache para próximas visitas
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Fallback offline se a rede falhar e o recurso não estiver no cache
            return cachedResponse;
          });

        // Retorna o cache imediatamente se houver, senão aguarda a rede
        return cachedResponse || fetchPromise;
      });
    })
  );
});
