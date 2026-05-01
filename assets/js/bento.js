(function () {
  const COLS = 36, ROWS = 20;

  function djb2(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = (Math.imul(h, 33) + str.charCodeAt(i)) | 0;
    return h >>> 0;
  }

  function rowWorst(row, rowWeight, longSide, shortSide, remWeight) {
    if (!row.length) return Infinity;
    const stripT = rowWeight / remWeight * longSide;
    let worst = 0;
    for (const it of row) {
      const itemL = it.weight / rowWeight * shortSide;
      const r = Math.max(stripT / itemL, itemL / stripT);
      if (r > worst) worst = r;
    }
    return worst;
  }

  function distribute(weights, total) {
    const sumW = weights.reduce((a, b) => a + b, 0);
    const exact = weights.map(w => w / sumW * total);
    const lens = exact.map(Math.floor);
    const rem = total - lens.reduce((a, b) => a + b, 0);
    if (rem > 0) {
      exact
        .map((e, i) => ({ i, frac: e - Math.floor(e) }))
        .sort((a, b) => b.frac - a.frac)
        .slice(0, rem)
        .forEach(({ i }) => lens[i]++);
    }
    return lens;
  }

  function squarify(items, rect, out) {
    let remaining = [...items];
    let cur = { ...rect };
    let remWeight = items.reduce((s, it) => s + it.weight, 0);

    while (remaining.length > 0) {
      const landscape = cur.w >= cur.h;
      const shortSide = landscape ? cur.h : cur.w;
      const longSide  = landscape ? cur.w : cur.h;

      let row = [];
      let rowWeight = 0;

      while (remaining.length > 0) {
        const next = remaining[0];
        const newWeight = rowWeight + next.weight;
        const newWorst = rowWorst([...row, next], newWeight, longSide, shortSide, remWeight);
        const curWorst = rowWorst(row, rowWeight, longSide, shortSide, remWeight);

        if (row.length === 0 || newWorst <= curWorst) {
          row.push(remaining.shift());
          rowWeight = newWeight;
        } else {
          break;
        }
      }

      const isLastRow = remaining.length === 0;
      const stripT = isLastRow
        ? longSide
        : Math.max(1, Math.min(longSide - 1, Math.round(rowWeight / remWeight * longSide)));

      const lens = distribute(row.map(it => it.weight), shortSide);

      let pos = 0;
      row.forEach((item, k) => {
        out[item.order] = landscape
          ? { col: cur.x,       row: cur.y + pos, cw: stripT,  rh: lens[k] }
          : { col: cur.x + pos, row: cur.y,       cw: lens[k], rh: stripT  };
        pos += lens[k];
      });

      if (isLastRow) break;

      cur = landscape
        ? { x: cur.x + stripT, y: cur.y,           w: cur.w - stripT, h: cur.h }
        : { x: cur.x,           y: cur.y + stripT, w: cur.w,          h: cur.h - stripT };
      remWeight -= rowWeight;
    }
  }

  const grid = document.getElementById('bento-grid');
  if (!grid) return;
  const tiles = Array.from(grid.querySelectorAll('.bento-tile'));
  if (!tiles.length) return;

  const items = tiles.map((tile, i) => {
    const size = parseInt(tile.dataset.size) || 1;
    const title = (tile.querySelector('.tile-title')?.textContent || String(i)).trim();
    const jitter = 1 + ((djb2(title) % 1000) / 1000 - 0.5) * 0.3;
    return { weight: size * jitter, tile, order: i };
  });

  items.sort((a, b) => b.weight - a.weight);
  items.forEach((it, i) => {
    it.order = i;
    it.tile.style.order = i;
  });

  if (window.innerWidth <= 640) {
    items.forEach(it => { it.tile.style.visibility = 'visible'; });
    return;
  }

  const out = new Array(items.length);
  squarify(items, { x: 0, y: 0, w: COLS, h: ROWS }, out);

  const debug = new URLSearchParams(location.search).has('debug');

  // Shared drag state
  let activeDrag = null;

  function fmtAdj(x, y) {
    const r = n => +(Math.round(n * 10) / 10);
    return `[${r(x)}, ${r(y)}]`;
  }

  // Returns effective scale (1 = no zoom applied).
  // Uses object-position to consume natural image overflow for free, then
  // falls back to translate+scale only for any excess beyond that range.
  function applySmartTransform(img, adjX, adjY, tw, th) {
    const nw = img.naturalWidth, nh = img.naturalHeight;

    if (!nw || !nh) {
      const s = 1 + Math.max(Math.abs(adjX), Math.abs(adjY)) / 50;
      img.style.objectPosition = '';
      img.style.transform = (adjX || adjY) ? `translate(${-adjX}%, ${adjY}%) scale(${s})` : '';
      return s;
    }

    const cs = Math.max(tw / nw, th / nh);
    const ox = nw * cs - tw, oy = nh * cs - th;

    // Max free pan each side via object-position (% of tile)
    const mpx = ox > 0 ? ox / tw * 50 : 0;
    const mpy = oy > 0 ? oy / th * 50 : 0;

    // Object-position for the free-pan portion
    const posX = ox > 0 ? Math.min(100, Math.max(0, 50 + adjX * tw / ox)) : 50;
    const posY = oy > 0 ? Math.min(100, Math.max(0, 50 - adjY * th / oy)) : 50;
    img.style.objectPosition = `${posX}% ${posY}%`;

    // Excess shift that object-position cannot cover
    const ex = Math.max(0, Math.abs(adjX) - mpx);
    const ey = Math.max(0, Math.abs(adjY) - mpy);

    if (!ex && !ey) {
      img.style.transform = '';
      return 1;
    }

    const tx = -Math.sign(adjX) * ex;
    const ty = Math.sign(adjY) * ey;
    const scale = 1 + 2 * Math.max(ex, ey) / 100;
    img.style.transform = `translate(${tx}%, ${ty}%) scale(${scale})`;
    return scale;
  }

  if (debug) {
    document.addEventListener('mousemove', e => {
      if (!activeDrag) return;
      const { img, tile, adjSpan, zoomSpan, startX, startY, startAdjX, startAdjY } = activeDrag;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) activeDrag.hasMoved = true;
      activeDrag.curAdjX = startAdjX - dx / tile.offsetWidth * 100;
      activeDrag.curAdjY = startAdjY + dy / tile.offsetHeight * 100;
      const scale = applySmartTransform(img, activeDrag.curAdjX, activeDrag.curAdjY, tile.offsetWidth, tile.offsetHeight);
      adjSpan.textContent = fmtAdj(activeDrag.curAdjX, activeDrag.curAdjY);
      zoomSpan.textContent = scale.toFixed(3);
    });

    document.addEventListener('mouseup', () => {
      if (!activeDrag) return;
      const { img, tile, hasMoved, updateCur, curAdjX, curAdjY } = activeDrag;
      img.style.cursor = 'grab';
      document.body.style.userSelect = '';
      updateCur(curAdjX, curAdjY);
      if (hasMoved) tile.addEventListener('click', e => e.preventDefault(), { once: true });
      activeDrag = null;
    });
  }

  out.forEach((slot, i) => {
    const item = items[i];
    const tile = item.tile;
    const img = tile.querySelector('img');
    const [adjX0, adjY0] = (img?.dataset.adj || '0,0').split(',').map(Number);

    tile.style.gridArea = `${slot.row + 1} / ${slot.col + 1} / ${slot.row + 1 + slot.rh} / ${slot.col + 1 + slot.cw}`;
    tile.style.visibility = 'visible';

    const tw = tile.offsetWidth, th = tile.offsetHeight;

    if (img) {
      if (img.complete && img.naturalWidth) {
        applySmartTransform(img, adjX0, adjY0, tw, th);
      } else {
        img.addEventListener('load', () => applySmartTransform(img, adjX0, adjY0, tw, th), { once: true });
      }
    }

    if (!debug) return;

    let curAdjX = adjX0, curAdjY = adjY0;

    // Debug panel
    const panel = document.createElement('div');
    Object.assign(panel.style, {
      position: 'absolute', top: '10px', left: '12px',
      fontFamily: 'JetBrains Mono, monospace', fontSize: '11px',
      color: '#fff', background: 'rgba(0,0,0,0.65)',
      padding: '6px 10px', borderRadius: '6px',
      pointerEvents: 'none', zIndex: '10', lineHeight: '1.7',
      letterSpacing: '0.3px',
    });

    const adjSpan = document.createElement('span');
    adjSpan.textContent = fmtAdj(curAdjX, curAdjY);

    const zoomSpan = document.createElement('span');
    zoomSpan.textContent = (img?.complete && img?.naturalWidth
      ? applySmartTransform(img, curAdjX, curAdjY, tw, th)
      : 1 + Math.max(Math.abs(curAdjX), Math.abs(curAdjY)) / 50
    ).toFixed(3);
    if (img && (!img.complete || !img.naturalWidth)) {
      img.addEventListener('load', () => {
        zoomSpan.textContent = applySmartTransform(img, curAdjX, curAdjY, tw, th).toFixed(3);
      }, { once: true });
    }

    [
      `size:  ${tile.dataset.size || '?'}`,
      `grid:  ${slot.cw}×${slot.rh}`,
      `px:    ${tile.offsetWidth}×${tile.offsetHeight}`,
      `w:     ${item.weight.toFixed(2)}`,
    ].forEach(text => {
      const d = document.createElement('div');
      d.textContent = text;
      panel.appendChild(d);
    });

    const adjLine = document.createElement('div');
    adjLine.textContent = 'adj:  ';
    adjLine.appendChild(adjSpan);
    panel.appendChild(adjLine);

    const zoomLine = document.createElement('div');
    zoomLine.textContent = 'zoom: ';
    zoomLine.appendChild(zoomSpan);
    panel.appendChild(zoomLine);
    tile.appendChild(panel);

    if (!img) return;

    img.draggable = false;
    img.style.cursor = 'grab';

    img.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      e.preventDefault();
      activeDrag = {
        img, tile, adjSpan, zoomSpan,
        startX: e.clientX, startY: e.clientY,
        startAdjX: curAdjX, startAdjY: curAdjY,
        curAdjX, curAdjY,
        hasMoved: false,
        updateCur: (ax, ay) => { curAdjX = ax; curAdjY = ay; },
      };
      img.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    });
  });
})();
