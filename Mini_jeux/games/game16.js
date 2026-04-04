let game14 = {};

export function startGame16(container, onFinish) {
    container.innerHTML = `
        <div style="text-align:center; font-family: 'Segoe UI', sans-serif; color: white; background: #1a1a1a; padding: 20px; border-radius: 15px;">
            <div style="font-size: 1.2em; margin-bottom: 10px;">🔢 Mouvements : <span id="moves14" style="color: #2ecc71;">0</span></div>
            <canvas id="taquinCanvas" width="360" height="360" style="border: 4px solid #34495e; border-radius: 8px; box-shadow: 0 0 20px rgba(0,0,0,0.5); cursor: pointer;"></canvas>
            <p id="msg14" style="margin-top: 15px; font-weight: bold; min-height: 24px;">Réorganisez les nombres premiers !</p>
        </div>
    `;

    const canvas = container.querySelector("#taquinCanvas");
    const ctx = canvas.getContext("2d");

    game14 = {
        ctx, canvas,
        size: 4, // 4x4
        tileSize: 90,
        grid: [],
        empty: { x: 3, y: 3 },
        moves: 0,
        onFinish,
        status: "PLAYING"
    };

    initTaquin();
    canvas.addEventListener("click", clickTaquin);
    renderTaquin();
}

/* ------------------ INIT ------------------ */

function initTaquin() {
    // Liste des premiers pour remplir le taquin
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];

    // On mélange
    game14.grid = primes.sort(() => Math.random() - 0.5);

    // On force la dernière case vide
    game14.grid.push(null);
}

/* ------------------ CLICK ------------------ */

function clickTaquin(e) {
    if (game14.status !== "PLAYING") return;

    const rect = game14.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const x = Math.floor(mx / game14.tileSize);
    const y = Math.floor(my / game14.tileSize);

    moveTile(x, y);
}

/* ------------------ MOVE ------------------ */

function moveTile(x, y) {
    const ex = game14.empty.x;
    const ey = game14.empty.y;

    // Déplacement possible si adjacent
    const isAdjacent =
        (x === ex && Math.abs(y - ey) === 1) ||
        (y === ey && Math.abs(x - ex) === 1);

    if (!isAdjacent) return;

    const idx1 = y * 4 + x;
    const idx2 = ey * 4 + ex;

    // Swap
    [game14.grid[idx1], game14.grid[idx2]] = [game14.grid[idx2], game14.grid[idx1]];

    game14.empty = { x, y };
    game14.moves++;

    document.getElementById("moves14").textContent = game14.moves;

    renderTaquin();
    checkPrimeWin();
}

/* ------------------ CHECK WIN ------------------ */

function checkPrimeWin() {
    const primesOrdered = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];

    for (let i = 0; i < 15; i++) {
        if (game14.grid[i] !== primesOrdered[i]) return;
    }

    // Dernière case doit être vide
    if (game14.grid[15] !== null) return;

    game14.status = "WIN";
    document.getElementById("msg14").textContent = "🎉 Bravo ! Suite de nombres premiers complétée !";

    setTimeout(game14.onFinish, 1500);
}

/* ------------------ RENDER ------------------ */

function renderTaquin() {
    const ctx = game14.ctx;
    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(0, 0, 360, 360);

    for (let i = 0; i < 16; i++) {
        const val = game14.grid[i];
        const x = (i % 4) * game14.tileSize;
        const y = Math.floor(i / 4) * game14.tileSize;

        if (val === null) continue;

        // Tuile
        ctx.fillStyle = "#3498db";
        ctx.fillRect(x + 5, y + 5, 80, 80);

        // Texte
        ctx.fillStyle = "white";
        ctx.font = "bold 28px Segoe UI";
        ctx.fillText(val, x + 30, y + 55);
    }
}
