import { gameManager } from "../gameCleanup.js";

let game16 = {};

export function startGame16(container, onFinish) {
    container.innerHTML = `
        <div style="text-align:center; font-family: 'Segoe UI', sans-serif; color: white; background: #101018; padding: 20px; border-radius: 15px;">
            
            <div style="font-size: 1.1em; margin-bottom: 8px; font-family: 'VT323', monospace;">
                🎨 Correspondance : 
                <span style="color:#ff6b6b;">A = 1</span> • 
                <span style="color:#feca57;">B = 2</span> • 
                <span style="color:#1dd1a1;">C = 3</span> • 
                <span style="color:#54a0ff;">D = 4</span>
            </div>

            <div style="font-size: 1.1em; margin-bottom: 10px; font-family: 'VT323', monospace;">
                🎯 Somme cible par ligne : <span id="target16" style="color:#00e5ff;">10</span>
            </div>

            <canvas id="sumCanvas16" width="400" height="400"
                style="border: 4px solid #00e5ff; border-radius: 8px; box-shadow: 0 0 20px #00e5ffaa; cursor: pointer;">
            </canvas>

            <p id="msg16" style="margin-top: 15px; font-weight: bold; min-height: 24px; font-family: 'VT323', monospace;">
                Cliquez sur les cases pour ajuster les couleurs et atteindre la somme cible sur chaque ligne.
            </p>
        </div>
    `;

    const canvas = container.querySelector("#sumCanvas16");
    const ctx = canvas.getContext("2d");

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
            A: "#ff6b6b", // rouge corail
            B: "#feca57", // jaune chaud
            C: "#1dd1a1", // vert menthe
            D: "#54a0ff"  // bleu doux
        },

        values: {
            A: 1,
            B: 2,
            C: 3,
            D: 4
        }
    };

    initGame16();
    canvas.addEventListener("click", onClick16);

    function loop() {
        render16();
        if (game16.status !== "WIN") requestAnimationFrame(loop);
    }
    loop();
}

/* ------------------ INIT ------------------ */

function initGame16() {
    const letters = ["A", "B", "C", "D"];
    for (let i = 0; i < game16.size * game16.size; i++) {
        const letter = letters[Math.floor(Math.random() * letters.length)];
        game16.grid[i] = letter;
    }
}

/* ------------------ CLICK ------------------ */

function onClick16(e) {
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

function cycleLetter16(letter) {
    if (letter === "A") return "B";
    if (letter === "B") return "C";
    if (letter === "C") return "D";
    return "A";
}

function checkWin16() {
    for (let y = 0; y < game16.size; y++) {
        let sum = 0;
        for (let x = 0; x < game16.size; x++) {
            const idx = y * game16.size + x;
            const letter = game16.grid[idx];
            sum += game16.values[letter];
        }
        if (sum !== game16.target) {
            document.getElementById("msg16").textContent =
                "Toutes les lignes doivent atteindre la somme " + game16.target + " (actuellement, la ligne " + (y + 1) + " vaut " + sum + ").";
            return;
        }
    }

    game16.status = "WIN";
    document.getElementById("msg16").textContent = "🎉 Sommes parfaites sur toutes les lignes !";
    setTimeout(game16.onFinish, 1500);
}

/* ------------------ RENDER ------------------ */

function render16() {
    const ctx = game16.ctx;
    ctx.fillStyle = "#05060a";
    ctx.fillRect(0, 0, game16.canvas.width, game16.canvas.height);

    for (let i = 0; i < game16.size * game16.size; i++) {
        const letter = game16.grid[i];
        const color = game16.colors[letter];

        const x = (i % game16.size) * game16.cell;
        const y = Math.floor(i / game16.size) * game16.cell;

        // Fond de la case
        const grad = ctx.createLinearGradient(x, y, x + game16.cell, y + game16.cell);
        grad.addColorStop(0, lighten16(color, 0.2));
        grad.addColorStop(1, color);

        ctx.fillStyle = grad;
        drawRoundedRect16(ctx, x + 6, y + 6, game16.cell - 12, game16.cell - 12, 12);
        ctx.fill();

        // Bord
        ctx.strokeStyle = "#ffffff22";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Lettre + valeur
        ctx.fillStyle = "#000000bb";
        ctx.font = "bold 26px VT323";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(letter, x + game16.cell / 2, y + game16.cell / 2 - 8);

        ctx.fillStyle = "#ffffffdd";
        ctx.font = "18px VT323";
        ctx.fillText(game16.values[letter], x + game16.cell / 2, y + game16.cell / 2 + 16);
    }

    // Affichage des sommes actuelles à droite de chaque ligne
    ctx.font = "18px VT323";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    for (let y = 0; y < game16.size; y++) {
        let sum = 0;
        for (let x = 0; x < game16.size; x++) {
            const idx = y * game16.size + x;
            sum += game16.values[game16.grid[idx]];
        }
        ctx.fillStyle = sum === game16.target ? "#1dd1a1" : "#ff6b6b";
        ctx.fillText("= " + sum, game16.canvas.width - 60, y * game16.cell + game16.cell / 2);
    }
}

/* ------------------ UTIL: RECTANGLE ARRONDI ------------------ */

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

/* ------------------ UTIL: LIGHTEN ------------------ */

function lighten16(hex, amount) {
    const num = parseInt(hex.slice(1), 16);
    let r = (num >> 16) + Math.floor(255 * amount);
    let g = ((num >> 8) & 0xff) + Math.floor(255 * amount);
    let b = (num & 0xff) + Math.floor(255 * amount);

    r = Math.min(255, r);
    g = Math.min(255, g);
    b = Math.min(255, b);

    return `rgb(${r},${g},${b})`;
}