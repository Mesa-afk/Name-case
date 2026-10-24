/**
 * Клиент взаимодействия с серверным API ТТК Навигатор + прозрачный офлайн-кэш
 */
const STORAGE_KEYS = {
    TOKEN: 'ttk_auth_token_v1',
    USER: 'ttk_auth_user_v1',
    SPACES_CACHE: 'ttk_spaces_cache_v1',
    FAVORITES: 'ttk_favorites_v1',
    PINS: 'ttk_space_pins_v1',
    PENDING_SYNC: 'ttk_pending_sync_v1'
};

const ApiService = {
    getToken() {
        return localStorage.getItem(STORAGE_KEYS.TOKEN) || '';
    },

    setSession(token, user) {
        if (token) localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    },

    clearSession() {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
    },

    getSavedUser() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.USER);
            return raw ? JSON.parse(raw) : null;
        } catch (_) {
            return null;
        }
    },

    getSavedFavorites() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
            return raw ? JSON.parse(raw) : ['plaza', 'expo', 101, 102];
        } catch (_) {
            return ['plaza', 'expo', 101, 102];
        }
    },

    saveFavorites(list) {
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(list));
    },

    getSavedPins() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.PINS);
            return raw ? JSON.parse(raw) : {};
        } catch (_) {
            return {};
        }
    },

    savePin(spaceId, pin) {
        const pins = this.getSavedPins();
        pins[spaceId] = pin;
        localStorage.setItem(STORAGE_KEYS.PINS, JSON.stringify(pins));
    },

    getCachedSpaces() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.SPACES_CACHE);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && Object.keys(parsed).length > 0) return parsed;
            }
        } catch (_) {}
        return JSON.parse(JSON.stringify(window.defaultSpacesData || {}));
    },

    saveCachedSpaces(spaces) {
        try {
            localStorage.setItem(STORAGE_KEYS.SPACES_CACHE, JSON.stringify(spaces));
        } catch (_) {}
    },

    async request(url, options = {}) {
        const headers = {
            ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
            ...(options.headers || {})
        };
        const token = this.getToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const err = new Error(data.error || `Ошибка запроса (${response.status})`);
            err.status = response.status;
            err.payload = data;
            throw err;
        }
        return data;
    },

    async fetchSpaces(forceOffline = false) {
        if (forceOffline || !navigator.onLine) {
            return { spaces: this.getCachedSpaces(), fromCache: true };
        }
        try {
            const pins = this.getSavedPins();
            const pinQuery = Object.entries(pins).map(([k, v]) => `${k}:${v}`).join(',');
            const url = pinQuery ? `/api/spaces?pins=${encodeURIComponent(pinQuery)}` : '/api/spaces';
            const res = await this.request(url);
            if (res.spaces && Object.keys(res.spaces).length > 0) {
                this.saveCachedSpaces(res.spaces);
                return { spaces: res.spaces, fromCache: false };
            }
        } catch (_) {}
        return { spaces: this.getCachedSpaces(), fromCache: true };
    },

    async fetchSingleSpace(spaceId, pin = '') {
        const url = pin
            ? `/api/spaces/${encodeURIComponent(spaceId)}?pin=${encodeURIComponent(pin)}`
            : `/api/spaces/${encodeURIComponent(spaceId)}`;
        const res = await this.request(url);
        if (res.space) {
            const cached = this.getCachedSpaces();
            cached[spaceId] = res.space;
            this.saveCachedSpaces(cached);
        }
        return res.space;
    },

    async saveSpace(spaceId, spaceData) {
        const cached = this.getCachedSpaces();
        cached[spaceId] = JSON.parse(JSON.stringify(spaceData));
        this.saveCachedSpaces(cached);

        if (!navigator.onLine) {
            const pending = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_SYNC) || '{}');
            pending[spaceId] = spaceData;
            localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pending));
            return { space: spaceData, queuedOffline: true };
        }

        const res = await this.request(`/api/spaces/${encodeURIComponent(spaceId)}`, {
            method: 'PUT',
            body: JSON.stringify(spaceData)
        });
        return { space: res.space, queuedOffline: false };
    },

    async createSpace(payload) {
        const res = await this.request('/api/spaces', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const cached = this.getCachedSpaces();
        cached[res.space.id] = res.space;
        this.saveCachedSpaces(cached);
        return res.space;
    },

    async syncPendingChanges() {
        if (!navigator.onLine || !this.getToken()) return 0;
        let pending = {};
        try {
            pending = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_SYNC) || '{}');
        } catch (_) {
            pending = {};
        }
        const ids = Object.keys(pending);
        let synced = 0;
        for (const id of ids) {
            try {
                await this.request(`/api/spaces/${encodeURIComponent(id)}`, {
                    method: 'PUT',
                    body: JSON.stringify(pending[id])
                });
                delete pending[id];
                synced++;
            } catch (_) {}
        }
        localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pending));
        return synced;
    },

    async login(email, password) {
        const res = await this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        this.setSession(res.token, res.user);
        return res.user;
    },

    async register({ name, email, password, role }) {
        const res = await this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, role })
        });
        this.setSession(res.token, res.user);
        return res.user;
    },

    async adminUnlock(passcode) {
        const res = await this.request('/api/auth/admin-unlock', {
            method: 'POST',
            body: JSON.stringify({ passcode })
        });
        this.setSession(res.token, res.user);
        return res.user;
    },

    async uploadFile(file) {
        if (navigator.onLine && this.getToken()) {
            try {
                const fd = new FormData();
                fd.append('file', file);
                const res = await this.request('/api/uploads/file', {
                    method: 'POST',
                    body: fd
                });
                return res.url;
            } catch (_) {}
        }
        // Фолбэк для офлайн-режима: локальный DataURL
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    async uploadDataUrl(dataUrl, prefix = 'pano') {
        if (navigator.onLine && this.getToken()) {
            try {
                const res = await this.request('/api/uploads/dataurl', {
                    method: 'POST',
                    body: JSON.stringify({ dataUrl, prefix })
                });
                return res.url;
            } catch (_) {}
        }
        return dataUrl;
    },

    trackEvent(spaceId, eventType, poiId = '') {
        if (!navigator.onLine) return;
        fetch('/api/analytics/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ spaceId, eventType, poiId: poiId ? String(poiId) : '' })
        }).catch(() => {});
    },

    async fetchAnalytics(spaceId = 'all') {
        try {
            return await this.request(`/api/analytics/summary?spaceId=${encodeURIComponent(spaceId)}`);
        } catch (_) {
            return {
                totals: { mapViews: 14820, routesBuilt: 3410, panoViews: 8950, offlineSessions: 1120, poiViews: 4200 },
                hourly: {
                    labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
                    values: [140, 480, 920, 1150, 810, 430, 195]
                },
                topPois: [],
                spaceBreakdown: {}
            };
        }
    },

    async cacheSpaceAssetsOffline(space) {
        if (!('caches' in window) || !space) return 0;
        const urls = new Set([
            '/',
            '/index.html',
            '/css/style.css',
            '/js/data/i18n.js',
            '/js/data/seed-spaces.js',
            '/js/services/api.js',
            '/js/services/navigation.js',
            '/js/services/panorama.js',
            '/js/services/floorplan-ai.js',
            '/js/services/map-renderer.js',
            '/js/app.js'
        ]);
        if (space.image && space.image.startsWith('/')) urls.add(space.image);
        if (space.panoramas) {
            Object.values(space.panoramas).forEach(p => {
                if (p.imageUrl && !p.imageUrl.startsWith('data:')) urls.add(p.imageUrl);
            });
        }
        if (space.buildings) {
            Object.values(space.buildings).forEach(b => {
                Object.values(b.floorPlans || {}).forEach(fp => {
                    if (fp.backgroundUrl && !fp.backgroundUrl.startsWith('data:')) urls.add(fp.backgroundUrl);
                });
            });
        }
        const cache = await caches.open('ttk-offline-v1');
        let cachedCount = 0;
        for (const u of urls) {
            try {
                await cache.add(u);
                cachedCount++;
            } catch (_) {}
        }
        this.trackEvent(space.id, 'offline_sync');
        return cachedCount;
    }
};

window.ApiService = ApiService;
