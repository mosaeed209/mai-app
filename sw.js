/* mَعي — offline cache. Version changes whenever index.html changes. */
const V = 'mai-e8478dd0e7';
const CORE = ['./', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
async function handle(req) {
  const c = await caches.open(V);
  let r = await c.match(req, { ignoreSearch: true });
  if (r) return r;
  if (req.mode === 'navigate') { r = await c.match('./index.html'); if (r) return r; }
  const res = await fetch(req);
  if (res && res.ok && new URL(req.url).origin === self.location.origin) { try { c.put(req, res.clone()); } catch (e) {} }
  return res;
}
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(handle(e.request));
});
