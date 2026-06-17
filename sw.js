// sw.js — Service Worker minimo per Correlatio Mobile.
//
// Scopo: requisito tecnico per l'installabilità PWA (senza service worker
// registrato, iOS e Android non considerano il sito "installabile" come
// app). La condivisione della chiave licenza tra Safari e la versione
// installata sulla Home (su iOS) è gestita direttamente dalla pagina
// tramite la Cache API — non serve passare dal service worker per questo.

const CACHE_NAME = "correlatio-mobile-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Strategia "network first": prova sempre la rete (i dati devono essere
// freschi), e usa la cache solo come fallback per i file statici
// (HTML/CSS/JS), non per le chiamate API al backend.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Non intercettare mai le chiamate verso il backend Railway:
  // devono sempre andare in rete, mai dalla cache.
  if (url.hostname.includes("railway.app")) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
