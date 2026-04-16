let game14 = {};

export function startGame16(container, onFinish) {
    container.innerHTML = `
        <div style="
            text-align:center;
            font-family: 'Segoe UI', sans-serif;
            color: #e0f7ff;
            background: radial-gradient(circle at top, #0a0f1f, #000);
            padding: 25px;
            border-radius: 20px;
            box-shadow: 0 0 40px rgba(0, 200, 255, 0.25);
        ">
            <div style="
                font-size: 1.3em;
                margin-bottom: 12px;
                color: #6beaff;
                text-shadow: 0 0 8px #00eaff;
            ">
                🔢 Mouvements : <span id="moves14" style="color: #00ffc8;">0</span>
            </div>

            <canvas id="taquinCanvas" width="360" height="360" style="
                border: 3px solid rgba(0, 255, 255, 0.4);
                border-radius: 12px;
                box-shadow: 0 0 25px rgba(0, 255, 255, 0.25);
                cursor: pointer;
                background: rgba(255,255,255,0.03);
                backdrop-filter: blur(6px);
            "></canvas>

            <p id="msg14" style="
                margin-top: 18px;
                font-weight: bold;
                min-height: 24px;
                color: #7be8ff;
                text-shadow: 0 0 6px #00eaff;
            ">
                Réorganisez les nombres premiers !
            </p>
        </div>
    `;

    const canvas = container.querySelector("#taquinCanvas");
    const ctx = canvas.getContext("2d");

    game14 = {
        ctx, canvas,
        size: 4,
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
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    game14.grid = primes.sort(() => Math.random() - 0.5);
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

    const isAdjacent =
        (x === ex && Math.abs(y - ey) === 1) ||
        (y === ey && Math.abs(x - ex) === 1);

    if (!isAdjacent) return;

    const idx1 = y * 4 + x;
    const idx2 = ey * 4 + ex;

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

    if (game14.grid[15] !== null) return;

    game14.status = "WIN";
    document.getElementById("msg14").textContent =
        "✨ Interface réorganisée avec succès !";

    setTimeout(game14.onFinish, 1500);
}

/* ------------------ RENDER ------------------ */

function renderTaquin() {
    const ctx = game14.ctx;
    ctx.fillStyle = "#000a14";
    ctx.fillRect(0, 0, 360, 360);

    for (let i = 0; i < 16; i++) {
        const val = game14.grid[i];
        const x = (i % 4) * game14.tileSize;
        const y = Math.floor(i / 4) * game14.tileSize;

        if (val === null) continue;

        // Tuile futuriste
        ctx.fillStyle = "rgba(0, 255, 255, 0.15)";
        ctx.strokeStyle = "rgba(0, 255, 255, 0.6)";
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.roundRect(x + 6, y + 6, 78, 78, 10);
        ctx.fill();
        ctx.stroke();

        // Glow interne
        ctx.shadowColor = "#00eaff";
        ctx.shadowBlur = 12;

        // Texte néon
        ctx.fillStyle = "#e0ffff";
        ctx.font = "bold 28px 'Segoe UI'";
        ctx.fillText(val, x + 30, y + 55);

        ctx.shadowBlur = 0;
    }
}
