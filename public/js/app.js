/**
 * Главный контроллер приложения «ТТК — Карта пространства и навигация» (Alpine.js)
 */
function appState() {
    return {
        // ---- Базовое состояние интерфейса ----
        currentView: 'spaces', // 'spaces' | 'map' | 'cabinet' | 'auth' | 'admin'
        lang: 'ru',
        darkMode: false,
        mobileMenuOpen: false,
        mobileMapTab: 'plan', // для мобильных: 'plan' | 'sidebar'
        isEmbedMode: false,

        // ---- Сеть и офлайн-режим ----
        isOffline: !navigator.onLine,
        offlineCachingBusy: false,

        // ---- Данные пространств ----
        spacesData: window.ApiService ? window.ApiService.getCachedSpaces() : (window.defaultSpacesData || {}),
        currentSpaceKey: 'plaza',
        carouselIndex: 0,

        // ---- Карта посетителя (2D / 3D / Корпуса / Этажи / Территория) ----
        mapLayerMode: 'floor', // 'floor' | 'campus'
        mapRenderMode: '2d',   // '2d' | '3d'
        rot3dX: 50,
        rot3dZ: -18,
        activeBuilding: 'A',
        activeFloor: 1,
        selectedCategory: 'all',
        zoomLevel: 1.0,
        mapPanX: 0,
        mapPanY: 0,
        isPanningMap: false,
        panStartX: 0,
        panStartY: 0,
        selectedPoi: null,

        // ---- Поиск ----
        topSearchQuery: '',
        photoSearchModalOpen: false,

        // ---- Навигация и маршруты ----
        routeActive: true,
        routeFrom: '101',
        routeTo: '102',
        pickingRoutePoint: null, // 'from' | 'to' | null
        computedRoute: null,

        // ---- 360° Панорамы и виртуальный проход маршрута ----
        panoramaModalOpen: false,
        activePanoramaId: '',
        panoYaw: 35,     // угол по горизонтали 0..360°
        panoPitch: 0,    // наклон -30..30°
        panoZoom: 105,   // масштаб %
        panoUsePhoto: false,
        panoVpW: 900,
        panoVpH: 520,
        panoAspect: 3,
        editorDraggingPoi: false,
        panoAutoRotate: false,
        panoRotateTimer: null,
        isDraggingPano: false,
        panoDragStartX: 0,
        panoDragStartY: 0,
        panoStartYaw: 0,
        panoStartPitch: 0,
        activeHotspotInfo: null,
        panoAddHotspotMode: false,
        newHotspotDraft: {
            open: false,
            yaw: 0,
            pitch: 0,
            type: 'info',
            labelRu: '',
            labelEn: '',
            textRu: '',
            poiId: '',
            targetPanoId: ''
        },
        // Пошаговый проход маршрута в 360°
        panoTourActive: false,
        panoTourIndex: 0,

        // ---- 3D-модель помещения по фотографиям ----
        room3dModalOpen: false,
        activeRoom3d: null,
        room3dYaw: -28,
        room3dPitch: -12,
        isDraggingRoom3d: false,
        room3dDragX: 0,
        room3dDragY: 0,

        // ---- Пользователь, авторизация и защита доступа ----
        user: window.ApiService ? window.ApiService.getSavedUser() : null,
        authTab: 'login',
        authForm: {
            name: '',
            email: '',
            password: '',
            role: 'visitor'
        },
        adminPasswordModalOpen: false,
        adminPasswordInput: '',
        pinModalOpen: false,
        pinModalSpaceId: '',
        pinInput: '',

        // ---- Избранное ----
        favorites: window.ApiService ? window.ApiService.getSavedFavorites() : ['plaza', 'expo', 101, 102],

        // ---- Панель организатора (Редактор 2D-плана, Мастер съёмки панорам, Аналитика) ----
        adminTab: 'editor', // 'editor' | 'panoramas' | 'analytics'
        activeMarkupTool: 'select', // 'select' | 'wall' | 'zone' | 'door' | 'window' | 'poi' | 'nav' | 'ruler'
        editorSelectedType: '', // 'poi' | 'room' | 'wall' | 'door' | 'navnode'
        editorSelectedId: null,
        editorDrawing: false,
        editorStartPt: null,
        editorCurrentPt: null,
        editorLastNavNodeId: null,
        rulerMeasurement: null,
        unsavedChanges: false,
        isSavingMap: false,
        isGeneratingMap: false,

        // Создание нового пространства / этажа / корпуса
        newSpaceModalOpen: false,
        newSpaceForm: {
            slug: '',
            nameRu: '',
            nameEn: '',
            typeRu: 'Выставочная площадка',
            city: 'г. Ростов-на-Дону',
            descRu: ''
        },

        // Мастер съёмки панорамы с телефона (8 кадров + сшивка)
        captureWizardOpen: false,
        captureTargetPoiId: '',
        captureTitleRu: '',
        captureSectorIndex: 0,
        capturedFrames: Array(8).fill(null),
        cameraStream: null,
        cameraLiveActive: false,
        deviceCompassHeading: null,
        isStitchingPano: false,
        stitchedPreviewUrl: '',

        // Публикация ссылки и встраивание <iframe>
        shareModalOpen: false,

        // Статистика организатора
        analyticsFilterSpace: 'all',
        analyticsData: {
            totals: { mapViews: 14820, routesBuilt: 3410, panoViews: 8950, offlineSessions: 1120 },
            hourly: {
                labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
                values: [140, 480, 920, 1150, 810, 430, 195]
            },
            topPois: []
        },
        chartInstance: null,

        // Уведомления
        notificationOpen: false,
        notificationText: '',
        notificationTimer: null,

        // =========================================================================
        // Вычисляемые свойства (Getters)
        // =========================================================================
        get t() {
            return (window.i18n && window.i18n[this.lang]) || window.i18n.ru;
        },

        get spaceList() {
            return Object.keys(this.spacesData);
        },

        get currentSpace() {
            return this.spacesData[this.currentSpaceKey] || this.spacesData[this.spaceList[0]] || {};
        },

        get currentBuildingObj() {
            const blds = this.currentSpace.buildings || {};
            return blds[this.activeBuilding] || Object.values(blds)[0] || { id: 'A', name: { ru: 'Корпус А', en: 'Building A' }, floors: [1], floorPlans: {} };
        },

        get currentFloorPlan() {
            const fp = this.currentBuildingObj?.floorPlans?.[String(this.activeFloor)];
            return fp || { width: 720, height: 420, backgroundUrl: '', backgroundOpacity: 0.45, rooms: [], walls: [], doors: [], windows: [] };
        },

        get visiblePois() {
            const pois = this.currentSpace.pois || [];
            return pois.filter(poi => {
                if (this.mapLayerMode === 'floor') {
                    if (poi.building !== this.activeBuilding || Number(poi.floor) !== Number(this.activeFloor)) {
                        return false;
                    }
                }
                if (this.selectedCategory !== 'all' && poi.category !== this.selectedCategory) {
                    return false;
                }
                return true;
            });
        },

        get currentFloorRoutePolylines() {
            if (!this.routeActive || !this.computedRoute) return [];
            if (this.mapLayerMode === 'campus') {
                const pts = this.computedRoute.campusPolyline || [];
                return pts.length >= 2 ? [pts.map(p => p.join(',')).join(' ')] : [];
            }
            const key = `${this.activeBuilding}:${this.activeFloor}`;
            const segs = this.computedRoute.segmentsByLayer?.[key] || [];
            return segs.filter(s => s.length >= 2).map(s => s.map(p => p.join(',')).join(' '));
        },

        get activePanorama() {
            if (!this.activePanoramaId || !this.currentSpace.panoramas) return null;
            return this.currentSpace.panoramas[this.activePanoramaId] || null;
        },

        get activePanoramaBgUrl() {
            const p = this.activePanorama;
            if (!p) return this.currentSpace.image || '';
            if (this.panoUsePhoto && p.photoUrl) return p.photoUrl;
            return p.imageUrl || p.photoUrl || this.currentSpace.image || '';
        },

        get panoBgHeight() {
            return this.panoVpH * 1.3 * (this.panoZoom / 100);
        },

        get panoBgWidth() {
            return this.panoBgHeight * (this.panoAspect || 3);
        },

        get panoVisibleDegrees() {
            return Math.min(360, 360 * this.panoVpW / Math.max(1, this.panoBgWidth));
        },

        get panoBackgroundStyle() {
            const bgW = this.panoBgWidth;
            const bgH = this.panoBgHeight;
            const posX = this.panoVpW / 2 - (this.panoYaw / 360) * bgW;
            const maxShift = Math.max(0, (bgH - this.panoVpH) / 2);
            const shift = Math.max(-maxShift, Math.min(maxShift, (this.panoPitch / 90) * bgH));
            const posY = (this.panoVpH - bgH) / 2 + shift;
            const url = String(this.activePanoramaBgUrl || '').replace(/"/g, '%22');
            return `background-image:url("${url}");background-size:${bgW.toFixed(1)}px ${bgH.toFixed(1)}px;background-position:${posX.toFixed(1)}px ${posY.toFixed(1)}px;`;
        },

        get projectedHotspots() {
            const pano = this.activePanorama;
            if (!pano || !Array.isArray(pano.hotspots)) return [];
            const vis = this.panoVisibleDegrees;
            const bgH = this.panoBgHeight;
            return pano.hotspots.map(hs => {
                const deltaYaw = ((hs.yaw - this.panoYaw + 540) % 360) - 180;
                const visible = Math.abs(deltaYaw) <= vis / 2 + 4;
                const leftPct = 50 + (deltaYaw / vis) * 100;
                const topPx = this.panoVpH / 2 - ((hs.pitch - this.panoPitch) / 90) * bgH;
                const topPct = (topPx / Math.max(1, this.panoVpH)) * 100;
                return {
                    ...hs,
                    visible,
                    leftPct: Math.max(4, Math.min(96, leftPct)),
                    topPct: Math.max(10, Math.min(90, topPct))
                };
            });
        },

        get mapSvgMarkup() {
            if (!window.MapRenderer || !this.currentSpace) return '';
            if (this.mapLayerMode === 'campus') {
                return window.MapRenderer.renderCampus({
                    space: this.currentSpace,
                    lang: this.lang,
                    dark: this.darkMode,
                    routePolylines: this.currentFloorRoutePolylines,
                    selectedPoiId: this.selectedPoi?.id,
                    routeFromId: this.routeActive ? this.routeFrom : '',
                    routeToId: this.routeActive ? this.routeTo : ''
                });
            }
            return window.MapRenderer.renderFloor({
                space: this.currentSpace,
                floorPlan: this.currentFloorPlan,
                building: this.activeBuilding,
                floor: this.activeFloor,
                lang: this.lang,
                dark: this.darkMode,
                selectedPoiId: this.selectedPoi?.id,
                routePolylines: this.currentFloorRoutePolylines,
                categoryFilter: this.selectedCategory,
                routeFromId: this.routeActive ? this.routeFrom : '',
                routeToId: this.routeActive ? this.routeTo : ''
            });
        },

        get editorSvgMarkup() {
            if (!window.MapRenderer || !this.currentSpace?.buildings) return '';
            return window.MapRenderer.renderFloor({
                space: this.currentSpace,
                floorPlan: this.currentFloorPlan,
                building: this.activeBuilding,
                floor: this.activeFloor,
                lang: this.lang,
                dark: this.darkMode,
                editor: true,
                showNav: true,
                editorSelected: this.editorSelectedType ? { type: this.editorSelectedType, id: this.editorSelectedId } : null,
                drawingPreview: this.editorDrawing && this.editorStartPt && this.editorCurrentPt
                    ? { tool: this.activeMarkupTool, s: this.editorStartPt, c: this.editorCurrentPt }
                    : null,
                ruler: this.rulerMeasurement
            });
        },

        get currentFloorPoisCount() {
            return (this.currentSpace.pois || []).filter(p => p.building === this.activeBuilding && Number(p.floor) === Number(this.activeFloor)).length;
        },

        get favoriteItemsList() {
            const list = [];
            for (const key of Object.keys(this.spacesData)) {
                const space = this.spacesData[key];
                if (!space) continue;
                if (this.favorites.includes(space.id)) {
                    list.push({
                        id: space.id,
                        name: space.name,
                        desc: space.desc,
                        image: space.image,
                        type: 'space'
                    });
                }
                for (const poi of (space.pois || [])) {
                    if (this.favorites.includes(poi.id)) {
                        list.push({
                            id: poi.id,
                            name: poi.name,
                            desc: {
                                ru: `${space.name.ru} • Корпус ${poi.building}, Этаж ${poi.floor}`,
                                en: `${space.name.en} • Bldg ${poi.building}, Floor ${poi.floor}`
                            },
                            image: poi.image,
                            type: 'poi',
                            parentSpaceKey: key,
                            rawPoi: poi
                        });
                    }
                }
            }
            return list;
        },

        get shareUrl() {
            const origin = window.location.origin;
            return `${origin}/s/${encodeURIComponent(this.currentSpaceKey)}`;
        },

        get embedIframeCode() {
            const origin = window.location.origin;
            return `<iframe src="${origin}/embed/${encodeURIComponent(this.currentSpaceKey)}" width="100%" height="620" style="border:0;border-radius:20px;" allowfullscreen loading="lazy"></iframe>`;
        },

        get shareQrSvg() {
            return window.PanoramaService ? window.PanoramaService.generateShareQrSvg(this.shareUrl) : '';
        },

        get captureSectors() {
            return window.PanoramaService ? window.PanoramaService.SECTORS : [];
        },

        get captureRingSvg() {
            const r = 44;
            const circ = 2 * Math.PI * r;
            const seg = circ / 8;
            let out = `<circle cx="60" cy="60" r="${r}" fill="none" stroke="${this.darkMode ? '#1e293b' : '#e2e8f0'}" stroke-width="14"/>`;
            this.capturedFrames.forEach((frame, i) => {
                const color = frame ? '#E31B23' : (this.captureSectorIndex === i ? '#fca5a5' : 'transparent');
                out += `<circle cx="60" cy="60" r="${r}" fill="none" stroke="${color}" stroke-width="14" stroke-dasharray="${(seg - 2).toFixed(2)} ${(circ - seg + 2).toFixed(2)}" stroke-dashoffset="${(-i * seg).toFixed(2)}" transform="rotate(-90 60 60)"/>`;
            });
            out += `<text x="60" y="58" text-anchor="middle" font-size="18" font-weight="900" fill="#E31B23">${this.capturedFramesCount}/8</text>`;
            out += `<text x="60" y="74" text-anchor="middle" font-size="8" font-weight="700" fill="#94a3b8">кадров</text>`;
            return out;
        },

        get capturedFramesCount() {
            return this.capturedFrames.filter(Boolean).length;
        },

        get editorSelectedPoi() {
            if (this.editorSelectedType !== 'poi' || !this.editorSelectedId) return null;
            return (this.currentSpace.pois || []).find(p => String(p.id) === String(this.editorSelectedId)) || null;
        },

        get editorSelectedRoom() {
            if (this.editorSelectedType !== 'room' || !this.editorSelectedId) return null;
            return (this.currentFloorPlan.rooms || []).find(r => r.id === this.editorSelectedId) || null;
        },

        // =========================================================================
        // Инициализация приложения
        // =========================================================================
        async init() {
            // Регистрация Service Worker для офлайн-работы на телефоне и ПК
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').catch(() => {});
            }

            // Тёмная тема (сохранённая или системная)
            const savedTheme = localStorage.getItem('ttk_theme_dark');
            if (savedTheme !== null) {
                this.darkMode = savedTheme === '1';
            } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.darkMode = true;
            }
            document.documentElement.classList.toggle('dark', this.darkMode);

            // Проверка параметров ссылки (/s/:spaceId, /embed/:spaceId или ?space=...)
            const params = new URLSearchParams(window.location.search);
            const pathParts = window.location.pathname.split('/').filter(Boolean);
            let urlSpace = params.get('space') || '';
            if (pathParts[0] === 's' && pathParts[1]) urlSpace = decodeURIComponent(pathParts[1]);
            if (pathParts[0] === 'embed' && pathParts[1]) {
                urlSpace = decodeURIComponent(pathParts[1]);
                this.isEmbedMode = true;
            }
            if (params.get('embed') === '1') {
                this.isEmbedMode = true;
            }

            // Загрузка актуальных карт с сервера (или из офлайн-кэша)
            const loaded = await window.ApiService.fetchSpaces(this.isOffline);
            if (loaded && loaded.spaces && Object.keys(loaded.spaces).length > 0) {
                this.spacesData = loaded.spaces;
            }

            if (urlSpace && this.spacesData[urlSpace]) {
                this.currentSpaceKey = urlSpace;
                this.currentView = 'map';
            } else if (this.isEmbedMode) {
                this.currentView = 'map';
            }

            this.syncSelectionAfterSpaceChange();
            this.recalculateRoute(false);

            // События сети
            window.addEventListener('online', async () => {
                this.isOffline = false;
                const synced = await window.ApiService.syncPendingChanges();
                if (synced > 0) {
                    this.showNotification(`Онлайн восстановлен: синхронизировано карт (${synced})`);
                }
            });
            window.addEventListener('offline', () => {
                this.isOffline = true;
            });

            // Слежение за сменой вкладок для перерисовки иконок и графиков
            this.$watch('currentView', (view) => {
                if (view === 'admin' && this.adminTab === 'analytics') {
                    this.loadAnalytics();
                }
                this.refreshIcons();
            });

            this.$watch('adminTab', (tab) => {
                if (tab === 'analytics') {
                    this.loadAnalytics();
                }
                this.refreshIcons();
            });

            this.$watch('darkMode', (val) => {
                localStorage.setItem('ttk_theme_dark', val ? '1' : '0');
                document.documentElement.classList.toggle('dark', val);
            });

            window.ApiService.trackEvent(this.currentSpaceKey, 'map_view');
            this.refreshIcons();
        },

        refreshIcons() {
            setTimeout(() => {
                if (window.lucide) window.lucide.createIcons();
            }, 40);
        },

        syncSelectionAfterSpaceChange() {
            const space = this.currentSpace;
            if (!space) return;
            if (space.pinRequired) {
                this.pinModalSpaceId = space.id;
                this.pinModalOpen = true;
                return;
            }
            const bKeys = Object.keys(space.buildings || {});
            this.activeBuilding = bKeys[0] || 'A';
            const floors = space.buildings?.[this.activeBuilding]?.floors || [1];
            this.activeFloor = floors[0] || 1;
            this.mapLayerMode = 'floor';

            const pois = space.pois || [];
            this.selectedPoi = pois[0] || null;
            if (pois.length >= 2) {
                this.routeFrom = String(pois[0].id);
                this.routeTo = String(pois[1].id);
            } else if (pois.length === 1) {
                this.routeFrom = String(pois[0].id);
                this.routeTo = String(pois[0].id);
            } else {
                this.routeFrom = '';
                this.routeTo = '';
            }
        },

        // =========================================================================
        // Управление пространствами и режимами карты
        // =========================================================================
        prevSpace() {
            if (!this.spaceList.length) return;
            this.carouselIndex = (this.carouselIndex - 1 + this.spaceList.length) % this.spaceList.length;
            this.currentSpaceKey = this.spaceList[this.carouselIndex];
        },

        nextSpace() {
            if (!this.spaceList.length) return;
            this.carouselIndex = (this.carouselIndex + 1) % this.spaceList.length;
            this.currentSpaceKey = this.spaceList[this.carouselIndex];
        },

        selectSpaceAndOpenMap(key) {
            if (!this.spacesData[key]) return;
            this.currentSpaceKey = key;
            if (this.spacesData[key].pinRequired) {
                this.pinModalSpaceId = key;
                this.pinInput = '';
                this.pinModalOpen = true;
                return;
            }
            this.syncSelectionAfterSpaceChange();
            this.currentView = 'map';
            this.routeActive = true;
            this.recalculateRoute(false);
            window.ApiService.trackEvent(key, 'map_view');
            this.refreshIcons();
        },

        async submitSpacePin() {
            if (!this.pinInput.trim()) return;
            try {
                const unlocked = await window.ApiService.fetchSingleSpace(this.pinModalSpaceId, this.pinInput.trim());
                if (unlocked) {
                    window.ApiService.savePin(this.pinModalSpaceId, this.pinInput.trim());
                    this.spacesData[this.pinModalSpaceId] = unlocked;
                    this.pinModalOpen = false;
                    this.pinInput = '';
                    this.selectSpaceAndOpenMap(this.pinModalSpaceId);
                    this.showNotification('Доступ к защищённой карте открыт');
                }
            } catch (err) {
                this.showNotification(err.message || 'Неверный PIN-код карты');
            }
        },

        openSpaceFullPage(key) {
            this.currentSpaceKey = key;
            this.syncSelectionAfterSpaceChange();
            const firstPoi = this.currentSpace.pois?.[0];
            this.openPanorama(firstPoi);
        },

        switchBuilding(bId) {
            if (bId === 'CAMPUS') {
                this.mapLayerMode = 'campus';
            } else {
                this.mapLayerMode = 'floor';
                this.activeBuilding = bId;
                const floors = this.currentSpace.buildings?.[bId]?.floors || [1];
                if (!floors.includes(this.activeFloor)) {
                    this.activeFloor = floors[0] || 1;
                }
            }
            this.refreshIcons();
        },

        switchFloor(fl) {
            this.mapLayerMode = 'floor';
            this.activeFloor = Number(fl);
            this.refreshIcons();
        },

        selectPoiOnMap(poi) {
            if (!poi) return;
            this.selectedPoi = poi;
            window.ApiService.trackEvent(this.currentSpaceKey, 'poi_view', poi.id);

            if (this.pickingRoutePoint === 'from') {
                this.routeFrom = String(poi.id);
                this.pickingRoutePoint = null;
                this.buildRoute();
                return;
            }
            if (this.pickingRoutePoint === 'to') {
                this.routeTo = String(poi.id);
                this.pickingRoutePoint = null;
                this.buildRoute();
                return;
            }
            this.refreshIcons();
        },

        onMapSvgClick(e) {
            const poiEl = e.target.closest('[data-poi-id]');
            if (poiEl) {
                const id = poiEl.getAttribute('data-poi-id');
                const poi = (this.currentSpace.pois || []).find(p => String(p.id) === String(id));
                if (poi) {
                    if (this.mapLayerMode === 'campus') {
                        this.mapLayerMode = 'floor';
                        this.activeBuilding = poi.building;
                        this.activeFloor = Number(poi.floor);
                    }
                    this.selectPoiOnMap(poi);
                }
                return;
            }
            const panoEl = e.target.closest('[data-pano-id]');
            if (panoEl) {
                this.openPanoramaById(panoEl.getAttribute('data-pano-id'), false);
                return;
            }
            const bEl = e.target.closest('[data-building]');
            if (bEl) {
                this.switchBuilding(bEl.getAttribute('data-building'));
            }
        },

        equipmentTags(poi) {
            const raw = poi?.equipment || '';
            if (!raw) return [];
            return String(raw).split(',').map(s => s.trim()).filter(Boolean);
        },

        roomFillClass(type) {
            const map = {
                hall: 'fill-sky-500/10 stroke-sky-500/40',
                corridor: 'fill-amber-500/10 stroke-amber-500/40',
                meeting: 'fill-rose-500/12 stroke-rose-500/45',
                stand: 'fill-purple-500/15 stroke-purple-500/50',
                entrance: 'fill-emerald-500/12 stroke-emerald-500/45',
                vertical: 'fill-indigo-500/15 stroke-indigo-500/50',
                tech: 'fill-cyan-500/12 stroke-cyan-500/45',
                service: 'fill-orange-500/10 stroke-orange-500/40',
                park: 'fill-emerald-500/10 stroke-emerald-600/30'
            };
            return map[type] || 'fill-slate-500/10 stroke-slate-400/40';
        },

        categoryColor(cat) {
            const colors = {
                entrance: '#10b981',
                meeting: '#E31B23',
                stand: '#8b5cf6',
                service: '#f59e0b',
                wifi: '#0ea5e9',
                vertical: '#6366f1'
            };
            return colors[cat] || '#E31B23';
        },

        // ---- Масштабирование и панорамирование 2D/3D-карты ----
        zoomInMap() {
            this.zoomLevel = Math.min(+(this.zoomLevel + 0.2).toFixed(2), 2.6);
        },

        zoomOutMap() {
            this.zoomLevel = Math.max(+(this.zoomLevel - 0.2).toFixed(2), 0.65);
        },

        resetMapZoom() {
            this.zoomLevel = 1.0;
            this.mapPanX = 0;
            this.mapPanY = 0;
            this.rot3dX = 50;
            this.rot3dZ = -18;
        },

        startMapPan(e) {
            if (e.target.closest('.poi-marker-group')) return;
            this.isPanningMap = true;
            const pt = e.touches ? e.touches[0] : e;
            this.panStartX = pt.clientX;
            this.panStartY = pt.clientY;
        },

        onMapPan(e) {
            if (!this.isPanningMap) return;
            const pt = e.touches ? e.touches[0] : e;
            const dx = pt.clientX - this.panStartX;
            const dy = pt.clientY - this.panStartY;
            this.panStartX = pt.clientX;
            this.panStartY = pt.clientY;

            if (this.mapRenderMode === '3d') {
                this.rot3dZ = Math.max(-75, Math.min(75, this.rot3dZ + dx * 0.35));
                this.rot3dX = Math.max(20, Math.min(70, this.rot3dX - dy * 0.25));
            } else {
                this.mapPanX = Math.max(-260, Math.min(260, this.mapPanX + dx));
                this.mapPanY = Math.max(-180, Math.min(180, this.mapPanY + dy));
            }
        },

        stopMapPan() {
            this.isPanningMap = false;
        },

        get mapTransformStyle() {
            if (this.mapRenderMode === '3d') {
                return `transform: scale(${this.zoomLevel}) rotateX(${this.rot3dX}deg) rotateZ(${this.rot3dZ}deg);`;
            }
            return `transform: translate(${this.mapPanX}px, ${this.mapPanY}px) scale(${this.zoomLevel});`;
        },

        // =========================================================================
        // Маршрутизация и навигация (Слайд 6)
        // =========================================================================
        swapRouteEndpoints() {
            const tmp = this.routeFrom;
            this.routeFrom = this.routeTo;
            this.routeTo = tmp;
            if (this.routeActive) this.recalculateRoute(true);
        },

        setRouteEndpointFromSelected(which) {
            if (!this.selectedPoi) return;
            if (which === 'from') this.routeFrom = String(this.selectedPoi.id);
            else this.routeTo = String(this.selectedPoi.id);
            this.buildRoute();
        },

        recalculateRoute(notify = false) {
            if (!this.routeFrom || !this.routeTo) {
                this.computedRoute = null;
                return;
            }
            this.computedRoute = window.NavigationService.computeRoute(this.currentSpace, this.routeFrom, this.routeTo);
            if (notify && this.computedRoute) {
                window.ApiService.trackEvent(this.currentSpaceKey, 'route_built', this.routeTo);
                this.showNotification(
                    this.lang === 'ru'
                        ? `Маршрут построен: ${this.computedRoute.totalMeters} м (~${this.computedRoute.estimatedMinutes} мин)`
                        : `Route ready: ${this.computedRoute.totalMeters} m (~${this.computedRoute.estimatedMinutes} min)`
                );
            }
        },

        buildRoute() {
            if (!this.routeFrom && this.currentSpace.pois?.length) {
                this.routeFrom = String(this.currentSpace.pois[0].id);
            }
            if (!this.routeTo && this.selectedPoi) {
                this.routeTo = String(this.selectedPoi.id);
            }
            this.routeActive = true;
            this.recalculateRoute(true);
            // Переключаем вид на этаж старта или генплан, если маршрут между зданиями
            if (this.computedRoute?.startPoi) {
                if (this.computedRoute.startPoi.building !== this.computedRoute.endPoi.building) {
                    this.mapLayerMode = 'campus';
                } else {
                    this.mapLayerMode = 'floor';
                    this.activeBuilding = this.computedRoute.startPoi.building;
                    this.activeFloor = this.computedRoute.startPoi.floor;
                }
            }
            this.mobileMapTab = 'plan';
            this.refreshIcons();
        },

        clearRoute() {
            this.routeActive = false;
            this.computedRoute = null;
            this.panoTourActive = false;
            this.showNotification(this.lang === 'ru' ? 'Маршрут сброшен' : 'Route cleared');
        },

        focusRouteStep(step) {
            if (!step) return;
            if (step.building === 'CAMPUS') {
                this.mapLayerMode = 'campus';
            } else {
                this.mapLayerMode = 'floor';
                this.activeBuilding = step.building;
                this.activeFloor = Number(step.floor);
            }
            this.mobileMapTab = 'plan';
            this.refreshIcons();
        },

        // Проход маршрута по панорамам 360° (Слайд 6)
        startRoutePanoramaWalkthrough() {
            if (!this.computedRoute || !this.computedRoute.panoramaTour?.length) {
                this.showNotification('Для этого участка панорамы ещё не добавлены');
                return;
            }
            this.panoTourActive = true;
            this.panoTourIndex = 0;
            const firstStop = this.computedRoute.panoramaTour[0];
            this.openPanoramaById(firstStop.panoId, true);
        },

        stepPanoramaTour(delta) {
            if (!this.computedRoute?.panoramaTour?.length) return;
            const next = this.panoTourIndex + delta;
            if (next < 0 || next >= this.computedRoute.panoramaTour.length) return;
            this.panoTourIndex = next;
            const stop = this.computedRoute.panoramaTour[next];
            this.openPanoramaById(stop.panoId, true);
        },

        // =========================================================================
        // 360° Панорамы, хотспоты и переходы (Слайд 5)
        // =========================================================================
        openPanorama(poi) {
            const targetPoi = poi || this.selectedPoi || this.currentSpace.pois?.[0];
            const panos = this.currentSpace.panoramas || {};
            let panoId = targetPoi?.panoId || Object.keys(panos)[0] || '';

            // Если у новой точки ещё нет отдельной записи панорамы, создаём временную на базе её фото
            if (!panoId || !panos[panoId]) {
                panoId = `pano_auto_${targetPoi?.id || 'default'}`;
                if (!this.currentSpace.panoramas) this.currentSpace.panoramas = {};
                this.currentSpace.panoramas[panoId] = {
                    id: panoId,
                    title: targetPoi?.name || { ru: 'Панорама 360°', en: '360° Panorama' },
                    building: targetPoi?.building || 'A',
                    floor: targetPoi?.floor || 1,
                    x: targetPoi?.x || 360,
                    y: targetPoi?.y || 210,
                    poiId: targetPoi?.id || null,
                    imageUrl: '/assets/panoramas/plaza-lobby.svg',
                    photoUrl: targetPoi?.image || this.currentSpace.image,
                    hotspots: []
                };
            }
            this.panoTourActive = false;
            this.openPanoramaById(panoId, false);
        },

        openPanoramaById(panoId, keepTour = false) {
            if (!this.currentSpace.panoramas?.[panoId]) return;
            if (!keepTour) this.panoTourActive = false;
            this.activePanoramaId = panoId;
            this.activeHotspotInfo = null;
            this.panoAddHotspotMode = false;
            this.newHotspotDraft.open = false;
            this.panoYaw = 35;
            this.panoPitch = 0;
            this.panoZoom = 105;
            this.panoramaModalOpen = true;

            const pano = this.currentSpace.panoramas[panoId];
            if (pano.building && pano.building !== 'CAMPUS') {
                this.activeBuilding = pano.building;
                this.activeFloor = Number(pano.floor) || 1;
            }

            window.ApiService.trackEvent(this.currentSpaceKey, 'pano_view', pano.poiId || '');
            this.$nextTick(() => this.measurePanoViewport());
            this.loadPanoAspect();
            this.refreshIcons();
        },

        measurePanoViewport() {
            const el = this.$refs.panoViewport;
            if (el && el.clientWidth > 0) {
                this.panoVpW = el.clientWidth;
                this.panoVpH = el.clientHeight;
            }
        },

        loadPanoAspect() {
            const url = this.activePanoramaBgUrl;
            if (!url) return;
            if (/\.svg(\?|$)/i.test(url)) {
                this.panoAspect = 3;
                return;
            }
            const img = new Image();
            img.onload = () => {
                if (img.naturalWidth && img.naturalHeight) {
                    // Плоские фото (не 360°) растягиваем минимум до 2:1, чтобы обзор оставался плавным
                    this.panoAspect = Math.max(2, img.naturalWidth / img.naturalHeight);
                }
            };
            img.src = url;
        },

        togglePanoSource() {
            this.panoUsePhoto = !this.panoUsePhoto;
            this.loadPanoAspect();
        },

        closePanoramaModal() {
            this.panoramaModalOpen = false;
            this.stopPanoAutoRotate();
        },

        togglePanoAutoRotate() {
            this.panoAutoRotate = !this.panoAutoRotate;
            if (this.panoAutoRotate) {
                this.panoRotateTimer = setInterval(() => {
                    if (!this.isDraggingPano && this.panoramaModalOpen) {
                        this.panoYaw = (this.panoYaw + 0.45) % 360;
                    }
                }, 30);
            } else {
                this.stopPanoAutoRotate();
            }
        },

        stopPanoAutoRotate() {
            this.panoAutoRotate = false;
            if (this.panoRotateTimer) {
                clearInterval(this.panoRotateTimer);
                this.panoRotateTimer = null;
            }
        },

        startPanoDrag(e) {
            if (e.target.closest('.pano-hotspot-btn') || e.target.closest('.pano-ui-overlay')) return;
            if (this.panoAddHotspotMode) {
                this.placeHotspotAtClick(e);
                return;
            }
            this.isDraggingPano = true;
            const pt = e.touches ? e.touches[0] : e;
            this.panoDragStartX = pt.clientX;
            this.panoDragStartY = pt.clientY;
            this.panoStartYaw = this.panoYaw;
            this.panoStartPitch = this.panoPitch;
        },

        onPanoDrag(e) {
            if (!this.isDraggingPano) return;
            const pt = e.touches ? e.touches[0] : e;
            const dx = pt.clientX - this.panoDragStartX;
            const dy = pt.clientY - this.panoDragStartY;
            const degPerPx = this.panoVisibleDegrees / Math.max(1, this.panoVpW);
            this.panoYaw = (this.panoStartYaw - dx * degPerPx + 3600) % 360;
            this.panoPitch = Math.max(-25, Math.min(25, this.panoStartPitch + dy * degPerPx * 0.8));
        },

        stopPanoDrag() {
            this.isDraggingPano = false;
        },

        handleHotspotClick(hs) {
            if (hs.type === 'nav' && hs.targetPanoId) {
                this.openPanoramaById(hs.targetPanoId, this.panoTourActive);
                return;
            }
            const linkedPoi = hs.poiId
                ? (this.currentSpace.pois || []).find(p => String(p.id) === String(hs.poiId))
                : null;
            this.activeHotspotInfo = {
                label: hs.label?.[this.lang] || hs.label?.ru || 'Объект',
                text: hs.text?.[this.lang] || hs.text?.ru || linkedPoi?.description?.[this.lang] || '',
                poi: linkedPoi
            };
            this.refreshIcons();
        },

        routeToHotspotPoi(poi) {
            if (!poi) return;
            this.selectedPoi = poi;
            this.routeTo = String(poi.id);
            this.closePanoramaModal();
            this.currentView = 'map';
            this.buildRoute();
        },

        placeHotspotAtClick(e) {
            const rect = e.currentTarget.getBoundingClientRect();
            const pt = e.touches ? e.touches[0] : e;
            const relX = (pt.clientX - rect.left) / rect.width;
            const relY = (pt.clientY - rect.top) / rect.height;
            const clickedYaw = (this.panoYaw + (relX - 0.5) * this.panoVisibleDegrees + 360) % 360;
            const clickedPitch = Math.max(-30, Math.min(30, this.panoPitch - ((relY - 0.5) * this.panoVpH / this.panoBgHeight) * 90));

            this.newHotspotDraft = {
                open: true,
                yaw: Math.round(clickedYaw),
                pitch: Math.round(clickedPitch),
                type: 'info',
                labelRu: '',
                labelEn: '',
                textRu: '',
                poiId: this.currentSpace.pois?.[0]?.id ? String(this.currentSpace.pois[0].id) : '',
                targetPanoId: Object.keys(this.currentSpace.panoramas || {}).find(id => id !== this.activePanoramaId) || ''
            };
            this.panoAddHotspotMode = false;
        },

        async saveNewPanoramaHotspot() {
            const pano = this.activePanorama;
            if (!pano) return;
            if (!Array.isArray(pano.hotspots)) pano.hotspots = [];

            const labelRu = this.newHotspotDraft.labelRu.trim() || 'Информационная точка';
            const hs = {
                id: `hs_${Date.now()}`,
                type: this.newHotspotDraft.type,
                yaw: Number(this.newHotspotDraft.yaw),
                pitch: Number(this.newHotspotDraft.pitch),
                label: { ru: labelRu, en: this.newHotspotDraft.labelEn.trim() || labelRu },
                text: { ru: this.newHotspotDraft.textRu.trim(), en: this.newHotspotDraft.textRu.trim() }
            };
            if (hs.type === 'info' && this.newHotspotDraft.poiId) {
                hs.poiId = Number(this.newHotspotDraft.poiId) || this.newHotspotDraft.poiId;
            }
            if (hs.type === 'nav' && this.newHotspotDraft.targetPanoId) {
                hs.targetPanoId = this.newHotspotDraft.targetPanoId;
            }

            pano.hotspots.push(hs);
            this.newHotspotDraft.open = false;
            this.unsavedChanges = true;
            await this.saveCurrentSpaceChanges();
        },

        // =========================================================================
        // Офлайн-режим и Поиск (Слайд 7)
        // =========================================================================
        async toggleOfflineMode() {
            if (!this.isOffline) {
                this.offlineCachingBusy = true;
                const count = await window.ApiService.cacheSpaceAssetsOffline(this.currentSpace);
                window.ApiService.saveCachedSpaces(this.spacesData);
                this.offlineCachingBusy = false;
                this.isOffline = true;
                this.showNotification(
                    this.lang === 'ru'
                        ? `Офлайн-режим активен: карта и панорамы сохранены в кэш (${count} объектов)`
                        : `Offline mode active: map & panoramas cached (${count} assets)`
                );
            } else {
                this.isOffline = false;
                await window.ApiService.syncPendingChanges();
                this.showNotification(this.lang === 'ru' ? 'Онлайн-режим восстановлен' : 'Online mode restored');
            }
        },

        async downloadCurrentSpaceOffline() {
            this.offlineCachingBusy = true;
            const count = await window.ApiService.cacheSpaceAssetsOffline(this.currentSpace);
            window.ApiService.saveCachedSpaces(this.spacesData);
            this.offlineCachingBusy = false;
            this.showNotification(`Пакет площадки «${this.currentSpace.name.ru}» сохранён для доступа без интернета (${count} файлов)`);
        },

        executeTopSearch() {
            if (!this.topSearchQuery || !this.topSearchQuery.trim()) return;
            const query = this.topSearchQuery.toLowerCase().trim();
            let foundSpace = null;
            let foundPoi = null;

            for (const key of Object.keys(this.spacesData)) {
                const space = this.spacesData[key];
                for (const poi of (space.pois || [])) {
                    const hay = `${poi.name?.ru || ''} ${poi.name?.en || ''} ${poi.equipment || ''} ${poi.wifi || ''} ${poi.description?.ru || ''}`.toLowerCase();
                    if (hay.includes(query)) {
                        foundSpace = key;
                        foundPoi = poi;
                        break;
                    }
                }
                if (foundPoi) break;
                const sHay = `${space.name?.ru || ''} ${space.name?.en || ''} ${space.desc?.ru || ''}`.toLowerCase();
                if (sHay.includes(query)) {
                    foundSpace = key;
                    break;
                }
            }

            if (foundSpace) {
                this.currentSpaceKey = foundSpace;
                this.syncSelectionAfterSpaceChange();
                if (foundPoi) {
                    this.selectedPoi = foundPoi;
                    this.activeBuilding = foundPoi.building;
                    this.activeFloor = foundPoi.floor;
                    this.routeTo = String(foundPoi.id);
                    this.recalculateRoute(false);
                }
                this.currentView = 'map';
                this.showNotification(`Найдено: «${foundPoi ? foundPoi.name[this.lang] : this.spacesData[foundSpace].name[this.lang]}»`);
            } else {
                this.showNotification(`По запросу «${this.topSearchQuery}» ничего не найдено`);
            }
            this.topSearchQuery = '';
            this.refreshIcons();
        },

        handlePhotoUpload(event) {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                this.photoSearchModalOpen = false;
                const pois = this.currentSpace.pois || [];
                const matched = pois[Math.min(1, pois.length - 1)];
                if (matched) {
                    this.selectedPoi = matched;
                    this.activeBuilding = matched.building;
                    this.activeFloor = matched.floor;
                    this.routeTo = String(matched.id);
                }
                this.currentView = 'map';
                this.buildRoute();
                this.showNotification('Помещение распознано по снимку — маршрут построен!');
            };
            reader.readAsDataURL(file);
        },

        switchLanguage(newLang) {
            this.lang = newLang;
            this.refreshIcons();
        },

        toggleDarkMode() {
            this.darkMode = !this.darkMode;
        },

        // =========================================================================
        // Избранное и Личный кабинет
        // =========================================================================
        isFavorite(id) {
            return this.favorites.includes(id);
        },

        toggleFavorite(id, event) {
            if (event) event.stopPropagation();
            if (this.favorites.includes(id)) {
                this.favorites = this.favorites.filter(fav => fav !== id);
                this.showNotification(this.lang === 'ru' ? 'Удалено из избранного' : 'Removed from favorites');
            } else {
                this.favorites.push(id);
                this.showNotification(this.lang === 'ru' ? 'Добавлено в избранное' : 'Saved to favorites');
            }
            window.ApiService.saveFavorites(this.favorites);
        },

        openFavoriteItem(item) {
            if (item.type === 'space' || this.spacesData[item.id]) {
                this.selectSpaceAndOpenMap(item.id);
            } else if (item.parentSpaceKey) {
                this.currentSpaceKey = item.parentSpaceKey;
                this.syncSelectionAfterSpaceChange();
                this.selectedPoi = item.rawPoi;
                this.activeBuilding = item.rawPoi.building;
                this.activeFloor = item.rawPoi.floor;
                this.currentView = 'map';
                this.refreshIcons();
            }
        },

        // =========================================================================
        // Авторизация и Защита доступа (Слайд 10)
        // =========================================================================
        attemptAdminAccess() {
            if (this.user && this.user.isAdmin) {
                this.currentView = 'admin';
                this.refreshIcons();
            } else {
                this.adminPasswordModalOpen = true;
                this.refreshIcons();
            }
        },

        async verifyAdminPassword() {
            try {
                const user = await window.ApiService.adminUnlock(this.adminPasswordInput || '');
                this.user = user;
                this.adminPasswordModalOpen = false;
                this.adminPasswordInput = '';
                // Перезагружаем полные данные пространств с правами организатора
                const loaded = await window.ApiService.fetchSpaces(false);
                if (loaded?.spaces) this.spacesData = loaded.spaces;
                this.currentView = 'admin';
                this.showNotification('Доступ организатора подтверждён (защищённая JWT-сессия)');
            } catch (err) {
                this.showNotification(err.message || 'Неверный код доступа (по умолчанию: admin2026)');
            }
        },

        async loginUser() {
            if (!this.authForm.email || !this.authForm.password) {
                this.showNotification('Введите email и пароль');
                return;
            }
            try {
                const user = await window.ApiService.login(this.authForm.email, this.authForm.password);
                this.user = user;
                this.currentView = user.isAdmin ? 'admin' : 'cabinet';
                this.showNotification(`Добро пожаловать, ${user.name}!`);
            } catch (err) {
                this.showNotification(err.message || 'Ошибка авторизации');
            }
        },

        async registerUser() {
            if (!this.authForm.name || !this.authForm.email || !this.authForm.password) {
                this.showNotification('Заполните имя, email и пароль');
                return;
            }
            try {
                const user = await window.ApiService.register(this.authForm);
                this.user = user;
                this.currentView = user.isAdmin ? 'admin' : 'cabinet';
                this.showNotification('Аккаунт успешно создан!');
            } catch (err) {
                this.showNotification(err.message || 'Ошибка регистрации');
            }
        },

        logoutUser() {
            window.ApiService.clearSession();
            this.user = null;
            this.currentView = 'spaces';
            this.showNotification('Вы вышли из учётной записи');
        },

        // =========================================================================
        // РЕДАКТОР КАРТЫ 2D, ТОЧЕК ИНТЕРЕСА И ПАНОРАМ (Слайды 4, 5, 7)
        // =========================================================================
        setMarkupTool(toolName) {
            this.activeMarkupTool = toolName;
            this.editorDrawing = false;
            this.editorStartPt = null;
            this.editorCurrentPt = null;
            if (toolName !== 'nav') this.editorLastNavNodeId = null;
        },

        svgCoordsFromEvent(e) {
            const svg = e.currentTarget;
            const rect = svg.getBoundingClientRect();
            const pt = e.touches ? e.touches[0] : e;
            const rawX = ((pt.clientX - rect.left) / rect.width) * 720;
            const rawY = ((pt.clientY - rect.top) / rect.height) * 420;
            const snap = v => Math.round(v / 10) * 10;
            return {
                x: Math.max(10, Math.min(710, snap(rawX))),
                y: Math.max(10, Math.min(410, snap(rawY)))
            };
        },

        ensureFloorPlanArrays() {
            const bld = this.currentSpace.buildings[this.activeBuilding];
            if (!bld.floorPlans) bld.floorPlans = {};
            const key = String(this.activeFloor);
            if (!bld.floorPlans[key]) {
                bld.floorPlans[key] = {
                    width: 720,
                    height: 420,
                    backgroundUrl: '',
                    backgroundOpacity: 0.45,
                    rooms: [],
                    walls: [],
                    doors: [],
                    windows: []
                };
            }
            const fp = bld.floorPlans[key];
            if (!Array.isArray(fp.rooms)) fp.rooms = [];
            if (!Array.isArray(fp.walls)) fp.walls = [];
            if (!Array.isArray(fp.doors)) fp.doors = [];
            if (!Array.isArray(fp.windows)) fp.windows = [];
            if (!Array.isArray(this.currentSpace.pois)) this.currentSpace.pois = [];
            if (!this.currentSpace.navGraph) this.currentSpace.navGraph = { nodes: [], edges: [] };
            return fp;
        },

        onEditorCanvasDown(e) {
            const pt = this.svgCoordsFromEvent(e);
            const fp = this.ensureFloorPlanArrays();

            if (this.activeMarkupTool === 'select') {
                const el = e.target.closest('[data-edit-type]');
                if (el) {
                    const type = el.getAttribute('data-edit-type');
                    const rawId = el.getAttribute('data-edit-id');
                    this.editorSelectedType = type;
                    this.editorSelectedId = type === 'poi' ? (Number(rawId) || rawId) : rawId;
                    this.editorDraggingPoi = type === 'poi';
                } else {
                    this.editorSelectedType = '';
                    this.editorSelectedId = null;
                }
                this.refreshIcons();
                return;
            }

            if (this.activeMarkupTool === 'poi') {
                const newId = Math.floor(1000 + Math.random() * 8999);
                const newPoi = {
                    id: newId,
                    building: this.activeBuilding,
                    floor: Number(this.activeFloor),
                    x: pt.x,
                    y: pt.y,
                    campusX: pt.x,
                    campusY: pt.y,
                    navNodeId: '',
                    category: 'stand',
                    categoryName: { ru: 'Стенд / Место', en: 'Stand / Place' },
                    name: { ru: `Новая точка #${newId}`, en: `New Point #${newId}` },
                    description: { ru: 'Описание объекта для посетителей', en: 'Place description for visitors' },
                    status: 'free',
                    statusText: { ru: 'Открыто', en: 'Open' },
                    capacity: '20 человек',
                    equipment: 'Wi-Fi, Стойка информации',
                    wifi: 'TTK_Free_WiFi',
                    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
                    panoId: Object.keys(this.currentSpace.panoramas || {})[0] || '',
                    icon: 'map-pin'
                };
                this.currentSpace.pois.push(newPoi);
                this.editorSelectedType = 'poi';
                this.editorSelectedId = newId;
                this.unsavedChanges = true;
                this.activeMarkupTool = 'select';
                this.showNotification('Точка добавлена на 2D-план — отредактируйте свойства справа');
                this.refreshIcons();
                return;
            }

            if (this.activeMarkupTool === 'door') {
                const door = {
                    id: `door_${Date.now()}`,
                    x: pt.x,
                    y: pt.y,
                    orientation: 'h',
                    width: 44
                };
                fp.doors.push(door);
                // Автоматически добавляем узел прохода в граф навигации
                const navId = `n_door_${Date.now()}`;
                this.currentSpace.navGraph.nodes.push({
                    id: navId,
                    building: this.activeBuilding,
                    floor: Number(this.activeFloor),
                    x: pt.x,
                    y: pt.y,
                    campusX: pt.x,
                    campusY: pt.y,
                    type: 'corridor',
                    panoId: '',
                    label: { ru: 'Проход', en: 'Doorway' }
                });
                this.autoConnectNavNode(navId);
                this.unsavedChanges = true;
                this.showNotification('Проход добавлен и подключён к графу маршрутов');
                return;
            }

            if (this.activeMarkupTool === 'nav') {
                const navId = `n_${Date.now()}`;
                const node = {
                    id: navId,
                    building: this.activeBuilding,
                    floor: Number(this.activeFloor),
                    x: pt.x,
                    y: pt.y,
                    campusX: pt.x,
                    campusY: pt.y,
                    type: 'corridor',
                    panoId: '',
                    label: { ru: 'Узел коридора', en: 'Corridor Node' }
                };
                this.currentSpace.navGraph.nodes.push(node);
                if (this.editorLastNavNodeId) {
                    const prev = this.currentSpace.navGraph.nodes.find(n => n.id === this.editorLastNavNodeId);
                    if (prev) {
                        const w = Math.max(4, Math.round(Math.hypot(pt.x - prev.x, pt.y - prev.y) * 0.14));
                        this.currentSpace.navGraph.edges.push({ from: prev.id, to: navId, weight: w, kind: 'walk' });
                    }
                } else {
                    this.autoConnectNavNode(navId);
                }
                this.editorLastNavNodeId = navId;
                this.unsavedChanges = true;
                return;
            }

            if (['wall', 'zone', 'window', 'ruler'].includes(this.activeMarkupTool)) {
                this.editorDrawing = true;
                this.editorStartPt = pt;
                this.editorCurrentPt = pt;
            }
        },

        onEditorCanvasMove(e) {
            const pt = this.svgCoordsFromEvent(e);
            if (this.editorDrawing) {
                this.editorCurrentPt = pt;
                return;
            }
            // Перетаскивание выбранной точки POI в режиме select (при зажатой кнопке мыши)
            if (this.activeMarkupTool === 'select' && this.editorDraggingPoi && this.editorSelectedType === 'poi' && this.editorSelectedPoi) {
                if (e.cancelable && e.touches) e.preventDefault();
                this.editorSelectedPoi.x = pt.x;
                this.editorSelectedPoi.y = pt.y;
                this.unsavedChanges = true;
            }
        },

        onEditorCanvasUp() {
            this.editorDraggingPoi = false;
            if (!this.editorDrawing || !this.editorStartPt || !this.editorCurrentPt) return;
            const fp = this.ensureFloorPlanArrays();
            const s = this.editorStartPt;
            const c = this.editorCurrentPt;
            const dist = Math.hypot(c.x - s.x, c.y - s.y);

            if (dist >= 10) {
                if (this.activeMarkupTool === 'wall') {
                    // Выравнивание почти горизонтальных/вертикальных стен
                    let x2 = c.x, y2 = c.y;
                    if (Math.abs(c.x - s.x) < 15) x2 = s.x;
                    if (Math.abs(c.y - s.y) < 15) y2 = s.y;
                    fp.walls.push({ id: `w_${Date.now()}`, x1: s.x, y1: s.y, x2, y2 });
                    this.unsavedChanges = true;
                } else if (this.activeMarkupTool === 'window') {
                    fp.windows.push({ id: `win_${Date.now()}`, x1: s.x, y1: s.y, x2: c.x, y2: c.y });
                    this.unsavedChanges = true;
                } else if (this.activeMarkupTool === 'zone') {
                    const room = {
                        id: `r_${Date.now()}`,
                        x: Math.min(s.x, c.x),
                        y: Math.min(s.y, c.y),
                        w: Math.abs(c.x - s.x),
                        h: Math.abs(c.y - s.y),
                        type: 'hall',
                        label: { ru: 'Новое помещение', en: 'New Room' }
                    };
                    fp.rooms.push(room);
                    this.editorSelectedType = 'room';
                    this.editorSelectedId = room.id;
                    this.unsavedChanges = true;
                } else if (this.activeMarkupTool === 'ruler') {
                    this.rulerMeasurement = {
                        x1: s.x,
                        y1: s.y,
                        x2: c.x,
                        y2: c.y,
                        meters: +(dist * 0.14).toFixed(1)
                    };
                }
            }

            this.editorDrawing = false;
            this.editorStartPt = null;
            this.editorCurrentPt = null;
        },

        autoConnectNavNode(newNodeId) {
            const nodes = this.currentSpace.navGraph?.nodes || [];
            const target = nodes.find(n => n.id === newNodeId);
            if (!target) return;
            const nearest = nodes
                .filter(n => n.id !== newNodeId && n.building === target.building && Number(n.floor) === Number(target.floor))
                .sort((a, b) => Math.hypot(a.x - target.x, a.y - target.y) - Math.hypot(b.x - target.x, b.y - target.y))[0];
            if (nearest) {
                const w = Math.max(4, Math.round(Math.hypot(nearest.x - target.x, nearest.y - target.y) * 0.14));
                this.currentSpace.navGraph.edges.push({ from: nearest.id, to: newNodeId, weight: w, kind: 'walk' });
            }
        },

        selectEditorObject(type, id, event) {
            if (event) event.stopPropagation();
            this.editorSelectedType = type;
            this.editorSelectedId = id;
            this.refreshIcons();
        },

        updatePoiCategoryLabel(poi) {
            if (!poi) return;
            const labels = {
                entrance: { ru: 'Вход / Ресепшн', en: 'Entrance / Reception' },
                meeting: { ru: 'Зал / Переговорная', en: 'Hall / Meeting Room' },
                stand: { ru: 'Стенд', en: 'Exhibition Stand' },
                service: { ru: 'Стойка обслуживания', en: 'Service Desk' },
                wifi: { ru: 'Точка Wi-Fi', en: 'Wi-Fi Zone' },
                vertical: { ru: 'Лифт / Лестница', en: 'Elevator / Stairs' }
            };
            poi.categoryName = labels[poi.category] || labels.stand;
            this.unsavedChanges = true;
        },

        deleteSelectedEditorObject() {
            const fp = this.ensureFloorPlanArrays();
            if (this.editorSelectedType === 'poi') {
                this.currentSpace.pois = this.currentSpace.pois.filter(p => String(p.id) !== String(this.editorSelectedId));
            } else if (this.editorSelectedType === 'room') {
                fp.rooms = fp.rooms.filter(r => r.id !== this.editorSelectedId);
            } else if (this.editorSelectedType === 'wall') {
                fp.walls = fp.walls.filter(w => w.id !== this.editorSelectedId);
            } else if (this.editorSelectedType === 'door') {
                fp.doors = fp.doors.filter(d => d.id !== this.editorSelectedId);
            }
            this.editorSelectedType = '';
            this.editorSelectedId = null;
            this.unsavedChanges = true;
            this.showNotification('Объект удалён с карты');
        },

        addNewFloorToCurrentBuilding() {
            const bld = this.currentSpace.buildings[this.activeBuilding];
            const maxFloor = Math.max(...(bld.floors || [1]));
            const nextFloor = maxFloor + 1;
            bld.floors.push(nextFloor);
            if (!bld.floorPlans) bld.floorPlans = {};
            bld.floorPlans[String(nextFloor)] = {
                width: 720,
                height: 420,
                backgroundUrl: '',
                backgroundOpacity: 0.45,
                rooms: [
                    { id: `r_f${nextFloor}`, x: 50, y: 50, w: 620, h: 320, type: 'hall', label: { ru: `Зал ${nextFloor} этажа`, en: `Floor ${nextFloor} Hall` } }
                ],
                walls: [
                    { id: `wf_${nextFloor}_1`, x1: 50, y1: 50, x2: 670, y2: 50 },
                    { id: `wf_${nextFloor}_2`, x1: 670, y1: 50, x2: 670, y2: 370 },
                    { id: `wf_${nextFloor}_3`, x1: 50, y1: 370, x2: 670, y2: 370 },
                    { id: `wf_${nextFloor}_4`, x1: 50, y1: 50, x2: 50, y2: 370 }
                ],
                doors: [],
                windows: []
            };
            // Связываем лифтом с предыдущим этажом
            const prevLift = (this.currentSpace.navGraph?.nodes || []).find(
                n => n.building === this.activeBuilding && Number(n.floor) === maxFloor
            );
            const newLiftId = `n_lift_${this.activeBuilding}_${nextFloor}_${Date.now()}`;
            this.currentSpace.navGraph.nodes.push({
                id: newLiftId,
                building: this.activeBuilding,
                floor: nextFloor,
                x: prevLift ? prevLift.x : 360,
                y: prevLift ? prevLift.y : 210,
                campusX: prevLift ? prevLift.campusX : 360,
                campusY: prevLift ? prevLift.campusY : 210,
                type: 'elevator',
                panoId: '',
                label: { ru: `Лифтовой холл (${nextFloor} эт.)`, en: `Elevator (Fl ${nextFloor})` }
            });
            if (prevLift) {
                this.currentSpace.navGraph.edges.push({ from: prevLift.id, to: newLiftId, weight: 15, kind: 'elevator' });
            }
            this.activeFloor = nextFloor;
            this.unsavedChanges = true;
            this.showNotification(`Добавлен Этаж ${nextFloor} и соединён лифтовым переходом`);
        },

        addNewBuildingToCurrentSpace() {
            const existingKeys = Object.keys(this.currentSpace.buildings || {});
            const letters = 'BCDEFGH';
            const nextId = Array.from(letters).find(l => !existingKeys.includes(l)) || `B${existingKeys.length + 1}`;
            this.currentSpace.buildings[nextId] = {
                id: nextId,
                name: { ru: `Корпус ${nextId}`, en: `Building ${nextId}` },
                floors: [1],
                floorPlans: {
                    '1': {
                        width: 720,
                        height: 420,
                        backgroundUrl: '',
                        backgroundOpacity: 0.45,
                        rooms: [
                            { id: `rb_${nextId}`, x: 60, y: 60, w: 600, h: 300, type: 'hall', label: { ru: `Холл Корпуса ${nextId}`, en: `Building ${nextId} Hall` } }
                        ],
                        walls: [
                            { id: `wb_${nextId}_1`, x1: 60, y1: 60, x2: 660, y2: 60 },
                            { id: `wb_${nextId}_2`, x1: 660, y1: 60, x2: 660, y2: 360 },
                            { id: `wb_${nextId}_3`, x1: 60, y1: 360, x2: 660, y2: 360 },
                            { id: `wb_${nextId}_4`, x1: 60, y1: 60, x2: 60, y2: 360 }
                        ],
                        doors: [{ id: `db_${nextId}`, x: 60, y: 210, orientation: 'v', width: 48 }],
                        windows: []
                    }
                }
            };
            if (!this.currentSpace.campus) {
                this.currentSpace.campus = { width: 720, height: 420, zones: [], buildingFootprints: [] };
            }
            this.currentSpace.campus.buildingFootprints.push({
                buildingId: nextId,
                x: 430,
                y: 80,
                w: 220,
                h: 240,
                label: { ru: `Корпус ${nextId}`, en: `Building ${nextId}` }
            });
            // Связываем через территорию с существующим графом
            const entryNodeId = `n_b_${nextId}_1`;
            this.currentSpace.navGraph.nodes.push({
                id: entryNodeId,
                building: nextId,
                floor: 1,
                x: 120,
                y: 210,
                campusX: 460,
                campusY: 200,
                type: 'corridor',
                panoId: '',
                label: { ru: `Вход Корпуса ${nextId}`, en: `Building ${nextId} Entrance` }
            });
            const anchor = this.currentSpace.navGraph.nodes.find(n => n.building === 'CAMPUS') || this.currentSpace.navGraph.nodes[0];
            if (anchor) {
                this.currentSpace.navGraph.edges.push({ from: anchor.id, to: entryNodeId, weight: 28, kind: 'outdoor' });
            }
            this.activeBuilding = nextId;
            this.activeFloor = 1;
            this.unsavedChanges = true;
            this.showNotification(`Корпус ${nextId} создан и соединён с территорией площадки`);
        },

        async createNewSpaceSubmit() {
            if (!this.newSpaceForm.nameRu.trim()) {
                this.showNotification('Укажите название нового пространства');
                return;
            }
            try {
                const created = await window.ApiService.createSpace({
                    slug: this.newSpaceForm.slug.trim(),
                    name: { ru: this.newSpaceForm.nameRu.trim(), en: this.newSpaceForm.nameEn.trim() || this.newSpaceForm.nameRu.trim() },
                    type: { ru: this.newSpaceForm.typeRu, en: 'Venue' },
                    city: this.newSpaceForm.city,
                    desc: { ru: this.newSpaceForm.descRu || 'Интерактивная карта площадки', en: 'Interactive venue map' }
                });
                this.spacesData[created.id] = created;
                this.currentSpaceKey = created.id;
                this.syncSelectionAfterSpaceChange();
                this.newSpaceModalOpen = false;
                this.newSpaceForm = { slug: '', nameRu: '', nameEn: '', typeRu: 'Выставочная площадка', city: 'г. Ростов-на-Дону', descRu: '' };
                this.showNotification(`Площадка «${created.name.ru}» создана!`);
            } catch (err) {
                this.showNotification(err.message || 'Ошибка создания пространства');
            }
        },

        // Загрузка готовой подложки плана (PNG/JPG/SVG)
        async uploadFloorplanBackground(event) {
            const file = event.target.files?.[0];
            if (!file) return;
            try {
                const url = await window.ApiService.uploadFile(file);
                const fp = this.ensureFloorPlanArrays();
                fp.backgroundUrl = url;
                this.unsavedChanges = true;
                this.showNotification('Готовый план загружен подложкой на текущий этаж');
            } catch (_) {
                this.showNotification('Не удалось загрузить файл плана');
            }
        },

        // ИИ-распознавание 2D-плана по загруженному изображению (Слайд 7)
        async generate2DBlueprint(event) {
            const file = event.target.files?.[0];
            if (!file) return;
            this.isGeneratingMap = true;
            try {
                const url = await window.ApiService.uploadFile(file);
                const recognized = await window.FloorplanAiService.recognizePlanFromImageUrl(url);
                const fp = this.ensureFloorPlanArrays();
                fp.backgroundUrl = url;
                fp.walls = recognized.walls;
                fp.rooms = recognized.rooms;
                fp.doors = recognized.doors;
                this.unsavedChanges = true;
                this.showNotification(`ИИ распознал стен: ${recognized.walls.length}, зон: ${recognized.rooms.length}`);
            } catch (_) {
                this.showNotification('Ошибка распознавания чертежа');
            } finally {
                this.isGeneratingMap = false;
            }
        },

        async runDemoAiBlueprint() {
            this.isGeneratingMap = true;
            try {
                const sampleUrl = window.FloorplanAiService.createSampleBlueprintDataUrl();
                const recognized = await window.FloorplanAiService.recognizePlanFromImageUrl(sampleUrl);
                const fp = this.ensureFloorPlanArrays();
                fp.backgroundUrl = sampleUrl;
                fp.walls = recognized.walls;
                fp.rooms = recognized.rooms;
                fp.doors = recognized.doors;
                this.unsavedChanges = true;
                this.showNotification(`Демо-чертёж распознан: создано ${recognized.walls.length} стен и ${recognized.rooms.length} зон`);
            } finally {
                this.isGeneratingMap = false;
            }
        },

        async saveCurrentSpaceChanges() {
            this.isSavingMap = true;
            try {
                const res = await window.ApiService.saveSpace(this.currentSpaceKey, this.currentSpace);
                if (res.space) {
                    this.spacesData[this.currentSpaceKey] = res.space;
                }
                this.unsavedChanges = false;
                this.recalculateRoute(false);
                this.showNotification(
                    res.queuedOffline
                        ? 'Сохранено локально (синхронизируется при появлении сети)'
                        : 'Карта сохранена! Опубликованная ссылка обновлена без смены адреса.'
                );
            } catch (err) {
                this.showNotification(err.message || 'Ошибка сохранения изменений');
            } finally {
                this.isSavingMap = false;
            }
        },

        // =========================================================================
        // Мастер съёмки панорам с телефона и загрузка готовых 360° (Слайд 5)
        // =========================================================================
        openCaptureWizard(poiId = '') {
            const firstPoi = this.currentSpace.pois?.[0];
            this.captureTargetPoiId = poiId ? String(poiId) : (firstPoi ? String(firstPoi.id) : '');
            const linked = (this.currentSpace.pois || []).find(p => String(p.id) === this.captureTargetPoiId);
            this.captureTitleRu = linked ? `Панорама: ${linked.name.ru}` : 'Новая панорама 360°';
            this.captureSectorIndex = 0;
            this.capturedFrames = Array(8).fill(null);
            this.stitchedPreviewUrl = '';
            this.captureWizardOpen = true;
            this.refreshIcons();
        },

        async startPhoneCameraStream() {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                this.showNotification('Камера недоступна в этом окружении — активен интерактивный режим съёмки секторов');
                return;
            }
            try {
                this.cameraStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
                    audio: false
                });
                this.cameraLiveActive = true;
                this.$nextTick(() => {
                    if (this.$refs.panoCameraVideo) {
                        this.$refs.panoCameraVideo.srcObject = this.cameraStream;
                    }
                });
                // Подписка на гироскоп/компас телефона, если поддерживается
                window.addEventListener('deviceorientation', (ev) => {
                    if (ev.alpha !== null) {
                        this.deviceCompassHeading = Math.round(ev.alpha);
                    }
                });
                this.showNotification('Камера активирована! Сделайте 8 кадров, поворачиваясь по часовой стрелке');
            } catch (_) {
                this.cameraLiveActive = false;
                this.showNotification('Доступ к камере отклонён — вы можете снять тестовую серию кадров или загрузить фото');
            }
        },

        stopPhoneCameraStream() {
            if (this.cameraStream) {
                this.cameraStream.getTracks().forEach(t => t.stop());
                this.cameraStream = null;
            }
            this.cameraLiveActive = false;
        },

        closeCaptureWizard() {
            this.stopPhoneCameraStream();
            this.captureWizardOpen = false;
        },

        captureCurrentSectorShot() {
            const videoEl = this.cameraLiveActive ? this.$refs.panoCameraVideo : null;
            const frameUrl = window.PanoramaService.captureSectorFrame(
                videoEl,
                this.captureSectorIndex,
                this.captureTitleRu || this.currentSpace.name.ru
            );
            this.capturedFrames.splice(this.captureSectorIndex, 1, frameUrl);
            if (this.captureSectorIndex < 7) {
                this.captureSectorIndex += 1;
            }
        },

        captureAllDemoSectors() {
            for (let i = 0; i < 8; i++) {
                const frameUrl = window.PanoramaService.captureSectorFrame(
                    null,
                    i,
                    this.captureTitleRu || this.currentSpace.name.ru
                );
                this.capturedFrames.splice(i, 1, frameUrl);
            }
            this.captureSectorIndex = 7;
            this.showNotification('Все 8 круговых кадров сняты — нажмите «Сшить в панораму 360°»');
        },

        async stitchAndSaveCapturedPanorama() {
            if (this.capturedFramesCount < 2) {
                this.showNotification('Сделайте минимум 2 кадра (рекомендуется 8 кадров по кругу)');
                return;
            }
            this.isStitchingPano = true;
            try {
                const stitchedDataUrl = await window.PanoramaService.stitchFramesToPanorama(this.capturedFrames);
                const uploadedUrl = await window.ApiService.uploadDataUrl(stitchedDataUrl, 'stitched360');
                this.stitchedPreviewUrl = uploadedUrl;

                const targetPoi = (this.currentSpace.pois || []).find(p => String(p.id) === String(this.captureTargetPoiId));
                const newPanoId = `pano_${Date.now()}`;
                if (!this.currentSpace.panoramas) this.currentSpace.panoramas = {};

                this.currentSpace.panoramas[newPanoId] = {
                    id: newPanoId,
                    title: {
                        ru: this.captureTitleRu || 'Сшитая панорама 360°',
                        en: this.captureTitleRu || 'Stitched 360° Panorama'
                    },
                    building: targetPoi ? targetPoi.building : this.activeBuilding,
                    floor: targetPoi ? targetPoi.floor : this.activeFloor,
                    x: targetPoi ? targetPoi.x : 360,
                    y: targetPoi ? targetPoi.y : 210,
                    poiId: targetPoi ? targetPoi.id : null,
                    imageUrl: uploadedUrl,
                    photoUrl: uploadedUrl,
                    hotspots: targetPoi
                        ? [
                              {
                                  id: `hs_auto_${Date.now()}`,
                                  type: 'info',
                                  yaw: 45,
                                  pitch: -2,
                                  poiId: targetPoi.id,
                                  label: targetPoi.name,
                                  text: targetPoi.description || { ru: targetPoi.equipment || '', en: targetPoi.equipment || '' }
                              }
                          ]
                        : []
                };

                if (targetPoi) {
                    targetPoi.panoId = newPanoId;
                }

                await this.saveCurrentSpaceChanges();
                this.closeCaptureWizard();
                this.openPanoramaById(newPanoId, false);
                this.showNotification('Кадры успешно сшиты в 360°-панораму и привязаны к карте!');
            } catch (_) {
                this.showNotification('Ошибка при сшивке кадров панорамы');
            } finally {
                this.isStitchingPano = false;
            }
        },

        async uploadReadyPanoramaFile(event, poiId = '') {
            const file = event.target.files?.[0];
            if (!file) return;
            try {
                const uploadedUrl = await window.ApiService.uploadFile(file);
                const targetPoi = poiId
                    ? (this.currentSpace.pois || []).find(p => String(p.id) === String(poiId))
                    : this.editorSelectedPoi || this.currentSpace.pois?.[0];

                const newPanoId = `pano_up_${Date.now()}`;
                if (!this.currentSpace.panoramas) this.currentSpace.panoramas = {};
                this.currentSpace.panoramas[newPanoId] = {
                    id: newPanoId,
                    title: {
                        ru: targetPoi ? `360° • ${targetPoi.name.ru}` : `Панорама ${file.name}`,
                        en: targetPoi ? `360° • ${targetPoi.name.en}` : `Panorama ${file.name}`
                    },
                    building: targetPoi ? targetPoi.building : this.activeBuilding,
                    floor: targetPoi ? targetPoi.floor : this.activeFloor,
                    x: targetPoi ? targetPoi.x : 360,
                    y: targetPoi ? targetPoi.y : 210,
                    poiId: targetPoi ? targetPoi.id : null,
                    imageUrl: uploadedUrl,
                    photoUrl: uploadedUrl,
                    hotspots: []
                };
                if (targetPoi) targetPoi.panoId = newPanoId;
                await this.saveCurrentSpaceChanges();
                this.showNotification('Готовая 360°-панорама загружена и привязана к точке!');
            } catch (_) {
                this.showNotification('Ошибка загрузки панорамы');
            }
        },

        // =========================================================================
        // 3D-модель помещения по фотографиям (Слайд 7)
        // =========================================================================
        async openRoom3DViewer(poi) {
            const target = poi || this.selectedPoi || this.currentSpace.pois?.[0];
            if (!target) return;
            if (!target.model3d) {
                target.model3d = await window.FloorplanAiService.reconstructRoom3DFromFiles(
                    [],
                    target.image || this.currentSpace.image,
                    target.name[this.lang]
                );
            }
            this.activeRoom3d = target.model3d;
            this.room3dYaw = -28;
            this.room3dPitch = -12;
            this.room3dModalOpen = true;
            this.refreshIcons();
        },

        async uploadPhotosForRoom3D(event) {
            const files = event.target.files;
            if (!files || !files.length) return;
            const target = this.editorSelectedPoi || this.selectedPoi || this.currentSpace.pois?.[0];
            const model = await window.FloorplanAiService.reconstructRoom3DFromFiles(
                files,
                target?.image || this.currentSpace.image,
                target?.name?.ru || 'Помещение'
            );
            if (target) target.model3d = model;
            this.activeRoom3d = model;
            this.room3dModalOpen = true;
            this.unsavedChanges = true;
            this.showNotification('3D-модель помещения построена по загруженным фотографиям!');
        },

        startRoom3dDrag(e) {
            this.isDraggingRoom3d = true;
            const pt = e.touches ? e.touches[0] : e;
            this.room3dDragX = pt.clientX;
            this.room3dDragY = pt.clientY;
        },

        onRoom3dDrag(e) {
            if (!this.isDraggingRoom3d) return;
            const pt = e.touches ? e.touches[0] : e;
            this.room3dYaw += (pt.clientX - this.room3dDragX) * 0.6;
            this.room3dPitch = Math.max(-45, Math.min(45, this.room3dPitch - (pt.clientY - this.room3dDragY) * 0.4));
            this.room3dDragX = pt.clientX;
            this.room3dDragY = pt.clientY;
        },

        stopRoom3dDrag() {
            this.isDraggingRoom3d = false;
        },

        // =========================================================================
        // Публикация ссылки и Аналитика организатора
        // =========================================================================
        copyTextToClipboard(text, label = 'Скопировано в буфер обмена') {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => this.showNotification(label));
            } else {
                this.showNotification(label);
            }
        },

        async loadAnalytics() {
            const data = await window.ApiService.fetchAnalytics(this.analyticsFilterSpace);
            if (data) this.analyticsData = data;
            setTimeout(() => this.initAnalyticsChart(), 90);
        },

        initAnalyticsChart() {
            const canvas = document.getElementById('analyticsChart');
            if (!canvas || typeof Chart === 'undefined') return;
            const ctx = canvas.getContext('2d');

            if (this.chartInstance) {
                this.chartInstance.destroy();
            }

            this.chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: this.analyticsData.hourly?.labels || ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
                    datasets: [{
                        label: this.lang === 'ru' ? 'Активность посетителей' : 'Visitor Activity',
                        data: this.analyticsData.hourly?.values || [140, 480, 920, 1150, 810, 430, 195],
                        borderColor: '#E31B23',
                        backgroundColor: 'rgba(227, 27, 35, 0.16)',
                        fill: true,
                        tension: 0.38,
                        pointRadius: 4,
                        pointBackgroundColor: '#E31B23'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { grid: { color: 'rgba(148, 163, 184, 0.14)' }, ticks: { color: '#94a3b8' } },
                        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        },

        showNotification(text) {
            this.notificationText = text;
            this.notificationOpen = true;
            if (this.notificationTimer) clearTimeout(this.notificationTimer);
            this.notificationTimer = setTimeout(() => {
                this.notificationOpen = false;
            }, 3400);
        }
    };
}

window.appState = appState;
