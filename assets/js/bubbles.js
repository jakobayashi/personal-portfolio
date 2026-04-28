(function () {
  const COLS = 6;
  const MAX_ROWS = 25;
  const INFLUENCE_R = 500;
  const MAX_PUSH = 15;

  // --- Placement: center-out by priority ---

  const allTiles = Array.from(document.querySelectorAll('.bubble-wrapper'));

  const tileData = allTiles.map(el => ({
    el,
    cs: parseInt(el.dataset.colSpan) || 1,
    rs: parseInt(el.dataset.rowSpan) || 1,
    priority: parseFloat(el.dataset.priority) || 5
  }));

  tileData.sort((a, b) => b.priority - a.priority);

  const centerCol = (COLS - 1) / 2;

  // Simulate packing in priority order to find actual grid height
  const tempOcc = Array.from({ length: MAX_ROWS }, () => new Array(COLS).fill(false));
  let actualRows = 0;
  for (const t of tileData) {
    placed: for (let r = 0; r < MAX_ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (c + t.cs > COLS) continue;
        let fits = true;
        outer: for (let dr = 0; dr < t.rs; dr++) {
          for (let dc = 0; dc < t.cs; dc++) {
            if (tempOcc[r + dr][c + dc]) { fits = false; break outer; }
          }
        }
        if (fits) {
          for (let dr = 0; dr < t.rs; dr++)
            for (let dc = 0; dc < t.cs; dc++)
              tempOcc[r + dr][c + dc] = true;
          actualRows = Math.max(actualRows, r + t.rs);
          break placed;
        }
      }
    }
  }
  const centerRow = (actualRows - 1) / 2;

  // All anchor positions — sorted per tile using tile center, not top-left
  const allAnchors = [];
  for (let r = 0; r < MAX_ROWS; r++)
    for (let c = 0; c < COLS; c++)
      allAnchors.push({ r, c });

  const occupied = Array.from({ length: MAX_ROWS }, () => new Array(COLS).fill(false));

  tileData.forEach(t => {
    const offC = (t.cs - 1) / 2;
    const offR = (t.rs - 1) / 2;
    const anchors = allAnchors.slice().sort((a, b) => {
      const da = (a.c + offC - centerCol) ** 2 + (a.r + offR - centerRow) ** 2;
      const db = (b.c + offC - centerCol) ** 2 + (b.r + offR - centerRow) ** 2;
      return da - db;
    });

    for (const { r, c } of anchors) {
      if (c + t.cs > COLS) continue;
      let fits = true;
      outer: for (let dr = 0; dr < t.rs; dr++) {
        for (let dc = 0; dc < t.cs; dc++) {
          if (occupied[r + dr][c + dc]) { fits = false; break outer; }
        }
      }
      if (fits) {
        for (let dr = 0; dr < t.rs; dr++)
          for (let dc = 0; dc < t.cs; dc++)
            occupied[r + dr][c + dc] = true;
        t.el.style.gridColumn = `${c + 1} / span ${t.cs}`;
        t.el.style.gridRow = `${r + 1} / span ${t.rs}`;
        break;
      }
    }
  });

  // --- Repulsion ---

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  const offsets = projectTiles.map(() => ({ ox: 0, oy: 0, hovered: false }));

  projectTiles.forEach((tile, i) => {
    tile.addEventListener('mouseenter', () => { offsets[i].hovered = true; });
    tile.addEventListener('mouseleave', () => { offsets[i].hovered = false; });
  });

  // getBoundingClientRect forces a reflow, so positions reflect the JS placement above
  const naturalCenters = projectTiles.map(tile => {
    const r = tile.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });

  (function tick() {
    projectTiles.forEach((tile, i) => {
      const s = offsets[i];
      const nc = naturalCenters[i];
      const vcx = nc.x + s.ox;
      const vcy = nc.y + s.oy;
      const dx = vcx - mouseX;
      const dy = vcy - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let tx = 0, ty = 0;
      if (!s.hovered && dist < INFLUENCE_R && dist > 0) {
        const force = (1 - dist / INFLUENCE_R) * MAX_PUSH;
        tx = -(dx / dist) * force;
        ty = -(dy / dist) * force;
      }

      s.ox += (tx - s.ox) * 0.1;
      s.oy += (ty - s.oy) * 0.1;
      tile.style.transform = `translate(${s.ox}px, ${s.oy}px)`;
    });
    requestAnimationFrame(tick);
  })();
})();
