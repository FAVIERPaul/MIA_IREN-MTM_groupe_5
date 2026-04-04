let game20 = {};

export function startGame22(container, onFinish) {
    container.innerHTML = `
        <div style="text-align:center; font-family:'VT323', monospace; color:white; background:#050509; padding:20px; border-radius:15px;">
            <h2 style="margin:0 0 8px;">🧱 Tetris inversé — Remplis l'écran</h2>
            <p style="margin:0 0 8px; font-size:0.95em;">
                Déplace les pièces avec ⬅️ ➡️, tourne avec ⬆️, fais tomber avec ⬇️ ou ESPACE.<br>
                But : <span style="color:#afff9f;">remplir entièrement la grille</span>. Aucune ligne ne disparaît.
            </p>
            <canvas id="tetrisCanvas20" width="200" height="400"
                style="border:4px solid #ff3860; border-radius:8px; box-shadow:0 0 25px #ff3860aa; background:#050509;">
            </canvas>
            <p id="msg20" style="margin-top:8px; min-height:24px; font-size:1.05em;">
                Remplis la grille sans laisser de trous !
            </p>
        </div>
    `;

    const canvas = container.querySelector("#tetrisCanvas20");
    const ctx = canvas.getContext("2d");

    game20 = {
        ctx,
        canvas,
        onFinish,
        cols: 10,
        rows: 20,
        cellSize: 20,
        grid: [],
        current: null,
        currentX: 0,
        currentY: 0,
        currentShapeIndex: 0,
        gameOver: false,
        dropInterval: 600,
        lastDrop: 0
    };

    // init grid
    for (let r = 0; r < game20.rows; r++) {
        game20.grid[r] = new Array(game20.cols).fill(0);
    }

    window.addEventListener("keydown", handleKey20);
    spawnPiece20();
    requestAnimationFrame(loop20);
}

/* ---------- PIECES ---------- */

const SHAPES20 = [
    // I
    [
        [1, 1, 1, 1]
    ],
    // O
    [
        [1, 1],
        [1, 1]
    ],
    // T
    [
        [0, 1, 0],
        [1, 1, 1]
    ],
    // L
    [
        [1, 0],
        [1, 0],
        [1, 1]
    ],
    // J
    [
        [0, 1],
        [0, 1],
        [1, 1]
    ],
    // S
    [
        [0, 1, 1],
        [1, 1, 0]
    ],
    // Z
    [
        [1, 1, 0],
        [0, 1, 1]
    ]
];

function spawnPiece20() {
    const idx = Math.floor(Math.random() * SHAPES20.length);
    game20.currentShapeIndex = idx;
    game20.current = SHAPES20[idx].map(row => row.slice());
    game20.currentX = Math.floor(game20.cols / 2) - Math.floor(game20.current[0].length / 2);
    game20.currentY = 0;

    if (collides20(game20.currentX, game20.currentY, game20.current)) {
        endGame20(false);
    }
}

/* ---------- INPUT ---------- */

function handleKey20(e) {
    if (game20.gameOver) return;

    if (e.code === "ArrowLeft") {
        e.preventDefault();
        movePiece20(-1);
    } else if (e.code === "ArrowRight") {
        e.preventDefault();
        movePiece20(1);
    } else if (e.code === "ArrowDown") {
        e.preventDefault();
        softDrop20();
    } else if (e.code === "ArrowUp") {
        e.preventDefault();
        rotatePiece20();
    } else if (e.code === "Space") {
        e.preventDefault();
        hardDrop20();
    }
}

function movePiece20(dir) {
    const nx = game20.currentX + dir;
    if (!collides20(nx, game20.currentY, game20.current)) {
        game20.currentX = nx;
    }
}

function softDrop20() {
    const ny = game20.currentY + 1;
    if (!collides20(game20.currentX, ny, game20.current)) {
        game20.currentY = ny;
    } else {
        lockPiece20();
    }
}

function hardDrop20() {
    while (!collides20(game20.currentX, game20.currentY + 1, game20.current)) {
        game20.currentY++;
    }
    lockPiece20();
}

function rotatePiece20() {
    const rotated = rotateMatrix20(game20.current);
    if (!collides20(game20.currentX, game20.currentY, rotated)) {
        game20.current = rotated;
    }
}

/* ---------- COLLISIONS & LOCK ---------- */

function collides20(x, y, shape) {
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (!shape[r][c]) continue;
            const gx = x + c;
            const gy = y + r;
            if (gx < 0 || gx >= game20.cols || gy >= game20.rows) return true;
            if (gy >= 0 && game20.grid[gy][gx]) return true;
        }
    }
    return false;
}

function lockPiece20() {
    const shape = game20.current;
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (!shape[r][c]) continue;
            const gx = game20.currentX + c;
            const gy = game20.currentY + r;
            if (gy >= 0 && gy < game20.rows && gx >= 0 && gx < game20.cols) {
                game20.grid[gy][gx] = game20.currentShapeIndex + 1;
            }
        }
    }

    // ici, on NE supprime PAS les lignes : le but est de remplir
    if (isGridFull20()) {
        endGame20(true);
        return;
    }

    spawnPiece20();
}

/* ---------- FULL GRID CHECK ---------- */

function isGridFull20() {
    for (let r = 0; r < game20.rows; r++) {
        for (let c = 0; c < game20.cols; c++) {
            if (!game20.grid[r][c]) return false;
        }
    }
    return true;
}

/* ---------- LOOP ---------- */

function loop20(timestamp) {
    if (game20.gameOver) {
        render20();
        return;
    }

    if (!game20.lastDrop) game20.lastDrop = timestamp;
    const delta = timestamp - game20.lastDrop;

    if (delta > game20.dropInterval) {
        game20.lastDrop = timestamp;
        softDrop20();
    }

    render20();
    requestAnimationFrame(loop20);
}

/* ---------- RENDER ---------- */

function render20() {
    const ctx = game20.ctx;
    const { width, height } = game20.canvas;
    ctx.fillStyle = "#050509";
    ctx.fillRect(0, 0, width, height);

    // grille
    ctx.strokeStyle = "#111320";
    ctx.lineWidth = 1;
    for (let x = 0; x <= game20.cols; x++) {
        ctx.beginPath();
        ctx.moveTo(x * game20.cellSize, 0);
        ctx.lineTo(x * game20.cellSize, height);
        ctx.stroke();
    }
    for (let y = 0; y <= game20.rows; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * game20.cellSize);
        ctx.lineTo(width, y * game20.cellSize);
        ctx.stroke();
    }

    // cases fixes
    for (let r = 0; r < game20.rows; r++) {
        for (let c = 0; c < game20.cols; c++) {
            const v = game20.grid[r][c];
            if (!v) continue;
            drawCell20(c, r, colorFor20(v));
        }
    }

    // pièce courante
    if (game20.current && !game20.gameOver) {
        const shape = game20.current;
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (!shape[r][c]) continue;
                const gx = game20.currentX + c;
                const gy = game20.currentY + r;
                if (gy >= 0) {
                    drawCell20(gx, gy, colorFor20(game20.currentShapeIndex + 1), true);
                }
            }
        }
    }
}

function drawCell20(cx, cy, color, glow = false) {
    const ctx = game20.ctx;
    const size = game20.cellSize;
    const x = cx * size;
    const y = cy * size;

    if (glow) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
    } else {
        ctx.shadowBlur = 0;
    }

    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

    ctx.shadowBlur = 0;
}

/* ---------- COLORS & UTILS ---------- */

function colorFor20(v) {
    const colors = [
        "#00e5ff",
        "#ff3860",
        "#ff9df8",
        "#afff9f",
        "#f5e960",
        "#9f86ff",
        "#ffb86c"
    ];
    return colors[(v - 1) % colors.length];
}

function rotateMatrix20(mat) {
    const rows = mat.length;
    const cols = mat[0].length;
    const res = [];
    for (let c = 0; c < cols; c++) {
        const row = [];
        for (let r = rows - 1; r >= 0; r--) {
            row.push(mat[r][c]);
        }
        res.push(row);
    }
    return res;
}

/* ---------- END GAME ---------- */

function endGame20(win) {
    game20.gameOver = true;
    const msgEl = document.getElementById("msg20");
    if (win) {
        msgEl.textContent = "🎉 Écran entièrement rempli ! Mission accomplie.";
        setTimeout(() => game20.onFinish && game20.onFinish(), 1500);
    } else {
        msgEl.textContent = "❌ Plus de place pour une nouvelle pièce. Tu n'as pas réussi à tout remplir.";
    }
}
