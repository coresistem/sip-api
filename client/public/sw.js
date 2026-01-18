// Minimal Service Worker to satisfy PWA installability requirements
// We use a network-first/network-only strategy to avoid caching issues

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Passthrough - do not cache, just fetch from network
    // This satisfies the "register a service worker with a fetch handler" requirement
    event.respondWith(fetch(event.request));
});
