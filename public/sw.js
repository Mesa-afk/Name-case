const CACHE_NAME = 'ttk-offline-v1';
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.webmanifest',
    '/css/style.css',
    '/assets/icons/icon.svg',
    '/assets/panoramas/plaza-lobby.svg',
    '/assets/panoramas/plaza-corridor.svg',
    '/assets/panoramas/plaza-meeting.svg',
    '/assets/panoramas/plaza-congress.svg',
    '/assets/panoramas/expo-hall.svg',
    '/assets/panoramas/hotel-lobby.svg',
    '/assets/panoramas/campus-courtyard.svg',
    '/js/data/i18n.js',
    '/js/data/seed-spaces.js',
    '/js/services/api.js',
    '/js/services/navigation.js',
    '/js/services/panorama.js',
    '/js/services/floorplan-ai.js',
    '/js/services/map-renderer.js',
    '/js/app.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);

    // Для API — сначала сеть, при отсутствии сети — кэш
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(req)
                .then((res) => {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
                    return res;
                })
                .catch(() => caches.match(req))
        );
        return;
    }

    // Для статики и панорам — быстрый ответ из кэша с фоновым обновлением (Stale-While-Revalidate)
    event.respondWith(
        caches.match(req).then((cached) => {
            const networkFetch = fetch(req)
                .then((res) => {
                    if (res && res.status === 200) {
                        const clone = res.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
                    }
                    return res;
                })
                .catch(() => cached);
            return cached || networkFetch;
        })
    );
});
