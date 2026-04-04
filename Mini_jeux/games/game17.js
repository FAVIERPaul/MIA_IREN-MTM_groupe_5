let game15 = {};

export function startGame17(container, onFinish) {
    container.innerHTML = `
        <div style="text-align:center; font-family: 'Segoe UI', sans-serif; color: white; background: #1a1a1a; padding: 20px; border-radius: 15px;">
            <div style="font-size: 1.2em; margin-bottom: 10px;">🌀 Mouvements : <span id="moves15" style="color: #2ecc71;">0</span></div>
            <canvas id="cubeCanvas" width="360" height="360" style="border: 4px solid #34495e; border-radius: 8px; box-shadow: 0 0 20px rgba(0,0,0,0.5); cursor: pointer;"></canvas>
            <p id="msg15" style="margin-top: 15px; font-weight: bold; min-height: 24px;">Réorganisez le cube paradoxal…</p>
        </div>
    `;

    const canvas = container.querySelector("#cubeCanvas");
    const ctx = canvas.getContext("2d");

    game15 = {
        ctx, canvas,
        size: 4,
        tileSize: 90,
        grid: [],
        moves: 0,
        onFinish,
        status: "PLAYING",
        dragging: false,
        dragStart: null
    };

    initCube();
    canvas.addEventListener("mousedown", startDrag);
    canvas.addEventListener("mouseup", endDrag);
    renderCube();
}

/* ------------------ INIT ------------------ */

function initCube() {
    const colors = ["#e74c3c", "#3498db", "#f1c40f", "#2ecc71"];
    for (let i = 0; i < 16; i++) {
        game15.grid[i] = colors[Math.floor(Math.random() * colors.length)];
    }
}

/* ------------------ DRAG ------------------ */

function startDrag(e) {
    const rect = game15.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const x = Math.floor(mx / game15.tileSize);
    const y = Math.floor(my / game15.tileSize);

    game15.dragging = true;
    game15.dragStart = { x, y, mx, my };
}

function endDrag(e) {
    if (!game15.dragging) return;
    game15.dragging = false;

    const rect = game15.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const dx = mx - game15.dragStart.mx;
    const dy = my - game15.dragStart.my;

    const row = game15.dragStart.y;
    const col = game15.dragStart.x;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 20) slideRow(row, 1);
        else if (dx < -20) slideRow(row, -1);
    } else {
        if (dy > 20) slideCol(col, 1);
        else if (dy < -20) slideCol(col, -1);
    }
}

/* ------------------ SLIDE ROW ------------------ */

function slideRow(row, dir) {
    const start = row * 4;
    const line = game15.grid.slice(start, start + 4);

    // Déplacement normal
    if (dir === 1) line.unshift(line.pop());
    else line.push(line.shift());

    // Paradoxe : couleurs tournent dans l'autre sens
    if (dir === 1) line.push(line.shift());
    else line.unshift(line.pop());

    // Réécriture
    for (let i = 0; i < 4; i++) game15.grid[start + i] = line[i];

    // Ligne miroir
    const mirror = 3 - row;
    const mStart = mirror * 4;
    const mLine = game15.grid.slice(mStart, mStart + 4).reverse();

    for (let i = 0; i < 4; i++) game15.grid[mStart + i] = mLine[i];

    game15.moves++;
    document.getElementById("moves15").textContent = game15.moves;

    renderCube();
    checkCubeWin();
}

/* ------------------ SLIDE COLUMN ------------------ */

function slideCol(col, dir) {
    const colVals = [];
    for (let i = 0; i < 4; i++) colVals.push(game15.grid[i * 4 + col]);

    // Déplacement normal
    if (dir === 1) colVals.unshift(colVals.pop());
    else colVals.push(colVals.shift());

    // Paradoxe : couleurs tournent dans l'autre sens
    if (dir === 1) colVals.push(colVals.shift());
    else colVals.unshift(colVals.pop());

    // Réécriture
    for (let i = 0; i < 4; i++) game15.grid[i * 4 + col] = colVals[i];

    // Colonne miroir
    const mirror = 3 - col;
    const mVals = [];
    for (let i = 0; i < 4; i++) mVals.push(game15.grid[i * 4 + mirror]);
    mVals.reverse();

    for (let i = 0; i < 4; i++) game15.grid[i * 4 + mirror] = mVals[i];

    game15.moves++;
    document.getElementById("moves15").textContent = game15.moves;

    renderCube();
    checkCubeWin();
}

/* ------------------ CHECK WIN ------------------ */

function checkCubeWin() {
    // Chaque ligne doit être monochrome
    for (let row = 0; row < 4; row++) {
        const start = row * 4;
        const color = game15.grid[start];

        for (let i = 0; i < 4; i++) {
            if (game15.grid[start + i] !== color) {
                return; // ligne non monochrome → pas gagné
            }
        }
    }

    // Si on arrive ici, toutes les lignes sont monochromes
    game15.status = "WIN";
    document.getElementById("msg15").textContent = "🎉 Toutes les lignes sont monochromes !";
    setTimeout(game15.onFinish, 1500);
}


/* ------------------ RENDER ------------------ */

function renderCube() {
    const ctx = game15.ctx;
    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(0, 0, 360, 360);

    for (let i = 0; i < 16; i++) {
        const color = game15.grid[i];
        const x = (i % 4) * game15.tileSize;
        const y = Math.floor(i / 4) * game15.tileSize;

        ctx.fillStyle = color;
        ctx.fillRect(x + 5, y + 5, 80, 80);
    }
}
