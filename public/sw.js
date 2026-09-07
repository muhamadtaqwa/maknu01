// public/sw.js

// Cache name
const CACHE_NAME = "maknu01-v1";
const API_CACHE = "maknu01-api-v1";

// Asset yang di-cache saat install
const ASSETS_TO_CACHE = ["/manifest.json", "/images/icon.svg"];

// Install event - cache aset statis
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        }),
    );
    self.skipWaiting();
});

// Activate event - hapus cache lama
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME && name !== API_CACHE)
                    .map((name) => caches.delete(name)),
            );
        }),
    );
    self.clients.claim();
});

// Fetch event - strategi cache
self.addEventListener("fetch", (event) => {
    const { request } = event;

    // Skip non-GET requests
    if (request.method !== "GET") return;

    // Skip navigasi halaman (biarkan network, jangan cache)
    if (request.mode === "navigate") {
        return;
    }

    // Asset statis - Cache First
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((response) => {
                // Cache asset statis
                if (
                    request.url.includes("/build/") ||
                    request.url.includes("/fonts/") ||
                    request.url.includes("/images/")
                ) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            });
        }),
    );
});
