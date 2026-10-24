/**
 * Начальная база пространств, 2D-планов этажей, генеральных планов территорий,
 * графов маршрутизации (внутри этажей, между этажами и между зданиями),
 * точек интереса (POI) и 360°-панорам с интерактивными хотспотами.
 */
const defaultSpacesData = {
    plaza: {
        id: 'plaza',
        published: true,
        accessPin: '',
        name: { ru: 'Бизнес-центр «ТТК Плаза»', en: 'Business Center "TTK Plaza"' },
        type: { ru: 'Бизнес-центр класса А', en: 'Class A Business Center' },
        city: 'г. Ростов-на-Дону',
        price: 'от 1 200 ₽ / час',
        desc: {
            ru: 'Главный кампус ТрансТелеКом: два соединённых корпуса, переговорные с ВКС, конгресс-холл, зоны Wi-Fi 5G и лаунж-пространства.',
            en: 'TransTeleCom flagship campus: two connected buildings, VCS meeting rooms, congress hall, 5G Wi-Fi zones and lounges.'
        },
        rating: 4.9,
        reviewsCount: 128,
        image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
        campus: {
            width: 720,
            height: 420,
            zones: [
                { id: 'cz_park', x: 30, y: 30, w: 660, h: 360, type: 'park', label: { ru: 'Территория кампуса ТТК Плаза', en: 'TTK Plaza Campus Grounds' } },
                { id: 'cz_walk', x: 260, y: 175, w: 200, h: 56, type: 'corridor', label: { ru: 'Крытая пешеходная галерея', en: 'Covered Pedestrian Gallery' } },
                { id: 'cz_parking', x: 265, y: 275, w: 190, h: 95, type: 'service', label: { ru: 'Гостевая парковка и КПП', en: 'Visitor Parking & Gate' } }
            ],
            buildingFootprints: [
                { buildingId: 'A', x: 55, y: 65, w: 215, h: 275, label: { ru: 'Корпус А (Этажи 1–3)', en: 'Building A (Floors 1–3)' } },
                { buildingId: 'B', x: 450, y: 75, w: 220, h: 255, label: { ru: 'Корпус B • Конгресс-холл', en: 'Building B • Congress Hall' } }
            ]
        },
        buildings: {
            'A': {
                id: 'A',
                name: { ru: 'Корпус А (Главный)', en: 'Building A (Main)' },
                floors: [1, 2, 3],
                floorPlans: {
                    '1': {
                        width: 720,
                        height: 420,
                        backgroundUrl: '',
                        backgroundOpacity: 0.45,
                        rooms: [
                            { id: 'pa1_lobby', x: 40, y: 40, w: 230, h: 210, type: 'hall', label: { ru: 'Главный холл и Ресепшн', en: 'Main Lobby & Reception' } },
                            { id: 'pa1_sec', x: 40, y: 250, w: 230, h: 130, type: 'entrance', label: { ru: 'Входная группа и Турникеты', en: 'Main Entrance & Turnstiles' } },
                            { id: 'pa1_corr', x: 270, y: 155, w: 410, h: 95, type: 'corridor', label: { ru: 'Центральная галерея 1 этажа', en: '1st Floor Central Corridor' } },
                            { id: 'pa1_lift', x: 270, y: 40, w: 185, h: 115, type: 'vertical', label: { ru: 'Лифтовой холл и Лестница', en: 'Elevators & Staircase' } },
                            { id: 'pa1_noc', x: 455, y: 40, w: 225, h: 115, type: 'tech', label: { ru: 'Узел связи и Wi-Fi 5G ТТК', en: 'TTK Telecom & 5G Wi-Fi Hub' } },
                            { id: 'pa1_cafe', x: 270, y: 250, w: 220, h: 130, type: 'service', label: { ru: 'Экспресс-кофейня и Инфо-зона', en: 'Express Coffee & Info Zone' } },
                            { id: 'pa1_yard', x: 490, y: 250, w: 190, h: 130, type: 'entrance', label: { ru: 'Выход в галерею к Корпусу B', en: 'Passage to Building B' } }
                        ],
                        walls: [
                            { id: 'w1', x1: 40, y1: 40, x2: 680, y2: 40 },
                            { id: 'w2', x1: 680, y1: 40, x2: 680, y2: 380 },
                            { id: 'w3', x1: 40, y1: 380, x2: 680, y2: 380 },
                            { id: 'w4', x1: 40, y1: 40, x2: 40, y2: 380 },
                            { id: 'w5', x1: 270, y1: 40, x2: 270, y2: 155 },
                            { id: 'w6', x1: 270, y1: 250, x2: 270, y2: 380 },
                            { id: 'w7', x1: 455, y1: 40, x2: 455, y2: 155 },
                            { id: 'w8', x1: 490, y1: 250, x2: 490, y2: 380 },
                            { id: 'w9', x1: 40, y1: 250, x2: 125, y2: 250 },
                            { id: 'w10', x1: 185, y1: 250, x2: 270, y2: 250 }
                        ],
                        doors: [
                            { id: 'd1', x: 155, y: 380, orientation: 'h', width: 48 },
                            { id: 'd2', x: 270, y: 202, orientation: 'v', width: 44 },
                            { id: 'd3', x: 360, y: 155, orientation: 'h', width: 42 },
                            { id: 'd4', x: 565, y: 155, orientation: 'h', width: 38 },
                            { id: 'd5', x: 680, y: 202, orientation: 'v', width: 44 }
                        ],
                        windows: [
                            { id: 'win1', x1: 80, y1: 40, x2: 220, y2: 40 },
                            { id: 'win2', x1: 500, y1: 40, x2: 630, y2: 40 }
                        ]
                    },
                    '2': {
                        width: 720,
                        height: 420,
                        backgroundUrl: '',
                        backgroundOpacity: 0.45,
                        rooms: [
                            { id: 'pa2_open', x: 40, y: 40, w: 230, h: 340, type: 'hall', label: { ru: 'Open Space • Инженерия сети', en: 'Open Space • Network Engineering' } },
                            { id: 'pa2_lift', x: 270, y: 40, w: 185, h: 115, type: 'vertical', label: { ru: 'Лифтовой холл 2 этажа', en: '2nd Floor Elevator Hall' } },
                            { id: 'pa2_print', x: 455, y: 40, w: 225, h: 115, type: 'tech', label: { ru: 'Принт-пойнт и ИТ-поддержка', en: 'Print Hub & IT Helpdesk' } },
                            { id: 'pa2_corr', x: 270, y: 155, w: 410, h: 95, type: 'corridor', label: { ru: 'Коридор 2 этажа', en: '2nd Floor Corridor' } },
                            { id: 'pa2_lounge', x: 270, y: 250, w: 410, h: 130, type: 'service', label: { ru: 'Кофе-пойнт и Лаунж зона', en: 'Coffee Point & Lounge Area' } }
                        ],
                        walls: [
                            { id: 'w2_1', x1: 40, y1: 40, x2: 680, y2: 40 },
                            { id: 'w2_2', x1: 680, y1: 40, x2: 680, y2: 380 },
                            { id: 'w2_3', x1: 40, y1: 380, x2: 680, y2: 380 },
                            { id: 'w2_4', x1: 40, y1: 40, x2: 40, y2: 380 },
                            { id: 'w2_5', x1: 270, y1: 40, x2: 270, y2: 175 },
                            { id: 'w2_6', x1: 270, y1: 230, x2: 270, y2: 380 },
                            { id: 'w2_7', x1: 455, y1: 40, x2: 455, y2: 155 }
                        ],
                        doors: [
                            { id: 'd2_1', x: 270, y: 202, orientation: 'v', width: 44 },
                            { id: 'd2_2', x: 360, y: 155, orientation: 'h', width: 42 },
                            { id: 'd2_3', x: 480, y: 250, orientation: 'h', width: 54 }
                        ],
                        windows: [
                            { id: 'win2_1', x1: 40, y1: 90, x2: 40, y2: 320 },
                            { id: 'win2_2', x1: 340, y1: 380, x2: 620, y2: 380 }
                        ]
                    },
                    '3': {
                        width: 720,
                        height: 420,
                        backgroundUrl: '',
                        backgroundOpacity: 0.45,
                        rooms: [
                            { id: 'pa3_beta', x: 40, y: 40, w: 230, h: 190, type: 'meeting', label: { ru: 'Переговорная «Бета»', en: 'Beta Meeting Room' } },
                            { id: 'pa3_exec', x: 40, y: 230, w: 230, h: 150, type: 'hall', label: { ru: 'Проектный офис ТТК', en: 'TTK Project Office' } },
                            { id: 'pa3_lift', x: 270, y: 40, w: 185, h: 115, type: 'vertical', label: { ru: 'Лифтовой холл 3 этажа', en: '3rd Floor Elevator Hall' } },
                            { id: 'pa3_alfa', x: 455, y: 40, w: 225, h: 135, type: 'meeting', label: { ru: 'Переговорная «Альфа» (ВКС)', en: 'Alfa VCS Meeting Room' } },
                            { id: 'pa3_corr', x: 270, y: 175, w: 410, h: 80, type: 'corridor', label: { ru: 'Панорамный холл 3 этажа', en: '3rd Floor Panoramic Hall' } },
                            { id: 'pa3_terrace', x: 270, y: 255, w: 410, h: 125, type: 'service', label: { ru: 'Зимний сад и Зона тихой работы', en: 'Winter Garden & Quiet Zone' } }
                        ],
                        walls: [
                            { id: 'w3_1', x1: 40, y1: 40, x2: 680, y2: 40 },
                            { id: 'w3_2', x1: 680, y1: 40, x2: 680, y2: 380 },
                            { id: 'w3_3', x1: 40, y1: 380, x2: 680, y2: 380 },
                            { id: 'w3_4', x1: 40, y1: 40, x2: 40, y2: 380 },
                            { id: 'w3_5', x1: 270, y1: 40, x2: 270, y2: 185 },
                            { id: 'w3_6', x1: 270, y1: 240, x2: 270, y2: 380 },
                            { id: 'w3_7', x1: 455, y1: 40, x2: 455, y2: 175 },
                            { id: 'w3_8', x1: 40, y1: 230, x2: 270, y2: 230 }
                        ],
                        doors: [
                            { id: 'd3_1', x: 360, y: 155, orientation: 'h', width: 42 },
                            { id: 'd3_2', x: 565, y: 175, orientation: 'h', width: 44 },
                            { id: 'd3_3', x: 270, y: 145, orientation: 'v', width: 38 }
                        ],
                        windows: [
                            { id: 'win3_1', x1: 480, y1: 40, x2: 650, y2: 40 },
                            { id: 'win3_2', x1: 680, y1: 70, x2: 680, y2: 165 }
                        ]
                    }
                }
            },
            'B': {
                id: 'B',
                name: { ru: 'Корпус B (Конгресс-холл)', en: 'Building B (Congress Hall)' },
                floors: [1, 2],
                floorPlans: {
                    '1': {
                        width: 720,
                        height: 420,
                        backgroundUrl: '',
                        backgroundOpacity: 0.45,
                        rooms: [
                            { id: 'pb1_foyer', x: 40, y: 40, w: 210, h: 340, type: 'entrance', label: { ru: 'Фойе и Галерея из Корпуса А', en: 'Foyer & Passage from Bldg A' } },
                            { id: 'pb1_hall', x: 250, y: 40, w: 430, h: 225, type: 'meeting', label: { ru: 'Главный Конференц-Зал «ТТК»', en: 'Main Conference Hall "TTK"' } },
                            { id: 'pb1_press', x: 250, y: 265, w: 225, h: 115, type: 'service', label: { ru: 'Пресс-центр и Регистрация СМИ', en: 'Press Center & Media Desk' } },
                            { id: 'pb1_lift', x: 475, y: 265, w: 205, h: 115, type: 'vertical', label: { ru: 'Лифт и Лестница на Балкон', en: 'Elevator & Balcony Stairs' } }
                        ],
                        walls: [
                            { id: 'wb1_1', x1: 40, y1: 40, x2: 680, y2: 40 },
                            { id: 'wb1_2', x1: 680, y1: 40, x2: 680, y2: 380 },
                            { id: 'wb1_3', x1: 40, y1: 380, x2: 680, y2: 380 },
                            { id: 'wb1_4', x1: 40, y1: 40, x2: 40, y2: 380 },
                            { id: 'wb1_5', x1: 250, y1: 40, x2: 250, y2: 155 },
                            { id: 'wb1_6', x1: 250, y1: 215, x2: 250, y2: 380 },
                            { id: 'wb1_7', x1: 250, y1: 265, x2: 680, y2: 265 },
                            { id: 'wb1_8', x1: 475, y1: 265, x2: 475, y2: 380 }
                        ],
                        doors: [
                            { id: 'db1_1', x: 40, y: 200, orientation: 'v', width: 48 },
                            { id: 'db1_2', x: 250, y: 185, orientation: 'v', width: 52 },
                            { id: 'db1_3', x: 350, y: 265, orientation: 'h', width: 42 }
                        ],
                        windows: [
                            { id: 'winb1_1', x1: 300, y1: 40, x2: 620, y2: 40 }
                        ]
                    },
                    '2': {
                        width: 720,
                        height: 420,
                        backgroundUrl: '',
                        backgroundOpacity: 0.45,
                        rooms: [
                            { id: 'pb2_vip', x: 40, y: 40, w: 380, h: 340, type: 'meeting', label: { ru: 'VIP-лаунж спикеров и Балкон', en: 'Speakers VIP Lounge & Balcony' } },
                            { id: 'pb2_lift', x: 420, y: 240, w: 260, h: 140, type: 'vertical', label: { ru: 'Лифтовой холл 2 этажа (Корпус B)', en: '2nd Floor Elevator (Bldg B)' } },
                            { id: 'pb2_av', x: 420, y: 40, w: 260, h: 200, type: 'tech', label: { ru: 'Аппаратная синхронного перевода', en: 'AV & Interpretation Booths' } }
                        ],
                        walls: [
                            { id: 'wb2_1', x1: 40, y1: 40, x2: 680, y2: 40 },
                            { id: 'wb2_2', x1: 680, y1: 40, x2: 680, y2: 380 },
                            { id: 'wb2_3', x1: 40, y1: 380, x2: 680, y2: 380 },
                            { id: 'wb2_4', x1: 40, y1: 40, x2: 40, y2: 380 },
                            { id: 'wb2_5', x1: 420, y1: 40, x2: 420, y2: 380 },
                            { id: 'wb2_6', x1: 420, y1: 240, x2: 680, y2: 240 }
                        ],
                        doors: [
                            { id: 'db2_1', x: 420, y: 300, orientation: 'v', width: 44 }
                        ],
                        windows: []
                    }
                }
            }
        },
        navGraph: {
            nodes: [
                // Building A Floor 1
                { id: 'n_pa1_gate', building: 'A', floor: 1, x: 155, y: 335, campusX: 155, campusY: 315, type: 'corridor', panoId: 'pano_plaza_101', label: { ru: 'Турникеты главного входа', en: 'Main Entrance Turnstiles' } },
                { id: 'n_pa1_lobby', building: 'A', floor: 1, x: 155, y: 195, campusX: 165, campusY: 205, type: 'corridor', panoId: 'pano_plaza_101', label: { ru: 'Центральный ресепшн', en: 'Central Reception' } },
                { id: 'n_pa1_corr_w', building: 'A', floor: 1, x: 360, y: 202, campusX: 215, campusY: 202, type: 'corridor', panoId: 'pano_plaza_corr', label: { ru: 'Галерея 1 этажа', en: '1st Floor Gallery' } },
                { id: 'n_pa1_lift', building: 'A', floor: 1, x: 360, y: 105, campusX: 205, campusY: 135, type: 'elevator', panoId: 'pano_plaza_corr', label: { ru: 'Лифт Корпуса А (1 эт.)', en: 'Bldg A Elevator (Fl 1)' } },
                { id: 'n_pa1_corr_e', building: 'A', floor: 1, x: 565, y: 202, campusX: 255, campusY: 202, type: 'corridor', panoId: 'pano_plaza_corr', label: { ru: 'Восточный выход к переходу', en: 'East Exit to Walkway' } },
                // Outdoor Campus Connector
                { id: 'n_campus_mid', building: 'CAMPUS', floor: 1, x: 360, y: 202, campusX: 360, campusY: 202, type: 'outdoor', panoId: 'pano_plaza_campus', label: { ru: 'Пешеходная галерея между корпусами', en: 'Inter-building Walkway' } },
                { id: 'n_campus_park', building: 'CAMPUS', floor: 1, x: 360, y: 320, campusX: 360, campusY: 320, type: 'outdoor', panoId: 'pano_plaza_campus', label: { ru: 'Гостевая парковка и КПП', en: 'Visitor Parking & Gate' } },
                // Building A Floor 2
                { id: 'n_pa2_lift', building: 'A', floor: 2, x: 360, y: 105, campusX: 205, campusY: 135, type: 'elevator', panoId: 'pano_plaza_corr', label: { ru: 'Лифт Корпуса А (2 эт.)', en: 'Bldg A Elevator (Fl 2)' } },
                { id: 'n_pa2_corr', building: 'A', floor: 2, x: 360, y: 202, campusX: 215, campusY: 202, type: 'corridor', panoId: 'pano_plaza_corr', label: { ru: 'Холл 2 этажа', en: '2nd Floor Hall' } },
                { id: 'n_pa2_lounge', building: 'A', floor: 2, x: 485, y: 305, campusX: 235, campusY: 245, type: 'corridor', panoId: 'pano_plaza_corr', label: { ru: 'Кофе-пойнт и Лаунж', en: 'Coffee Point & Lounge' } },
                // Building A Floor 3
                { id: 'n_pa3_lift', building: 'A', floor: 3, x: 360, y: 105, campusX: 205, campusY: 135, type: 'elevator', panoId: 'pano_plaza_corr', label: { ru: 'Лифт Корпуса А (3 эт.)', en: 'Bldg A Elevator (Fl 3)' } },
                { id: 'n_pa3_corr', building: 'A', floor: 3, x: 360, y: 210, campusX: 215, campusY: 205, type: 'corridor', panoId: 'pano_plaza_corr', label: { ru: 'Панорамный холл 3 этажа', en: '3rd Floor Panoramic Hall' } },
                { id: 'n_pa3_alfa', building: 'A', floor: 3, x: 565, y: 135, campusX: 245, campusY: 145, type: 'corridor', panoId: 'pano_plaza_102', label: { ru: 'Вход в Переговорную «Альфа»', en: 'Alfa Meeting Room Door' } },
                // Building B Floor 1 & 2
                { id: 'n_pb1_entry', building: 'B', floor: 1, x: 145, y: 200, campusX: 465, campusY: 202, type: 'corridor', panoId: 'pano_plaza_campus', label: { ru: 'Фойе Корпуса B', en: 'Building B Foyer' } },
                { id: 'n_pb1_hall', building: 'B', floor: 1, x: 455, y: 165, campusX: 560, campusY: 185, type: 'corridor', panoId: 'pano_plaza_104', label: { ru: 'Конференц-Зал «ТТК»', en: 'Conference Hall "TTK"' } },
                { id: 'n_pb1_lift', building: 'B', floor: 1, x: 560, y: 320, campusX: 610, campusY: 260, type: 'elevator', panoId: 'pano_plaza_104', label: { ru: 'Лифт Корпуса B (1 эт.)', en: 'Bldg B Elevator (Fl 1)' } },
                { id: 'n_pb2_lift', building: 'B', floor: 2, x: 520, y: 300, campusX: 610, campusY: 260, type: 'elevator', panoId: 'pano_plaza_104', label: { ru: 'Лифт Корпуса B (2 эт.)', en: 'Bldg B Elevator (Fl 2)' } },
                { id: 'n_pb2_vip', building: 'B', floor: 2, x: 240, y: 220, campusX: 530, campusY: 195, type: 'corridor', panoId: 'pano_plaza_104', label: { ru: 'VIP-лаунж 2 этажа', en: '2nd Floor VIP Lounge' } }
            ],
            edges: [
                { from: 'n_pa1_gate', to: 'n_pa1_lobby', weight: 14, kind: 'walk' },
                { from: 'n_pa1_lobby', to: 'n_pa1_corr_w', weight: 18, kind: 'walk' },
                { from: 'n_pa1_corr_w', to: 'n_pa1_lift', weight: 10, kind: 'walk' },
                { from: 'n_pa1_corr_w', to: 'n_pa1_corr_e', weight: 18, kind: 'walk' },
                // Outdoor connection between Building A and Building B + Parking
                { from: 'n_pa1_corr_e', to: 'n_campus_mid', weight: 28, kind: 'outdoor' },
                { from: 'n_campus_mid', to: 'n_pb1_entry', weight: 28, kind: 'outdoor' },
                { from: 'n_campus_mid', to: 'n_campus_park', weight: 22, kind: 'outdoor' },
                { from: 'n_pa1_gate', to: 'n_campus_park', weight: 30, kind: 'outdoor' },
                // Building A Elevators (Floor 1 <-> 2 <-> 3)
                { from: 'n_pa1_lift', to: 'n_pa2_lift', weight: 15, kind: 'elevator' },
                { from: 'n_pa2_lift', to: 'n_pa3_lift', weight: 15, kind: 'elevator' },
                // Floor 2
                { from: 'n_pa2_lift', to: 'n_pa2_corr', weight: 10, kind: 'walk' },
                { from: 'n_pa2_corr', to: 'n_pa2_lounge', weight: 14, kind: 'walk' },
                // Floor 3
                { from: 'n_pa3_lift', to: 'n_pa3_corr', weight: 10, kind: 'walk' },
                { from: 'n_pa3_corr', to: 'n_pa3_alfa', weight: 18, kind: 'walk' },
                // Building B
                { from: 'n_pb1_entry', to: 'n_pb1_hall', weight: 22, kind: 'walk' },
                { from: 'n_pb1_entry', to: 'n_pb1_lift', weight: 26, kind: 'walk' },
                { from: 'n_pb1_hall', to: 'n_pb1_lift', weight: 16, kind: 'walk' },
                { from: 'n_pb1_lift', to: 'n_pb2_lift', weight: 15, kind: 'elevator' },
                { from: 'n_pb2_lift', to: 'n_pb2_vip', weight: 20, kind: 'walk' }
            ]
        },
        pois: [
            {
                id: 101,
                building: 'A',
                floor: 1,
                x: 155,
                y: 150,
                campusX: 155,
                campusY: 200,
                navNodeId: 'n_pa1_lobby',
                category: 'entrance',
                categoryName: { ru: 'Вход / Ресепшн', en: 'Entrance / Reception' },
                name: { ru: 'Главный вход и Центральный ресепшн', en: 'Main Entrance & Central Reception' },
                description: {
                    ru: 'Стойка встречи гостей, выдача гостевых QR-пропусков, интерактивный терминал навигации и зона ожидания.',
                    en: 'Visitor welcome desk, QR guest passes, interactive wayfinding kiosk and waiting lounge.'
                },
                status: 'free',
                statusText: { ru: 'Открыто', en: 'Open' },
                capacity: '50 человек',
                equipment: 'Стойка информации, Турникеты, QR-терминал',
                wifi: 'TTK_Corporate_5G (450 Мбит/с)',
                image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
                panoId: 'pano_plaza_101',
                icon: 'door-open'
            },
            {
                id: 105,
                building: 'A',
                floor: 1,
                x: 360,
                y: 95,
                campusX: 205,
                campusY: 135,
                navNodeId: 'n_pa1_lift',
                category: 'vertical',
                categoryName: { ru: 'Лифт / Лестница', en: 'Elevator / Stairs' },
                name: { ru: 'Лифтовой холл Корпуса А', en: 'Building A Elevator Hall' },
                description: {
                    ru: 'Четыре скоростных лифта и маршевая лестница для перехода между 1, 2 и 3 этажами Главного корпуса.',
                    en: 'Four high-speed elevators and staircase connecting Floors 1, 2, and 3 of Main Building A.'
                },
                status: 'free',
                statusText: { ru: 'Работает', en: 'Active' },
                capacity: '4 × 12 человек',
                equipment: 'Скоростные лифты, Брайль-панели, Голосовое оповещение',
                wifi: 'TTK_Corporate_5G',
                image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
                panoId: 'pano_plaza_corr',
                icon: 'arrow-up-down'
            },
            {
                id: 106,
                building: 'A',
                floor: 1,
                x: 565,
                y: 95,
                campusX: 245,
                campusY: 120,
                navNodeId: 'n_pa1_corr_e',
                category: 'wifi',
                categoryName: { ru: 'Точка Wi-Fi / Связь', en: 'Wi-Fi / Telecom Zone' },
                name: { ru: 'Гигабитная зона Wi-Fi 6E ТТК', en: 'TTK Gigabit Wi-Fi 6E Zone' },
                description: {
                    ru: 'Высокоскоростная точка беспроводного доступа ТТК со свободным подключением для гостей и участников мероприятий.',
                    en: 'High-density TTK wireless access zone with free guest connectivity and charging stations.'
                },
                status: 'free',
                statusText: { ru: 'Сигнал 100%', en: '100% Signal' },
                capacity: 'До 250 устройств',
                equipment: 'Роутеры Wi-Fi 6E, USB-C зарядные стойки',
                wifi: 'TTK_Free_Gigabit (1 Гбит/с)',
                image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
                panoId: 'pano_plaza_corr',
                icon: 'wifi'
            },
            {
                id: 103,
                building: 'A',
                floor: 2,
                x: 485,
                y: 315,
                campusX: 235,
                campusY: 255,
                navNodeId: 'n_pa2_lounge',
                category: 'service',
                categoryName: { ru: 'Кафе / Лаунж', en: 'Coffee / Lounge' },
                name: { ru: 'Кофе-пойнт и Лаунж зона', en: 'Coffee Point & Lounge' },
                description: {
                    ru: 'Уютное пространство для неформальных встреч, кофе-брейков и отдыха с панорамными окнами.',
                    en: 'Comfortable space for informal meetings, coffee breaks and relaxation with panoramic windows.'
                },
                status: 'free',
                statusText: { ru: 'Открыто', en: 'Open' },
                capacity: '25 человек',
                equipment: 'Зерновые кофемашины, Кулеры, Мягкие диваны',
                wifi: 'TTK_Corporate_5G',
                image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80',
                panoId: 'pano_plaza_corr',
                icon: 'coffee'
            },
            {
                id: 108,
                building: 'A',
                floor: 2,
                x: 155,
                y: 200,
                campusX: 135,
                campusY: 200,
                navNodeId: 'n_pa2_corr',
                category: 'stand',
                categoryName: { ru: 'Демо-стенд', en: 'Demo Stand' },
                name: { ru: 'Шоурум цифровых сервисов ТТК', en: 'TTK Digital Services Showroom' },
                description: {
                    ru: 'Демонстрационный зал облачных решений, умного здания и телеком-инфраструктуры.',
                    en: 'Demonstration showroom of cloud solutions, smart building IoT, and telecom infrastructure.'
                },
                status: 'free',
                statusText: { ru: 'Открыто', en: 'Open' },
                capacity: '30 человек',
                equipment: 'Сенсорные панели, Демо-стойки IoT',
                wifi: 'TTK_Corporate_5G',
                image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
                panoId: 'pano_plaza_corr',
                icon: 'cpu'
            },
            {
                id: 102,
                building: 'A',
                floor: 3,
                x: 565,
                y: 105,
                campusX: 245,
                campusY: 145,
                navNodeId: 'n_pa3_alfa',
                category: 'meeting',
                categoryName: { ru: 'Переговорная', en: 'Meeting Room' },
                name: { ru: 'Переговорная «Альфа»', en: 'Alfa Meeting Room' },
                description: {
                    ru: 'Флагманская переговорная комната на 3 этаже с системой видеоконференцсвязи 4K, интерактивной доской и звукоизоляцией.',
                    en: 'Flagship 3rd-floor boardroom featuring 4K video conferencing, interactive whiteboard, and acoustic glazing.'
                },
                status: 'bookable',
                statusText: { ru: 'Свободно', en: 'Available' },
                capacity: '12 человек',
                equipment: 'ВКС 4K, Интерактивная доска, Спикерфоны',
                wifi: 'TTK_Corporate_5G',
                image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80',
                panoId: 'pano_plaza_102',
                icon: 'users'
            },
            {
                id: 110,
                building: 'A',
                floor: 3,
                x: 155,
                y: 130,
                campusX: 135,
                campusY: 140,
                navNodeId: 'n_pa3_corr',
                category: 'meeting',
                categoryName: { ru: 'Переговорная', en: 'Meeting Room' },
                name: { ru: 'Переговорная «Бета»', en: 'Beta Meeting Room' },
                description: {
                    ru: 'Компактный зал для командных брейнштормов и презентаций.',
                    en: 'Compact room for team brainstorming sessions and client presentations.'
                },
                status: 'free',
                statusText: { ru: 'Свободно', en: 'Available' },
                capacity: '8 человек',
                equipment: 'ТВ-панель 75", Маркерная стена, HDMI/AirPlay',
                wifi: 'TTK_Corporate_5G',
                image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80',
                panoId: 'pano_plaza_102',
                icon: 'presentation'
            },
            {
                id: 104,
                building: 'B',
                floor: 1,
                x: 465,
                y: 150,
                campusX: 560,
                campusY: 175,
                navNodeId: 'n_pb1_hall',
                category: 'meeting',
                categoryName: { ru: 'Конгресс-зал', en: 'Congress Hall' },
                name: { ru: 'Главный Конференц-Зал «ТТК»', en: 'Main Conference Hall "TTK"' },
                description: {
                    ru: 'Большой зал мероприятий в Корпусе B со светодиодным экраном 8×4 м, сценой и кабинами синхронного перевода.',
                    en: 'Large auditorium in Building B equipped with an 8×4m LED wall, stage, and simultaneous interpretation.'
                },
                status: 'busy',
                statusText: { ru: 'Идёт сессия', en: 'In Session' },
                capacity: '120 человек',
                equipment: 'Сцена, LED-экран 8×4 м, Радиомикрофоны',
                wifi: 'TTK_Events_5G',
                image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
                panoId: 'pano_plaza_104',
                icon: 'presentation'
            },
            {
                id: 112,
                building: 'B',
                floor: 1,
                x: 360,
                y: 325,
                campusX: 525,
                campusY: 270,
                navNodeId: 'n_pb1_entry',
                category: 'service',
                categoryName: { ru: 'Стойка обслуживания', en: 'Service Desk' },
                name: { ru: 'Стойка аккредитации и Пресс-центр', en: 'Accreditation Desk & Press Center' },
                description: {
                    ru: 'Выдача бейджей спикеров и прессы, гардероб и информационная поддержка участников конференции.',
                    en: 'Speaker and media badge pickup, cloakroom and conference attendee assistance.'
                },
                status: 'free',
                statusText: { ru: 'Работает', en: 'Open' },
                capacity: '35 человек',
                equipment: 'Принтеры бейджей, Стойка помощи, Гардероб',
                wifi: 'TTK_Events_5G',
                image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
                panoId: 'pano_plaza_104',
                icon: 'badge-check'
            },
            {
                id: 113,
                building: 'B',
                floor: 2,
                x: 230,
                y: 200,
                campusX: 525,
                campusY: 195,
                navNodeId: 'n_pb2_vip',
                category: 'meeting',
                categoryName: { ru: 'VIP-зал', en: 'VIP Lounge' },
                name: { ru: 'VIP-лаунж спикеров и Балкон', en: 'Speakers VIP Lounge & Balcony' },
                description: {
                    ru: 'Закрытая зона подготовки докладчиков на 2 этаже Корпуса B с выходом на балкон конгресс-холла.',
                    en: 'Private speaker preparation lounge on Floor 2 of Building B overlooking the main auditorium.'
                },
                status: 'bookable',
                statusText: { ru: 'По пропускам', en: 'Pass Required' },
                capacity: '25 человек',
                equipment: 'Кейтеринг, Мониторы трансляции сцены',
                wifi: 'TTK_VIP_5G',
                image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
                panoId: 'pano_plaza_104',
                icon: 'star'
            }
        ],
        panoramas: {
            pano_plaza_101: {
                id: 'pano_plaza_101',
                title: { ru: 'Главный холл и Ресепшн (Корпус А, 1 этаж)', en: 'Main Lobby & Reception (Bldg A, Floor 1)' },
                building: 'A',
                floor: 1,
                x: 155,
                y: 165,
                poiId: 101,
                imageUrl: '/assets/panoramas/plaza-lobby.svg',
                photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
                hotspots: [
                    { id: 'hs_p101_1', type: 'info', yaw: 45, pitch: -4, poiId: 101, label: { ru: 'Центральный ресепшн ТТК', en: 'TTK Central Reception' }, text: { ru: 'Оформление пропусков и помощь посетителям', en: 'Guest passes and visitor information desk' } },
                    { id: 'hs_p101_2', type: 'nav', yaw: 135, pitch: -6, targetPanoId: 'pano_plaza_corr', label: { ru: 'К лифтам и центральной галерее →', en: 'To Elevators & Central Gallery →' } },
                    { id: 'hs_p101_3', type: 'nav', yaw: 225, pitch: -8, targetPanoId: 'pano_plaza_campus', label: { ru: 'Выход на территорию и в Корпус B →', en: 'Exit to Campus & Building B →' } },
                    { id: 'hs_p101_4', type: 'info', yaw: 315, pitch: -5, poiId: 106, label: { ru: 'Инфо-терминал и Wi-Fi 6E', en: 'Info Kiosk & Wi-Fi 6E' }, text: { ru: 'Бесплатный высокоскоростной интернет TTK_Free_Gigabit', en: 'Free high-speed TTK_Free_Gigabit access' } }
                ]
            },
            pano_plaza_corr: {
                id: 'pano_plaza_corr',
                title: { ru: 'Лифтовой холл и Коридор (Корпус А)', en: 'Elevator Hall & Gallery (Building A)' },
                building: 'A',
                floor: 1,
                x: 360,
                y: 165,
                poiId: 105,
                imageUrl: '/assets/panoramas/plaza-corridor.svg',
                photoUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=80',
                hotspots: [
                    { id: 'hs_pcorr_1', type: 'info', yaw: 45, pitch: -4, poiId: 103, label: { ru: 'Кофе-пойнт и Лаунж зона', en: 'Coffee Point & Lounge' }, text: { ru: 'Свежий кофе и мягкие зоны отдыха (2 этаж)', en: 'Fresh coffee and soft seating (2nd floor)' } },
                    { id: 'hs_pcorr_2', type: 'nav', yaw: 135, pitch: -5, targetPanoId: 'pano_plaza_102', label: { ru: 'Подняться в Переговорную «Альфа» (3 этаж) →', en: 'Go to Alfa Meeting Room (3rd Floor) →' } },
                    { id: 'hs_pcorr_3', type: 'nav', yaw: 230, pitch: -6, targetPanoId: 'pano_plaza_campus', label: { ru: 'Переход в Корпус B (Конгресс-холл) →', en: 'Walkway to Building B (Congress Hall) →' } },
                    { id: 'hs_pcorr_4', type: 'nav', yaw: 315, pitch: -6, targetPanoId: 'pano_plaza_101', label: { ru: '← Вернуться на Главный ресепшн', en: '← Back to Main Reception' } }
                ]
            },
            pano_plaza_102: {
                id: 'pano_plaza_102',
                title: { ru: 'Переговорная «Альфа» (Корпус А, 3 этаж)', en: 'Alfa Meeting Room (Bldg A, Floor 3)' },
                building: 'A',
                floor: 3,
                x: 565,
                y: 105,
                poiId: 102,
                imageUrl: '/assets/panoramas/plaza-meeting.svg',
                photoUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1600&q=80',
                hotspots: [
                    { id: 'hs_p102_1', type: 'info', yaw: 45, pitch: 0, poiId: 102, label: { ru: 'Система ВКС 4K ТТК', en: 'TTK 4K Video Conferencing' }, text: { ru: 'Вместимость 12 человек, бронь через личный кабинет', en: 'Seats 12 people, bookable online' } },
                    { id: 'hs_p102_2', type: 'info', yaw: 225, pitch: -2, poiId: 110, label: { ru: 'Интерактивная маркерная панель', en: 'Interactive Smart Whiteboard' }, text: { ru: 'Синхронизация заметок по QR-коду', en: 'Instant whiteboard export via QR' } },
                    { id: 'hs_p102_3', type: 'nav', yaw: 315, pitch: -8, targetPanoId: 'pano_plaza_corr', label: { ru: '← Выход в холл и к лифтам', en: '← Exit to Hall & Elevators' } }
                ]
            },
            pano_plaza_campus: {
                id: 'pano_plaza_campus',
                title: { ru: 'Территория кампуса • Переход между Корпусами A и B', en: 'Campus Grounds • Walkway between Buildings A & B' },
                building: 'CAMPUS',
                floor: 1,
                x: 360,
                y: 202,
                poiId: 101,
                imageUrl: '/assets/panoramas/campus-courtyard.svg',
                photoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
                hotspots: [
                    { id: 'hs_pcamp_1', type: 'nav', yaw: 45, pitch: -4, targetPanoId: 'pano_plaza_101', label: { ru: '← Войти в Корпус А (Главный)', en: '← Enter Building A (Main)' } },
                    { id: 'hs_pcamp_2', type: 'nav', yaw: 225, pitch: -4, targetPanoId: 'pano_plaza_104', label: { ru: 'Войти в Корпус B (Конгресс-холл) →', en: 'Enter Building B (Congress Hall) →' } }
                ]
            },
            pano_plaza_104: {
                id: 'pano_plaza_104',
                title: { ru: 'Главный Конференц-Зал «ТТК» (Корпус B, 1 этаж)', en: 'Main Conference Hall "TTK" (Bldg B, Floor 1)' },
                building: 'B',
                floor: 1,
                x: 465,
                y: 150,
                poiId: 104,
                imageUrl: '/assets/panoramas/plaza-congress.svg',
                photoUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1600&q=80',
                hotspots: [
                    { id: 'hs_p104_1', type: 'info', yaw: 45, pitch: 2, poiId: 104, label: { ru: 'Главная сцена и LED-экран 8×4 м', en: 'Main Stage & 8×4m LED Screen' }, text: { ru: 'Вместимость 120 мест, синхронный перевод и онлайн-трансляция', en: '120 seats, live streaming and simultaneous interpretation' } },
                    { id: 'hs_p104_2', type: 'info', yaw: 135, pitch: -3, poiId: 112, label: { ru: 'Стойка аккредитации прессы', en: 'Media & Press Desk' }, text: { ru: 'Регистрация спикеров и выдача оборудования', en: 'Speaker check-in and headset pickup' } },
                    { id: 'hs_p104_3', type: 'nav', yaw: 225, pitch: -6, targetPanoId: 'pano_plaza_campus', label: { ru: '← Выход в галерею к Корпусу А', en: '← Back to Campus Walkway & Bldg A' } }
                ]
            }
        }
    },

    expo: {
        id: 'expo',
        published: true,
        accessPin: '',
        name: { ru: 'Выставочный комплекс «Экспо-Сити»', en: 'Exhibition Complex "Expo-City"' },
        type: { ru: 'Выставочный форум', en: 'Exhibition Pavilion' },
        city: 'г. Ростов-на-Дону',
        price: 'от 3 500 ₽ / кв.м',
        desc: {
            ru: 'Площадка технологического форума связи: интерактивные стенды экспонентов, демо-зоны 5G/VR, пресс-зал и открытая площадь между павильонами.',
            en: 'Telecom & AI expo venue featuring interactive partner booths, 5G/VR demo zones, press hall and outdoor plaza.'
        },
        rating: 4.8,
        reviewsCount: 94,
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
        campus: {
            width: 720,
            height: 420,
            zones: [
                { id: 'ex_plaza', x: 30, y: 30, w: 660, h: 360, type: 'park', label: { ru: 'Фестивальная площадь «Экспо-Сити»', en: 'Expo-City Festival Square' } },
                { id: 'ex_bridge', x: 280, y: 180, w: 160, h: 60, type: 'corridor', label: { ru: 'Экспо-променад между павильонами', en: 'Expo Promenade' } }
            ],
            buildingFootprints: [
                { buildingId: 'A', x: 55, y: 65, w: 230, h: 280, label: { ru: 'Павильон №1 (Выставка)', en: 'Pavilion 1 (Expo Booths)' } },
                { buildingId: 'B', x: 435, y: 80, w: 230, h: 250, label: { ru: 'Павильон №2 (Форум-арена)', en: 'Pavilion 2 (Keynote Arena)' } }
            ]
        },
        buildings: {
            'A': {
                id: 'A',
                name: { ru: 'Павильон №1 (Выставка)', en: 'Pavilion No. 1 (Expo)' },
                floors: [1, 2],
                floorPlans: {
                    '1': {
                        width: 720,
                        height: 420,
                        backgroundUrl: '',
                        backgroundOpacity: 0.45,
                        rooms: [
                            { id: 'ea1_reg', x: 40, y: 140, w: 150, h: 140, type: 'entrance', label: { ru: 'Вход и QR-регистрация', en: 'Entrance & QR Check-in' } },
                            { id: 'ea1_aisle', x: 190, y: 165, w: 490, h: 90, type: 'corridor', label: { ru: 'Главный выставочный проспект', en: 'Main Exhibition Aisle' } },
                            { id: 'ea1_ttk', x: 210, y: 40, w: 220, h: 125, type: 'stand', label: { ru: 'Стенд A1 • ТТК «Связь Будущего»', en: 'Stand A1 • TTK Future Telecom' } },
                            { id: 'ea1_ai', x: 450, y: 40, w: 230, h: 125, type: 'stand', label: { ru: 'Стенд A2 • Облачные ИИ-решения', en: 'Stand A2 • Cloud & AI' } },
                            { id: 'ea1_wifi', x: 210, y: 255, w: 220, h: 125, type: 'tech', label: { ru: 'Зона Wi-Fi 6E и Зарядки', en: 'Wi-Fi 6E & Charging Hub' } },
                            { id: 'ea1_lift', x: 450, y: 255, w: 230, h: 125, type: 'vertical', label: { ru: 'Эскалатор на 2 этаж и Выход в Пав. 2', en: 'Escalator & Exit to Pav. 2' } }
                        ],
                        walls: [
                            { id: 'ew1', x1: 40, y1: 40, x2: 680, y2: 40 },
                            { id: 'ew2', x1: 680, y1: 40, x2: 680, y2: 380 },
                            { id: 'ew3', x1: 40, y1: 380, x2: 680, y2: 380 },
                            { id: 'ew4', x1: 40, y1: 40, x2: 40, y2: 380 }
                        ],
                        doors: [
                            { id: 'ed1', x: 40, y: 210, orientation: 'v', width: 52 },
                            { id: 'ed2', x: 680, y: 210, orientation: 'v', width: 52 }
                        ],
                        windows: []
                    },
                    '2': {
                        width: 720,
                        height: 420,
                        backgroundUrl: '',
                        backgroundOpacity: 0.45,
                        rooms: [
                            { id: 'ea2_net', x: 40, y: 40, w: 410, h: 340, type: 'service', label: { ru: 'Зона нетворкинга и B2B-переговоров', en: 'B2B Networking Lounge' } },
                            { id: 'ea2_esc', x: 450, y: 220, w: 230, h: 160, type: 'vertical', label: { ru: 'Эскалатор с 1 этажа', en: 'Escalator from Floor 1' } },
                            { id: 'ea2_media', x: 450, y: 40, w: 230, h: 180, type: 'meeting', label: { ru: 'Зал мастер-классов', en: 'Workshop Room' } }
                        ],
                        walls: [
                            { id: 'ew2_1', x1: 40, y1: 40, x2: 680, y2: 40 },
                            { id: 'ew2_2', x1: 680, y1: 40, x2: 680, y2: 380 },
                            { id: 'ew2_3', x1: 40, y1: 380, x2: 680, y2: 380 },
                            { id: 'ew2_4', x1: 40, y1: 40, x2: 40, y2: 380 }
                        ],
                        doors: [],
                        windows: []
                    }
                }
            },
            'B': {
                id: 'B',
                name: { ru: 'Павильон №2 (Арена)', en: 'Pavilion No. 2 (Arena)' },
                floors: [1],
                floorPlans: {
                    '1': {
                        width: 720,
                        height: 420,
                        backgroundUrl: '',
                        backgroundOpacity: 0.45,
                        rooms: [
                            { id: 'eb1_in', x: 40, y: 130, w: 160, h: 160, type: 'entrance', label: { ru: 'Вход со стороны Павильона №1', en: 'Entrance from Pavilion 1' } },
                            { id: 'eb1_arena', x: 200, y: 40, w: 480, h: 340, type: 'meeting', label: { ru: 'Главная Пленарная Арена (500 мест)', en: 'Keynote Arena (500 seats)' } }
                        ],
                        walls: [
                            { id: 'ewb1', x1: 40, y1: 40, x2: 680, y2: 40 },
                            { id: 'ewb2', x1: 680, y1: 40, x2: 680, y2: 380 },
                            { id: 'ewb3', x1: 40, y1: 380, x2: 680, y2: 380 },
                            { id: 'ewb4', x1: 40, y1: 40, x2: 40, y2: 380 }
                        ],
                        doors: [{ id: 'edb1', x: 40, y: 210, orientation: 'v', width: 52 }],
                        windows: []
                    }
                }
            }
        },
        navGraph: {
            nodes: [
                { id: 'n_ex_in', building: 'A', floor: 1, x: 115, y: 210, campusX: 95, campusY: 210, type: 'corridor', panoId: 'pano_expo_main', label: { ru: 'Вход Павильона №1', en: 'Pavilion 1 Entrance' } },
                { id: 'n_ex_mid', building: 'A', floor: 1, x: 320, y: 210, campusX: 185, campusY: 210, type: 'corridor', panoId: 'pano_expo_main', label: { ru: 'Центральный проход у стенда ТТК', en: 'Central Aisle at TTK Booth' } },
                { id: 'n_ex_east', building: 'A', floor: 1, x: 560, y: 210, campusX: 265, campusY: 210, type: 'elevator', panoId: 'pano_expo_main', label: { ru: 'Эскалатор и выход к Павильону №2', en: 'Escalator & Exit to Pav 2' } },
                { id: 'n_ex_f2', building: 'A', floor: 2, x: 540, y: 280, campusX: 250, campusY: 230, type: 'elevator', panoId: 'pano_expo_main', label: { ru: 'Холл 2 этажа Павильона №1', en: 'Pavilion 1 Floor 2' } },
                { id: 'n_ex_net', building: 'A', floor: 2, x: 250, y: 210, campusX: 165, campusY: 200, type: 'corridor', panoId: 'pano_expo_main', label: { ru: 'Зона B2B нетворкинга', en: 'B2B Networking' } },
                { id: 'n_ex_plaza', building: 'CAMPUS', floor: 1, x: 360, y: 210, campusX: 360, campusY: 210, type: 'outdoor', panoId: 'pano_plaza_campus', label: { ru: 'Экспо-променад', en: 'Expo Promenade' } },
                { id: 'n_ex_b1', building: 'B', floor: 1, x: 420, y: 210, campusX: 540, campusY: 210, type: 'corridor', panoId: 'pano_plaza_104', label: { ru: 'Главная Пленарная Арена', en: 'Keynote Arena' } }
            ],
            edges: [
                { from: 'n_ex_in', to: 'n_ex_mid', weight: 16, kind: 'walk' },
                { from: 'n_ex_mid', to: 'n_ex_east', weight: 18, kind: 'walk' },
                { from: 'n_ex_east', to: 'n_ex_f2', weight: 15, kind: 'elevator' },
                { from: 'n_ex_f2', to: 'n_ex_net', weight: 20, kind: 'walk' },
                { from: 'n_ex_east', to: 'n_ex_plaza', weight: 25, kind: 'outdoor' },
                { from: 'n_ex_plaza', to: 'n_ex_b1', weight: 25, kind: 'outdoor' }
            ]
        },
        pois: [
            {
                id: 201,
                building: 'A',
                floor: 1,
                x: 115,
                y: 210,
                campusX: 95,
                campusY: 210,
                navNodeId: 'n_ex_in',
                category: 'entrance',
                categoryName: { ru: 'Вход / Регистрация', en: 'Entrance / Check-in' },
                name: { ru: 'Главный вход и QR-регистрация', en: 'Main Entrance & QR Check-in' },
                description: { ru: 'Зона экспресс-печати бейджей посетителей по QR-коду и рамки контроля доступа.', en: 'Express visitor QR badge printing and security gates.' },
                status: 'free',
                statusText: { ru: 'Без очереди', en: 'No Queue' },
                capacity: '200+ человек',
                equipment: 'Терминалы QR-бейджей, Инфо-стойка',
                wifi: 'TTK_Expo_Free',
                image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
                panoId: 'pano_expo_main',
                icon: 'door-open'
            },
            {
                id: 202,
                building: 'A',
                floor: 1,
                x: 320,
                y: 105,
                campusX: 175,
                campusY: 135,
                navNodeId: 'n_ex_mid',
                category: 'stand',
                categoryName: { ru: 'Стенд', en: 'Exhibition Stand' },
                name: { ru: 'Интерактивный стенд ТТК «Связь Будущего»', en: 'TTK Flagship Booth "Future Telecom"' },
                description: { ru: 'Демонстрация квантовых коммуникаций, VR-тур по магистральным сетям ТТК и консультации экспертов.', en: 'Quantum networking showcase, VR tour of TTK backbone infrastructure, and expert consultations.' },
                status: 'free',
                statusText: { ru: 'Идёт демо', en: 'Live Demo' },
                capacity: '35 человек',
                equipment: 'VR-шлемы, Сенсорный стол, Демо 5G',
                wifi: 'TTK_Expo_5G (1.2 Гбит/с)',
                image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
                panoId: 'pano_expo_main',
                icon: 'sparkles'
            },
            {
                id: 203,
                building: 'A',
                floor: 1,
                x: 565,
                y: 105,
                campusX: 245,
                campusY: 135,
                navNodeId: 'n_ex_east',
                category: 'stand',
                categoryName: { ru: 'Стенд', en: 'Exhibition Stand' },
                name: { ru: 'Стенд A2 • Облачные и ИИ-решения', en: 'Booth A2 • Cloud & AI Solutions' },
                description: { ru: 'Решения видеоаналитики, цифровых двойников зданий и облачного хранения.', en: 'Video analytics, smart building digital twins, and enterprise cloud platform.' },
                status: 'free',
                statusText: { ru: 'Работает', en: 'Open' },
                capacity: '25 человек',
                equipment: 'Видеостена, Демо-серверы',
                wifi: 'TTK_Expo_5G',
                image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
                panoId: 'pano_expo_main',
                icon: 'cpu'
            },
            {
                id: 204,
                building: 'A',
                floor: 1,
                x: 320,
                y: 315,
                campusX: 175,
                campusY: 285,
                navNodeId: 'n_ex_mid',
                category: 'wifi',
                categoryName: { ru: 'Точка Wi-Fi / Зарядка', en: 'Wi-Fi & Charging' },
                name: { ru: 'Зона сверхбыстрого Wi-Fi 6E и Зарядки', en: 'Ultra-Fast Wi-Fi 6E & Charging Lounge' },
                description: { ru: 'Бесплатные локеры для зарядки смартфонов и ноутбуков, покрытие Wi-Fi 6E.', en: 'Free phone/laptop charging lockers and high-density Wi-Fi 6E.' },
                status: 'free',
                statusText: { ru: 'Свободно', en: 'Available' },
                capacity: '40 мест',
                equipment: 'Зарядные станции, Пуфы, Роутер ТТК',
                wifi: 'TTK_Expo_5G',
                image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80',
                panoId: 'pano_expo_main',
                icon: 'wifi'
            },
            {
                id: 205,
                building: 'B',
                floor: 1,
                x: 440,
                y: 210,
                campusX: 550,
                campusY: 210,
                navNodeId: 'n_ex_b1',
                category: 'meeting',
                categoryName: { ru: 'Сцена форума', en: 'Keynote Stage' },
                name: { ru: 'Главная Пленарная Арена (Павильон №2)', en: 'Main Keynote Arena (Pavilion 2)' },
                description: { ru: 'Пленарные сессии, ключевые доклады и награждение победителей хакатона.', en: 'Keynote sessions, panel discussions, and hackathon awards ceremony.' },
                status: 'free',
                statusText: { ru: 'Открыт вход', en: 'Doors Open' },
                capacity: '500 человек',
                equipment: 'Круговая LED-сцена, Звук концертного класса',
                wifi: 'TTK_Expo_5G',
                image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
                panoId: 'pano_plaza_104',
                icon: 'presentation'
            },
            {
                id: 206,
                building: 'A',
                floor: 2,
                x: 245,
                y: 210,
                campusX: 165,
                campusY: 200,
                navNodeId: 'n_ex_net',
                category: 'service',
                categoryName: { ru: 'Нетворкинг', en: 'Networking' },
                name: { ru: 'B2B-лаунж и Зона переговоров (2 этаж)', en: 'B2B Networking Lounge (2nd Floor)' },
                description: { ru: 'Тихие столы для деловых встреч участников выставки и кофе-бар.', en: 'Quiet tables for exhibitor business meetings and specialty coffee bar.' },
                status: 'bookable',
                statusText: { ru: 'Доступно', en: 'Available' },
                capacity: '60 человек',
                equipment: 'Переговорные боксы, Кофе-бар',
                wifi: 'TTK_Expo_5G',
                image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80',
                panoId: 'pano_expo_main',
                icon: 'coffee'
            }
        ],
        panoramas: {
            pano_expo_main: {
                id: 'pano_expo_main',
                title: { ru: 'Павильон №1 • Главный проспект и Стенд ТТК', en: 'Pavilion 1 • Main Aisle & TTK Stand' },
                building: 'A',
                floor: 1,
                x: 320,
                y: 210,
                poiId: 202,
                imageUrl: '/assets/panoramas/expo-hall.svg',
                photoUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80',
                hotspots: [
                    { id: 'hs_ex_1', type: 'info', yaw: 45, pitch: -2, poiId: 202, label: { ru: 'Стенд A1 • ТТК «Связь Будущего»', en: 'Stand A1 • TTK Future Telecom' }, text: { ru: 'Интерактивная демо-зона 5G и VR', en: 'Interactive 5G & VR demo booth' } },
                    { id: 'hs_ex_2', type: 'info', yaw: 135, pitch: -2, poiId: 203, label: { ru: 'Стенд A2 • Облачные ИИ-решения', en: 'Stand A2 • Cloud & AI' }, text: { ru: 'Цифровые двойники и аналитика', en: 'Digital twins and smart analytics' } },
                    { id: 'hs_ex_3', type: 'info', yaw: 225, pitch: -4, poiId: 201, label: { ru: 'Главный вход и QR-регистрация', en: 'Main Entrance & QR Check-in' }, text: { ru: 'Печать бейджей за 5 секунд', en: '5-second QR badge pickup' } },
                    { id: 'hs_ex_4', type: 'nav', yaw: 310, pitch: -6, targetPanoId: 'pano_plaza_104', label: { ru: 'Перейти в Павильон №2 (Пленарная арена) →', en: 'Go to Pavilion 2 (Keynote Arena) →' } }
                ]
            },
            pano_plaza_campus: {
                id: 'pano_plaza_campus',
                title: { ru: 'Экспо-променад между Павильонами №1 и №2', en: 'Outdoor Promenade between Pavilions 1 & 2' },
                building: 'CAMPUS',
                floor: 1,
                x: 360,
                y: 210,
                poiId: 201,
                imageUrl: '/assets/panoramas/campus-courtyard.svg',
                photoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
                hotspots: [
                    { id: 'hs_exc_1', type: 'nav', yaw: 60, pitch: -4, targetPanoId: 'pano_expo_main', label: { ru: '← В Павильон №1 (Выставка)', en: '← To Pavilion 1 (Expo)' } },
                    { id: 'hs_exc_2', type: 'nav', yaw: 220, pitch: -4, targetPanoId: 'pano_plaza_104', label: { ru: 'В Павильон №2 (Арена) →', en: 'To Pavilion 2 (Arena) →' } }
                ]
            },
            pano_plaza_104: {
                id: 'pano_plaza_104',
                title: { ru: 'Павильон №2 • Главная Пленарная Арена', en: 'Pavilion 2 • Main Keynote Arena' },
                building: 'B',
                floor: 1,
                x: 440,
                y: 210,
                poiId: 205,
                imageUrl: '/assets/panoramas/plaza-congress.svg',
                photoUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1600&q=80',
                hotspots: [
                    { id: 'hs_exa_1', type: 'info', yaw: 45, pitch: 0, poiId: 205, label: { ru: 'Пленарная сцена (500 мест)', en: 'Keynote Stage (500 seats)' }, text: { ru: 'Главные выступления спикеров форума', en: 'Main conference keynotes' } },
                    { id: 'hs_exa_2', type: 'nav', yaw: 225, pitch: -6, targetPanoId: 'pano_expo_main', label: { ru: '← Вернуться в Павильон №1', en: '← Return to Pavilion 1' } }
                ]
            }
        }
    },

    hotel: {
        id: 'hotel',
        published: true,
        accessPin: '',
        name: { ru: 'Конференц-отель «Гранд Сити» 5★', en: 'Grand City Conference Hotel 5★' },
        type: { ru: 'Гостиничный комплекс 5★', en: '5★ Hotel & Resort' },
        city: 'г. Ростов-на-Дону',
        price: 'от 8 500 ₽ / сутки',
        desc: {
            ru: 'Пятизвёздочный отель с атриум-лобби, панорамным рестораном «Бордо», спа-центром и представительскими номерами — осмотрите путь от стойки ресепшн до номера заранее.',
            en: 'Five-star hotel featuring an atrium lobby, Bordeaux restaurant, wellness spa, and panoramic suites — preview every room before arrival.'
        },
        rating: 4.9,
        reviewsCount: 215,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        campus: {
            width: 720,
            height: 420,
            zones: [
                { id: 'hc_garden', x: 30, y: 30, w: 660, h: 360, type: 'park', label: { ru: 'Территория отеля и Летняя терраса', en: 'Hotel Park & Summer Terrace' } }
            ],
            buildingFootprints: [
                { buildingId: 'A', x: 140, y: 65, w: 440, h: 280, label: { ru: 'Главный корпус отеля (Этажи 1–3)', en: 'Main Hotel Tower (Floors 1–3)' } }
            ]
        },
        buildings: {
            'A': {
                id: 'A',
                name: { ru: 'Главный Корпус', en: 'Main Building' },
                floors: [1, 2, 3],
                floorPlans: {
                    '1': {
                        width: 720,
                        height: 420,
                        backgroundUrl: '',
                        backgroundOpacity: 0.45,
                        rooms: [
                            { id: 'ha1_lobby', x: 40, y: 120, w: 300, h: 260, type: 'entrance', label: { ru: 'Гранд-Лобби и Ресепшн 24/7', en: 'Grand Lobby & 24/7 Reception' } },
                            { id: 'ha1_lift', x: 340, y: 40, w: 160, h: 160, type: 'vertical', label: { ru: 'Панорамные лифты', en: 'Panoramic Elevators' } },
                            { id: 'ha1_spa', x: 340, y: 200, w: 340, h: 180, type: 'service', label: { ru: 'SPA-комплекс и Бассейн', en: 'Wellness Spa & Pool' } },
                            { id: 'ha1_bag', x: 40, y: 40, w: 300, h: 80, type: 'service', label: { ru: 'Консьерж и Камера хранения', en: 'Concierge & Luggage' } }
                        ],
                        walls: [
                            { id: 'hw1', x1: 40, y1: 40, x2: 680, y2: 40 },
                            { id: 'hw2', x1: 680, y1: 40, x2: 680, y2: 380 },
                            { id: 'hw3', x1: 40, y1: 380, x2: 680, y2: 380 },
                            { id: 'hw4', x1: 40, y1: 40, x2: 40, y2: 380 }
                        ],
                        doors: [{ id: 'hd1', x: 180, y: 380, orientation: 'h', width: 56 }],
                        windows: []
                    },
                    '2': {
                        width: 720,
                        height: 420,
                        backgroundUrl: '',
                        backgroundOpacity: 0.45,
                        rooms: [
                            { id: 'ha2_rest', x: 40, y: 40, w: 340, h: 340, type: 'service', label: { ru: 'Панорамный ресторан «Бордо»', en: 'Bordeaux Fine Dining Restaurant' } },
                            { id: 'ha2_lift', x: 380, y: 40, w: 140, h: 150, type: 'vertical', label: { ru: 'Лифтовой холл 2 этажа', en: '2nd Floor Elevators' } },
                            { id: 'ha2_hall', x: 380, y: 190, w: 300, h: 190, type: 'meeting', label: { ru: 'Банкетный и Конференц-зал «Сапфир»', en: 'Sapphire Ballroom & Hall' } }
                        ],
                        walls: [
                            { id: 'hw2_1', x1: 40, y1: 40, x2: 680, y2: 40 },
                            { id: 'hw2_2', x1: 680, y1: 40, x2: 680, y2: 380 },
                            { id: 'hw2_3', x1: 40, y1: 380, x2: 680, y2: 380 },
                            { id: 'hw2_4', x1: 40, y1: 40, x2: 40, y2: 380 }
                        ],
                        doors: [],
                        windows: []
                    },
                    '3': {
                        width: 720,
                        height: 420,
                        backgroundUrl: '',
                        backgroundOpacity: 0.45,
                        rooms: [
                            { id: 'ha3_suite', x: 40, y: 40, w: 320, h: 340, type: 'hall', label: { ru: 'Представительский Люкс «Панорама»', en: 'Panorama Executive Suite' } },
                            { id: 'ha3_lift', x: 360, y: 40, w: 160, h: 160, type: 'vertical', label: { ru: 'Лифтовой холл 3 этажа', en: '3rd Floor Elevators' } },
                            { id: 'ha3_std', x: 360, y: 200, w: 320, h: 180, type: 'service', label: { ru: 'Номера Делюкс 301–310 и Wi-Fi холл', en: 'Deluxe Rooms 301–310 & Wi-Fi' } }
                        ],
                        walls: [
                            { id: 'hw3_1', x1: 40, y1: 40, x2: 680, y2: 40 },
                            { id: 'hw3_2', x1: 680, y1: 40, x2: 680, y2: 380 },
                            { id: 'hw3_3', x1: 40, y1: 380, x2: 680, y2: 380 },
                            { id: 'hw3_4', x1: 40, y1: 40, x2: 40, y2: 380 }
                        ],
                        doors: [],
                        windows: []
                    }
                }
            }
        },
        navGraph: {
            nodes: [
                { id: 'n_h1_lobby', building: 'A', floor: 1, x: 190, y: 250, campusX: 280, campusY: 230, type: 'corridor', panoId: 'pano_hotel_lobby', label: { ru: 'Лобби и Ресепшн', en: 'Hotel Lobby' } },
                { id: 'n_h1_lift', building: 'A', floor: 1, x: 420, y: 120, campusX: 390, campusY: 150, type: 'elevator', panoId: 'pano_hotel_lobby', label: { ru: 'Панорамные лифты (1 эт.)', en: 'Elevators (Fl 1)' } },
                { id: 'n_h1_spa', building: 'A', floor: 1, x: 510, y: 290, campusX: 460, campusY: 250, type: 'corridor', panoId: 'pano_hotel_lobby', label: { ru: 'SPA-комплекс', en: 'Wellness Spa' } },
                { id: 'n_h2_lift', building: 'A', floor: 2, x: 440, y: 120, campusX: 390, campusY: 150, type: 'elevator', panoId: 'pano_hotel_lobby', label: { ru: 'Лифты (2 эт.)', en: 'Elevators (Fl 2)' } },
                { id: 'n_h2_rest', building: 'A', floor: 2, x: 210, y: 210, campusX: 270, campusY: 200, type: 'corridor', panoId: 'pano_hotel_lobby', label: { ru: 'Ресторан «Бордо»', en: 'Bordeaux Restaurant' } },
                { id: 'n_h3_lift', building: 'A', floor: 3, x: 440, y: 120, campusX: 390, campusY: 150, type: 'elevator', panoId: 'pano_plaza_102', label: { ru: 'Лифты (3 эт.)', en: 'Elevators (Fl 3)' } },
                { id: 'n_h3_suite', building: 'A', floor: 3, x: 200, y: 210, campusX: 270, campusY: 200, type: 'corridor', panoId: 'pano_plaza_102', label: { ru: 'Люкс «Панорама»', en: 'Panorama Suite' } }
            ],
            edges: [
                { from: 'n_h1_lobby', to: 'n_h1_lift', weight: 16, kind: 'walk' },
                { from: 'n_h1_lobby', to: 'n_h1_spa', weight: 20, kind: 'walk' },
                { from: 'n_h1_lift', to: 'n_h2_lift', weight: 14, kind: 'elevator' },
                { from: 'n_h2_lift', to: 'n_h2_rest', weight: 16, kind: 'walk' },
                { from: 'n_h2_lift', to: 'n_h3_lift', weight: 14, kind: 'elevator' },
                { from: 'n_h3_lift', to: 'n_h3_suite', weight: 16, kind: 'walk' }
            ]
        },
        pois: [
            {
                id: 301,
                building: 'A',
                floor: 1,
                x: 190,
                y: 250,
                campusX: 280,
                campusY: 230,
                navNodeId: 'n_h1_lobby',
                category: 'entrance',
                categoryName: { ru: 'Ресепшн', en: 'Reception' },
                name: { ru: 'Ресепшн и Атриум-лобби отеля', en: 'Hotel Reception & Atrium Lobby' },
                description: { ru: 'Круглосуточное заселение, консьерж-сервис, заказ трансфера и приветственный лаунж.', en: '24/7 check-in desk, concierge service, airport transfer desk, and welcome lounge.' },
                status: 'free',
                statusText: { ru: '24/7 Открыто', en: 'Open 24/7' },
                capacity: '45 человек',
                equipment: 'Стойка регистрации, Терминал ключей, Консьерж',
                wifi: 'TTK_Hotel_Guest',
                image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
                panoId: 'pano_hotel_lobby',
                icon: 'home'
            },
            {
                id: 304,
                building: 'A',
                floor: 1,
                x: 510,
                y: 290,
                campusX: 460,
                campusY: 250,
                navNodeId: 'n_h1_spa',
                category: 'service',
                categoryName: { ru: 'SPA и Бассейн', en: 'Spa & Pool' },
                name: { ru: 'SPA & Wellness центр с бассейном', en: 'SPA & Wellness Thermal Pool' },
                description: { ru: 'Подогреваемый бассейн 25 м, финская сауна, хаммам и фитнес-зал для гостей отеля.', en: '25m heated indoor pool, sauna, hammam, and gym for hotel guests.' },
                status: 'free',
                statusText: { ru: 'Открыто', en: 'Open' },
                capacity: '40 гостей',
                equipment: 'Бассейн 25 м, Сауна, Фитнес-зона',
                wifi: 'TTK_Hotel_Guest',
                image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
                panoId: 'pano_hotel_lobby',
                icon: 'sparkles'
            },
            {
                id: 302,
                building: 'A',
                floor: 2,
                x: 210,
                y: 210,
                campusX: 270,
                campusY: 200,
                navNodeId: 'n_h2_rest',
                category: 'service',
                categoryName: { ru: 'Ресторан', en: 'Restaurant' },
                name: { ru: 'Панорамный ресторан «Бордо»', en: 'Bordeaux Panoramic Restaurant' },
                description: { ru: 'Завтраки «шведский стол» с 07:00 до 11:00 и авторская кухня с видом на парк.', en: 'Buffet breakfast 07:00–11:00 and fine dining overlooking the hotel park.' },
                status: 'bookable',
                statusText: { ru: 'Бронь столиков', en: 'Bookable' },
                capacity: '80 человек',
                equipment: 'Шведский стол, Винная комната, Терраса',
                wifi: 'TTK_Hotel_Guest',
                image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
                panoId: 'pano_hotel_lobby',
                icon: 'coffee'
            },
            {
                id: 306,
                building: 'A',
                floor: 3,
                x: 200,
                y: 210,
                campusX: 270,
                campusY: 200,
                navNodeId: 'n_h3_suite',
                category: 'meeting',
                categoryName: { ru: 'Номер Люкс', en: 'Executive Suite' },
                name: { ru: 'Представительский Люкс «Панорама»', en: 'Panorama Executive Suite' },
                description: { ru: 'Двухкомнатный панорамный люкс с рабочей зоной, переговорным столом и системой умного дома.', en: 'Two-room panoramic suite with private study, smart room controls, and city view.' },
                status: 'bookable',
                statusText: { ru: 'Доступен к брони', en: 'Available' },
                capacity: '4 гостя',
                equipment: 'Умный дом, King-size, Кофемашина, Smart TV',
                wifi: 'TTK_Hotel_VIP (1 Гбит/с)',
                image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
                panoId: 'pano_plaza_102',
                icon: 'star'
            }
        ],
        panoramas: {
            pano_hotel_lobby: {
                id: 'pano_hotel_lobby',
                title: { ru: 'Атриум-лобби отеля «Гранд Сити» 5★', en: 'Grand City Hotel 5★ Atrium Lobby' },
                building: 'A',
                floor: 1,
                x: 190,
                y: 250,
                poiId: 301,
                imageUrl: '/assets/panoramas/hotel-lobby.svg',
                photoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
                hotspots: [
                    { id: 'hs_hl_1', type: 'info', yaw: 45, pitch: -3, poiId: 301, label: { ru: 'Стойка регистрации и Консьерж', en: 'Front Desk & Concierge' }, text: { ru: 'Быстрое заселение по паспорту или QR', en: 'Express check-in' } },
                    { id: 'hs_hl_2', type: 'info', yaw: 225, pitch: -3, poiId: 302, label: { ru: 'К ресторану «Бордо» (2 этаж)', en: 'To Bordeaux Restaurant (2nd Fl)' }, text: { ru: 'Завтраки и вечернее меню', en: 'Breakfast & fine dining' } },
                    { id: 'hs_hl_3', type: 'nav', yaw: 135, pitch: -4, targetPanoId: 'pano_plaza_102', label: { ru: 'Подняться на лифте в Люкс «Панорама» (3 эт.) →', en: 'Take Elevator to Panorama Suite (3rd Fl) →' } },
                    { id: 'hs_hl_4', type: 'info', yaw: 315, pitch: -4, poiId: 304, label: { ru: 'SPA & Бассейн', en: 'SPA & Thermal Pool' }, text: { ru: 'Вход по карте гостя на 1 этаже', en: '1st floor wellness zone' } }
                ]
            },
            pano_plaza_102: {
                id: 'pano_plaza_102',
                title: { ru: 'Представительский Люкс и Деловой холл (3 этаж)', en: 'Executive Suite & Lounge (3rd Floor)' },
                building: 'A',
                floor: 3,
                x: 200,
                y: 210,
                poiId: 306,
                imageUrl: '/assets/panoramas/plaza-meeting.svg',
                photoUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1600&q=80',
                hotspots: [
                    { id: 'hs_hs_1', type: 'info', yaw: 90, pitch: -2, poiId: 306, label: { ru: 'Панорамная гостиная Люкса', en: 'Panoramic Suite Living Area' }, text: { ru: 'Вид на парк и рабочая зона с 1 Гбит/с Wi-Fi', en: 'Park view & 1 Gbps Wi-Fi study' } },
                    { id: 'hs_hs_2', type: 'nav', yaw: 310, pitch: -6, targetPanoId: 'pano_hotel_lobby', label: { ru: '← Спуститься в Лобби отеля', en: '← Return to Hotel Lobby' } }
                ]
            }
        }
    },

    hub: {
        id: 'hub',
        published: true,
        accessPin: '',
        name: { ru: 'Инновационный IT-Хаб ТТК', en: 'TTK Innovation IT-Hub' },
        type: { ru: 'Технопарк и коворкинг', en: 'Tech Hub & Coworking' },
        city: 'г. Ростов-на-Дону',
        price: 'от 900 ₽ / день',
        desc: {
            ru: 'Технологический коворкинг для разработчиков и R&D-команд: оптические каналы 10G, серверная лаборатория и круглосуточные капсулы фокуса.',
            en: 'Tech coworking space for R&D teams featuring 10G fiber links, server lab, and 24/7 focus pods.'
        },
        rating: 4.8,
        reviewsCount: 76,
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
        campus: {
            width: 720,
            height: 420,
            zones: [
                { id: 'hub_yard', x: 30, y: 30, w: 660, h: 360, type: 'park', label: { ru: 'Кампус Технопарка ТТК', en: 'TTK Technopark Campus' } }
            ],
            buildingFootprints: [
                { buildingId: 'A', x: 140, y: 70, w: 440, h: 270, label: { ru: 'Корпус Технопарка (Этажи 1–2)', en: 'Technopark Hub (Floors 1–2)' } }
            ]
        },
        buildings: {
            'A': {
                id: 'A',
                name: { ru: 'Технопарк', en: 'Technopark' },
                floors: [1, 2],
                floorPlans: {
                    '1': {
                        width: 720,
                        height: 420,
                        backgroundUrl: '',
                        backgroundOpacity: 0.45,
                        rooms: [
                            { id: 'hb1_in', x: 40, y: 140, w: 200, h: 240, type: 'entrance', label: { ru: 'Вход и Face-ID турникеты', en: 'Entrance & Face-ID Access' } },
                            { id: 'hb1_lab', x: 240, y: 40, w: 440, h: 200, type: 'tech', label: { ru: 'Серверная и Сетевая лаборатория 10G', en: '10G Server & Network Lab' } },
                            { id: 'hb1_lift', x: 240, y: 240, w: 200, h: 140, type: 'vertical', label: { ru: 'Лестница и Лифт', en: 'Stairs & Elevator' } },
                            { id: 'hb1_vr', x: 440, y: 240, w: 240, h: 140, type: 'stand', label: { ru: 'Лаборатория 3D-сканирования и VR', en: '3D Scanning & VR Lab' } }
                        ],
                        walls: [
                            { id: 'hbw1', x1: 40, y1: 40, x2: 680, y2: 40 },
                            { id: 'hbw2', x1: 680, y1: 40, x2: 680, y2: 380 },
                            { id: 'hbw3', x1: 40, y1: 380, x2: 680, y2: 380 },
                            { id: 'hbw4', x1: 40, y1: 40, x2: 40, y2: 380 }
                        ],
                        doors: [{ id: 'hbd1', x: 140, y: 380, orientation: 'h', width: 48 }],
                        windows: []
                    },
                    '2': {
                        width: 720,
                        height: 420,
                        backgroundUrl: '',
                        backgroundOpacity: 0.45,
                        rooms: [
                            { id: 'hb2_cowork', x: 40, y: 40, w: 640, h: 210, type: 'hall', label: { ru: 'Коворкинг 24/7 на 80 резидентов', en: '24/7 Open Coworking (80 desks)' } },
                            { id: 'hb2_lift', x: 240, y: 250, w: 200, h: 130, type: 'vertical', label: { ru: 'Холл 2 этажа', en: '2nd Floor Hall' } },
                            { id: 'hb2_pods', x: 440, y: 250, w: 240, h: 130, type: 'meeting', label: { ru: 'Акустические Zoom-капсулы', en: 'Acoustic Zoom Pods' } }
                        ],
                        walls: [
                            { id: 'hbw2_1', x1: 40, y1: 40, x2: 680, y2: 40 },
                            { id: 'hbw2_2', x1: 680, y1: 40, x2: 680, y2: 380 },
                            { id: 'hbw2_3', x1: 40, y1: 380, x2: 680, y2: 380 },
                            { id: 'hbw2_4', x1: 40, y1: 40, x2: 40, y2: 380 }
                        ],
                        doors: [],
                        windows: []
                    }
                }
            }
        },
        navGraph: {
            nodes: [
                { id: 'n_hb1_in', building: 'A', floor: 1, x: 140, y: 270, campusX: 230, campusY: 250, type: 'corridor', panoId: 'pano_plaza_corr', label: { ru: 'Вход Технопарка', en: 'Hub Entrance' } },
                { id: 'n_hb1_lift', building: 'A', floor: 1, x: 340, y: 300, campusX: 350, campusY: 250, type: 'elevator', panoId: 'pano_plaza_corr', label: { ru: 'Лифт (1 эт.)', en: 'Elevator (Fl 1)' } },
                { id: 'n_hb1_lab', building: 'A', floor: 1, x: 450, y: 140, campusX: 430, campusY: 160, type: 'corridor', panoId: 'pano_plaza_102', label: { ru: 'Лаборатория 10G', en: '10G Lab' } },
                { id: 'n_hb2_lift', building: 'A', floor: 2, x: 340, y: 300, campusX: 350, campusY: 250, type: 'elevator', panoId: 'pano_plaza_corr', label: { ru: 'Лифт (2 эт.)', en: 'Elevator (Fl 2)' } },
                { id: 'n_hb2_cw', building: 'A', floor: 2, x: 360, y: 145, campusX: 360, campusY: 160, type: 'corridor', panoId: 'pano_plaza_corr', label: { ru: 'Коворкинг 24/7', en: 'Coworking 24/7' } }
            ],
            edges: [
                { from: 'n_hb1_in', to: 'n_hb1_lift', weight: 15, kind: 'walk' },
                { from: 'n_hb1_lift', to: 'n_hb1_lab', weight: 16, kind: 'walk' },
                { from: 'n_hb1_lift', to: 'n_hb2_lift', weight: 14, kind: 'elevator' },
                { from: 'n_hb2_lift', to: 'n_hb2_cw', weight: 15, kind: 'walk' }
            ]
        },
        pois: [
            {
                id: 402,
                building: 'A',
                floor: 1,
                x: 140,
                y: 260,
                campusX: 230,
                campusY: 250,
                navNodeId: 'n_hb1_in',
                category: 'entrance',
                categoryName: { ru: 'Вход', en: 'Entrance' },
                name: { ru: 'Ресепшн и Face-ID проходная', en: 'Reception & Face-ID Gate' },
                description: { ru: 'Регистрация резидентов коворкинга и выдача временных пропусков в лаборатории.', en: 'Resident check-in and visitor lab access badges.' },
                status: 'free',
                statusText: { ru: 'Открыто', en: 'Open' },
                capacity: '30 человек',
                equipment: 'Терминалы Face-ID, Локеры',
                wifi: 'TTK_TechHub_10G',
                image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
                panoId: 'pano_plaza_corr',
                icon: 'door-open'
            },
            {
                id: 401,
                building: 'A',
                floor: 1,
                x: 450,
                y: 140,
                campusX: 430,
                campusY: 160,
                navNodeId: 'n_hb1_lab',
                category: 'stand',
                categoryName: { ru: 'Лаборатория', en: 'Laboratory' },
                name: { ru: 'Главная серверная лаборатория 10G', en: 'Main 10G Server & Fiber Lab' },
                description: { ru: 'Испытательный стенд магистрального оборудования, оптики и облачных кластеров.', en: 'Backbone networking testbed, fiber optics lab, and GPU cluster racks.' },
                status: 'free',
                statusText: { ru: 'Активно', en: 'Active' },
                capacity: '15 инженеров',
                equipment: 'Серверные стойки, Стенды 10G/100G',
                wifi: 'TTK_TechHub_10G',
                image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
                panoId: 'pano_plaza_102',
                icon: 'cpu'
            },
            {
                id: 403,
                building: 'A',
                floor: 2,
                x: 360,
                y: 145,
                campusX: 360,
                campusY: 160,
                navNodeId: 'n_hb2_cw',
                category: 'meeting',
                categoryName: { ru: 'Коворкинг', en: 'Coworking' },
                name: { ru: 'Круглосуточный коворкинг резидентов 24/7', en: '24/7 Developer Coworking Space' },
                description: { ru: 'Эргономичные рабочие станции с внешними 4K-мониторами и гигабитным Wi-Fi.', en: 'Ergonomic desks with external 4K monitors and gigabit Wi-Fi.' },
                status: 'bookable',
                statusText: { ru: 'Есть 18 мест', en: '18 Desks Free' },
                capacity: '80 резидентов',
                equipment: 'Мониторы 27" 4K, Акустические кабины, Кофе-бар',
                wifi: 'TTK_TechHub_10G',
                image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
                panoId: 'pano_plaza_corr',
                icon: 'users'
            }
        ],
        panoramas: {
            pano_plaza_corr: {
                id: 'pano_plaza_corr',
                title: { ru: 'IT-Хаб ТТК • Коворкинг и Холл', en: 'TTK IT-Hub • Coworking & Hall' },
                building: 'A',
                floor: 1,
                x: 340,
                y: 260,
                poiId: 402,
                imageUrl: '/assets/panoramas/plaza-corridor.svg',
                photoUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=80',
                hotspots: [
                    { id: 'hs_hb_1', type: 'info', yaw: 135, pitch: -3, poiId: 403, label: { ru: 'Open Space Коворкинг 24/7', en: 'Open Space Coworking 24/7' }, text: { ru: 'Рабочие места с 4K-мониторами на 2 этаже', en: '4K monitor workstations on 2nd floor' } },
                    { id: 'hs_hb_2', type: 'nav', yaw: 45, pitch: -5, targetPanoId: 'pano_plaza_102', label: { ru: 'Перейти в Серверную лабораторию 10G →', en: 'Enter 10G Server Lab →' } }
                ]
            },
            pano_plaza_102: {
                id: 'pano_plaza_102',
                title: { ru: 'Главная серверная и Инженерный стенд 10G', en: '10G Engineering & Server Lab' },
                building: 'A',
                floor: 1,
                x: 450,
                y: 140,
                poiId: 401,
                imageUrl: '/assets/panoramas/plaza-meeting.svg',
                photoUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80',
                hotspots: [
                    { id: 'hs_hbl_1', type: 'info', yaw: 45, pitch: -2, poiId: 401, label: { ru: 'Стойки тестирования 10G/100G', en: '10G/100G Optical Racks' }, text: { ru: 'Мониторинг задержек сети в реальном времени', en: 'Real-time telemetry' } },
                    { id: 'hs_hbl_2', type: 'nav', yaw: 310, pitch: -6, targetPanoId: 'pano_plaza_corr', label: { ru: '← Выход в холл IT-Хаба', en: '← Back to IT-Hub Hall' } }
                ]
            }
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { defaultSpacesData };
} else {
    window.defaultSpacesData = defaultSpacesData;
}
