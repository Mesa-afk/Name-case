const fs = require('fs');
const path = require('path');
const config = require('../config/config');

fs.mkdirSync(config.STORAGE_DIR, { recursive: true });

let sqliteModule = null;
try {
    sqliteModule = require('node:sqlite');
} catch (_) {
    sqliteModule = null;
}

/**
 * Надёжное хранилище данных:
 * использует встроенный движок SQLite (node:sqlite DatabaseSync в Node 22+),
 * а на более старых версиях Node автоматически переключается на атомарное JSON-хранилище.
 */
class DatabaseAdapter {
    constructor() {
        this.mode = sqliteModule && sqliteModule.DatabaseSync ? 'sqlite' : 'json';
        if (this.mode === 'sqlite') {
            const dbPath = path.join(config.STORAGE_DIR, 'navigator.sqlite');
            this.db = new sqliteModule.DatabaseSync(dbPath);
            this._initSqlite();
        } else {
            this.jsonPath = path.join(config.STORAGE_DIR, 'navigator-store.json');
            this._initJson();
        }
    }

    _initSqlite() {
        this.db.exec(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'visitor',
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS spaces (
                id TEXT PRIMARY KEY,
                owner_id INTEGER,
                published INTEGER NOT NULL DEFAULT 1,
                access_pin TEXT NOT NULL DEFAULT '',
                payload_json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS analytics_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                space_id TEXT NOT NULL,
                poi_id TEXT DEFAULT '',
                event_type TEXT NOT NULL,
                hour_bucket INTEGER NOT NULL,
                count INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_analytics_space ON analytics_events(space_id);
            CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
        `);
    }

    _initJson() {
        if (!fs.existsSync(this.jsonPath)) {
            this._writeJson({ users: [], spaces: {}, analytics_events: [], seqUser: 1, seqEvent: 1 });
        }
    }

    _readJson() {
        return JSON.parse(fs.readFileSync(this.jsonPath, 'utf8'));
    }

    _writeJson(data) {
        const tmp = `${this.jsonPath}.tmp`;
        fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
        fs.renameSync(tmp, this.jsonPath);
    }

    // ---- Users ----
    findUserByEmail(email) {
        const normalized = String(email || '').trim().toLowerCase();
        if (this.mode === 'sqlite') {
            return this.db.prepare('SELECT * FROM users WHERE email = ?').get(normalized) || null;
        }
        const store = this._readJson();
        return store.users.find(u => u.email === normalized) || null;
    }

    findUserById(id) {
        if (this.mode === 'sqlite') {
            return this.db.prepare('SELECT * FROM users WHERE id = ?').get(Number(id)) || null;
        }
        const store = this._readJson();
        return store.users.find(u => u.id === Number(id)) || null;
    }

    createUser({ name, email, passwordHash, role = 'visitor' }) {
        const normalized = String(email || '').trim().toLowerCase();
        const now = new Date().toISOString();
        if (this.mode === 'sqlite') {
            const stmt = this.db.prepare(
                'INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)'
            );
            const res = stmt.run(name, normalized, passwordHash, role, now);
            return this.findUserById(res.lastInsertRowid);
        }
        const store = this._readJson();
        const user = {
            id: store.seqUser++,
            name,
            email: normalized,
            password_hash: passwordHash,
            role,
            created_at: now
        };
        store.users.push(user);
        this._writeJson(store);
        return user;
    }

    // ---- Spaces ----
    countSpaces() {
        if (this.mode === 'sqlite') {
            const row = this.db.prepare('SELECT COUNT(*) AS cnt FROM spaces').get();
            return Number(row.cnt || 0);
        }
        return Object.keys(this._readJson().spaces).length;
    }

    getAllSpaces() {
        if (this.mode === 'sqlite') {
            const rows = this.db.prepare('SELECT * FROM spaces ORDER BY rowid ASC').all();
            return rows.map(r => ({
                id: r.id,
                published: Boolean(r.published),
                accessPin: r.access_pin || '',
                updatedAt: r.updated_at,
                data: JSON.parse(r.payload_json)
            }));
        }
        const store = this._readJson();
        return Object.values(store.spaces);
    }

    getSpaceById(id) {
        if (this.mode === 'sqlite') {
            const r = this.db.prepare('SELECT * FROM spaces WHERE id = ?').get(String(id));
            if (!r) return null;
            return {
                id: r.id,
                published: Boolean(r.published),
                accessPin: r.access_pin || '',
                updatedAt: r.updated_at,
                data: JSON.parse(r.payload_json)
            };
        }
        const store = this._readJson();
        return store.spaces[String(id)] || null;
    }

    upsertSpace(id, spaceData, ownerId = null) {
        const cleanId = String(id).trim();
        const published = spaceData.published !== false ? 1 : 0;
        const accessPin = String(spaceData.accessPin || '').trim();
        const now = new Date().toISOString();
        const normalizedPayload = {
            ...spaceData,
            id: cleanId,
            published: Boolean(published),
            accessPin,
            updatedAt: now
        };
        if (this.mode === 'sqlite') {
            this.db.prepare(`
                INSERT INTO spaces (id, owner_id, published, access_pin, payload_json, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    published = excluded.published,
                    access_pin = excluded.access_pin,
                    payload_json = excluded.payload_json,
                    updated_at = excluded.updated_at
            `).run(cleanId, ownerId, published, accessPin, JSON.stringify(normalizedPayload), now);
            return this.getSpaceById(cleanId);
        }
        const store = this._readJson();
        store.spaces[cleanId] = {
            id: cleanId,
            published: Boolean(published),
            accessPin,
            updatedAt: now,
            data: normalizedPayload
        };
        this._writeJson(store);
        return store.spaces[cleanId];
    }

    deleteSpace(id) {
        if (this.mode === 'sqlite') {
            const res = this.db.prepare('DELETE FROM spaces WHERE id = ?').run(String(id));
            return res.changes > 0;
        }
        const store = this._readJson();
        if (!store.spaces[id]) return false;
        delete store.spaces[id];
        this._writeJson(store);
        return true;
    }

    // ---- Analytics ----
    countAnalytics() {
        if (this.mode === 'sqlite') {
            const row = this.db.prepare('SELECT COUNT(*) AS cnt FROM analytics_events').get();
            return Number(row.cnt || 0);
        }
        return this._readJson().analytics_events.length;
    }

    recordEvent({ spaceId = 'plaza', poiId = '', eventType = 'map_view', hourBucket = null, count = 1 }) {
        const hour = hourBucket !== null && hourBucket !== undefined ? Number(hourBucket) : new Date().getHours();
        const now = new Date().toISOString();
        if (this.mode === 'sqlite') {
            this.db.prepare(`
                INSERT INTO analytics_events (space_id, poi_id, event_type, hour_bucket, count, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(String(spaceId), String(poiId || ''), String(eventType), hour, Number(count) || 1, now);
            return;
        }
        const store = this._readJson();
        store.analytics_events.push({
            id: store.seqEvent++,
            space_id: String(spaceId),
            poi_id: String(poiId || ''),
            event_type: String(eventType),
            hour_bucket: hour,
            count: Number(count) || 1,
            created_at: now
        });
        this._writeJson(store);
    }

    getAnalyticsSummary(spaceId = null) {
        let rows = [];
        if (this.mode === 'sqlite') {
            if (spaceId && spaceId !== 'all') {
                rows = this.db.prepare('SELECT * FROM analytics_events WHERE space_id = ?').all(String(spaceId));
            } else {
                rows = this.db.prepare('SELECT * FROM analytics_events').all();
            }
        } else {
            const store = this._readJson();
            rows = spaceId && spaceId !== 'all'
                ? store.analytics_events.filter(e => e.space_id === String(spaceId))
                : store.analytics_events;
        }

        const totals = {
            mapViews: 0,
            routesBuilt: 0,
            panoViews: 0,
            offlineSessions: 0,
            poiViews: 0
        };

        const hourlyBuckets = { 8: 0, 10: 0, 12: 0, 14: 0, 16: 0, 18: 0, 20: 0 };
        const poiCounts = {};
        const spaceCounts = {};

        for (const r of rows) {
            const c = Number(r.count) || 1;
            if (r.event_type === 'map_view') totals.mapViews += c;
            else if (r.event_type === 'route_built') totals.routesBuilt += c;
            else if (r.event_type === 'pano_view') totals.panoViews += c;
            else if (r.event_type === 'offline_sync') totals.offlineSessions += c;
            else if (r.event_type === 'poi_view') totals.poiViews += c;

            // Snap hour to nearest 2-hour chart bucket
            const h = Number(r.hour_bucket);
            const bucketKeys = [8, 10, 12, 14, 16, 18, 20];
            let nearest = 12;
            let bestDiff = 99;
            for (const bk of bucketKeys) {
                const diff = Math.abs(h - bk);
                if (diff < bestDiff) {
                    bestDiff = diff;
                    nearest = bk;
                }
            }
            hourlyBuckets[nearest] = (hourlyBuckets[nearest] || 0) + c;

            if (r.poi_id) {
                const key = `${r.space_id}:${r.poi_id}`;
                poiCounts[key] = (poiCounts[key] || 0) + c;
            }
            if (r.space_id) {
                spaceCounts[r.space_id] = (spaceCounts[r.space_id] || 0) + c;
            }
        }

        return {
            totals,
            hourly: {
                labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
                values: [8, 10, 12, 14, 16, 18, 20].map(k => hourlyBuckets[k] || 0)
            },
            topPoisRaw: poiCounts,
            spaceBreakdown: spaceCounts
        };
    }
}

const db = new DatabaseAdapter();
module.exports = db;
