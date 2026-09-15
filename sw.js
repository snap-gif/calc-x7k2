const CACHE = 'uscita-v5';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
// Rete prima; se la rete manca o il sito non risponde correttamente (es. 404
// perché il sito è stato ritirato) si usa la copia salvata sul telefono.
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia));
        return r;
      }
      return caches.match(e.request).then(c => c || caches.match('index.html')).then(c => c || r);
    }).catch(() => caches.match(e.request).then(c => c || caches.match('index.html')))
  );
});
