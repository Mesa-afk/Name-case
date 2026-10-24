const express = require('express');
const db = require('../database/db');
const { optionalAuth, requireOrganizer } = require('../middleware/auth');

const router = express.Router();

function sanitizeSpaceForVisitor(record, providedPin, user) {
    const isOrganizer = user && ['admin', 'organizer'].includes(user.role);
    if (record.accessPin && !isOrganizer && String(providedPin || '') !== record.accessPin) {
        return {
            id: record.id,
            published: record.published,
            pinRequired: true,
            name: record.data.name,
            type: record.data.type,
            city: record.data.city || 'г. Ростов-на-Дону',
            price: record.data.price || '',
            desc: record.data.desc,
            rating: record.data.rating || 4.9,
            reviewsCount: record.data.reviewsCount || 1,
            image: record.data.image,
            buildings: { A: { id: 'A', name: { ru: 'Защищено PIN-кодом', en: 'PIN Protected' }, floors: [1], floorPlans: { '1': { width: 720, height: 420, rooms: [], walls: [], doors: [], windows: [] } } } },
            navGraph: { nodes: [], edges: [] },
            pois: [],
            panoramas: {}
        };
    }
    const copy = { ...record.data, pinRequired: false };
    if (!isOrganizer) {
        delete copy.accessPin;
    }
    return copy;
}

router.get('/', optionalAuth, (req, res) => {
    const isOrganizer = req.user && ['admin', 'organizer'].includes(req.user.role);
    const pinsHeader = req.query.pins ? String(req.query.pins) : '';
    const pinMap = {};
    if (pinsHeader) {
        for (const pair of pinsHeader.split(',')) {
            const [k, v] = pair.split(':');
            if (k && v) pinMap[k] = v;
        }
    }

    const records = db.getAllSpaces();
    const spaces = {};
    for (const rec of records) {
        if (!rec.published && !isOrganizer) continue;
        spaces[rec.id] = sanitizeSpaceForVisitor(rec, pinMap[rec.id], req.user);
    }
    return res.json({ spaces });
});

router.get('/:id', optionalAuth, (req, res) => {
    const rec = db.getSpaceById(req.params.id);
    if (!rec) {
        return res.status(404).json({ error: 'Пространство не найдено' });
    }
    const isOrganizer = req.user && ['admin', 'organizer'].includes(req.user.role);
    if (!rec.published && !isOrganizer) {
        return res.status(403).json({ error: 'Карта скрыта организатором (черновик)' });
    }
    const pin = req.query.pin || req.headers['x-space-pin'] || '';
    if (rec.accessPin && !isOrganizer && String(pin) !== rec.accessPin) {
        return res.status(403).json({
            error: 'Для просмотра этой карты требуется PIN-код доступа',
            pinRequired: true,
            spaceMeta: {
                id: rec.id,
                name: rec.data.name,
                type: rec.data.type,
                image: rec.data.image
            }
        });
    }
    return res.json({ space: sanitizeSpaceForVisitor(rec, pin, req.user) });
});

router.post('/', requireOrganizer, (req, res) => {
    const payload = req.body || {};
    const rawSlug = String(payload.id || payload.slug || '')
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || `space-${Date.now()}`;

    if (db.getSpaceById(rawSlug)) {
        return res.status(409).json({ error: 'Пространство с таким идентификатором уже существует' });
    }

    const newSpace = {
        id: rawSlug,
        published: payload.published !== false,
        accessPin: String(payload.accessPin || '').trim(),
        name: payload.name || { ru: 'Новое пространство', en: 'New Space' },
        type: payload.type || { ru: 'Площадка мероприятия', en: 'Event Venue' },
        city: payload.city || 'г. Ростов-на-Дону',
        price: payload.price || 'Свободный вход',
        desc: payload.desc || { ru: 'Интерактивная карта и навигация', en: 'Interactive indoor map & navigation' },
        rating: payload.rating || 5.0,
        reviewsCount: payload.reviewsCount || 1,
        image: payload.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
        campus: payload.campus || {
            width: 720,
            height: 420,
            zones: [{ id: 'cz_main', x: 30, y: 30, w: 660, h: 360, type: 'park', label: { ru: 'Территория площадки', en: 'Venue Grounds' } }],
            buildingFootprints: [{ buildingId: 'A', x: 140, y: 70, w: 440, h: 280, label: { ru: 'Корпус А', en: 'Building A' } }]
        },
        buildings: payload.buildings || {
            A: {
                id: 'A',
                name: { ru: 'Корпус А', en: 'Building A' },
                floors: [1],
                floorPlans: {
                    '1': {
                        width: 720,
                        height: 420,
                        backgroundUrl: '',
                        backgroundOpacity: 0.45,
                        rooms: [
                            { id: 'r_init', x: 60, y: 50, w: 600, h: 320, type: 'hall', label: { ru: 'Основной зал', en: 'Main Hall' } }
                        ],
                        walls: [
                            { id: 'w_1', x1: 60, y1: 50, x2: 660, y2: 50 },
                            { id: 'w_2', x1: 660, y1: 50, x2: 660, y2: 370 },
                            { id: 'w_3', x1: 60, y1: 370, x2: 660, y2: 370 },
                            { id: 'w_4', x1: 60, y1: 50, x2: 60, y2: 370 }
                        ],
                        doors: [{ id: 'd_1', x: 360, y: 370, orientation: 'h', width: 48 }],
                        windows: []
                    }
                }
            }
        },
        navGraph: payload.navGraph || {
            nodes: [
                { id: 'n_entry', building: 'A', floor: 1, x: 360, y: 330, campusX: 360, campusY: 310, type: 'corridor', panoId: '', label: { ru: 'Главный вход', en: 'Main Entrance' } },
                { id: 'n_center', building: 'A', floor: 1, x: 360, y: 200, campusX: 360, campusY: 200, type: 'corridor', panoId: '', label: { ru: 'Центр зала', en: 'Center Hall' } }
            ],
            edges: [
                { from: 'n_entry', to: 'n_center', weight: 15, kind: 'walk' }
            ]
        },
        pois: payload.pois || [
            {
                id: Date.now() % 100000,
                building: 'A',
                floor: 1,
                // Координаты в процентах от размера карты (как на клиенте: poi.x * 6.8 px)
                x: 50,
                y: 75,
                campusX: 360,
                campusY: 310,
                navNodeId: 'n_entry',
                category: 'entrance',
                categoryName: { ru: 'Вход', en: 'Entrance' },
                name: { ru: 'Главный вход', en: 'Main Entrance' },
                description: { ru: 'Входная группа площадки', en: 'Main venue entrance' },
                status: 'free',
                statusText: { ru: 'Открыто', en: 'Open' },
                capacity: '50 человек',
                equipment: 'Стойка информации',
                wifi: 'TTK_Free_WiFi',
                image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
                panoId: '',
                icon: 'door-open'
            }
        ],
        panoramas: payload.panoramas || {}
    };

    const saved = db.upsertSpace(rawSlug, newSpace, req.user.id);
    return res.status(201).json({ space: saved.data });
});

router.put('/:id', requireOrganizer, (req, res) => {
    const spaceId = req.params.id;
    const payload = req.body || {};
    if (!payload || typeof payload !== 'object') {
        return res.status(400).json({ error: 'Некорректные данные карты' });
    }

    const updated = db.upsertSpace(spaceId, { ...payload, id: spaceId }, req.user.id);
    return res.json({
        message: 'Опубликованная карта успешно обновлена без смены ссылки',
        space: updated.data
    });
});

router.delete('/:id', requireOrganizer, (req, res) => {
    const spaceId = req.params.id;
    if (['plaza', 'expo', 'hotel', 'hub'].includes(spaceId)) {
        return res.status(400).json({ error: 'Демонстрационные площадки защищены от полного удаления (их можно редактировать)' });
    }
    const ok = db.deleteSpace(spaceId);
    if (!ok) return res.status(404).json({ error: 'Пространство не найдено' });
    return res.json({ deleted: true });
});

module.exports = router;
