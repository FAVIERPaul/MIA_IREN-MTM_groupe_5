let game16 = {};

export function startGame18(container, onFinish) {
    container.innerHTML = `
        <div style="text-align:center; font-family: 'Segoe UI', sans-serif; color: white; background: #0d0d0d; padding: 20px; border-radius: 15px;">
            <div style="font-size: 1.2em; margin-bottom: 10px; font-family: 'VT323', monospace;">
                🔄 Mouvements : <span id="moves16" style="color: #00e5ff;">0</span>
            </div>
            <canvas id="flipCanvas" width="400" height="400" 
                style="border: 4px solid #ff3860; border-radius: 8px; box-shadow: 0 0 25px #ff3860aa; cursor: pointer;">
            </canvas>
            <p id="msg16" style="margin-top: 15px; font-weight: bold; min-height: 24px; font-family: 'VT323', monospace;">
                Retournez les cases pour former un damier !
            </p>
        </div>
    `;

    const canvas = container.querySelector("#flipCanvas");
    const ctx = canvas.getContext("2d");

    game16 = {
        ctx, canvas,
        size: 5,
        tileSize: 80,
        grid: [],
        moves: 0,
        onFinish,
        status: "PLAYING",

        // 🎨 Couleurs rétro-gaming
        colors: {
            A: "#5500ff", // rose néon
            B: "#f800fc", // rouge néon
            C: "#00e0f9", // cyan électrique
            D: "#ff7300"  // bleu saturé
        }
    };

    initFlipPuzzle();
    canvas.addEventListener("click", clickFlipPuzzle);
    renderFlipPuzzle();
}

/* ------------------ INIT ------------------ */

function initFlipPuzzle() {
    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            const idx = y * 5 + x;

            // Cases (x+y) pairs → type AB (pour pouvoir afficher A)
            // Cases (x+y) impairs → type CD (pour pouvoir afficher C)
            const type = ((x + y) % 2 === 0) ? "AB" : "CD";

            // Face aléatoire (recto/verso)
            const face = Math.random() < 0.5 ? 0 : 1;

            game16.grid[idx] = { type, face };
        }
    }
}

/* ------------------ CLICK ------------------ */

function clickFlipPuzzle(e) {
    if (game16.status !== "PLAYING") return;

    const rect = game16.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const x = Math.floor(mx / game16.tileSize);
    const y = Math.floor(my / game16.tileSize);
    const idx = y * 5 + x;

    // Retourner la case
    game16.grid[idx].face = 1 - game16.grid[idx].face;

    game16.moves++;
    document.getElementById("moves16").textContent = game16.moves;

    renderFlipPuzzle();
    checkFlipWin();
}

/* ------------------ CHECK WIN ------------------ */

function checkFlipWin() {
    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            const idx = y * 5 + x;
            const cell = game16.grid[idx];

            const shouldBeA = ((x + y) % 2 === 0);

            if (shouldBeA) {
                // Case doit être A → type AB + face recto
                if (cell.type !== "AB" || cell.face !== 0) return;
            } else {
                // Case doit être C → type CD + face recto
                if (cell.type !== "CD" || cell.face !== 0) return;
            }
        }
    }

    // Si on arrive ici → victoire
    game16.status = "WIN";
    document.getElementById("msg16").textContent = "🎉 Damier complété !";
    setTimeout(game16.onFinish, 1500);
}

/* ------------------ GET COLOR ------------------ */

function getCellColor(cell) {
    if (cell.type === "AB") {
        return cell.face === 0 ? game16.colors.A : game16.colors.B;
    } else {
        return cell.face === 0 ? game16.colors.C : game16.colors.D;
    }
}

/* ------------------ RENDER ------------------ */

function renderFlipPuzzle() {
    const ctx = game16.ctx;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 400, 400);

    for (let i = 0; i < 25; i++) {
        const cell = game16.grid[i];
        const color = getCellColor(cell);

        const x = (i % 5) * game16.tileSize;
        const y = Math.floor(i / 5) * game16.tileSize;

        // Effet glossy rétro
        const gradient = ctx.createLinearGradient(x, y, x + 80, y + 80);
        gradient.addColorStop(0, lighten(color, 0.25));
        gradient.addColorStop(1, color);

        ctx.fillStyle = gradient;
        ctx.fillRect(x + 5, y + 5, 70, 70);

        // Glow néon
        ctx.strokeStyle = color + "aa";
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 5, y + 5, 70, 70);
    }
}

/* ------------------ COLOR UTILS ------------------ */

function lighten(hex, amount) {
    const num = parseInt(hex.slice(1), 16);
    let r = (num >> 16) + Math.floor(255 * amount);
    let g = ((num >> 8) & 0xFF) + Math.floor(255 * amount);
    let b = (num & 0xFF) + Math.floor(255 * amount);

    r = Math.min(255, r);
    g = Math.min(255, g);
    b = Math.min(255, b);

    return `rgb(${r},${g},${b})`;
}
