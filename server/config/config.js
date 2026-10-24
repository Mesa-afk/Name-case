const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..', '..');

module.exports = {
    PORT: Number(process.env.PORT) || 3000,
    HOST: process.env.HOST || '0.0.0.0',
    JWT_SECRET: process.env.JWT_SECRET || 'ttk-space-navigator-jwt-secret-2026',
    JWT_EXPIRES_IN: '7d',
    ADMIN_ACCESS_CODE: process.env.ADMIN_ACCESS_CODE || 'admin2026',
    ROOT_DIR,
    PUBLIC_DIR: path.join(ROOT_DIR, 'public'),
    UPLOADS_DIR: path.join(ROOT_DIR, 'public', 'uploads'),
    STORAGE_DIR: path.join(__dirname, '..', 'database', 'storage'),
    MAX_UPLOAD_SIZE_BYTES: 15 * 1024 * 1024 // 15 MB
};
