/* Offline support: cache the app on install, serve from cache first. */
const CACHE = 'quotes-__VERSION__';
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(__FILES__)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n.startsWith('quotes-') && n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
