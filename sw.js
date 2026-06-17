// sw.js — Service Worker per Correlatio Mobile.
//
// Due scopi:
// 1. Requisito tecnico per l'installabilità PWA (senza service worker
//    registrato, iOS e Android non considerano il sito "installabile").
// 2. Su iOS, Safari e la versione "installata sulla Home" non condividono
//    localStorage — ognuna ha la sua memoria separata. Il service worker
//    invece è condiviso tra le due, quindi lo usiamo come "cassetta
//    postale" per passare la chiave licenza dall'uno all'altro.

const CACHE_NAME = "correlatio-mobile-v1";
const CHIAVE_STORE = "correlatio-chiave-store";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Riceve la chiave dalla pagina (via postMessage) e la mette in un posto
// condiviso (Cache Storage), leggibile sia da Safari che dalla versione
// installata sulla Home.
self.addEventListener("message", (event) => {
  if (event.data && event.data.tipo === "SALVA_CHIAVE") {
    const risposta = new Response(event.data.chiave);
    event.waitUntil(
      caches.open(CHIAVE_STORE).then((cache) => cache.put("/chiave", risposta))
    );
  }
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Endpoint "finto" che la pagina chiama per leggere la chiave salvata.
  if (url.pathname === "/__chiave_condivisa__") {
    event.respondWith(
      caches.open(CHIAVE_STORE).then((cache) =>
        cache.match("/chiave").then((risposta) => risposta || new Response(""))
      )
    );
    return;
  }

  // Non intercettare mai le chiamate verso il backend Railway:
  // devono sempre andare in rete, mai dalla cache.
  if (url.hostname.includes("railway.app")) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
