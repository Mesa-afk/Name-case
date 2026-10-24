/**
 * Сброс локальной базы данных (dev-утилита).
 * Удаляет файлы хранилища (SQLite или JSON) — при следующем запуске сервер
 * создаст базу заново и засеет её актуальными демо-данными.
 *
 * Запуск: npm run reset-db
 */
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

const STORAGE_FILES = [
    'navigator.sqlite',
    'navigator.sqlite-wal',
    'navigator.sqlite-shm',
    'navigator.sqlite-journal',
    'navigator-store.json'
];

let removed = 0;
for (const fileName of STORAGE_FILES) {
    const filePath = path.join(config.STORAGE_DIR, fileName);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        removed += 1;
        console.log('Удалён файл хранилища:', path.relative(config.ROOT_DIR, filePath));
    }
}

if (removed > 0) {
    console.log('База сброшена. Демо-данные будут созданы заново при следующем запуске сервера.');
} else {
    console.log('Файлов хранилища не найдено — база уже пустая.');
}
