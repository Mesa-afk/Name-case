/**
 * Рендерер векторных 2D-планов этажей и генерального плана территории (SVG-разметка).
 * Возвращает строку SVG-элементов, которая вставляется в <svg> через x-html.
 * Клики обрабатываются делегированием по data-атрибутам (data-poi-id, data-pano-id, data-edit-type ...).
 */
const MapRenderer = {
    esc(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    },

    palette(dark) {
        return dark
            ? { bg: '#0f172a', grid: '#1e293b', wall: '#e2e8f0', text: '#e2e8f0', subtext: '#94a3b8', door: '#0f172a', window: '#38bdf8', nav: '#64748b', poiStroke: '#0f172a' }
            : { bg: '#ffffff', grid: '#f1f5f9', wall: '#0f172a', text: '#1e293b', subtext: '#64748b', door: '#ffffff', window: '#0ea5e9', nav: '#94a3b8', poiStroke: '#ffffff' };
    },

    roomColors: {
        hall: ['#0ea5e9', 0.10],
        corridor: ['#f59e0b', 0.10],
        meeting: ['#E31B23', 0.11],
        stand: ['#8b5cf6', 0.13],
        entrance: ['#10b981', 0.12],
        vertical: ['#6366f1', 0.14],
        tech: ['#06b6d4', 0.12],
        service: ['#f97316', 0.11],
        park: ['#10b981', 0.08]
    },

    categoryColors: {
        entrance: '#10b981',
        meeting: '#E31B23',
        stand: '#8b5cf6',
        service: '#f59e0b',
        wifi: '#0ea5e9',
        vertical: '#6366f1'
    },

    categoryGlyph: {
        entrance: '⇥',
        meeting: '◉',
        stand: '★',
        service: '☕',
        wifi: '⌔',
        vertical: '⇅'
    },

    labelFontSize(label, w) {
        const len = Math.max(4, String(label).length);
        return Math.max(7, Math.min(11, (w - 10) / (len * 0.58)));
    },

    gridDefs(p) {
        return `
            <defs>
                <pattern id="ttkGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="${p.grid}" stroke-width="1"/>
                </pattern>
                <marker id="ttkArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#E31B23"/>
                </marker>
            </defs>
            <rect width="720" height="420" fill="${p.bg}"/>
            <rect width="720" height="420" fill="url(#ttkGrid)"/>
        `;
    },

    renderRoute(polylines) {
        let out = '';
        for (const pts of polylines || []) {
            out += `<polyline points="${pts}" fill="none" stroke="#E31B23" stroke-opacity="0.22" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`;
            out += `<polyline points="${pts}" fill="none" stroke="#E31B23" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="animate-route" marker-end="url(#ttkArrow)"/>`;
            const arr = pts.split(' ');
            const [sx, sy] = arr[0].split(',');
            const [ex, ey] = arr[arr.length - 1].split(',');
            out += `<circle cx="${sx}" cy="${sy}" r="6" fill="#ffffff" stroke="#E31B23" stroke-width="3"/>`;
            out += `<circle cx="${ex}" cy="${ey}" r="7" fill="#E31B23" stroke="#ffffff" stroke-width="2"/>`;
        }
        return out;
    },

    renderPoi(poi, x, y, { selected, lang, routeFromId, routeToId, editor }) {
        const color = this.categoryColors[poi.category] || '#E31B23';
        const glyph = this.categoryGlyph[poi.category] || '•';
        const isFrom = String(poi.id) === String(routeFromId);
        const isTo = String(poi.id) === String(routeToId);
        const name = poi.name?.[lang] || poi.name?.ru || '';
        let out = `<g class="poi-marker-group" data-poi-id="${this.esc(poi.id)}" ${editor ? `data-edit-type="poi" data-edit-id="${this.esc(poi.id)}"` : ''} transform="translate(${x},${y})" style="cursor:pointer">`;
        if (selected) {
            out += `<circle r="15" fill="${color}" opacity="0.35" class="poi-pulse"/>`;
        }
        out += `<circle r="${selected ? 13 : 11}" fill="${color}" stroke="${selected ? '#ffffff' : 'rgba(255,255,255,0.9)'}" stroke-width="${selected ? 3 : 2}"/>`;
        out += `<text y="4" text-anchor="middle" font-size="11" font-weight="900" fill="#ffffff" style="pointer-events:none">${glyph}</text>`;
        if (isFrom || isTo) {
            out += `<g transform="translate(10,-14)"><rect x="-8" y="-8" width="16" height="16" rx="5" fill="${isFrom ? '#0f172a' : '#E31B23'}" stroke="#fff" stroke-width="1.5"/><text y="4" text-anchor="middle" font-size="10" font-weight="900" fill="#fff">${isFrom ? 'A' : 'B'}</text></g>`;
        }
        if (selected || editor) {
            const short = name.length > 30 ? name.slice(0, 29) + '…' : name;
            const w = Math.max(60, short.length * 5.6 + 14);
            out += `<g transform="translate(0,${selected ? 26 : 22})" style="pointer-events:none"><rect x="${-w / 2}" y="-9" width="${w}" height="16" rx="8" fill="rgba(15,23,42,0.88)"/><text y="3" text-anchor="middle" font-size="9" font-weight="700" fill="#fff">${this.esc(short)}</text></g>`;
        }
        out += `</g>`;
        return out;
    },

    /**
     * Рендер плана этажа
     */
    renderFloor(opts) {
        const {
            space, floorPlan, building, floor, lang = 'ru', dark = false,
            selectedPoiId = null, routePolylines = [], categoryFilter = 'all',
            routeFromId = '', routeToId = '',
            editor = false, editorSelected = null, drawingPreview = null, ruler = null,
            showNav = false, showPanos = true
        } = opts;
        const p = this.palette(dark);
        const fp = floorPlan || {};
        let out = this.gridDefs(p);

        if (fp.backgroundUrl) {
            out += `<image href="${this.esc(fp.backgroundUrl)}" x="0" y="0" width="720" height="420" preserveAspectRatio="xMidYMid meet" opacity="${fp.backgroundOpacity ?? 0.45}"/>`;
        }

        // Помещения и зоны
        for (const r of fp.rooms || []) {
            const [c, a] = this.roomColors[r.type] || ['#64748b', 0.1];
            const isSel = editor && editorSelected?.type === 'room' && editorSelected.id === r.id;
            const label = r.label?.[lang] || r.label?.ru || '';
            const fs = this.labelFontSize(label, r.w);
            out += `<g ${editor ? `data-edit-type="room" data-edit-id="${this.esc(r.id)}"` : ''}>`;
            out += `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${c}" fill-opacity="${a}" stroke="${isSel ? '#E31B23' : c}" stroke-opacity="${isSel ? 1 : 0.35}" stroke-width="${isSel ? 3 : 1.2}" ${isSel ? 'stroke-dasharray="6 4"' : ''}/>`;
            out += `<text x="${r.x + r.w / 2}" y="${r.h > 70 ? r.y + 16 : r.y + r.h / 2 + 3}" text-anchor="middle" font-size="${fs.toFixed(1)}" font-weight="800" fill="${p.text}" fill-opacity="0.85" style="pointer-events:none;text-transform:uppercase;letter-spacing:0.02em">${this.esc(label)}</text>`;
            out += `</g>`;
        }

        // Окна
        for (const w of fp.windows || []) {
            out += `<line x1="${w.x1}" y1="${w.y1}" x2="${w.x2}" y2="${w.y2}" stroke="${p.window}" stroke-width="5" stroke-linecap="round"/>`;
        }

        // Стены
        for (const w of fp.walls || []) {
            const isSel = editor && editorSelected?.type === 'wall' && editorSelected.id === w.id;
            out += `<line ${editor ? `data-edit-type="wall" data-edit-id="${this.esc(w.id)}"` : ''} x1="${w.x1}" y1="${w.y1}" x2="${w.x2}" y2="${w.y2}" stroke="${isSel ? '#E31B23' : p.wall}" stroke-width="${isSel ? 7 : 5}" stroke-linecap="round"/>`;
        }

        // Двери / проходы
        for (const d of fp.doors || []) {
            const half = (d.width || 44) / 2;
            const isSel = editor && editorSelected?.type === 'door' && editorSelected.id === d.id;
            const attrs = editor ? `data-edit-type="door" data-edit-id="${this.esc(d.id)}"` : '';
            if (d.orientation === 'v') {
                out += `<line ${attrs} x1="${d.x}" y1="${d.y - half}" x2="${d.x}" y2="${d.y + half}" stroke="${p.door}" stroke-width="8"/>`;
                out += `<path d="M ${d.x} ${d.y - half} A ${half * 2} ${half * 2} 0 0 1 ${d.x + half * 1.1} ${d.y + half * 0.2}" fill="none" stroke="${isSel ? '#E31B23' : '#10b981'}" stroke-width="1.6" stroke-dasharray="3 2"/>`;
            } else {
                out += `<line ${attrs} x1="${d.x - half}" y1="${d.y}" x2="${d.x + half}" y2="${d.y}" stroke="${p.door}" stroke-width="8"/>`;
                out += `<path d="M ${d.x - half} ${d.y} A ${half * 2} ${half * 2} 0 0 0 ${d.x + half * 0.2} ${d.y - half * 1.1}" fill="none" stroke="${isSel ? '#E31B23' : '#10b981'}" stroke-width="1.6" stroke-dasharray="3 2"/>`;
            }
        }

        // Граф навигации (в редакторе)
        if (showNav && space?.navGraph) {
            const nodes = space.navGraph.nodes.filter(n => n.building === building && Number(n.floor) === Number(floor));
            const ids = new Set(nodes.map(n => n.id));
            const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]));
            for (const e of space.navGraph.edges || []) {
                if (ids.has(e.from) && ids.has(e.to)) {
                    const a = nodeById[e.from], b = nodeById[e.to];
                    out += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${p.nav}" stroke-width="2" stroke-dasharray="4 4"/>`;
                }
            }
            for (const n of nodes) {
                const color = n.type === 'elevator' ? '#6366f1' : '#64748b';
                out += `<circle cx="${n.x}" cy="${n.y}" r="${n.type === 'elevator' ? 6 : 4.5}" fill="${color}" stroke="#fff" stroke-width="1.5"/>`;
                if (n.type === 'elevator') {
                    out += `<text x="${n.x}" y="${n.y + 3}" text-anchor="middle" font-size="7" font-weight="900" fill="#fff" style="pointer-events:none">⇅</text>`;
                }
            }
        }

        // Маршрут
        out += this.renderRoute(routePolylines);

        // Точки съёмки панорам
        if (showPanos && space?.panoramas) {
            for (const pano of Object.values(space.panoramas)) {
                if (pano.building !== building || Number(pano.floor) !== Number(floor)) continue;
                if (pano.x === undefined || pano.y === undefined) continue;
                const px = Number(pano.x) + 16, py = Number(pano.y) - 16;
                out += `<g data-pano-id="${this.esc(pano.id)}" transform="translate(${px},${py})" style="cursor:pointer"><rect x="-9" y="-7" width="18" height="14" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/><circle r="3.6" fill="none" stroke="#38bdf8" stroke-width="1.6"/><text x="0" y="-10" text-anchor="middle" font-size="7" font-weight="900" fill="#0ea5e9" style="pointer-events:none">360°</text></g>`;
            }
        }

        // Точки интереса
        for (const poi of space?.pois || []) {
            if (poi.building !== building || Number(poi.floor) !== Number(floor)) continue;
            if (!editor && categoryFilter !== 'all' && poi.category !== categoryFilter) continue;
            const selected = editor
                ? editorSelected?.type === 'poi' && String(editorSelected.id) === String(poi.id)
                : String(selectedPoiId) === String(poi.id);
            out += this.renderPoi(poi, poi.x, poi.y, { selected, lang, routeFromId, routeToId, editor });
        }

        // Предпросмотр рисования в редакторе
        if (drawingPreview) {
            const { tool, s, c } = drawingPreview;
            if (tool === 'zone') {
                out += `<rect x="${Math.min(s.x, c.x)}" y="${Math.min(s.y, c.y)}" width="${Math.abs(c.x - s.x)}" height="${Math.abs(c.y - s.y)}" fill="#E31B23" fill-opacity="0.12" stroke="#E31B23" stroke-width="2" stroke-dasharray="6 4"/>`;
            } else {
                const color = tool === 'window' ? p.window : tool === 'ruler' ? '#f59e0b' : '#E31B23';
                out += `<line x1="${s.x}" y1="${s.y}" x2="${c.x}" y2="${c.y}" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${tool === 'ruler' ? '6 4' : '0'}"/>`;
                if (tool === 'ruler' || tool === 'wall') {
                    const m = (Math.hypot(c.x - s.x, c.y - s.y) * 0.14).toFixed(1);
                    out += `<text x="${(s.x + c.x) / 2}" y="${(s.y + c.y) / 2 - 8}" text-anchor="middle" font-size="11" font-weight="900" fill="${color}">${m} м</text>`;
                }
            }
        }

        if (ruler) {
            out += `<line x1="${ruler.x1}" y1="${ruler.y1}" x2="${ruler.x2}" y2="${ruler.y2}" stroke="#f59e0b" stroke-width="3" stroke-dasharray="6 4"/>`;
            out += `<g transform="translate(${(ruler.x1 + ruler.x2) / 2},${(ruler.y1 + ruler.y2) / 2 - 12})"><rect x="-30" y="-10" width="60" height="18" rx="9" fill="#f59e0b"/><text y="3" text-anchor="middle" font-size="10" font-weight="900" fill="#fff">${ruler.meters} м</text></g>`;
        }

        return out;
    },

    /**
     * Рендер генерального плана территории (несколько зданий + маршрут между ними)
     */
    renderCampus(opts) {
        const { space, lang = 'ru', dark = false, routePolylines = [], selectedPoiId = null, routeFromId = '', routeToId = '' } = opts;
        const p = this.palette(dark);
        const campus = space?.campus || { zones: [], buildingFootprints: [] };
        let out = this.gridDefs(p);

        for (const z of campus.zones || []) {
            const [c, a] = this.roomColors[z.type] || ['#64748b', 0.1];
            out += `<rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="${z.type === 'park' ? 26 : 10}" fill="${c}" fill-opacity="${a}" stroke="${c}" stroke-opacity="0.35" stroke-width="1.5" ${z.type === 'corridor' ? 'stroke-dasharray="6 4"' : ''}/>`;
            const label = z.label?.[lang] || z.label?.ru || '';
            const ty = z.type === 'park' ? z.y + 18 : z.y + z.h / 2 + 3;
            out += `<text x="${z.x + z.w / 2}" y="${ty}" text-anchor="middle" font-size="${z.type === 'park' ? 10 : this.labelFontSize(label, z.w).toFixed(1)}" font-weight="800" fill="${p.subtext}" style="pointer-events:none;text-transform:uppercase">${this.esc(label)}</text>`;
        }

        for (const b of campus.buildingFootprints || []) {
            const label = b.label?.[lang] || b.label?.ru || b.buildingId;
            out += `<g data-building="${this.esc(b.buildingId)}" style="cursor:pointer">`;
            out += `<rect x="${b.x + 6}" y="${b.y + 8}" width="${b.w}" height="${b.h}" rx="12" fill="#000" opacity="${dark ? 0.35 : 0.08}"/>`;
            out += `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="12" fill="${dark ? '#1e293b' : '#f8fafc'}" stroke="${p.wall}" stroke-width="4"/>`;
            out += `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="30" rx="12" fill="#E31B23"/>`;
            out += `<rect x="${b.x}" y="${b.y + 18}" width="${b.w}" height="12" fill="#E31B23"/>`;
            out += `<text x="${b.x + b.w / 2}" y="${b.y + 20}" text-anchor="middle" font-size="${this.labelFontSize(label, b.w).toFixed(1)}" font-weight="900" fill="#fff" style="pointer-events:none">${this.esc(label)}</text>`;
            out += `<text x="${b.x + b.w / 2}" y="${b.y + b.h - 12}" text-anchor="middle" font-size="9" font-weight="700" fill="${p.subtext}" style="pointer-events:none">${lang === 'ru' ? 'Нажмите, чтобы открыть этажи' : 'Tap to open floors'}</text>`;
            out += `</g>`;
        }

        // Внешние узлы навигации (аллеи, парковки)
        for (const n of space?.navGraph?.nodes || []) {
            if (n.building !== 'CAMPUS') continue;
            out += `<circle cx="${n.campusX}" cy="${n.campusY}" r="5" fill="#10b981" stroke="#fff" stroke-width="2"/>`;
        }

        out += this.renderRoute(routePolylines);

        for (const poi of space?.pois || []) {
            const fp = campus.buildingFootprints?.find(f => f.buildingId === poi.building);
            const x = poi.campusX ?? (fp ? fp.x + (poi.x / 720) * fp.w : poi.x);
            const y = poi.campusY ?? (fp ? fp.y + (poi.y / 420) * fp.h : poi.y);
            out += this.renderPoi(poi, x, y, {
                selected: String(selectedPoiId) === String(poi.id),
                lang, routeFromId, routeToId, editor: false
            });
        }
        return out;
    }
};

window.MapRenderer = MapRenderer;
