let game17 = {};

export function startGame17(container, onFinish) {
    container.innerHTML = `
        <div style="text-align:center; font-family: 'Segoe UI', sans-serif; color: white; background: #1a1a1a; padding: 20px; border-radius: 15px;">
            <div style="font-size: 1.2em; margin-bottom: 10px;">🌀 Mouvements : <span id="moves17" style="color: #2ecc71;">0</span></div>
            <canvas id="cubeCanvas" width="360" height="360" style="border: 4px solid #34495e; border-radius: 8px; box-shadow: 0 0 20px rgba(0,0,0,0.5); cursor: pointer;"></canvas>
            <p id="msg17" style="margin-top: 15px; font-weight: bold; min-height: 24px;">Réorganise par lignes ou colonnes monochromes.</p>
        </div>
    `;

    const canvas = container.querySelector("#cubeCanvas");
    const ctx = canvas.getContext("2d");

    game17 = {
        ctx,
        canvas,
        size: 4,
        tileSize: canvas.width / 4,
        grid: [],
        moves: 0,
        onFinish,
        dragging: false,
        dragStart: null
    };

    initCube();
    mixCube();
    renderCube();

    canvas.addEventListener("mousedown", startDrag);
    canvas.addEventListener("mouseup", endDrag);
}

/* ---------- INIT ---------- */

function initCube() {
    const colors = ["#e74c3c", "#3498db", "#f1c40f", "#2ecc71"];

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            game17.grid[row * 4 + col] = colors[row];
        }
    }
}

/* ---------- MIX ---------- */

function mixCube() {
    for (let i = 0; i < 25; i++) {
        if (Math.random() < 0.5) {
            const row = Math.floor(Math.random() * 4);
            slideRow(row, Math.random() < 0.5 ? 1 : -1, false);
        } else {
            const col = Math.floor(Math.random() * 4);
            slideCol(col, Math.random() < 0.5 ? 1 : -1, false);
        }
    }
}

/* ---------- DRAG ---------- */

function startDrag(e) {
    const rect = game17.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const x = Math.floor(mx / game17.tileSize);
    const y = Math.floor(my / game17.tileSize);

    game17.dragging = true;
    game17.dragStart = { x, y, mx, my };
}

function endDrag(e) {
    if (!game17.dragging) return;
    game17.dragging = false;

    const rect = game17.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const dx = mx - game17.dragStart.mx;
    const dy = my - game17.dragStart.my;

    const row = game17.dragStart.y;
    const col = game17.dragStart.x;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 10) slideRow(row, 1, true);
        else if (dx < -10) slideRow(row, -1, true);
    } else {
        if (dy > 10) slideCol(col, 1, true);
        else if (dy < -10) slideCol(col, -1, true);
    }
}

/* ---------- SLIDE ROW ---------- */

function slideRow(row, dir, countMove) {
    const size = game17.size;
    const start = row * size;
    const line = game17.grid.slice(start, start + size);

    if (dir === 1) line.unshift(line.pop());
    else line.push(line.shift());

    for (let i = 0; i < size; i++) game17.grid[start + i] = line[i];

    if (countMove) {
        game17.moves++;
        document.getElementById("moves17").textContent = game17.moves;
        checkCubeWin();
    }

    renderCube();
}

/* ---------- SLIDE COL ---------- */

function slideCol(col, dir, countMove) {
    const size = game17.size;
    const colVals = [];
    for (let i = 0; i < size; i++) colVals.push(game17.grid[i * size + col]);

    if (dir === 1) colVals.unshift(colVals.pop());
    else colVals.push(colVals.shift());

    for (let i = 0; i < size; i++) game17.grid[i * size + col] = colVals[i];

    if (countMove) {
        game17.moves++;
        document.getElementById("moves17").textContent = game17.moves;
        checkCubeWin();
    }

    renderCube();
}

/* ---------- CHECK WIN ---------- */

function checkCubeWin() {
    const size = game17.size;

    // Toutes les lignes monochromes ?
    let allRowsMono = true;
    for (let row = 0; row < size; row++) {
        const start = row * size;
        const color = game17.grid[start];
        for (let col = 0; col < size; col++) {
            if (game17.grid[start + col] !== color) {
                allRowsMono = false;
                break;
            }
        }
        if (!allRowsMono) break;
    }

    // Toutes les colonnes monochromes ?
    let allColsMono = true;
    for (let col = 0; col < size; col++) {
        const color = game17.grid[col];
        for (let row = 0; row < size; row++) {
            if (game17.grid[row * size + col] !== color) {
                allColsMono = false;
                break;
            }
        }
        if (!allColsMono) break;
    }

    if (allRowsMono || allColsMono) {
        document.getElementById("msg17").textContent =
            "🎉 Bravo ! Toutes les lignes OU toutes les colonnes sont monochromes !";
        setTimeout(game17.onFinish, 1500);
    }
}

/* ---------- RENDER ---------- */

function renderCube() {
    const ctx = game17.ctx;
    const size = game17.size;
    const tile = game17.tileSize;

    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(0, 0, game17.canvas.width, game17.canvas.height);

    for (let i = 0; i < size * size; i++) {
        const color = game17.grid[i];
        const x = (i % size) * tile;
        const y = Math.floor(i / size) * tile;

        ctx.fillStyle = color;
        ctx.fillRect(x + 5, y + 5, tile - 10, tile - 10);
    }
}
