const CACHE_NAME = "pallascout-cache-v1";
const urlsToCache = [
  "/24OredelleGrazie/new.html",
  "/24OredelleGrazie/manifest.json",
  "/24OredelleGrazie/icon-192.png",
  "/24OredelleGrazie/icon-512.png"
];

// Installazione e cache iniziale
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Attivazione: pulizia vecchie cache
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Recupero dalle cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
