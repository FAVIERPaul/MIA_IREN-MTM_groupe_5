let game100 = {};

export function startGame100(container, onFinish) {
    container.innerHTML = `
        <div style="text-align:center; font-family: 'Segoe UI', sans-serif; color: white; background: #1a1a1a; padding: 20px; border-radius: 15px;">
            <div style="font-size: 1.2em; margin-bottom: 10px;">🌀 Mouvements : <span id="moves17" style="color: #2ecc71;">0</span></div>
            <canvas id="cubeCanvas" width="360" height="360" style="border: 4px solid #34495e; border-radius: 8px; box-shadow: 0 0 20px rgba(0,0,0,0.5); cursor: pointer;"></canvas>
            <p id="msg17" style="margin-top: 15px; font-weight: bold; min-height: 24px;">Réorganise les lignes par couleur.</p>
        </div>
    `;

    const canvas = container.querySelector("#cubeCanvas");
    const ctx = canvas.getContext("2d");

    game100 = {
        ctx,
        canvas,
        size: 4,
        tileSize: 90,
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
    const colors = ["#f055f0", "#62dff6", "#fff755", "#7e7eff"];

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            game100.grid[row * 4 + col] = colors[row];
        }
    }
}

/* ---------- MIX ---------- */

function mixCube() {
    for (let i = 0; i < 20; i++) {
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
    const rect = game100.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const x = Math.floor(mx / game100.tileSize);
    const y = Math.floor(my / game100.tileSize);

    game100.dragging = true;
    game100.dragStart = { x, y, mx, my };
}

function endDrag(e) {
    if (!game100.dragging) return;
    game100.dragging = false;

    const rect = game100.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const dx = mx - game100.dragStart.mx;
    const dy = my - game100.dragStart.my;

    const row = game100.dragStart.y;
    const col = game100.dragStart.x;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 20) slideRow(row, 1, true);
        else if (dx < -20) slideRow(row, -1, true);
    } else {
        if (dy > 20) slideCol(col, 1, true);
        else if (dy < -20) slideCol(col, -1, true);
    }
}

/* ---------- SLIDE ROW ---------- */

function slideRow(row, dir, countMove) {
    const start = row * 4;
    const line = game100.grid.slice(start, start + 4);

    if (dir === 1) line.unshift(line.pop());
    else line.push(line.shift());

    for (let i = 0; i < 4; i++) game100.grid[start + i] = line[i];

    if (countMove) {
        game100.moves++;
        document.getElementById("moves17").textContent = game100.moves;
        checkCubeWin();
    }

    renderCube();
}

/* ---------- SLIDE COL ---------- */

function slideCol(col, dir, countMove) {
    const colVals = [];
    for (let i = 0; i < 4; i++) colVals.push(game100.grid[i * 4 + col]);

    if (dir === 1) colVals.unshift(colVals.pop());
    else colVals.push(colVals.shift());

    for (let i = 0; i < 4; i++) game100.grid[i * 4 + col] = colVals[i];

    if (countMove) {
        game100.moves++;
        document.getElementById("moves17").textContent = game100.moves;
        checkCubeWin();
    }

    renderCube();
}

/* ---------- CHECK WIN (nouvelle version) ---------- */

function checkCubeWin() {
    const size = 4;

    /* ----- Vérifier si toutes les lignes sont monochromes ----- */
    let allRowsMono = true;

    for (let row = 0; row < size; row++) {
        const start = row * size;
        const color = game100.grid[start];

        for (let col = 0; col < size; col++) {
            if (game100.grid[start + col] !== color) {
                allRowsMono = false;
                break;
            }
        }
    }

    /* ----- Vérifier si toutes les colonnes sont monochromes ----- */
    let allColsMono = true;

    for (let col = 0; col < size; col++) {
        const color = game100.grid[col];

        for (let row = 0; row < size; row++) {
            if (game100.grid[row * size + col] !== color) {
                allColsMono = false;
                break;
            }
        }
    }

    /* ----- Condition de victoire ----- */
    if (allRowsMono || allColsMono) {
        document.getElementById("msg17").textContent =
            "🎉 Bravo ! Toutes les lignes OU toutes les colonnes sont monochromes !";

        setTimeout(game100.onFinish, 1500);
    }
}

/* ---------- RENDER ---------- */

function renderCube() {
    const ctx = game100.ctx;
    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(0, 0, 360, 360);

    for (let i = 0; i < 16; i++) {
        const color = game100.grid[i];
        const x = (i % 4) * game100.tileSize;
        const y = Math.floor(i / 4) * game100.tileSize;

        ctx.fillStyle = color;
        ctx.fillRect(x + 5, y + 5, 80, 80);
    }
}
