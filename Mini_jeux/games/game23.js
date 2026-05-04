import { gameManager } from "../gameCleanup.js";
let game21 = {};

export function startGame23(container, onFinish) {
    container.innerHTML = `
        <div style="text-align:center; font-family:'VT323', monospace; color:white; background:#050509; padding:20px; border-radius:15px;">
            <h2 style="margin:0 0 8px;">🁢 Dominos inversés — Puzzle à solution unique</h2>
            <p style="margin:0 0 8px; font-size:0.95em;">
                Sélectionne un domino en bas, puis clique sur un emplacement vide à gauche ou à droite du centre.<br>
                Règle inversée : <span style="color:#afff9f;">le nombre à l'extrémité opposée du domino posé doit être égal au nombre à l'extrémité opposée du domino déjà posé</span>.
            </p>

            <canvas id="dominoCanvas21" width="900" height="400"
                style="border:4px solid #f5e0b8; border-radius:8px; box-shadow:0 0 25px #f5e0b8aa; background:#06202a;">
            </canvas>

            <p id="msg21" style="margin-top:8px; min-height:24px; font-size:1.05em;">
                Sélectionne un domino dans la réserve, puis clique sur un emplacement vide.
            </p>
        </div>
    `;

    const canvas = container.querySelector("#dominoCanvas21");
    const ctx = canvas.getContext("2d");

    const centerY = canvas.height / 2 - 40;
    const centerX = canvas.width / 2;

    // Plateau linéaire : 3 dominos à gauche, 3 à droite, tous collés
    const slotSpacing = 120;
    const dominoWidth = 80;
    const dominoHeight = 40;

    const slots = [
        { id: "L3", x: centerX - slotSpacing * 3, y: centerY, direction: "left", parent: "L2", occupied: false },
        { id: "L2", x: centerX - slotSpacing * 2, y: centerY, direction: "left", parent: "L1", occupied: false },
        { id: "L1", x: centerX - slotSpacing * 1, y: centerY, direction: "left", parent: "center", occupied: false },

        { id: "center", x: centerX, y: centerY, direction: null, parent: null, occupied: true },

        { id: "R1", x: centerX + slotSpacing * 1, y: centerY, direction: "right", parent: "center", occupied: false },
        { id: "R2", x: centerX + slotSpacing * 2, y: centerY, direction: "right", parent: "R1", occupied: false },
        { id: "R3", x: centerX + slotSpacing * 3, y: centerY, direction: "right", parent: "R2", occupied: false }
    ];

    // Domino central fixé : 2|1
    const boardDominos = [
        { slotId: "center", left: 2, right: 1 }
    ];

    // Puzzle à solution unique : ces 6 dominos ont une place précise
    // Chaîne à droite (direction "right", on compare les extrémités opposées) :
    // center 2|1 → R1 3|2 → R2 4|3 → R3 5|4
    // Chaîne à gauche (direction "left") :
    // center 2|1 → L1 1|6 → L2 6|0 → L3 0|5
    const pool = [
        { left: 3, right: 2 }, // R1
        { left: 4, right: 3 }, // R2
        { left: 5, right: 4 }, // R3
        { left: 1, right: 6 }, // L1
        { left: 6, right: 0 }, // L2
        { left: 0, right: 5 }  // L3
    ];

    // Réserve en bas
    const poolLayout = pool.map((d, i) => ({
        x: 80 + i * 120,
        y: canvas.height - 110,
        w: 80,
        h: 100
    }));

    game21 = {
        ctx,
        canvas,
        onFinish,
        slots,
        boardDominos,
        pool,
        poolLayout,
        selectedPoolIndex: null,
        gameOver: false,
        dominoWidth,
        dominoHeight
    };

    canvas.addEventListener("click", onCanvasClick21);
    render21();
}

/* ---------- UTILITAIRES PLATEAU ---------- */

function findSlot21(id) {
    return game21.slots.find(s => s.id === id);
}

function findBoardDomino21(slotId) {
    return game21.boardDominos.find(d => d.slotId === slotId);
}

/**
 * Règle inversée :
 * - On ne peut PAS retourner le domino.
 * - On regarde l'extrémité OPPOSÉE au point de contact.
 *   - À droite : on compare left du parent avec right du nouveau.
 *   - À gauche : on compare right du parent avec left du nouveau.
 */
function canPlaceDomino21(domino, slot) {
    if (!slot.parent) return false;
    const parentDomino = findBoardDomino21(slot.parent);
    if (!parentDomino) return false;

    if (slot.direction === "right") {
        const parentOpp = parentDomino.left;  // côté opposé à la droite
        const newOpp = domino.right;          // côté opposé au point de contact (gauche)
        return parentOpp === newOpp;
    }

    if (slot.direction === "left") {
        const parentOpp = parentDomino.right; // côté opposé à la gauche
        const newOpp = domino.left;           // côté opposé au point de contact (droite)
        return parentOpp === newOpp;
    }

    return false;
}

/* ---------- INPUT ---------- */

function onCanvasClick21(e) {
    if (game21.gameOver) return;

    const rect = game21.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 1) Sélection dans la réserve
    for (let i = 0; i < game21.poolLayout.length; i++) {
        const pl = game21.poolLayout[i];
        if (
            x >= pl.x && x <= pl.x + pl.w &&
            y >= pl.y && y <= pl.y + pl.h &&
            game21.pool[i]
        ) {
            game21.selectedPoolIndex = i;
            document.getElementById("msg21").textContent =
                "Domino sélectionné. Clique sur un emplacement vide à gauche ou à droite.";
            render21();
            return;
        }
    }

    // 2) Placement sur un slot vide
    if (game21.selectedPoolIndex != null) {
        const slot = nearestEmptySlot21(x, y);
        if (!slot) return;

        const domino = game21.pool[game21.selectedPoolIndex];

        if (!canPlaceDomino21(domino, slot)) {
            document.getElementById("msg21").textContent =
                "❌ Mauvais domino pour cet emplacement (règle inversée non respectée).";
            return;
        }

        // Placement
        game21.boardDominos.push({
            slotId: slot.id,
            left: domino.left,
            right: domino.right
        });
        slot.occupied = true;
        game21.pool[game21.selectedPoolIndex] = null;
        game21.selectedPoolIndex = null;

        if (checkWin21()) {
            endGame21(true);
            return;
        }

        document.getElementById("msg21").textContent = "✔️ Bien joué. Continue.";
        render21();
    }
}

function nearestEmptySlot21(x, y) {
    let best = null;
    let bestDist = 999999;
    for (const s of game21.slots) {
        if (s.occupied) continue;
        const dx = x - s.x;
        const dy = y - s.y;
        const d = dx * dx + dy * dy;
        if (d < bestDist && d < 60 * 60) {
            bestDist = d;
            best = s;
        }
    }
    return best;
}

/* ---------- VICTOIRE ---------- */

function checkWin21() {
    // Tous les slots doivent être occupés
    return game21.slots.every(s => s.occupied);
}

/* ---------- RENDER ---------- */

function render21() {
    const ctx = game21.ctx;
    const canvas = game21.canvas;

    ctx.fillStyle = "#06202a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Slots (emplacements)
    for (const s of game21.slots) {
        if (s.id === "center") continue;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.strokeStyle = s.occupied ? "#2b8a3e" : "#355c7d";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(
            -game21.dominoWidth / 2 - 4,
            -game21.dominoHeight / 2 - 4,
            game21.dominoWidth + 8,
            game21.dominoHeight + 8
        );
        ctx.restore();
    }

    // Dominos sur le plateau
    for (const d of game21.boardDominos) {
        const slot = findSlot21(d.slotId);
        ctx.save();
        ctx.translate(slot.x, slot.y);
        drawDomino21(
            ctx,
            -game21.dominoWidth / 2,
            -game21.dominoHeight / 2,
            game21.dominoWidth,
            game21.dominoHeight,
            d.left,
            d.right,
            false
        );
        ctx.restore();
    }

    // Réserve
    for (let i = 0; i < game21.poolLayout.length; i++) {
        const pl = game21.poolLayout[i];
        const domino = game21.pool[i];
        if (!domino) continue;

        const selected = game21.selectedPoolIndex === i;

        ctx.save();
        ctx.translate(pl.x + pl.w / 2, pl.y + pl.h / 2);
        drawDomino21(
            ctx,
            -pl.w / 2,
            -pl.h / 2,
            pl.w,
            pl.h,
            domino.left,
            domino.right,
            selected
        );
        ctx.restore();
    }
}

/* ---------- DESSIN DOMINOS ---------- */

function drawDomino21(ctx, x, y, w, h, leftVal, rightVal, highlight) {
    drawDominoShape21(ctx, x, y, w, h, "#f5e0b8", highlight);

    ctx.strokeStyle = "#444";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 5);
    ctx.lineTo(x + w / 2, y + h - 5);
    ctx.stroke();

    drawPips21(ctx, x + w * 0.25, y + h * 0.5, leftVal);
    drawPips21(ctx, x + w * 0.75, y + h * 0.5, rightVal);
}

function drawDominoShape21(ctx, x, y, w, h, color, highlight) {
    const r = 8;

    ctx.fillStyle = color;
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
    ctx.fill();

    ctx.strokeStyle = highlight ? "#ff3860" : "#333";
    ctx.lineWidth = highlight ? 3 : 2;
    ctx.stroke();
}

function drawPips21(ctx, cx, cy, val) {
    const r = 4;
    ctx.fillStyle = "#111";

    const positions = {
        0: [],
        1: [[0, 0]],
        2: [[-10, -10], [10, 10]],
        3: [[-10, -10], [0, 0], [10, 10]],
        4: [[-10, -10], [10, -10], [-10, 10], [10, 10]],
        5: [[-10, -10], [10, -10], [0, 0], [-10, 10], [10, 10]],
        6: [[-10, -10], [10, -10], [-10, 0], [10, 0], [-10, 10], [10, 10]]
    };

    for (const [dx, dy] of positions[val]) {
        ctx.beginPath();
        ctx.arc(cx + dx, cy + dy, r, 0, Math.PI * 2);
        ctx.fill();
    }
}

/* ---------- FIN ---------- */

function endGame21(win) {
    game21.gameOver = true;
    const msg = document.getElementById("msg21");
    msg.textContent = "🎉 Puzzle résolu : tu as trouvé l'unique configuration correcte.";
    setTimeout(() => game21.onFinish && game21.onFinish(), 1500);
}
