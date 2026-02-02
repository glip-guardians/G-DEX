const VER = 'gdex-v1.0.1';
const PRECACHE = [
  './', './index.html',
  './manifest.webmanifest',
  './G_DEX_icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(VER);
    await Promise.allSettled(PRECACHE.map((u) => cache.add(u)));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== VER && k !== (VER + '-api')).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

const SWR_EXT = /\.(?:css|js|woff2?|ttf|otf|png|jpg|jpeg|gif|svg|webp)$/i;
const HTML_REQ = (req) => req.destination === 'document' || req.mode === 'navigate';

const API_PATTERNS = [
  /api\.0x\.org/i,
  /thegraph\.com|\.graph\.cdn/i,
  /alchemy\.com|infura\.io/i
];
function isApi(url) { return API_PATTERNS.some(rx => rx.test(url)); }

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // HTML: Network First (+ fallback)
  if (HTML_REQ(req)) {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(VER);
        cache.put(req, fresh.clone());
        return fresh;
      } catch {
        const cached = await caches.match(req);
        return cached || caches.match('./index.html');
      }
    })());
    return;
  }

  // Static: SWR
  if (SWR_EXT.test(url.pathname)) {
    e.respondWith((async () => {
      const cache = await caches.open(VER);
      const cached = await cache.match(req);
      const network = fetch(req).then(res => { cache.put(req, res.clone()); return res; });
      return cached || network;
    })());
    return;
  }

  // API: SWR
  if (isApi(url.href)) {
    e.respondWith((async () => {
      const cache = await caches.open(VER + '-api');
      const cached = await cache.match(req);
      const network = fetch(req)
        .then(res => { cache.put(req, res.clone()); return res; })
        .catch(() => null);
      return cached || network || new Response(JSON.stringify({ error: "offline" }), { status: 503 });
    })());
    return;
  }
});
