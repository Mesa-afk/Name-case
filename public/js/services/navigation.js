/**
 * Движок маршрутизации внутри зданий и по территории площадки (Алгоритм Дейкстры / A*)
 * Поддерживает:
 *  - маршруты внутри одного этажа по коридорам и проходам
 *  - межэтажные переходы (лифты и лестницы)
 *  - переходы между разными корпусами через территорию площадки (CAMPUS)
 *  - формирование пошагового тура по панорамам 360° вдоль маршрута
 */
const NavigationService = {
    dist(ax, ay, bx, by) {
        return Math.hypot((bx || 0) - (ax || 0), (by || 0) - (ay || 0));
    },

    /**
     * Строит полный маршрут между двумя точками интереса (poiA -> poiB) в рамках space
     */
    computeRoute(space, fromPoiId, toPoiId) {
        if (!space || !space.pois || !fromPoiId || !toPoiId) return null;
        const startPoi = space.pois.find(p => String(p.id) === String(fromPoiId));
        const endPoi = space.pois.find(p => String(p.id) === String(toPoiId));
        if (!startPoi || !endPoi) return null;

        if (String(startPoi.id) === String(endPoi.id)) {
            return {
                startPoi,
                endPoi,
                totalMeters: 0,
                estimatedMinutes: 1,
                segmentsByLayer: {
                    [`${startPoi.building}:${startPoi.floor}`]: [[startPoi.x, startPoi.y]]
                },
                campusPolyline: [],
                steps: [
                    {
                        index: 1,
                        building: startPoi.building,
                        floor: startPoi.floor,
                        mode: 'arrive',
                        panoId: startPoi.panoId || '',
                        text: {
                            ru: `Вы уже находитесь у точки «${startPoi.name.ru}»`,
                            en: `You are already at "${startPoi.name.en}"`
                        }
                    }
                ],
                panoramaTour: startPoi.panoId && space.panoramas?.[startPoi.panoId]
                    ? [{ panoId: startPoi.panoId, stepLabel: startPoi.name }]
                    : []
            };
        }

        // Копируем граф пространства и динамически подключаем виртуальные узлы старта и финиша
        const baseNodes = (space.navGraph?.nodes || []).map(n => ({ ...n }));
        const baseEdges = (space.navGraph?.edges || []).map(e => ({ ...e }));

        const nodeMap = new Map();
        for (const n of baseNodes) nodeMap.set(n.id, n);

        const adj = new Map();
        const addEdge = (a, b, w, kind = 'walk') => {
            if (!adj.has(a)) adj.set(a, []);
            if (!adj.has(b)) adj.set(b, []);
            adj.get(a).push({ to: b, weight: w, kind });
            adj.get(b).push({ to: a, weight: w, kind });
        };

        for (const e of baseEdges) {
            if (nodeMap.has(e.from) && nodeMap.has(e.to)) {
                addEdge(e.from, e.to, Number(e.weight) || 15, e.kind || 'walk');
            }
        }

        // Функция привязки POI к ближайшим узлам того же корпуса и этажа
        const attachPoiVirtualNode = (poi, virtualId) => {
            const bFoot = space.campus?.buildingFootprints?.find(bf => bf.buildingId === poi.building);
            const fallbackCampusX = poi.campusX || (bFoot ? bFoot.x + (poi.x / 720) * bFoot.w : poi.x);
            const fallbackCampusY = poi.campusY || (bFoot ? bFoot.y + (poi.y / 420) * bFoot.h : poi.y);

            const vNode = {
                id: virtualId,
                building: poi.building,
                floor: Number(poi.floor),
                x: Number(poi.x),
                y: Number(poi.y),
                campusX: fallbackCampusX,
                campusY: fallbackCampusY,
                type: 'poi',
                panoId: poi.panoId || '',
                label: poi.name
            };
            nodeMap.set(virtualId, vNode);

            // Если явно указан узел и он существует на этом же этаже
            if (poi.navNodeId && nodeMap.has(poi.navNodeId)) {
                const target = nodeMap.get(poi.navNodeId);
                if (target.building === poi.building && Number(target.floor) === Number(poi.floor)) {
                    const d = Math.max(2, this.dist(poi.x, poi.y, target.x, target.y) * 0.12);
                    addEdge(virtualId, target.id, d, 'walk');
                }
            }

            // Дополнительно соединяем с 2 ближайшими узлами на том же этаже для новых точек из редактора
            const sameFloorNodes = baseNodes
                .filter(n => n.building === poi.building && Number(n.floor) === Number(poi.floor))
                .map(n => ({ n, d: this.dist(poi.x, poi.y, n.x, n.y) }))
                .sort((a, b) => a.d - b.d)
                .slice(0, 2);

            for (const item of sameFloorNodes) {
                addEdge(virtualId, item.n.id, Math.max(2, item.d * 0.12), 'walk');
            }
        };

        const startNodeId = '__start_poi__';
        const endNodeId = '__end_poi__';
        attachPoiVirtualNode(startPoi, startNodeId);
        attachPoiVirtualNode(endPoi, endNodeId);

        // Если обе точки на одном этаже и нет связного графа (например, на новом этаже в редакторе), добавляем резервное прямое ребро
        if (startPoi.building === endPoi.building && Number(startPoi.floor) === Number(endPoi.floor)) {
            const directDist = this.dist(startPoi.x, startPoi.y, endPoi.x, endPoi.y) * 0.12;
            // Больший вес, чтобы при наличии коридоров маршрут шёл строго по коридорам
            addEdge(startNodeId, endNodeId, directDist * 3.2 + 40, 'walk');
        }

        // Алгоритм Дейкстры
        const distances = new Map();
        const prev = new Map();
        const prevEdgeKind = new Map();
        const visited = new Set();

        for (const id of nodeMap.keys()) distances.set(id, Infinity);
        distances.set(startNodeId, 0);

        while (true) {
            let current = null;
            let best = Infinity;
            for (const [id, d] of distances.entries()) {
                if (!visited.has(id) && d < best) {
                    best = d;
                    current = id;
                }
            }
            if (!current || current === endNodeId) break;
            visited.add(current);

            const neighbors = adj.get(current) || [];
            for (const edge of neighbors) {
                if (visited.has(edge.to)) continue;
                const candidate = best + edge.weight;
                if (candidate < (distances.get(edge.to) ?? Infinity)) {
                    distances.set(edge.to, candidate);
                    prev.set(edge.to, current);
                    prevEdgeKind.set(edge.to, edge.kind);
                }
            }
        }

        // Восстановление пути
        const pathNodes = [];
        let cursor = endNodeId;
        if (prev.has(cursor) || cursor === startNodeId) {
            while (cursor) {
                pathNodes.unshift(nodeMap.get(cursor));
                cursor = prev.get(cursor);
            }
        } else {
            // Резервный путь, если корпуса/этажи ещё не соединены организатором
            pathNodes.push(nodeMap.get(startNodeId), nodeMap.get(endNodeId));
        }

        // Формирование полилиний по слоям (Корпус:Этаж и Генплан CAMPUS)
        const segmentsByLayer = {};
        const campusPolyline = [];
        let totalMeters = 0;

        for (let i = 0; i < pathNodes.length; i++) {
            const node = pathNodes[i];
            if (node.campusX !== undefined && node.campusY !== undefined) {
                campusPolyline.push([node.campusX, node.campusY]);
            }

            if (node.building !== 'CAMPUS') {
                const layerKey = `${node.building}:${node.floor}`;
                if (!segmentsByLayer[layerKey]) segmentsByLayer[layerKey] = [];
                // Разбиваем на подсегменты, если маршрут уходил на другой этаж и вернулся
                const prevNode = i > 0 ? pathNodes[i - 1] : null;
                if (!prevNode || (prevNode.building === node.building && Number(prevNode.floor) === Number(node.floor))) {
                    const segs = segmentsByLayer[layerKey];
                    if (segs.length === 0) segs.push([]);
                    segs[segs.length - 1].push([node.x, node.y]);
                } else {
                    segmentsByLayer[layerKey].push([[node.x, node.y]]);
                }
            }

            if (i > 0) {
                const p = pathNodes[i - 1];
                if (p.building === node.building && Number(p.floor) === Number(node.floor)) {
                    totalMeters += this.dist(p.x, p.y, node.x, node.y) * 0.14;
                } else if (p.building !== node.building) {
                    totalMeters += 32;
                } else {
                    totalMeters += 12 * Math.abs(Number(node.floor) - Number(p.floor));
                }
            }
        }

        totalMeters = Math.max(8, Math.round(totalMeters));
        const estimatedMinutes = Math.max(1, Math.round(totalMeters / 65));

        // Пошаговые инструкции навигации
        const steps = [];
        steps.push({
            index: 1,
            building: startPoi.building,
            floor: startPoi.floor,
            mode: 'start',
            panoId: startPoi.panoId || pathNodes[1]?.panoId || '',
            text: {
                ru: `Старт от «${startPoi.name.ru}» (Корпус ${startPoi.building}, Этаж ${startPoi.floor})`,
                en: `Start at "${startPoi.name.en}" (Bldg ${startPoi.building}, Floor ${startPoi.floor})`
            }
        });

        for (let i = 1; i < pathNodes.length - 1; i++) {
            const prevN = pathNodes[i - 1];
            const currN = pathNodes[i];
            const nextN = pathNodes[i + 1];

            if (currN.building === 'CAMPUS' && prevN.building !== 'CAMPUS') {
                steps.push({
                    index: steps.length + 1,
                    building: 'CAMPUS',
                    floor: 1,
                    mode: 'outdoor',
                    panoId: currN.panoId || '',
                    text: {
                        ru: `Выйдите на территорию и пройдите по переходу «${currN.label?.ru || 'Аллея'}» в Корпус ${nextN.building}`,
                        en: `Walk across campus "${currN.label?.en || 'Walkway'}" to Building ${nextN.building}`
                    }
                });
            } else if (currN.building === nextN.building && Number(currN.floor) !== Number(nextN.floor)) {
                const dirRu = Number(nextN.floor) > Number(currN.floor) ? 'Поднимитесь' : 'Спуститесь';
                const dirEn = Number(nextN.floor) > Number(currN.floor) ? 'Go up' : 'Go down';
                steps.push({
                    index: steps.length + 1,
                    building: nextN.building,
                    floor: nextN.floor,
                    mode: 'elevator',
                    panoId: currN.panoId || nextN.panoId || '',
                    text: {
                        ru: `${dirRu} на лифте или по лестнице с ${currN.floor} на ${nextN.floor} этаж (Корпус ${currN.building})`,
                        en: `${dirEn} via elevator/stairs from Floor ${currN.floor} to Floor ${nextN.floor} (Bldg ${currN.building})`
                    }
                });
            }
        }

        // Если внутри одного этажа был промежуточный коридор, добавим понятный шаг по коридору
        if (steps.length === 1 && pathNodes.length > 2) {
            const mid = pathNodes[Math.floor(pathNodes.length / 2)];
            steps.push({
                index: 2,
                building: mid.building === 'CAMPUS' ? 'CAMPUS' : mid.building,
                floor: mid.floor,
                mode: 'walk',
                panoId: mid.panoId || '',
                text: {
                    ru: `Следуйте по маршруту через «${mid.label?.ru || 'Центральный коридор'}»`,
                    en: `Follow the corridor via "${mid.label?.en || 'Main Hallway'}"`
                }
            });
        }

        steps.push({
            index: steps.length + 1,
            building: endPoi.building,
            floor: endPoi.floor,
            mode: 'arrive',
            panoId: endPoi.panoId || '',
            text: {
                ru: `Прибытие: «${endPoi.name.ru}» (Корпус ${endPoi.building}, Этаж ${endPoi.floor})`,
                en: `Destination: "${endPoi.name.en}" (Bldg ${endPoi.building}, Floor ${endPoi.floor})`
            }
        });

        // Последовательность панорам вдоль маршрута («Пройти путь в панорамах 360°»)
        const panoramaTour = [];
        const seenPanos = new Set();
        for (const node of pathNodes) {
            const pId = node.panoId;
            if (pId && space.panoramas?.[pId] && !seenPanos.has(pId)) {
                seenPanos.add(pId);
                panoramaTour.push({
                    panoId: pId,
                    building: node.building,
                    floor: node.floor,
                    stepLabel: space.panoramas[pId].title || node.label
                });
            }
        }

        return {
            startPoi,
            endPoi,
            totalMeters,
            estimatedMinutes,
            segmentsByLayer,
            campusPolyline,
            steps,
            panoramaTour
        };
    }
};

window.NavigationService = NavigationService;
