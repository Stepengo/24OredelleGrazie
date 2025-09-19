const CACHE_NAME = 'torneo-pallascout-v1.0';
const urlsToCache = [
  './torneo_pallascout.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// Installa il service worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        return self.skipWaiting();
      })
  );
});

// Attiva il service worker
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Intercetta le richieste di rete
self.addEventListener('fetch', event => {
  // Solo per richieste GET
  if (event.request.method !== 'GET') return;
  
  // Strategia: Network First (per dati sempre aggiornati)
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Se la richiesta va a buon fine, salva in cache
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // Se la rete non funziona, usa la cache
        return caches.match(event.request)
          .then(response => {
            if (response) {
              console.log('📦 Service Worker: Serving from cache:', event.request.url);
              return response;
            }
            // Se non è in cache e è offline, mostra pagina offline
            return new Response(
              '<html><body><h1>🔴 Offline</h1><p>Connessione internet necessaria per caricare nuove risorse.</p></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          });
      })
  );
});

// Gestisce i messaggi dal client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
