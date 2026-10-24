const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const config = require('../config/config');
const { requireOrganizer } = require('../middleware/auth');

fs.mkdirSync(config.UPLOADS_DIR, { recursive: true });

const ALLOWED_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg']);

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, config.UPLOADS_DIR),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase();
        const safeExt = ALLOWED_EXT.has(ext) ? ext : '.png';
        const unique = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${safeExt}`;
        cb(null, unique);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: config.MAX_UPLOAD_SIZE_BYTES },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype && file.mimetype.startsWith('image/')) {
            return cb(null, true);
        }
        cb(new Error('Разрешена загрузка только изображений (PNG, JPG, WEBP, SVG)'));
    }
});

const router = express.Router();

// Multipart file upload (готовый план этажа или 360-панорама)
router.post('/file', requireOrganizer, (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message || 'Ошибка загрузки файла' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'Файл не передан' });
        }
        return res.status(201).json({
            url: `/uploads/${req.file.filename}`,
            size: req.file.size
        });
    });
});

// Base64 DataURL upload (для сшитых в браузере панорам с камеры телефона)
router.post('/dataurl', requireOrganizer, (req, res) => {
    const { dataUrl, prefix = 'pano' } = req.body || {};
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Некорректные данные изображения' });
    }
    const match = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
    if (!match) {
        return res.status(400).json({ error: 'Поддерживаются форматы PNG, JPEG, WEBP' });
    }
    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length > config.MAX_UPLOAD_SIZE_BYTES) {
        return res.status(413).json({ error: 'Размер изображения превышает 15 МБ' });
    }
    const safePrefix = String(prefix).replace(/[^a-z0-9_-]/gi, '').slice(0, 16) || 'img';
    const filename = `${safePrefix}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}.${ext}`;
    fs.writeFileSync(path.join(config.UPLOADS_DIR, filename), buffer);

    return res.status(201).json({
        url: `/uploads/${filename}`,
        size: buffer.length
    });
});

module.exports = router;
