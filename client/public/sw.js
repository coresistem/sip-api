const CACHE_NAME = 'sip-v1-cache';
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/logo.png',
    '/logo-maskable.png',
];

// List of file extensions to cache with "Cache First" strategy (images, fonts)
const STATIC_ASSETS_EXT = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.otf'];

// Install event - Pre-cache critical assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(PRECACHE_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate event - Cleanup old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Helper to check if a URL is a static asset
const isStaticAsset = (url) => {
    return STATIC_ASSETS_EXT.some(ext => url.endsWith(ext)) || url.includes('/assets/');
};

// Fetch event handler
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-HTTP(S), API, HMR, and Chrome extension requests
    if (
        !url.protocol.startsWith('http') ||
        url.pathname.startsWith('/api/') ||
        url.search.includes('token=') || // Vite HMR token
        url.origin.includes('chrome-extension')
    ) {
        return;
    }

    // 1. Navigation requests - Network First, Fallback to Cache (index.html)
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => {
                return caches.match('/index.html') || caches.match('/');
            })
        );
        return;
    }

    // 2. Static Assets (Images, Fonts) - Cache First
    if (isStaticAsset(request.url)) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) return cachedResponse;

                return fetch(request)
                    .then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, responseToCache);
                            });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // Silent failure for static assets
                        return null;
                    });
            })
        );
        return;
    }

    // 3. App Assets (JS, CSS) - Stale-While-Revalidate
    if (request.destination === 'script' || request.destination === 'style') {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                const fetchPromise = fetch(request)
                    .then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, responseToCache);
                            });
                        }
                        return networkResponse;
                    })
                    .catch(() => cachedResponse); // Silence error, use cache if available

                return cachedResponse || fetchPromise;
            })
        );
        return;
    }

    // 4. Default: Network Only with error handling
    // This part fixes the "Failed to fetch" uncaught error
    event.respondWith(
        fetch(request).catch(err => {
            // Silently handle failed fetches (e.g. offline or aborted)
            // This prevents "Uncaught (in promise) TypeError: Failed to fetch"
            console.debug('[SW] Fetch failed for:', request.url, err);
            return new Response(null, { status: 408, statusText: 'Network Error' });
        })
    );
});
