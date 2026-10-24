const express = require('express');
const db = require('../database/db');
const { requireOrganizer } = require('../middleware/auth');

const router = express.Router();

const ALLOWED_EVENTS = new Set(['map_view', 'poi_view', 'pano_view', 'route_built', 'offline_sync']);

router.post('/event', (req, res) => {
    const { spaceId = 'plaza', poiId = '', eventType = 'map_view' } = req.body || {};
    if (!ALLOWED_EVENTS.has(eventType)) {
        return res.status(400).json({ error: 'Неизвестный тип события' });
    }
    db.recordEvent({ spaceId, poiId, eventType });
    return res.status(201).json({ recorded: true });
});

router.get('/summary', requireOrganizer, (req, res) => {
    const spaceId = req.query.spaceId || 'all';
    const summary = db.getAnalyticsSummary(spaceId);

    // Обогащаем топ точек названиями пространств и POI
    const allSpaces = db.getAllSpaces();
    const spaceMap = {};
    for (const s of allSpaces) spaceMap[s.id] = s.data;

    const topPois = Object.entries(summary.topPoisRaw)
        .map(([compoundKey, views]) => {
            const [sId, pId] = compoundKey.split(':');
            const sp = spaceMap[sId];
            const poi = sp?.pois?.find(p => String(p.id) === String(pId));
            return {
                spaceId: sId,
                poiId: pId,
                views,
                spaceName: sp?.name || { ru: sId, en: sId },
                poiName: poi?.name || { ru: `Точка #${pId}`, en: `POI #${pId}` },
                categoryName: poi?.categoryName || { ru: 'Объект', en: 'Point' }
            };
        })
        .sort((a, b) => b.views - a.views)
        .slice(0, 6);

    return res.json({
        totals: summary.totals,
        hourly: summary.hourly,
        topPois,
        spaceBreakdown: summary.spaceBreakdown
    });
});

module.exports = router;
