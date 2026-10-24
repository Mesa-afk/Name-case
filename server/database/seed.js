const bcrypt = require('bcryptjs');
const db = require('./db');
const config = require('../config/config');
// Начальная база площадок берётся из тех же данных, что и офлайн-кэш фронтенда,
// поэтому сервер и клиент всегда описывают карты одинаково.
const { spacesData: defaultSpacesData } = require('../../public/js/spaces-data');

function ensureSeedData() {
    // 1. Базовые пользователи (организатор/администратор и посетитель)
    if (!db.findUserByEmail('admin@ttk.ru')) {
        db.createUser({
            name: 'Администратор ТТК',
            email: 'admin@ttk.ru',
            passwordHash: bcrypt.hashSync(config.ADMIN_ACCESS_CODE, 10),
            role: 'admin'
        });
    }

    if (!db.findUserByEmail('alexey@ttk.ru')) {
        db.createUser({
            name: 'Алексей Шереметьев',
            email: 'alexey@ttk.ru',
            passwordHash: bcrypt.hashSync('ttk2026', 10),
            role: 'visitor'
        });
    }

    // 2. Пространства по умолчанию (опубликованные, без PIN-кода)
    if (db.countSpaces() === 0) {
        const admin = db.findUserByEmail('admin@ttk.ru');
        for (const [id, space] of Object.entries(defaultSpacesData)) {
            db.upsertSpace(id, {
                ...space,
                published: true,
                accessPin: ''
            }, admin ? admin.id : null);
        }
    }

    // 3. Начальная статистика посещаемости для демонстрации графиков организатора
    if (db.countAnalytics() === 0) {
        const seedHourly = [
            { hour: 8, count: 140 },
            { hour: 10, count: 480 },
            { hour: 12, count: 920 },
            { hour: 14, count: 1150 },
            { hour: 16, count: 810 },
            { hour: 18, count: 430 },
            { hour: 20, count: 195 }
        ];
        for (const item of seedHourly) {
            db.recordEvent({ spaceId: 'plaza', eventType: 'map_view', hourBucket: item.hour, count: item.count });
        }
        db.recordEvent({ spaceId: 'expo', eventType: 'map_view', hourBucket: 12, count: 640 });
        db.recordEvent({ spaceId: 'hotel', eventType: 'map_view', hourBucket: 14, count: 520 });
        db.recordEvent({ spaceId: 'hub', eventType: 'map_view', hourBucket: 16, count: 310 });

        // Точки интереса «ТТК Плаза»: 101 — главный вход, 102 — переговорная «Альфа»
        db.recordEvent({ spaceId: 'plaza', poiId: '101', eventType: 'poi_view', hourBucket: 10, count: 420 });
        db.recordEvent({ spaceId: 'plaza', poiId: '102', eventType: 'poi_view', hourBucket: 12, count: 380 });
        db.recordEvent({ spaceId: 'plaza', poiId: '102', eventType: 'route_built', hourBucket: 12, count: 315 });
        db.recordEvent({ spaceId: 'plaza', poiId: '101', eventType: 'route_built', hourBucket: 14, count: 290 });
        db.recordEvent({ spaceId: 'plaza', poiId: '101', eventType: 'pano_view', hourBucket: 16, count: 460 });
        db.recordEvent({ spaceId: 'plaza', poiId: '102', eventType: 'pano_view', hourBucket: 12, count: 510 });

        db.recordEvent({ spaceId: 'plaza', eventType: 'offline_sync', hourBucket: 12, count: 185 });
        db.recordEvent({ spaceId: 'expo', eventType: 'offline_sync', hourBucket: 14, count: 140 });
    }
}

module.exports = { ensureSeedData };
