const express = require('express');
const compression = require('compression');
const cors = require('cors');
const path = require('path');

const config = require('./config/config');
const { ensureSeedData } = require('./database/seed');

const authRoutes = require('./routes/auth.routes');
const spacesRoutes = require('./routes/spaces.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const uploadRoutes = require('./routes/upload.routes');

ensureSeedData();

const app = express();

// Разрешаем запросы с любых доменов (для превью и для встраивания виджета карты на внешние сайты)
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '18mb' }));
app.use(express.urlencoded({ extended: true, limit: '18mb' }));

// Базовые заголовки безопасности с разрешением встраивания карты через <iframe> (по ТЗ слайда 3)
app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', 'frame-ancestors *');
    next();
});

// Healthcheck
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'ttk-space-navigator', timestamp: new Date().toISOString() });
});

// REST API
app.use('/api/auth', authRoutes);
app.use('/api/spaces', spacesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/uploads', uploadRoutes);

// Раздача статики фронтенда с кэшированием ассетов для быстрой загрузки карт и панорам
app.use(express.static(config.PUBLIC_DIR, {
    etag: true,
    maxAge: '1h',
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('sw.js') || filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

// Короткие публичные ссылки на опубликованные карты и виджет встраивания
app.get('/s/:spaceId', (_req, res) => {
    res.sendFile(path.join(config.PUBLIC_DIR, 'index.html'));
});

app.get('/embed/:spaceId', (_req, res) => {
    res.sendFile(path.join(config.PUBLIC_DIR, 'index.html'));
});

// SPA Fallback для клиентских маршрутов
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API эндпоинт не найден' });
    }
    if (req.method === 'GET') {
        return res.sendFile(path.join(config.PUBLIC_DIR, 'index.html'));
    }
    next();
});

if (require.main === module) {
    app.listen(config.PORT, config.HOST, () => {
        console.log(`ТТК Карта пространств запущена на http://${config.HOST}:${config.PORT}`);
    });
}

module.exports = app;
