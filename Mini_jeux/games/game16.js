import { gameManager } from "../gameCleanup.js";

let game16 = {};

export function startGame16(container, onFinish) {

    // --- UI ---
    container.innerHTML = `
        <div style="text-align:center; font-family:'Segoe UI', sans-serif; color:white; background:#101018; padding:20px; border-radius:15px;">
            
            <div style="font-size:1.2em; margin-bottom:10px; font-family:'VT323', monospace;">
                🎨 A=1 <span style="color:#ff6b6b;">■</span> • 
                B=2 <span style="color:#feca57;">■</span> • 
                C=3 <span style="color:#1dd1a1;">■</span> • 
                D=4 <span style="color:#54a0ff;">■</span>
            </div>

            <div style="font-size:1.2em; margin-bottom:10px; font-family:'VT323', monospace;">
                🎯 Somme cible par ligne : <span id="target16" style="color:#00e5ff;">10</span>
            </div>

            <canvas id="canvas16" width="400" height="400"
                style="border:4px solid #00e5ff; border-radius:8px; box-shadow:0 0 20px #00e5ffaa; cursor:pointer;">
            </canvas>

            <p id="msg16" style="margin-top:15px; font-weight:bold; min-height:24px; font-family:'VT323', monospace;">
                Cliquez sur les cases pour atteindre la somme cible.
            </p>
        </div>
    `;

    const canvas = container.querySelector("#canvas16");
    const ctx = canvas.getContext("2d");

    // --- STATE ---
    game16 = {
        ctx,
        canvas,
        size: 5,
        cell: 80,
        grid: [],
        target: 10,
        status: "PLAYING",
        onFinish,

        colors: {
            A: "#ff6b6b",
            B: "#feca57",
            C: "#1dd1a1",
            D: "#54a0ff"
        },

        values: {
            A: 1,
            B: 2,
            C: 3,
            D: 4
        }
    };

    initGrid16();

    // --- INPUT ---
    gameManager.addEventListener(canvas, "click", click16);

    // --- LOOP ---
    function loop() {
        render16();
        if (game16.status !== "WIN") requestAnimationFrame(loop);
    }
    loop();
}

/* ------------------ INIT ------------------ */

function initGrid16() {
    const letters = ["A", "B", "C", "D"];
    for (let i = 0; i < 25; i++) {
        game16.grid[i] = letters[Math.floor(Math.random() * 4)];
    }
}

/* ------------------ CLICK ------------------ */

function click16(e) {
    if (game16.status !== "PLAYING") return;

    const rect = game16.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const x = Math.floor(mx / game16.cell);
    const y = Math.floor(my / game16.cell);

    if (x < 0 || y < 0 || x >= game16.size || y >= game16.size) return;

    const idx = y * game16.size + x;
    game16.grid[idx] = cycleLetter16(game16.grid[idx]);

    checkWin16();
}

/* ------------------ LOGIQUE ------------------ */

function cycleLetter16(l) {
    if (l === "A") return "B";
    if (l === "B") return "C";
    if (l === "C") return "D";
    return "A";
}

function checkWin16() {
    for (let y = 0; y < game16.size; y++) {
        let sum = 0;
        for (let x = 0; x < game16.size; x++) {
            const idx = y * game16.size + x;
            sum += game16.values[game16.grid[idx]];
        }
        if (sum !== game16.target) {
            document.getElementById("msg16").textContent =
                "La ligne " + (y + 1) + " vaut " + sum + " (objectif : " + game16.target + ")";
            return;
        }
    }

    // WIN
    game16.status = "WIN";
    document.getElementById("msg16").textContent = "🎉 Sommes parfaites !";
    setTimeout(game16.onFinish, 1500);
}

/* ------------------ RENDER ------------------ */

function render16() {
    const ctx = game16.ctx;
    ctx.fillStyle = "#05060a";
    ctx.fillRect(0, 0, 400, 400);

    for (let i = 0; i < 25; i++) {
        const letter = game16.grid[i];
        const color = game16.colors[letter];

        const x = (i % 5) * game16.cell;
        const y = Math.floor(i / 5) * game16.cell;

        // Fond
        const grad = ctx.createLinearGradient(x, y, x + 80, y + 80);
        grad.addColorStop(0, lighten16(color, 0.25));
        grad.addColorStop(1, color);

        ctx.fillStyle = grad;
        drawRoundedRect16(ctx, x + 6, y + 6, 68, 68, 12);
        ctx.fill();

        // Lettre
        ctx.fillStyle = "#000000aa";
        ctx.font = "bold 28px VT323";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(letter, x + 40, y + 32);

        // Valeur
        ctx.fillStyle = "#ffffffdd";
        ctx.font = "20px VT323";
        ctx.fillText(game16.values[letter], x + 40, y + 52);
    }
}

/* ------------------ UTIL ------------------ */

function drawRoundedRect16(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function lighten16(hex, amount) {
    const num = parseInt(hex.slice(1), 16);
    let r = (num >> 16) + Math.floor(255 * amount);
    let g = ((num >> 8) & 0xff) + Math.floor(255 * amount);
    let b = (num & 0xff) + Math.floor(255 * amount);

    return `rgb(${Math.min(r,255)},${Math.min(g,255)},${Math.min(b,255)})`;
}
