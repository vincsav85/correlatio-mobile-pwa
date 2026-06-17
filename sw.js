// sw.js — Service Worker minimo per Correlatio Mobile.
//
// Lo scopo principale di questo file è soddisfare un requisito tecnico:
// senza un service worker registrato, iOS e Android non considerano il
// sito "installabile" come app. Per ora non serve funzionalità offline
// avanzata (i dati arrivano comunque dal backend, non c'è da mostrare
// nulla senza connessione) — teniamolo semplice e onesto su questo.

const CACHE_NAME = "correlatio-mobile-v1";

self.addEventListener("install", (event) => {
  // Attiva subito questa versione, senza aspettare la chiusura di vecchie tab.
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
