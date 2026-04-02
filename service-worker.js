const CACHE_NAME = 'jpg-to-pdf-v2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/i18n.js',
    '/manifest.json',
    '/icons/icon.svg',
    '/vendor/pdf-lib.min.js'
];

// Install: cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// Fetch: cache-first for app assets
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cached => cached || fetch(event.request).then(response => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(event.request, clone))
                        .catch(err => console.warn('Cache write failed:', err));
                }
                return response;
            }))
    );
});
