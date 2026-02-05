self.addEventListener('install', () => {
    console.log('[SW] Kill-switch installed. Force skipping waiting.');
    self.skipWaiting();
});

self.addEventListener('activate', () => {
    console.log('[SW] Kill-switch activated. Unregistering and reloading clients...');
    self.registration.unregister()
        .then(() => self.clients.matchAll())
        .then((clients) => {
            clients.forEach(client => {
                if (client.url && 'navigate' in client) {
                    client.navigate(client.url);
                }
            });
        });
});

// Intercept nothing, let everything fall through to network
self.addEventListener('fetch', (event) => {
    return;
});
