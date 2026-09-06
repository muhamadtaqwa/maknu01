// public/sw.js

// Cache name
const CACHE_NAME = "al-amanah-v2";
const API_CACHE = "al-amanah-api-v1";

// Asset yang di-cache saat install
const ASSETS_TO_CACHE = ["/manifest.json", "/icon-amanah.png"];

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

    // API Quran - Stale While Revalidate
    if (request.url.includes("api.quran.com")) {
        event.respondWith(
            caches.open(API_CACHE).then((cache) => {
                return fetch(request)
                    .then((response) => {
                        cache.put(request, response.clone());
                        return response;
                    })
                    .catch(() => cache.match(request));
            }),
        );
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

// Push event - terima notifikasi
self.addEventListener("push", (event) => {
    let data = {
        title: "Al-Amanah",
        body: "Notifikasi baru",
        icon: "/icon-amanah.png",
        badge: "/icon-amanah.png",
        url: "/",
        tag: "al-amanah",
        requireInteraction: true,
        vibrate: [200, 100, 200],
    };

    if (event.data) {
        try {
            data = { ...data, ...event.data.json() };
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        vibrate: data.vibrate,
        requireInteraction: data.requireInteraction,
        tag: data.tag,
        data: {
            url: data.url,
        },
        actions: [
            { action: "open", title: "Buka" },
            { action: "close", title: "Tutup" },
        ],
        dir: "auto",
        lang: "id-ID",
        renotify: true,
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    if (event.action === "close") {
        return;
    }

    const url = event.notification.data?.url || "/";

    event.waitUntil(
        clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then((clientList) => {
                // Cek apakah sudah ada window yang terbuka
                for (const client of clientList) {
                    if (client.url.includes(url) && "focus" in client) {
                        return client.focus();
                    }
                }
                // Buka window baru
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            }),
    );
});
