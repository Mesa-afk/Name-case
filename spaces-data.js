/**
 * ============================================================================
 * Международная система интернационализации (i18n) для ТТК Навигатор
 * Поддерживает русский (ru) и английский (en) языки интерфейса.
 * ============================================================================
 */
const i18n = {
    ru: {
        navSpaces: "Пространства",
        navMap: "Карта и навигация",
        navCabinet: "Кабинет",
        navAdmin: "Админ-панель",
        navLogin: "Войти",
        searchPlaceholder: "Поиск объектов, залов, оборудования...",
        heroTitle: "Карта пространства и панорамы 360°",
        heroDesc: "Современный высокоточный сервис для навигации внутри зданий, бизнес-центров класса А, отелей и выставочных комплексов с поддержкой офлайн-режима.",
        openMapBtn: "Открыть карту ТТК Плаза",
        searchPhotoBtn: "Найти объект по фото",
        spacesTitle: "Доступные пространства и объекты",
        spacesSub: "Выберите объект для детального осмотра панорам 360° и построения оптимального маршрута",
        buildingLabel: "Корпус:",
        floorLabel: "Этаж",
        routeTitle: "Построение маршрута",
        routeFrom: "Точка отправления (А)",
        routeTo: "Точка назначения (В)",
        buildRouteBtn: "Построить маршрут",
        resetBtn: "Сбросить",
        panoBtn: "360° Панорама",
        capacity: "Вместимость",
        equipment: "Оборудование",
        wifi: "Wi-Fi покрытие",
        statusFree: "Свободно",
        statusBusy: "Занято",
        statusBookable: "Можно забронировать",
        routeHere: "Маршрут сюда",
        analyticsTitle: "Аналитика посещаемости и пространств",
        analyticsSub: "Статистика просмотров интерактивной карты, популярных маршрутов и плотности потока",
        editorTitle: "Редактор точек, съемка и ИИ-планы",
        authTitle: "Вход / Регистрация в системе ТТК",
        adminAuthPromptTitle: "Авторизация администратора ТТК",
        adminAuthPromptDesc: "Для доступа к панели администратора введите защищенный пароль admin2026",
        adminPasswordLabel: "Пароль администратора",
        adminLoginBtn: "Войти в админ-панель",
        registerTab: "Регистрация",
        loginTab: "Авторизация",
        registerBtn: "Зарегистрироваться",
        loginBtn: "Войти в систему",
        offlineModeOn: "Офлайн-режим",
        offlineModeOff: "Онлайн",
        privacyApi: "Конфиденциальность API",
        termsLink: "Условия использования",
        footerCopy: "© 2026 ТТК (ТрансТелеком). Все права защищены.",
        adminLinkTitle: "Перейти в админ-панель",
        changeObject: "Сменить объект"
    },
    en: {
        navSpaces: "Spaces",
        navMap: "Map & Navigation",
        navCabinet: "Dashboard",
        navAdmin: "Admin Panel",
        navLogin: "Sign In",
        searchPlaceholder: "Search spaces, rooms, equipment...",
        heroTitle: "Space Map & 360° Panoramas",
        heroDesc: "Modern high-precision indoor navigation service for buildings, Class A business centers, hotels, and exhibition complexes with offline mode support.",
        openMapBtn: "Open TTK Plaza Map",
        searchPhotoBtn: "Search by Photo",
        spacesTitle: "Available Spaces & Venues",
        spacesSub: "Select a space to view 360° panoramas and build optimal routes",
        buildingLabel: "Building:",
        floorLabel: "Floor",
        routeTitle: "Route Builder",
        routeFrom: "From (My Location)",
        routeTo: "To (Destination)",
        buildRouteBtn: "Build Route",
        resetBtn: "Reset",
        panoBtn: "360° Panorama",
        capacity: "Capacity",
        equipment: "Equipment",
        wifi: "Wi-Fi Coverage",
        statusFree: "Available",
        statusBusy: "Occupied",
        statusBookable: "Bookable",
        routeHere: "Route Here",
        analyticsTitle: "Attendance & Space Analytics",
        analyticsSub: "Interactive map view statistics, popular routes, and peak traffic density",
        editorTitle: "Point Editor, Capture & AI Blueprints",
        authTitle: "Sign In / Register to TTK System",
        adminAuthPromptTitle: "TTK Administrator Authorization",
        adminAuthPromptDesc: "Enter secure admin password admin2026 to access the administration panel",
        adminPasswordLabel: "Admin Password",
        adminLoginBtn: "Access Admin Panel",
        registerTab: "Register",
        loginTab: "Sign In",
        registerBtn: "Create Account",
        loginBtn: "Log In",
        offlineModeOn: "Offline Mode",
        offlineModeOff: "Online",
        privacyApi: "API Privacy",
        termsLink: "Terms of Use",
        footerCopy: "© 2026 TTK (TransTeleCom). All rights reserved.",
        adminLinkTitle: "Go to Admin Panel",
        changeObject: "Change Object"
    }
};

/**
 * ============================================================================
 * База данных пространств, корпусов, этажей и точек интереса (POI)
 * ============================================================================
 */
const spacesData = {
    plaza: {
        id: 'plaza',
        name: { ru: 'Бизнес-центр «ТТК Плаза»', en: 'Business Center "TTK Plaza"' },
        type: { ru: 'Бизнес-центр класса А', en: 'Class A Business Center' },
        price: 'от 1 200 ₽ / час',
        desc: { ru: 'Главный офис ТрансТелеком. Переговорные комнаты, серверные узлы, кофе-пойнты и комфортные зоны отдыха.', en: 'TransTeleCom Head Office. Meeting rooms, server rooms, coffee points and lounge areas.' },
        rating: 4.9,
        reviewsCount: 128,
        image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
        buildings: {
            'A': {
                name: { ru: 'Корпус А (Главный)', en: 'Building A (Main)' },
                floors: [1, 2, 3]
            },
            'B': {
                name: { ru: 'Корпус B (Конгресс-холл)', en: 'Building B (Congress Hall)' },
                floors: [1, 2]
            }
        },
        pois: [
            { 
                id: 101, 
                building: 'A',
                name: { ru: 'Главный вход и Центральный ресепшн', en: 'Main Entrance & Central Reception' }, 
                floor: 1, 
                category: 'entrance', 
                categoryName: { ru: 'Вход / Ресепшн', en: 'Entrance / Reception' }, 
                x: 25, 
                y: 30, 
                status: 'free', 
                statusText: { ru: 'Свободно', en: 'Available' },
                capacity: '50 человек', 
                equipment: 'Стойка информации, Турникеты, Инфо-терминал', 
                wifi: 'TTK_Corporate (5G)',
                image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80', 
                icon: 'door-open' 
            },
            { 
                id: 102, 
                building: 'A',
                name: { ru: 'Переговорная Альфа', en: 'Alfa Meeting Room' }, 
                floor: 3, 
                category: 'meeting', 
                categoryName: { ru: 'Переговорная', en: 'Meeting Room' }, 
                x: 55, 
                y: 30, 
                status: 'bookable', 
                statusText: { ru: 'Свободно', en: 'Available' },
                capacity: '10 человек', 
                equipment: 'Проектор, маркерная доска, ВКС система', 
                wifi: 'TTK_Corporate (5G)',
                image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80', 
                icon: 'users' 
            },
            { 
                id: 103, 
                building: 'A',
                name: { ru: 'Кофе-пойнт и Лаунж зона', en: 'Coffee Point & Lounge' }, 
                floor: 2, 
                category: 'service', 
                categoryName: { ru: 'Зона отдыха', en: 'Lounge' }, 
                x: 75, 
                y: 70, 
                status: 'free', 
                statusText: { ru: 'Открыто', en: 'Open' },
                capacity: '25 человек', 
                equipment: 'Кофемашины, Кулеры с водой, Мягкая мебель', 
                wifi: 'TTK_Corporate (5G)',
                image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80', 
                icon: 'coffee' 
            },
            { 
                id: 104, 
                building: 'B',
                name: { ru: 'Главный Конференц-Зал «ТТК»', en: 'Main Conference Hall "TTK"' }, 
                floor: 1, 
                category: 'meeting', 
                categoryName: { ru: 'Зал мероприятий', en: 'Event Hall' }, 
                x: 40, 
                y: 70, 
                status: 'busy', 
                statusText: { ru: 'Занято', en: 'Occupied' },
                capacity: '120 человек', 
                equipment: 'Сцена, LED-экран 8x4m, Радиомикрофоны', 
                wifi: 'TTK_Corporate (5G)',
                image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80', 
                icon: 'presentation' 
            }
        ]
    },
    expo: {
        id: 'expo',
        name: { ru: 'Выставочный комплекс «Экспо-Сити»', en: 'Exhibition Complex "Expo-City"' },
        type: { ru: 'Выставочный павильон', en: 'Exhibition Pavilion' },
        price: 'от 3 500 ₽ / кв.м',
        desc: { ru: 'Инновационный форум связи и телекоммуникаций. Стенды партнёров и интерактивные зоны нетворкинга.', en: 'Innovative telecom forum. Partner booths and interactive networking areas.' },
        rating: 4.7,
        reviewsCount: 94,
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
        buildings: {
            'A': {
                name: { ru: 'Павильон №1', en: 'Pavilion No. 1' },
                floors: [1, 2]
            },
            'B': {
                name: { ru: 'Павильон №2', en: 'Pavilion No. 2' },
                floors: [1]
            }
        },
        pois: [
            { 
                id: 201, 
                building: 'A',
                name: { ru: 'Главный вход павильона А', en: 'Main Entrance Pavilion A' }, 
                floor: 1, 
                category: 'entrance', 
                categoryName: { ru: 'Вход', en: 'Entrance' }, 
                x: 30, 
                y: 40, 
                status: 'free', 
                statusText: { ru: 'Свободно', en: 'Available' },
                capacity: '200+ человек', 
                equipment: 'Рамки металлодетекторов, Регистрация по QR', 
                wifi: 'TTK_Corporate (5G)',
                image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80', 
                icon: 'door-open' 
            },
            { 
                id: 202, 
                building: 'A',
                name: { ru: 'Интерактивный стенд ТТК «Связь Будущего»', en: 'TTK Interactive Stand' }, 
                floor: 1, 
                category: 'service', 
                categoryName: { ru: 'Стенд', en: 'Exhibition Stand' }, 
                x: 60, 
                y: 50, 
                status: 'free', 
                statusText: { ru: 'Работает', en: 'Active' },
                capacity: '30 человек', 
                equipment: 'VR-очки, сенсорные интерактивные столы, демо 5G', 
                wifi: 'TTK_Corporate (5G)',
                image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80', 
                icon: 'sparkles' 
            }
        ]
    },
    hotel: {
        id: 'hotel',
        name: { ru: 'Отель «Гранд Сити»', en: 'Grand City Hotel' },
        type: { ru: 'Конференц-отель 5★', en: 'Conference Hotel 5★' },
        price: 'от 8 500 ₽ / сутки',
        desc: { ru: 'Конференц-отель с панорамными номерами, современным спа-комплексом и ресторанами высокой кухни.', en: 'Conference hotel with panoramic rooms, spa complex and fine dining.' },
        rating: 4.9,
        reviewsCount: 215,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        buildings: {
            'A': {
                name: { ru: 'Главный Корпус', en: 'Main Building' },
                floors: [1, 2, 3, 4, 5]
            }
        },
        pois: [
            { 
                id: 301, 
                building: 'A',
                name: { ru: 'Ресепшн и Лобби отеля', en: 'Hotel Reception & Lobby' }, 
                floor: 1, 
                category: 'entrance', 
                categoryName: { ru: 'Ресепшн', en: 'Reception' }, 
                x: 50, 
                y: 50, 
                status: 'free', 
                statusText: { ru: 'Свободно', en: 'Available' },
                capacity: '40 человек', 
                equipment: 'Стойка регистрации, консьерж-сервис', 
                wifi: 'TTK_Corporate (5G)',
                image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', 
                icon: 'home' 
            },
            { 
                id: 302, 
                building: 'A',
                name: { ru: 'Ресторан «Бордо»', en: 'Bordeaux Restaurant' }, 
                floor: 2, 
                category: 'service', 
                categoryName: { ru: 'Ресторан', en: 'Restaurant' }, 
                x: 65, 
                y: 35, 
                status: 'bookable', 
                statusText: { ru: 'Открыто', en: 'Open' },
                capacity: '80 человек', 
                equipment: 'Шведский стол, Винная карта, VIP-ложа', 
                wifi: 'TTK_Corporate (5G)',
                image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', 
                icon: 'utensils' 
            }
        ]
    },
    hub: {
        id: 'hub',
        name: { ru: 'Инновационный IT-Хаб ТТК', en: 'TTK Innovation IT-Hub' },
        type: { ru: 'Коворкинг и инкубатор', en: 'Coworking & Incubator' },
        price: 'от 900 ₽ / день',
        desc: { ru: 'Пространство для разработчиков, инженеров и IT-специалистов. Высокоскоростной доступ в сеть и лаборатории.', en: 'Hub for developers, engineers and IT specialists. High-speed network access and labs.' },
        rating: 4.8,
        reviewsCount: 76,
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
        buildings: {
            'A': {
                name: { ru: 'Технопарк', en: 'Technopark' },
                floors: [1, 2]
            }
        },
        pois: [
            { 
                id: 401, 
                building: 'A',
                name: { ru: 'Главная серверная лаборатория', en: 'Main Server Lab' }, 
                floor: 1, 
                category: 'service', 
                categoryName: { ru: 'Лаборатория', en: 'Laboratory' }, 
                x: 45, 
                y: 45, 
                status: 'free', 
                statusText: { ru: 'Активно', en: 'Active' },
                capacity: '15 человек', 
                equipment: 'Серверные стойки, Тестовые стенды 10G', 
                wifi: 'TTK_Corporate (5G)',
                image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80', 
                icon: 'cpu' 
            }
        ]
    }
};