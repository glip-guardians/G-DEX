const VER = 'gdex-v1.0.0';
const PRECACHE = [
  '/', '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png', '/icons/icon-512.png', '/icons/maskable-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VER).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

const SWR_EXT = /\.(?:css|js|woff2?|ttf|otf|png|jpg|jpeg|gif|svg|webp)$/i;
const HTML_REQ = (req) => req.destination === 'document' || (req.mode === 'navigate');

const API_PATTERNS = [
  /api\.0x\.org/i,                 // 0x Quote/Swap
  /thegraph\.com|\.graph\.cdn/i,   // Subgraph
  /alchemy\.com|infura\.io/i       // RPC(프록시를 강력히 권장)
];

function isApi(url) { return API_PATTERNS.some(rx => rx.test(url)); }

self.addEventListener('fetch', e => {
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
        return cached || caches.match('/index.html');
      }
    })());
    return;
  }

  // 정적자원: Stale-While-Revalidate
  if (SWR_EXT.test(url.pathname)) {
    e.respondWith((async () => {
      const cache = await caches.open(VER);
      const cached = await cache.match(req);
      const network = fetch(req).then(res => { cache.put(req, res.clone()); return res; });
      return cached || network;
    })());
    return;
  }

  // API/런타임: SWR + 짧은 TTL (헤더 기반 단순 처리)
  if (isApi(url.href)) {
    e.respondWith((async () => {
      const cache = await caches.open(VER + '-api');
      const cached = await cache.match(req);
      const network = fetch(req).then(res => { cache.put(req, res.clone()); return res; }).catch(()=>null);
      // 우선 캐시 반환하되, 네트워크 오면 다음 요청에 최신 반영
      return cached || network || new Response(JSON.stringify({error:"offline"}), {status: 503});
    })());
    return;
  }

  // 기본: 통과
});
