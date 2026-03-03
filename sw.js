// No-op service worker - deliberately empty to replace the old caching SW
// When the browser fetches this file, it will see no fetch handler and stop intercepting requests
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(names => Promise.all(names.map(name => caches.delete(name))))
            .then(() => self.clients.claim())
    );
});
