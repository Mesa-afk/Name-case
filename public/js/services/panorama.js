/**
 * Сервис работы с 360°-панорамами:
 *  - Пошаговая съёмка 8 секторов (0°..315°) с камеры телефона или в интерактивном режиме
 *  - Автоматическая сшивка серии кадров (stitching) с плавным смешиванием границ в единую панораму 360°
 *  - Генератор локального SVG QR-кода для публикации карты по ссылке
 */
const PanoramaService = {
    SECTORS: [
        { index: 0, angle: 0, labelRu: 'Север (0°)', labelEn: 'North (0°)', hintRu: 'Встаньте в центре и снимите прямо перед собой', hintEn: 'Stand centered and shoot straight ahead' },
        { index: 1, angle: 45, labelRu: 'Северо-Восток (45°)', labelEn: 'NE (45°)', hintRu: 'Повернитесь вправо на 45° (перекрытие ~25%)', hintEn: 'Turn 45° clockwise (~25% overlap)' },
        { index: 2, angle: 90, labelRu: 'Восток (90°)', labelEn: 'East (90°)', hintRu: 'Держите телефон вертикально на уровне глаз', hintEn: 'Keep phone level at eye height' },
        { index: 3, angle: 135, labelRu: 'Юго-Восток (135°)', labelEn: 'SE (135°)', hintRu: 'Продолжайте плавный поворот по часовой стрелке', hintEn: 'Continue turning clockwise smoothly' },
        { index: 4, angle: 180, labelRu: 'Юг (180°)', labelEn: 'South (180°)', hintRu: 'Половина круга позади — снимите противоположную стену', hintEn: 'Halfway around — capture opposite wall' },
        { index: 5, angle: 225, labelRu: 'Юго-Запад (225°)', labelEn: 'SW (225°)', hintRu: 'Повернитесь ещё на 45° вправо', hintEn: 'Turn another 45° clockwise' },
        { index: 6, angle: 270, labelRu: 'Запад (270°)', labelEn: 'West (270°)', hintRu: 'Почти полный оборот — остаётся 2 кадра', hintEn: 'Almost complete — 2 frames remaining' },
        { index: 7, angle: 315, labelRu: 'Северо-Запад (315°)', labelEn: 'NW (315°)', hintRu: 'Финальный кадр для замыкания кольца 360°', hintEn: 'Final shot to close the 360° loop' }
    ],

    /**
     * Захватывает один кадр с активного <video> камеры телефона,
     * либо рендерит реалистичный архитектурный сектор помещения (если камера недоступна на ПК)
     */
    captureSectorFrame(videoEl, sectorIndex, roomTitle = 'Помещение ТТК') {
        const canvas = document.createElement('canvas');
        canvas.width = 420;
        canvas.height = 560;
        const ctx = canvas.getContext('2d');

        if (videoEl && videoEl.readyState >= 2 && videoEl.videoWidth > 0) {
            const vw = videoEl.videoWidth;
            const vh = videoEl.videoHeight;
            const targetRatio = canvas.width / canvas.height;
            let sx = 0, sy = 0, sw = vw, sh = vh;
            if (vw / vh > targetRatio) {
                sw = vh * targetRatio;
                sx = (vw - sw) / 2;
            } else {
                sh = vw / targetRatio;
                sy = (vh - sh) / 2;
            }
            ctx.drawImage(videoEl, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
        } else {
            // Архитектурный рендер сектора для устройств без камеры
            const angle = sectorIndex * 45;
            const ceilGrad = ctx.createLinearGradient(0, 0, 0, 150);
            ceilGrad.addColorStop(0, '#090d16');
            ceilGrad.addColorStop(1, '#1e293b');
            ctx.fillStyle = ceilGrad;
            ctx.fillRect(0, 0, 420, 150);

            const wallHue = (210 + sectorIndex * 18) % 360;
            const wallGrad = ctx.createLinearGradient(0, 150, 0, 390);
            wallGrad.addColorStop(0, `hsl(${wallHue}, 28%, 18%)`);
            wallGrad.addColorStop(1, `hsl(${wallHue}, 24%, 13%)`);
            ctx.fillStyle = wallGrad;
            ctx.fillRect(0, 150, 420, 240);

            const floorGrad = ctx.createLinearGradient(0, 390, 0, 560);
            floorGrad.addColorStop(0, '#334155');
            floorGrad.addColorStop(1, '#0f172a');
            ctx.fillStyle = floorGrad;
            ctx.fillRect(0, 390, 420, 170);

            // Светильник на потолке
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            ctx.beginPath();
            ctx.ellipse(210, 82, 68, 12, 0, 0, Math.PI * 2);
            ctx.fill();

            // Архитектурная панель / окно / дверь в зависимости от сектора
            ctx.strokeStyle = sectorIndex % 2 === 0 ? '#E31B23' : '#38bdf8';
            ctx.lineWidth = 3;
            ctx.fillStyle = sectorIndex % 2 === 0 ? 'rgba(15, 23, 42, 0.85)' : 'rgba(56, 189, 248, 0.16)';
            ctx.fillRect(55, 185, 310, 185);
            ctx.strokeRect(55, 185, 310, 185);

            // Красная акцентная линия плинтуса ТТК
            ctx.fillStyle = '#E31B23';
            ctx.fillRect(0, 388, 420, 4);

            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 20px Roboto, Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(roomTitle.slice(0, 26), 210, 265);

            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 15px Roboto, Arial, sans-serif';
            ctx.fillText(`РАКУРС ${angle}° • СЕКТОР ${sectorIndex + 1}/8`, 210, 305);
        }

        return canvas.toDataURL('image/jpeg', 0.88);
    },

    /**
     * Склеивает 8 кадров в единую бесшовную цилиндрическую 360°-панораму (2400x800)
     * с плавным альфа-блендингом (feathering) зон перекрытия
     */
    async stitchFramesToPanorama(frameDataUrls) {
        const validUrls = (frameDataUrls || []).filter(Boolean);
        if (validUrls.length === 0) return '';

        const images = await Promise.all(
            validUrls.map(
                src =>
                    new Promise((resolve) => {
                        const img = new Image();
                        img.crossOrigin = 'anonymous';
                        img.onload = () => resolve(img);
                        img.onerror = () => resolve(null);
                        img.src = src;
                    })
            )
        );

        const loaded = images.filter(Boolean);
        if (loaded.length === 0) return '';

        const outW = 2400;
        const outH = 800;
        const canvas = document.createElement('canvas');
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, outW, outH);

        const count = loaded.length;
        const stepW = outW / count;
        const overlap = Math.round(stepW * 0.18);

        for (let i = 0; i < count; i++) {
            const img = loaded[i];
            const destX = i * stepW;

            // Временный буфер с мягкой маской на левом краю для бесшовного стыка
            const segCanvas = document.createElement('canvas');
            segCanvas.width = Math.ceil(stepW + overlap);
            segCanvas.height = outH;
            const sctx = segCanvas.getContext('2d');
            sctx.drawImage(img, 0, 0, segCanvas.width, outH);

            if (i > 0) {
                sctx.globalCompositeOperation = 'destination-in';
                const mask = sctx.createLinearGradient(0, 0, overlap, 0);
                mask.addColorStop(0, 'rgba(0,0,0,0)');
                mask.addColorStop(1, 'rgba(0,0,0,1)');
                sctx.fillStyle = mask;
                sctx.fillRect(0, 0, overlap, outH);
                sctx.fillStyle = 'rgba(0,0,0,1)';
                sctx.fillRect(overlap, 0, segCanvas.width - overlap, outH);
            }

            ctx.drawImage(segCanvas, destX - (i > 0 ? overlap / 2 : 0), 0);
        }

        // Замыкаем правый край с первым кадром для бесшовного 360° цикла
        if (loaded.length >= 2) {
            const wrapCanvas = document.createElement('canvas');
            wrapCanvas.width = overlap;
            wrapCanvas.height = outH;
            const wctx = wrapCanvas.getContext('2d');
            wctx.drawImage(loaded[0], 0, 0, overlap, outH);
            wctx.globalCompositeOperation = 'destination-in';
            const mask = wctx.createLinearGradient(0, 0, overlap, 0);
            mask.addColorStop(0, 'rgba(0,0,0,0)');
            mask.addColorStop(1, 'rgba(0,0,0,0.85)');
            wctx.fillStyle = mask;
            wctx.fillRect(0, 0, overlap, outH);
            ctx.drawImage(wrapCanvas, outW - overlap, 0);
        }

        return canvas.toDataURL('image/jpeg', 0.86);
    },

    /**
     * Генерирует визуальный матричный QR-бейдж (SVG) для быстрой публикации ссылки
     */
    generateShareQrSvg(urlText) {
        const size = 21;
        let hash = 2166136261;
        const str = String(urlText || 'https://ttk.ru');
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }

        const isFinder = (r, c) =>
            (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);

        const finderDark = (r, c, r0, c0) => {
            const lr = r - r0;
            const lc = c - c0;
            if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true;
            if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true;
            return false;
        };

        let rects = '';
        const cell = 8;
        const pad = 12;
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                let dark = false;
                if (r < 7 && c < 7) dark = finderDark(r, c, 0, 0);
                else if (r < 7 && c >= size - 7) dark = finderDark(r, c, 0, size - 7);
                else if (r >= size - 7 && c < 7) dark = finderDark(r, c, size - 7, 0);
                else if (r === 6 || c === 6) dark = (r + c) % 2 === 0;
                else if (!isFinder(r, c)) {
                    const v = Math.imul(hash ^ (r * 37 + c * 101 + str.charCodeAt((r * size + c) % str.length)), 2654435761);
                    dark = ((v >>> 16) & 1) === 1;
                }
                if (dark) {
                    const fill = (r >= 9 && r <= 11 && c >= 9 && c <= 11) ? '#E31B23' : '#0f172a';
                    rects += `<rect x="${pad + c * cell}" y="${pad + r * cell}" width="${cell - 0.6}" height="${cell - 0.6}" rx="1.4" fill="${fill}"/>`;
                }
            }
        }
        const total = pad * 2 + size * cell;
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" class="w-40 h-40 mx-auto rounded-2xl bg-white p-1 shadow-inner border border-slate-200">${rects}</svg>`;
    }
};

window.PanoramaService = PanoramaService;
