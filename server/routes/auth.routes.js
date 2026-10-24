const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const config = require('../config/config');
const { requireAuth } = require('../middleware/auth');
const { createRateLimiter } = require('../middleware/rateLimit');

const router = express.Router();
const authLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 25,
    message: 'Превышен лимит попыток входа. Подождите минуту.'
});

function signUserToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN }
    );
}

function formatUserResponse(user) {
    const isAdmin = user.role === 'admin' || user.role === 'organizer';
    const roleLabel = user.role === 'admin'
        ? 'Администратор ТТК'
        : user.role === 'organizer'
            ? 'Организатор площадки'
            : 'Посетитель';
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleLabel,
        isAdmin
    };
}

router.post('/register', authLimiter, (req, res) => {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Заполните имя, email и пароль' });
    }
    if (String(password).length < 4) {
        return res.status(400).json({ error: 'Пароль должен содержать минимум 4 символа' });
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
        return res.status(409).json({ error: 'Пользователь с таким email уже зарегистрирован' });
    }

    const normalizedRole = role === 'organizer' ? 'organizer' : 'visitor';
    const passwordHash = bcrypt.hashSync(String(password), 10);
    const created = db.createUser({
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        passwordHash,
        role: normalizedRole
    });

    const token = signUserToken(created);
    return res.status(201).json({
        token,
        user: formatUserResponse(created)
    });
});

router.post('/login', authLimiter, (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
        return res.status(400).json({ error: 'Введите email и пароль' });
    }

    const user = db.findUserByEmail(email);
    if (!user || !bcrypt.compareSync(String(password), user.password_hash)) {
        return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = signUserToken(user);
    return res.json({
        token,
        user: formatUserResponse(user)
    });
});

router.post('/admin-unlock', authLimiter, (req, res) => {
    const { passcode } = req.body || {};
    if (!passcode || String(passcode).trim() !== config.ADMIN_ACCESS_CODE) {
        return res.status(401).json({ error: 'Неверный код доступа организатора' });
    }

    const adminUser = db.findUserByEmail('admin@ttk.ru') || {
        id: 1,
        name: 'Администратор ТТК',
        email: 'admin@ttk.ru',
        role: 'admin'
    };

    const token = signUserToken(adminUser);
    return res.json({
        token,
        user: formatUserResponse(adminUser)
    });
});

router.get('/me', requireAuth, (req, res) => {
    const user = db.findUserById(req.user.id);
    if (!user) {
        return res.json({
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                roleLabel: req.user.role === 'admin' ? 'Администратор ТТК' : 'Организатор',
                isAdmin: ['admin', 'organizer'].includes(req.user.role)
            }
        });
    }
    return res.json({ user: formatUserResponse(user) });
});

module.exports = router;
