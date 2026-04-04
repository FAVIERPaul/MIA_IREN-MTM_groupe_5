let game18 = {};

export function startGame20(container, onFinish) {
    container.innerHTML = `
        <div style="text-align:center; font-family:'VT323', monospace; color:white; background:#050509; padding:20px; border-radius:15px;">
            
            <div style="font-size:1.2em; margin-bottom:10px;">
                🎯 Fléchettes lancées : <span id="darts18" style="color:#00e5ff;">0</span> / 5
            </div>

            <canvas id="dartCanvas" width="520" height="380"
                style="border:4px solid #ff3860; border-radius:8px; box-shadow:0 0 25px #ff3860aa; cursor:crosshair;">
            </canvas>

            <div style="margin-top:10px;">
                <button id="reset18" style="padding:6px 16px; border-radius:6px; border:none; background:#ff3860; color:#fff; font-size:1em; cursor:pointer;">
                    Recommencer
                </button>
            </div>

            <p id="msg18" style="margin-top:10px; min-height:24px; font-size:1.1em;">
                Clique pour lancer une fléchette. Vise la zone blanche, évite le centre rouge.
            </p>
        </div>
    `;

    const canvas = container.querySelector("#dartCanvas");
    const ctx = canvas.getContext("2d");

    game18 = {
        ctx,
        canvas,
        onFinish,
        dartsThrown: 0,
        maxDarts: 5,
        darts: [],
        gravity: 0.25,

        // Position de tir
        throwPos: { x: 80, y: 300 },

        // Cible
        target: {
            x: 420,
            y: 180,
            rRed: 20,
            rWhite: 40,
            rBlue: 70
        }
    };

    canvas.addEventListener("click", throwDart18);
    container.querySelector("#reset18").addEventListener("click", resetGame18);

    renderDartGame18();
}

/* ------------------ RESET ------------------ */

function resetGame18() {
    game18.darts = [];
    game18.dartsThrown = 0;
    document.getElementById("darts18").textContent = 0;
    document.getElementById("msg18").textContent =
        "Clique pour lancer une fléchette. Vise la zone blanche, évite le centre rouge.";
    renderDartGame18();
}

/* ------------------ THROW ------------------ */

function throwDart18(e) {
    if (game18.dartsThrown >= game18.maxDarts) return;

    const rect = game18.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Calcul direction
    const dx = mx - game18.throwPos.x;
    const dy = my - game18.throwPos.y;

    const angle = Math.atan2(dy, dx);
    const power = Math.min(12, Math.hypot(dx, dy) / 20);

    game18.darts.push({
        x: game18.throwPos.x,
        y: game18.throwPos.y,
        vx: Math.cos(angle) * power,
        vy: Math.sin(angle) * power
    });

    game18.dartsThrown++;
    document.getElementById("darts18").textContent = game18.dartsThrown;

    animateDarts18();
}

/* ------------------ ANIMATION ------------------ */

function animateDarts18() {
    const ctx = game18.ctx;

    function frame() {
        updateDarts18();
        renderDartGame18();

        if (checkEnd18()) return;

        requestAnimationFrame(frame);
    }

    frame();
}

/* ------------------ UPDATE ------------------ */

function updateDarts18() {
    for (const d of game18.darts) {
        d.vy += game18.gravity;
        d.x += d.vx;
        d.y += d.vy;
    }
}

/* ------------------ COLLISIONS ------------------ */

function checkEnd18() {
    const t = game18.target;

    for (const d of game18.darts) {
        const dist = Math.hypot(d.x - t.x, d.y - t.y);

        // ❌ Centre rouge → reset immédiat
        if (dist <= t.rRed) {
            resetGame18();
            document.getElementById("msg18").textContent =
                "❌ Une fléchette a touché le centre rouge ! Recommence.";
            return true;
        }

        // ❌ En dehors de la zone blanche → échec
        if (dist > t.rWhite && dist < t.rBlue) {
            resetGame18();
            document.getElementById("msg18").textContent =
                "❌ Une fléchette n'est pas dans la zone blanche.";
            return true;
        }
    }

    // 🎉 Victoire si 5 fléchettes dans la zone blanche
    if (game18.dartsThrown === game18.maxDarts) {
        let allGood = true;
        for (const d of game18.darts) {
            const dist = Math.hypot(d.x - t.x, d.y - t.y);
            if (!(dist > t.rRed && dist <= t.rWhite)) allGood = false;
        }

        if (allGood) {
            document.getElementById("msg18").textContent =
                "🎉 Bravo ! Les 5 fléchettes sont dans la zone blanche !";
            setTimeout(() => game18.onFinish && game18.onFinish(), 1500);
        } else {
            resetGame18();
            document.getElementById("msg18").textContent =
                "❌ Toutes les fléchettes doivent être dans la zone blanche.";
        }

        return true;
    }

    return false;
}

/* ------------------ RENDER ------------------ */

function renderDartGame18() {
    const ctx = game18.ctx;
    const { width, height } = game18.canvas;

    ctx.fillStyle = "#050509";
    ctx.fillRect(0, 0, width, height);

    drawTarget18(ctx, game18.target);

    // Fléchettes
    ctx.fillStyle = "#ff3860";
    for (const d of game18.darts) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Position de tir
    ctx.fillStyle = "#86eefa";
    ctx.beginPath();
    ctx.arc(game18.throwPos.x, game18.throwPos.y, 6, 0, Math.PI * 2);
    ctx.fill();
}

function drawTarget18(ctx, t) {
    // Bleu extérieur
    ctx.fillStyle = "#1b3bff";
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.rBlue, 0, Math.PI * 2);
    ctx.fill();

    // Blanc (objectif)
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.rWhite, 0, Math.PI * 2);
    ctx.fill();

    // Rouge interdit
    ctx.fillStyle = "#ff3860";
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.rRed, 0, Math.PI * 2);
    ctx.fill();
}

/* ------------------ UTILS ------------------ */

function normalize17(v) {
    const len = Math.hypot(v.x, v.y);
    return len === 0 ? { x: 0, y: 0 } : { x: v.x / len, y: v.y / len };
}
