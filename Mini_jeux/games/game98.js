import { gameManager } from "../gameCleanup.js";

let pizzaGame = null;

export function startGame98(container, onFinish) {
    container.innerHTML = `
        <div style="text-align:center; font-family: 'Segoe UI', sans-serif; color: white; background:#1a1a1a; padding:20px; border-radius:15px;">
            <div style="font-size:1.2em; margin-bottom:10px;">🔪 Coupures : 
                <span id="pizzaCuts" style="color:#ffcc00;">0</span>
            </div>

            <canvas id="pizzaCanvas" width="400" height="400"
                style="border:4px solid #ffcc00; border-radius:50%; box-shadow:0 0 25px #ffcc00aa; cursor:crosshair;">
            </canvas>

            <p id="pizzaMsg" style="margin-top:15px; font-weight:bold; min-height:24px;">
                Dessinez un trait pour couper la pizza diavola !
            </p>
        </div>
    `;

    const canvas = container.querySelector("#pizzaCanvas");
    const ctx = canvas.getContext("2d");

    pizzaGame = {
        ctx,
        canvas,
        container,
        cuts: [],
        drawing: false,
        startPoint: null,
        onFinish,
        status: "PLAYING"
    };

    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", drawPreview);
    canvas.addEventListener("mouseup", endDraw);

    drawPizza();
}

/* ------------------ DRAWING ------------------ */

function startDraw(e) {
    if (pizzaGame.status !== "PLAYING") return;

    const { x, y } = getMousePos(e);
    pizzaGame.drawing = true;
    pizzaGame.startPoint = { x, y };
}

function drawPreview(e) {
    if (!pizzaGame.drawing) return;

    drawPizza();

    const { x, y } = getMousePos(e);
    const ctx = pizzaGame.ctx;

    ctx.strokeStyle = "#ffffffaa";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(pizzaGame.startPoint.x, pizzaGame.startPoint.y);
    ctx.lineTo(x, y);
    ctx.stroke();
}

function endDraw(e) {
    if (!pizzaGame.drawing) return;
    pizzaGame.drawing = false;

    const { x, y } = getMousePos(e);

    const cx = 200, cy = 200;
    const angle = Math.atan2(y - cy, x - cx);
    const normalized = (angle + Math.PI * 2) % (Math.PI * 2);

    pizzaGame.cuts.push(normalized);
    pizzaGame.cuts.sort((a, b) => a - b);

    document.getElementById("pizzaCuts").textContent = pizzaGame.cuts.length;

    drawPizza();
    checkPizzaWin();
}

/* ------------------ UTILS ------------------ */

function getMousePos(e) {
    const rect = pizzaGame.canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

/* ------------------ CHECK WIN ------------------ */

function checkPizzaWin() {
    if (pizzaGame.cuts.length < 4) return;

    const angles = pizzaGame.cuts;
    const parts = [];

    for (let i = 0; i < angles.length; i++) {
        const a1 = angles[i];
        const a2 = angles[(i + 1) % angles.length];
        let diff = a2 - a1;
        if (diff < 0) diff += Math.PI * 2;
        parts.push(diff);
    }

    const total = Math.PI * 2;
    const percents = parts.map(p => p / total);

    for (let i = 0; i < percents.length; i++) {
        for (let j = i + 1; j < percents.length; j++) {
            const ratio = Math.min(percents[i], percents[j]) / Math.max(percents[i], percents[j]);

            if (ratio > 0.8) {
                document.getElementById("pizzaMsg").textContent =
                    "❌ Deux parts sont trop similaires ! Réessayez…";

                pizzaGame.status = "LOSE";
                setTimeout(() => startGame98(pizzaGame.container, pizzaGame.onFinish), 1500);
                return;
            }
        }
    }

    document.getElementById("pizzaMsg").textContent =
        "🔥 Bravo ! Ta diavola est coupée en parts bien différentes !";

    pizzaGame.status = "WIN";
    setTimeout(pizzaGame.onFinish, 1500);
}

/* ------------------ DRAW PIZZA (diavola réaliste) ------------------ */

function drawPizza() {
    const ctx = pizzaGame.ctx;
    ctx.clearRect(0, 0, 400, 400);

    const cx = 200;
    const cy = 200;

    /* FOND */
    const bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, 220);
    bgGrad.addColorStop(0, "#222");
    bgGrad.addColorStop(1, "#000");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 400, 400);

    /* CROÛTE */
    const crustGrad = ctx.createRadialGradient(cx, cy, 130, cx, cy, 190);
    crustGrad.addColorStop(0, "#f3c892");
    crustGrad.addColorStop(0.5, "#d89b5a");
    crustGrad.addColorStop(1, "#8b5a2b");

    ctx.fillStyle = crustGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 185, 0, Math.PI * 2);
    ctx.fill();

    // Taches brûlées
    ctx.fillStyle = "rgba(60,30,10,0.55)";
    for (let i = 0; i < 14; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 165 + Math.random() * 15;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        ctx.beginPath();
        ctx.ellipse(x, y, 5 + Math.random() * 4, 3 + Math.random() * 2, angle, 0, Math.PI * 2);
        ctx.fill();
    }

    /* SAUCE */
    const sauceGrad = ctx.createRadialGradient(cx, cy, 40, cx, cy, 160);
    sauceGrad.addColorStop(0, "#b71c1c");
    sauceGrad.addColorStop(0.5, "#d32f2f");
    sauceGrad.addColorStop(1, "#7f1010");

    ctx.fillStyle = sauceGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 160, 0, Math.PI * 2);
    ctx.fill();

    /* FROMAGE */
    const cheeseGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, 150);
    cheeseGrad.addColorStop(0, "#ffe9a3");
    cheeseGrad.addColorStop(0.5, "#ffd36b");
    cheeseGrad.addColorStop(1, "#f7b733");

    ctx.fillStyle = cheeseGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 150, 0, Math.PI * 2);
    ctx.fill();

    /* SALAMI */
    const salamiPositions = [
        { x: cx - 60, y: cy - 40 },
        { x: cx + 55, y: cy - 30 },
        { x: cx - 20, y: cy + 55 },
        { x: cx + 40, y: cy + 35 },
        { x: cx,      y: cy - 5 },
        { x: cx + 10, y: cy + 10 }
    ];

    for (const p of salamiPositions) {
        const salGrad = ctx.createRadialGradient(p.x, p.y, 5, p.x, p.y, 22);
        salGrad.addColorStop(0, "#ff6b6b");
        salGrad.addColorStop(0.4, "#e53935");
        salGrad.addColorStop(1, "#8e1b1b");

        ctx.fillStyle = salGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 20, 0, Math.PI * 2);
        ctx.fill();

        // petits points de gras
        ctx.fillStyle = "rgba(255,230,180,0.8)";
        for (let i = 0; i < 5; i++) {
            const a = Math.random() * Math.PI * 2;
            const r = 4 + Math.random() * 8;
            const sx = p.x + Math.cos(a) * r;
            const sy = p.y + Math.sin(a) * r;
            ctx.beginPath();
            ctx.arc(sx, sy, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /* MOZZARELLA FRAÎCHE */
    const mozzPositions = [
        { x: cx - 40, y: cy - 10 },
        { x: cx + 30, y: cy - 50 },
        { x: cx - 10, y: cy + 40 },
        { x: cx + 60, y: cy + 20 }
    ];

    for (const m of mozzPositions) {
        const mozzGrad = ctx.createRadialGradient(m.x, m.y, 5, m.x, m.y, 18);
        mozzGrad.addColorStop(0, "#ffffff");
        mozzGrad.addColorStop(1, "#e8e8e8");

        ctx.fillStyle = mozzGrad;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 15, 0, Math.PI * 2);
        ctx.fill();
    }

    /* BASILIC */
    ctx.fillStyle = "#2ecc71";
    const basil = [
        { x: cx - 30, y: cy - 70 },
        { x: cx + 70, y: cy + 10 },
        { x: cx - 50, y: cy + 20 },
        { x: cx + 20, y: cy + 60 },
        { x: cx - 70, y: cy - 10 }
    ];
    for (const b of basil) {
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, 14, 7, Math.random(), 0, Math.PI * 2);
        ctx.fill();
    }

    /* HUILE PIMENTÉE */
    ctx.strokeStyle = "rgba(255, 215, 130, 0.4)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 30 + Math.random() * 100;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;

        ctx.beginPath();
        ctx.ellipse(x, y, 8, 3, angle, 0, Math.PI * 2);
        ctx.stroke();
    }

    /* COUPURES */
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;

    for (const angle of pizzaGame.cuts) {
        const x = cx + Math.cos(angle) * 180;
        const y = cy + Math.sin(angle) * 180;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
}