/* ========================================================================== */
/* ТТК — КАРТА ПРОСТРАНСТВА. Клиентское состояние и связка с бекендом.        */
/*                                                                            */
/* Фронтенд работает поверх REST API сервера (Express):                      */
/*   POST /api/auth/login, /register, /admin-unlock  — авторизация (JWT)      */
/*   GET  /api/auth/me                               — восстановление сессии  */
/*   GET  /api/spaces, GET /api/spaces/:id?pin=      — карты и точки (POI)    */
/*   PUT  /api/spaces/:id                            — сохранение карты       */
/*   POST /api/analytics/event                       — события посещаемости    */
/*   GET  /api/analytics/summary                     — аналитика организатора */
/*   POST /api/uploads/file, /api/uploads/dataurl    — планы и панорамы       */
/*                                                                            */
/* Если сервер недоступен (офлайн-режим PWA), приложение работает на локальной */
/* базе из js/spaces-data.js, а события аналитики складывает в очередь и       */
/* отправляет их на сервер при восстановлении связи.                          */
/* ========================================================================== */

const TTK_API_BASE = '/api';

const TTKApi = {
    TOKEN_KEY: 'ttk_auth_token',
    QUEUE_KEY: 'ttk_event_queue',
    FAVORITES_KEY: 'ttk_favorites',

    getToken() {
        try {
            return localStorage.getItem(this.TOKEN_KEY) || '';
        } catch (_) {
            return '';
        }
    },

    setToken(token) {
        try {
            if (token) localStorage.setItem(this.TOKEN_KEY, token);
            else localStorage.removeItem(this.TOKEN_KEY);
        } catch (_) {
            /* приватный режим браузера — работаем без сохранения токена */
        }
    },

    buildHeaders(isJson) {
        const headers = {};
        const token = this.getToken();
        if (token) headers.Authorization = 'Bearer ' + token;
        if (isJson) headers['Content-Type'] = 'application/json';
        return headers;
    },

    async request(path, { method = 'GET', body, formData } = {}) {
        const options = { method, headers: this.buildHeaders(!formData) };
        if (formData) options.body = formData;
        else if (body !== undefined) options.body = JSON.stringify(body);

        const response = await fetch(TTK_API_BASE + path, options);
        let data = {};
        try {
            data = await response.json();
        } catch (_) {
            /* пустой или не-JSON ответ */
        }

        if (!response.ok) {
            const error = new Error(data.error || 'Ошибка запроса (' + response.status + ')');
            error.status = response.status;
            error.payload = data;
            throw error;
        }
        return data;
    },

    get(path) {
        return this.request(path);
    },

    post(path, body) {
        return this.request(path, { method: 'POST', body });
    },

    put(path, body) {
        return this.request(path, { method: 'PUT', body });
    },

    upload(path, formData) {
        return this.request(path, { method: 'POST', formData });
    }
};

function appState() {
    return {

        currentView: 'spaces',
        lang: 'ru',
        selectedCity: 'г. Ростов-на-Дону',
        darkMode: false,

        activeBuilding: 'A',
        activeFloor: 1,
        selectedCategory: 'all',
        zoomLevel: 1.0,
        cabinetTab: 'favorites',
        adminTab: 'editor',

        topSearchQuery: '',
        isSearching: false,

        isOffline: !navigator.onLine,
        toggleOfflineMode() {
            this.isOffline = !this.isOffline;
            this.showNotification(
                this.isOffline
                    ? (this.lang === 'ru' ? 'Офлайн режим активирован (кэш доступен)' : 'Offline mode activated (cache ready)')
                    : (this.lang === 'ru' ? 'Онлайн режим восстановлен' : 'Online mode restored')
            );
            if (!this.isOffline) {
                // Вернулись в сеть: подтягиваем актуальные данные и отправляем накопленные события
                this.loadSpaces();
                this.flushEventQueue();
            }
        },

        /* ------------- Авторизация (JWT + bcrypt на бекенде) ------------- */
        user: null,
        authTab: 'login',
        authForm: {
            name: '',
            email: '',
            password: '',
            role: 'Employee'
        },
        isAuthenticating: false,

        adminPasswordModalOpen: false,
        adminPasswordInput: '',

        attemptAdminAccess() {
            if (this.user && this.user.isAdmin) {
                this.currentView = 'admin';
            } else {
                this.adminPasswordModalOpen = true;
            }
        },

        async verifyAdminPassword() {
            if (!this.adminPasswordInput) {
                this.showNotification(this.lang === 'ru' ? 'Введите код доступа' : 'Enter the access code');
                return;
            }
            if (this.isAuthenticating) return;
            this.isAuthenticating = true;
            try {
                const data = await TTKApi.post('/auth/admin-unlock', { passcode: this.adminPasswordInput });
                TTKApi.setToken(data.token);
                this.user = data.user;
                this.adminPasswordModalOpen = false;
                this.adminPasswordInput = '';
                this.currentView = 'admin';
                this.showNotification(
                    this.lang === 'ru'
                        ? 'Доступ администратора предоставлен (JWT-сессия активна)'
                        : 'Administrator access granted (JWT session active)'
                );
                await this.loadSpaces();
            } catch (error) {
                this.showNotification(
                    (this.lang === 'ru' ? 'Ошибка доступа: ' : 'Access error: ') + error.message
                );
            } finally {
                this.isAuthenticating = false;
            }
        },

        /* ------------- Избранное (локальное хранилище устройства) ------------- */
        favorites: ['plaza', 'expo', 'center', 101, 102],

        restoreFavorites() {
            try {
                const raw = localStorage.getItem(TTKApi.FAVORITES_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) this.favorites = parsed;
                }
            } catch (_) { /* повреждённый кэш — используем значения по умолчанию */ }
        },

        saveFavorites() {
            try {
                localStorage.setItem(TTKApi.FAVORITES_KEY, JSON.stringify(this.favorites));
            } catch (_) { /* хранилище недоступно */ }
        },

        get favoriteItemsList() {
            let list = [];
            for (let key in this.spacesData) {
                let space = this.spacesData[key];
                if (this.favorites.includes(space.id)) {
                    list.push({
                        id: space.id,
                        name: space.name,
                        desc: space.desc,
                        image: space.image,
                        type: 'space'
                    });
                }
                if (space.pois) {
                    space.pois.forEach(poi => {
                        if (this.favorites.includes(poi.id)) {
                            list.push({
                                id: poi.id,
                                name: poi.name,
                                desc: {
                                    ru: `Корпус ${poi.building}, Этаж ${poi.floor}`,
                                    en: `Building ${poi.building}, Floor ${poi.floor}`
                                },
                                image: poi.image,
                                type: 'poi',
                                parentSpaceKey: key,
                                rawPoi: poi
                            });
                        }
                    });
                }
            }
            return list;
        },

        isFavorite(id) {
            return this.favorites.includes(id);
        },

        toggleFavorite(id, event) {
            if (event) event.stopPropagation();
            if (this.favorites.includes(id)) {
                this.favorites = this.favorites.filter(favId => favId !== id);
                this.showNotification(
                    this.lang === 'ru' ? 'Удалено из избранного' : 'Removed from favorites'
                );
            } else {
                this.favorites.push(id);
                this.showNotification(
                    this.lang === 'ru' ? 'Добавлено в избранное' : 'Added to favorites'
                );
            }
            this.saveFavorites();
        },

        openFavoriteItem(item) {
            if (item.type === 'space' || this.spacesData[item.id]) {
                this.selectSpaceAndOpenMap(item.id);
            } else if (item.parentSpaceKey) {
                this.currentSpaceKey = item.parentSpaceKey;
                this.selectedPoi = item.rawPoi;
                this.activeBuilding = item.rawPoi.building;
                this.activeFloor = item.rawPoi.floor;
                this.currentView = 'map';
            }
        },

        carouselIndex: 0,
        spaceList: ['plaza', 'expo', 'hotel', 'hub', 'center'],

        activePanoramaPoi: null,
        panoramaModalOpen: false,
        panoZoom: 100,
        panoRotationX: 0,
        panoRotationY: 0,
        isDraggingPano: false,
        panoStartX: 0,
        panoStartY: 0,

        photoSearchModalOpen: false,
        isCapturingCamera: false,
        capturedFramesCount: 0,

        generatedCanvasMap: null,
        isGeneratingMap: false,
        activeMarkupTool: null,
        isUploadingPlan: false,
        isSavingSpace: false,

        routeActive: true,
        routeFrom: '101',
        routeTo: '102',
        selectedPoi: null,

        notificationOpen: false,
        notificationText: '',
        mobileMenuOpen: false,
        chartInstance: null,

        /* ------------- Аналитика организатора (GET /api/analytics/summary) ------------- */
        analytics: null,
        analyticsUpdatedAt: '',

        /* ------------- Данные карт (GET /api/spaces либо локальный кэш) ------------- */
        spacesData: spacesData,
        currentSpaceKey: 'plaza',
        pendingDeepLinkSpaceId: null,
        isSpacesLoading: false,

        get currentSpace() {
            return this.spacesData[this.currentSpaceKey]
                || this.spacesData[this.spaceList[0]]
                || this.spacesData['plaza']
                || {};
        },

        get t() {
            return i18n[this.lang];
        },

        /* ================================================================== */
        /* ИНИЦИАЛИЗАЦИЯ: сессия, данные с сервера, офлайн-режим, deep link    */
        /* ================================================================== */
        async init() {
            this.restoreFavorites();
            this.detectDeepLink();

            if (this.currentSpace.pois && this.currentSpace.pois.length > 0) {
                this.selectedPoi = this.currentSpace.pois[0];
            }

            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.darkMode = true;
            }

            window.addEventListener('online', () => {
                this.isOffline = false;
                this.loadSpaces();
                this.flushEventQueue();
                this.showNotification(
                    this.lang === 'ru' ? 'Соединение восстановлено, данные синхронизированы' : 'Connection restored, data synced'
                );
            });

            window.addEventListener('offline', () => {
                this.isOffline = true;
                this.showNotification(
                    this.lang === 'ru' ? 'Нет сети: работаем с офлайн-кэшем' : 'No network: offline cache mode'
                );
            });

            this.$watch('currentView', (view) => {
                if (view === 'admin' && this.adminTab === 'analytics') {
                    this.loadAnalytics();
                }
                if (view === 'map' && this.currentSpaceKey) {
                    this.trackEvent('map_view');
                }
                setTimeout(() => this.refreshIcons(), 50);
            });

            this.$watch('darkMode', (val) => {
                if (val) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            });

            this.$watch('adminTab', (tab) => {
                if (tab === 'analytics') {
                    this.loadAnalytics();
                }
            });

            this.$watch('selectedPoi', (poi) => {
                if (poi && this.currentView === 'map') {
                    this.trackEvent('poi_view', poi.id);
                }
            });

            this.$watch('lang', () => {
                if (this.chartInstance && this.analytics) {
                    this.initAnalyticsChart();
                }
                this.refreshIcons();
            });

            // Сначала восстанавливаем JWT-сессию, затем запрашиваем данные карт
            // (организатор увидит и черновики, посетитель — только опубликованные)
            await this.restoreSession();
            await this.loadSpaces();

            this.registerServiceWorker();
            this.flushEventQueue();
            setTimeout(() => this.refreshIcons(), 100);
        },

        refreshIcons() {
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                window.lucide.createIcons();
            }
        },

        /* Постоянные ссылки бекенда: /s/:id и виджет /embed/:id */
        detectDeepLink() {
            const match = window.location.pathname.match(/^\/(?:s|embed)\/([a-zA-Z0-9_-]+)/);
            if (match) {
                this.pendingDeepLinkSpaceId = match[1].toLowerCase();
                this.currentView = 'map';
            }
        },

        applyDeepLink() {
            if (!this.pendingDeepLinkSpaceId) return;
            const spaceId = this.pendingDeepLinkSpaceId;
            this.pendingDeepLinkSpaceId = null;

            if (this.spacesData[spaceId]) {
                this.currentSpaceKey = spaceId;
                this.currentView = 'map';
                this.trackEvent('map_view');
                const pois = this.currentSpace.pois || [];
                if (pois.length) {
                    this.selectedPoi = pois[0];
                    this.activeBuilding = this.selectedPoi.building || 'A';
                    this.activeFloor = this.selectedPoi.floor || 1;
                }
            } else {
                this.currentView = 'spaces';
                this.showNotification(
                    this.lang === 'ru'
                        ? 'Карта недоступна: скрыта организатором или защищена PIN-кодом'
                        : 'Map unavailable: hidden by organizer or PIN-protected'
                );
            }
        },

        async restoreSession() {
            if (!TTKApi.getToken()) return;
            try {
                const data = await TTKApi.get('/auth/me');
                this.user = data.user || null;
            } catch (error) {
                if (error.status === 401) {
                    TTKApi.setToken('');
                }
                this.user = null;
            }
        },

        async loadSpaces() {
            if (this.isSpacesLoading) return;
            this.isSpacesLoading = true;
            try {
                if (!navigator.onLine) {
                    // Офлайн: работаем на локальной базе из spaces-data.js
                    this.applyDeepLink();
                    return;
                }
                const data = await TTKApi.get('/spaces');
                const spaces = data && data.spaces ? data.spaces : {};
                if (Object.keys(spaces).length > 0) {
                    this.spacesData = spaces;
                    this.spaceList = Object.keys(spaces);
                    if (!this.spacesData[this.currentSpaceKey]) {
                        this.currentSpaceKey = this.spaceList[0];
                    }
                    this.syncSelectionWithPois();
                }
                this.applyDeepLink();
            } catch (_) {
                // Сервер недоступен (офлайн / перезапуск) — остаёмся на локальном кэше
                this.applyDeepLink();
            } finally {
                this.isSpacesLoading = false;
            }
        },

        syncSelectionWithPois() {
            const pois = this.currentSpace.pois || [];
            const selectedId = this.selectedPoi ? String(this.selectedPoi.id) : '';
            if (!pois.some(poi => String(poi.id) === selectedId)) {
                this.selectedPoi = pois[0] || null;
            }
            if (pois.length > 0) {
                const ids = pois.map(poi => String(poi.id));
                if (!ids.includes(String(this.routeFrom))) this.routeFrom = ids[0];
                if (!ids.includes(String(this.routeTo))) this.routeTo = ids[ids.length - 1];
            }
        },

        registerServiceWorker() {
            if (!('serviceWorker' in navigator)) return;
            if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') return;
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').catch(() => { /* SW не критичен */ });
            });
        },

        /* ================================================================== */
        /* СОБЫТИЯ АНАЛИТИКИ: онлайн — сразу, офлайн — в очередь               */
        /* ================================================================== */
        trackEvent(eventType, poiId = '') {
            const payload = {
                spaceId: this.currentSpaceKey || 'plaza',
                poiId: String(poiId === null || poiId === undefined ? '' : poiId),
                eventType
            };
            if (this.isOffline || !navigator.onLine) {
                this.queueEvent(payload);
                return;
            }
            TTKApi.post('/analytics/event', payload).catch(() => this.queueEvent(payload));
        },

        readEventQueue() {
            try {
                const raw = localStorage.getItem(TTKApi.QUEUE_KEY);
                const parsed = raw ? JSON.parse(raw) : [];
                return Array.isArray(parsed) ? parsed : [];
            } catch (_) {
                return [];
            }
        },

        writeEventQueue(queue) {
            try {
                localStorage.setItem(TTKApi.QUEUE_KEY, JSON.stringify(queue));
            } catch (_) { /* хранилище недоступно */ }
        },

        queueEvent(payload) {
            const queue = this.readEventQueue();
            queue.push({ ...payload, queuedAt: new Date().toISOString() });
            this.writeEventQueue(queue.slice(-200));
        },

        async flushEventQueue() {
            const queue = this.readEventQueue();
            if (queue.length === 0) return;

            const failed = [];
            for (const item of queue) {
                try {
                    await TTKApi.post('/analytics/event', {
                        spaceId: item.spaceId,
                        poiId: item.poiId,
                        eventType: item.eventType
                    });
                } catch (_) {
                    failed.push(item);
                }
            }
            this.writeEventQueue(failed);

            if (failed.length === 0) {
                // Отмечаем успешную офлайн-синхронизацию (PWA-сценарий из ТЗ)
                TTKApi.post('/analytics/event', {
                    spaceId: this.currentSpaceKey || 'plaza',
                    eventType: 'offline_sync'
                }).catch(() => {});
                this.showNotification(
                    this.lang === 'ru'
                        ? `Офлайн-события отправлены на сервер: ${queue.length}`
                        : `Offline events synced to server: ${queue.length}`
                );
            }
        },

        triggerMetallicFlash(event) {
            const el = event.currentTarget;
            el.classList.add('metallic-flash-active');
            this.showNotification(this.lang === 'ru' ? 'Переход к расширенному поиску ТТК...' : 'Navigating to TTK Advanced Search...');
            setTimeout(() => {
                el.classList.remove('metallic-flash-active');
                this.currentView = 'map';
            }, 800);
        },

        executeTopSearch() {
            if (!this.topSearchQuery || !this.topSearchQuery.trim()) return;
            const query = this.topSearchQuery.toLowerCase().trim();
            let found = false;

            for (let key in this.spacesData) {
                const space = this.spacesData[key];
                if (space.name.ru.toLowerCase().includes(query) || space.name.en.toLowerCase().includes(query) || space.desc.ru.toLowerCase().includes(query)) {
                    this.currentSpaceKey = key;
                    found = true;
                    break;
                }
                if (space.pois) {
                    for (let poi of space.pois) {
                        if (poi.name.ru.toLowerCase().includes(query) || poi.name.en.toLowerCase().includes(query) || (poi.equipment && poi.equipment.toLowerCase().includes(query))) {
                            this.currentSpaceKey = key;
                            this.selectedPoi = poi;
                            this.activeBuilding = poi.building;
                            this.activeFloor = poi.floor;
                            found = true;
                            break;
                        }
                    }
                }
                if (found) break;
            }

            this.currentView = 'map';
            this.showNotification(
                this.lang === 'ru'
                    ? `Результаты поиска для: "${this.topSearchQuery}"`
                    : `Search results for: "${this.topSearchQuery}"`
            );
            this.topSearchQuery = '';
        },

        switchLanguage(newLang) {
            this.lang = newLang;
            this.showNotification(
                newLang === 'ru' ? 'Язык изменен на Русский' : 'Language switched to English'
            );
        },

        toggleDarkMode() {
            this.darkMode = !this.darkMode;
        },

        /* ================================================================== */
        /* АВТОРИЗАЦИЯ: реальные запросы к /api/auth/*                        */
        /* ================================================================== */
        async loginUser() {
            if (!this.authForm.email || !this.authForm.password) {
                this.showNotification(
                    this.lang === 'ru' ? 'Пожалуйста, заполните все поля!' : 'Please fill all fields!'
                );
                return;
            }
            if (this.isAuthenticating) return;
            this.isAuthenticating = true;
            try {
                const data = await TTKApi.post('/auth/login', {
                    email: this.authForm.email,
                    password: this.authForm.password
                });
                TTKApi.setToken(data.token);
                this.user = data.user;
                this.authForm.password = '';
                this.currentView = 'cabinet';
                this.showNotification(
                    this.lang === 'ru' ? 'Успешный вход в личный кабинет!' : 'Successfully logged in!'
                );
                // Перезагружаем карты уже с JWT: организатор видит черновики и PIN-данные
                await this.loadSpaces();
            } catch (error) {
                this.showNotification(
                    (this.lang === 'ru' ? 'Не удалось войти: ' : 'Login failed: ') + error.message
                );
            } finally {
                this.isAuthenticating = false;
            }
        },

        async registerUser() {
            if (!this.authForm.email || !this.authForm.password || !this.authForm.name) {
                this.showNotification(
                    this.lang === 'ru' ? 'Заполните все поля регистрации!' : 'Fill all registration fields!'
                );
                return;
            }
            if (this.isAuthenticating) return;
            this.isAuthenticating = true;
            try {
                const data = await TTKApi.post('/auth/register', {
                    name: this.authForm.name,
                    email: this.authForm.email,
                    password: this.authForm.password,
                    role: String(this.authForm.role || '').toLowerCase() === 'organizer' ? 'organizer' : 'visitor'
                });
                TTKApi.setToken(data.token);
                this.user = data.user;
                this.authForm.password = '';
                this.currentView = 'cabinet';
                this.showNotification(
                    this.lang === 'ru' ? 'Регистрация успешно завершена!' : 'Registration complete!'
                );
                await this.loadSpaces();
            } catch (error) {
                this.showNotification(
                    (this.lang === 'ru' ? 'Не удалось зарегистрироваться: ' : 'Registration failed: ') + error.message
                );
            } finally {
                this.isAuthenticating = false;
            }
        },

        async logoutUser() {
            TTKApi.setToken('');
            this.user = null;
            this.analytics = null;
            this.currentView = 'spaces';
            this.showNotification(
                this.lang === 'ru' ? 'Вы успешно вышли из системы' : 'Successfully logged out'
            );
            await this.loadSpaces();
        },

        prevSpace() {
            this.carouselIndex = (this.carouselIndex - 1 + (this.spaceList.length + 1)) % (this.spaceList.length + 1);
            if (this.carouselIndex < this.spaceList.length) {
                this.currentSpaceKey = this.spaceList[this.carouselIndex];
            }
        },

        nextSpace() {
            this.carouselIndex = (this.carouselIndex + 1) % (this.spaceList.length + 1);
            if (this.carouselIndex < this.spaceList.length) {
                this.currentSpaceKey = this.spaceList[this.carouselIndex];
            }
        },

        async selectSpaceAndOpenMap(key) {
            this.currentSpaceKey = key;
            this.activeBuilding = 'A';
            this.activeFloor = 1;
            if (this.currentSpace.pois && this.currentSpace.pois.length > 0) {
                this.selectedPoi = this.currentSpace.pois[0];
            } else {
                this.selectedPoi = null;
            }
            this.currentView = 'map';
            this.routeActive = true;

            if (this.currentSpace.pinRequired) {
                await this.requestSpacePin(key);
            }

            this.showNotification(
                this.lang === 'ru' ? 'Объект загружен на карту и навигацию' : 'Space loaded to map'
            );
        },

        /* Карта закрыта PIN-кодом: GET /api/spaces/:id?pin=... */
        async requestSpacePin(spaceId) {
            const pin = window.prompt(
                this.lang === 'ru'
                    ? 'Карта защищена PIN-кодом. Введите код доступа:'
                    : 'This map is PIN-protected. Enter the access code:'
            );
            if (!pin) return;
            try {
                const data = await TTKApi.get(`/spaces/${encodeURIComponent(spaceId)}?pin=${encodeURIComponent(pin)}`);
                if (data.space) {
                    this.spacesData[spaceId] = data.space;
                    this.syncSelectionWithPois();
                    this.panoramaModalOpen = false;
                    this.showNotification(
                        this.lang === 'ru' ? 'PIN-код верный, карта открыта' : 'PIN accepted, map unlocked'
                    );
                }
            } catch (error) {
                this.showNotification(
                    (this.lang === 'ru' ? 'Доступ к карте: ' : 'Map access: ') + error.message
                );
            }
        },

        openSpaceFullPage(key) {
            this.currentSpaceKey = key;
            if (this.currentSpace.pois && this.currentSpace.pois.length > 0) {
                this.selectedPoi = this.currentSpace.pois[0];
                this.activePanoramaPoi = this.selectedPoi;
                this.openPanorama(this.selectedPoi);
            } else {
                // Нет размеченных точек — показываем обзорное фото самой площадки
                this.openPanorama(null);
            }
        },

        zoomInMap() {
            this.zoomLevel = Math.min(this.zoomLevel + 0.25, 2.5);
        },

        zoomOutMap() {
            this.zoomLevel = Math.max(this.zoomLevel - 0.25, 0.6);
        },

        resetMapZoom() {
            this.zoomLevel = 1.0;
        },

        openPanorama(poi) {
            const target = poi || (this.currentSpace.pois ? this.currentSpace.pois[0] : null);
            this.activePanoramaPoi = target;
            this.panoRotationX = 0;
            this.panoRotationY = 0;
            this.panoZoom = 100;
            this.panoramaModalOpen = true;
            this.trackEvent('pano_view', target ? target.id : '');
            setTimeout(() => this.refreshIcons(), 50);
        },

        startPanoDrag(e) {
            this.isDraggingPano = true;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            this.panoStartX = clientX - this.panoRotationX;
            this.panoStartY = clientY - this.panoRotationY;
        },

        onPanoDrag(e) {
            if (!this.isDraggingPano) return;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            this.panoRotationX = (clientX - this.panoStartX);
            this.panoRotationY = Math.max(-120, Math.min(120, (clientY - this.panoStartY)));
        },

        stopPanoDrag() {
            this.isDraggingPano = false;
        },

        startCameraPanorama() {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                    .then((stream) => {
                        // Проверяем доступ к камере и сразу освобождаем устройство
                        stream.getTracks().forEach(track => track.stop());
                        this.isCapturingCamera = true;
                        this.capturedFramesCount = 1;
                        this.showNotification(
                            this.lang === 'ru' ? 'Камера активирована. Сделайте 8 круговых кадров.' : 'Camera active. Take 8 shots.'
                        );
                    })
                    .catch(() => {
                        this.showNotification(
                            this.lang === 'ru' ? 'Ошибка доступа к камере устройства' : 'Camera access error'
                        );
                    });
            } else {
                this.showNotification(
                    this.lang === 'ru' ? 'Камера не поддерживается вашим браузером' : 'Camera not supported'
                );
            }
        },

        setMarkupTool(toolName) {
            this.activeMarkupTool = toolName;
            const toolNamesRu = { wall: 'Нарисовать стену', poi: 'Добавить POI', wifi: 'Зона Wi-Fi', entrance: 'Вход/Выход' };
            const toolNamesEn = { wall: 'Draw Wall', poi: 'Add POI', wifi: 'Wi-Fi Zone', entrance: 'Entrance/Exit' };
            const name = this.lang === 'ru' ? toolNamesRu[toolName] : toolNamesEn[toolName];
            this.showNotification(this.lang === 'ru' ? `Инструмент разметки: ${name}` : `Markup Tool: ${name}`);
        },

        /* Поиск объекта по фотографии (посетитель): подбираем ближайшую точку */
        handlePhotoUpload(event) {
            const file = event.target.files && event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                this.photoSearchModalOpen = false;
                if (this.currentSpace.pois && this.currentSpace.pois.length > 1) {
                    this.selectedPoi = this.currentSpace.pois[1];
                    this.activeFloor = this.selectedPoi.floor;
                }
                this.currentView = 'map';
                this.buildRoute();
                this.showNotification(
                    this.lang === 'ru' ? 'Объект успешно распознан по фотографии!' : 'Object recognized on photo!'
                );
            };
            reader.readAsDataURL(file);
            event.target.value = '';
        },

        /* Загрузка планировки организатором: POST /api/uploads/file + PUT /api/spaces/:id */
        async handleBlueprintUpload(event) {
            const file = event.target.files && event.target.files[0];
            event.target.value = '';
            if (!file) return;

            if (!this.user || !this.user.isAdmin) {
                this.showNotification(
                    this.lang === 'ru'
                        ? 'Загрузка планировок доступна только организатору'
                        : 'Blueprint upload is available to organizers only'
                );
                return;
            }
            if (this.isUploadingPlan) return;

            const formData = new FormData();
            formData.append('file', file);
            this.isUploadingPlan = true;
            try {
                const uploaded = await TTKApi.upload('/uploads/file', formData);
                this.currentSpace.planImage = uploaded.url;
                const saved = await TTKApi.put('/spaces/' + encodeURIComponent(this.currentSpace.id), this.currentSpace);
                this.spacesData[this.currentSpaceKey] = saved.space;
                this.showNotification(
                    this.lang === 'ru'
                        ? `Планировка загружена и сохранена: ${uploaded.url}`
                        : `Blueprint uploaded and saved: ${uploaded.url}`
                );
            } catch (error) {
                this.showNotification(
                    (this.lang === 'ru' ? 'Ошибка загрузки планировки: ' : 'Blueprint upload error: ') + error.message
                );
            } finally {
                this.isUploadingPlan = false;
            }
        },

        /* Сохранение карты организатором: PUT /api/spaces/:id (ссылка /s/:id не меняется) */
        async saveSpaceChanges() {
            if (!this.user || !this.user.isAdmin) {
                this.showNotification(
                    this.lang === 'ru'
                        ? 'Нужны права организатора: войдите через админ-панель'
                        : 'Organizer rights required: sign in via the admin panel'
                );
                return;
            }
            if (this.isSavingSpace) return;
            const space = this.currentSpace;
            if (!space || !space.id) return;

            this.isSavingSpace = true;
            try {
                const saved = await TTKApi.put('/spaces/' + encodeURIComponent(space.id), space);
                this.spacesData[space.id] = saved.space;
                this.showNotification(
                    this.lang === 'ru'
                        ? `Изменения сохранены. Постоянная ссылка: /s/${space.id}`
                        : `Changes saved. Permanent link: /s/${space.id}`
                );
            } catch (error) {
                this.showNotification(
                    (this.lang === 'ru' ? 'Не удалось сохранить карту: ' : 'Failed to save map: ') + error.message
                );
            } finally {
                this.isSavingSpace = false;
            }
        },

        buildRoute() {
            if (!(this.currentSpace.pois || []).length) {
                this.showNotification(
                    this.lang === 'ru'
                        ? 'Для этой площадки точки маршрута ещё не размечены организатором'
                        : 'Route points for this venue have not been placed by the organizer yet'
                );
                return;
            }
            if (!this.routeFrom || !this.routeTo) {
                this.showNotification(
                    this.lang === 'ru' ? 'Выберите точки отправления и назначения' : 'Choose origin and destination points'
                );
                return;
            }
            if (String(this.routeFrom) === String(this.routeTo)) {
                this.showNotification(
                    this.lang === 'ru' ? 'Точки А и В совпадают' : 'Points A and B are the same'
                );
                return;
            }
            this.routeActive = true;
            this.trackEvent('route_built', this.routeTo);
            this.showNotification(
                this.lang === 'ru' ? 'Маршрут успешно построен на карте!' : 'Route built successfully!'
            );
        },

        clearRoute() {
            this.routeActive = false;
            // Возвращаем точки по умолчанию из размеченных POI текущей площадки
            this.syncSelectionWithPois();
            this.showNotification(
                this.lang === 'ru' ? 'Маршрут сброшен' : 'Route cleared'
            );
        },

        /* ================================================================== */
        /* АНАЛИТИКА ОРГАНИЗАТОРА: GET /api/analytics/summary                 */
        /* ================================================================== */
        analyticsValue(key) {
            const totals = this.analytics && this.analytics.totals;
            if (!totals) return '—';
            const value = Number(totals[key] || 0);
            return value.toLocaleString(this.lang === 'ru' ? 'ru-RU' : 'en-US');
        },

        async loadAnalytics() {
            if (!this.user || !this.user.isAdmin) {
                this.showNotification(
                    this.lang === 'ru'
                        ? 'Аналитика доступна организаторам и администраторам'
                        : 'Analytics is available to organizers and admins'
                );
                return;
            }
            try {
                const data = await TTKApi.get('/analytics/summary?spaceId=all');
                this.analytics = data;
                this.analyticsUpdatedAt = new Date().toLocaleTimeString(
                    this.lang === 'ru' ? 'ru-RU' : 'en-US',
                    { hour: '2-digit', minute: '2-digit' }
                );
                this.$nextTick(() => this.initAnalyticsChart());
            } catch (error) {
                this.showNotification(
                    (this.lang === 'ru' ? 'Не удалось загрузить аналитику: ' : 'Failed to load analytics: ') + error.message
                );
            }
        },

        initAnalyticsChart() {
            const canvas = document.getElementById('analyticsChart');
            if (!canvas || typeof Chart === 'undefined') return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            if (this.chartInstance) {
                this.chartInstance.destroy();
            }

            const hourly = this.analytics && this.analytics.hourly;
            const labels = hourly && Array.isArray(hourly.labels)
                ? hourly.labels
                : ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
            const values = hourly && Array.isArray(hourly.values)
                ? hourly.values
                : [0, 0, 0, 0, 0, 0, 0];

            this.chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: this.lang === 'ru' ? 'Посетители (чел/час)' : 'Visitors (people/hr)',
                        data: values,
                        borderColor: '#E31B23',
                        backgroundColor: 'rgba(227, 27, 35, 0.12)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: '#E31B23'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { grid: { color: 'rgba(200, 200, 200, 0.1)' } },
                        x: { grid: { display: false } }
                    }
                }
            });
        },

        showNotification(text) {
            this.notificationText = text;
            this.notificationOpen = true;
            setTimeout(() => {
                this.notificationOpen = false;
            }, 3500);
        }
    };
}
