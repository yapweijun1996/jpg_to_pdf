const CACHE_NAME = "jpg-to-pdf-v5";
const APP_SHELL_PATHS = new Set([
    "/",
    "/index.html",
    "/styles.css",
    "/app.js",
    "/i18n.js",
    "/manifest.json",
    "/icons/icon.svg",
    "/icons/icon-192.png",
    "/icons/icon-512.png",
    "/vendor/pdf-lib.min.js"
]);

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => Promise.all(
                [...APP_SHELL_PATHS].map(path => cache.add(new Request(path, { cache: "reload" })))
            ))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
        await self.clients.claim();
        await notifyClients({ type: "SW_ACTIVE", version: CACHE_NAME });
    })());
});

self.addEventListener("message", event => {
    if (event.data?.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;
    if (!APP_SHELL_PATHS.has(url.pathname)) return;

    event.respondWith(networkFirst(event.request));
});

async function notifyClients(message) {
    const clients = await self.clients.matchAll({ type: "window" });
    clients.forEach(client => client.postMessage(message));
}

async function networkFirst(request) {
    try {
        const response = await fetch(request, { cache: "no-cache" });
        if (response && response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone()).catch(error => console.warn("Cache write failed:", error));
        }
        return response;
    } catch (_error) {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
            return caches.match("/index.html");
        }
        return Response.error();
    }
}
