(function () {
  const COLS = 36, ROWS = 20;

  function djb2(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = (Math.imul(h, 33) + str.charCodeAt(i)) | 0;
    return h >>> 0;
  }

  // Worst aspect ratio for a candidate row, computed from weight ratios
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

  // Largest-remainder method: distribute `total` integer units across weights
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

      // Greedily build the row while aspect ratios keep improving
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
      // Last row consumes the rest; otherwise leave ≥1 unit for the next strip
      const stripT = isLastRow
        ? longSide
        : Math.max(1, Math.min(longSide - 1, Math.round(rowWeight / remWeight * longSide)));

      const lens = distribute(row.map(it => it.weight), shortSide);

      let pos = 0;
      row.forEach((item, i) => {
        out[item.order] = landscape
          ? { col: cur.x,       row: cur.y + pos, cw: stripT,  rh: lens[i] }
          : { col: cur.x + pos, row: cur.y,       cw: lens[i], rh: stripT  };
        pos += lens[i];
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

  out.forEach((slot, i) => {
    const item = items[i];
    const tile = item.tile;
    tile.style.gridArea = `${slot.row + 1} / ${slot.col + 1} / ${slot.row + 1 + slot.rh} / ${slot.col + 1 + slot.cw}`;
    tile.style.visibility = 'visible';

    if (debug) {
      const label = document.createElement('div');
      const size = tile.dataset.size || '?';
      label.textContent = `${slot.cw}×${slot.rh}  size=${size}  w=${item.weight.toFixed(2)}`;
      Object.assign(label.style, {
        position: 'absolute', top: '10px', left: '12px',
        fontFamily: 'JetBrains Mono, monospace', fontSize: '11px',
        color: '#fff', background: 'rgba(0,0,0,0.55)',
        padding: '3px 7px', borderRadius: '6px',
        pointerEvents: 'none', zIndex: '10', letterSpacing: '0.5px',
      });
      tile.appendChild(label);
    }
  });
})();
