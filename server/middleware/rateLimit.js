/**
 * Защита от перебора паролей (rate limiter в памяти)
 */
function createRateLimiter({ windowMs = 60_000, max = 30, message = 'Слишком много запросов, попробуйте позже' } = {}) {
    const hits = new Map();

    // Периодическая очистка устаревших записей
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of hits.entries()) {
            if (now > entry.resetAt) hits.delete(key);
        }
    }, windowMs).unref();

    return function rateLimitMiddleware(req, res, next) {
        const ip = req.ip || req.socket?.remoteAddress || 'unknown';
        const now = Date.now();
        let entry = hits.get(ip);
        if (!entry || now > entry.resetAt) {
            entry = { count: 0, resetAt: now + windowMs };
            hits.set(ip, entry);
        }
        entry.count += 1;
        if (entry.count > max) {
            return res.status(429).json({ error: message });
        }
        next();
    };
}

module.exports = { createRateLimiter };
