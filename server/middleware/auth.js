const jwt = require('jsonwebtoken');
const config = require('../config/config');

function extractToken(req) {
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7).trim();
    }
    return null;
}

function optionalAuth(req, _res, next) {
    const token = extractToken(req);
    if (!token) {
        req.user = null;
        return next();
    }
    try {
        req.user = jwt.verify(token, config.JWT_SECRET);
    } catch (_) {
        req.user = null;
    }
    next();
}

function requireAuth(req, res, next) {
    const token = extractToken(req);
    if (!token) {
        return res.status(401).json({ error: 'Требуется авторизация' });
    }
    try {
        req.user = jwt.verify(token, config.JWT_SECRET);
        next();
    } catch (_) {
        return res.status(401).json({ error: 'Недействительный или истекший токен доступа' });
    }
}

function requireOrganizer(req, res, next) {
    requireAuth(req, res, () => {
        if (!req.user || !['admin', 'organizer'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Доступ разрешён только организаторам и администраторам' });
        }
        next();
    });
}

module.exports = {
    optionalAuth,
    requireAuth,
    requireOrganizer
};
