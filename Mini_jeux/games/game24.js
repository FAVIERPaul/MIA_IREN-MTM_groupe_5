let game22 = {};

export function startGame22(container, onFinish) {
    container.innerHTML = `
        <div style="text-align:center; font-family:'VT323', monospace; color:white; background:#050509; padding:20px; border-radius:15px;">
            <h2 style="margin:0 0 8px;">🚰 Robinets à l'envers — Logique contrariée</h2>
            <p style="margin:0 0 8px; font-size:0.95em;">
                Clique sur un robinet (A, B, C, D).<br>
                Rien ne se passe comme prévu : l'eau sort d'un autre robinet, et parfois dans le mauvais sens...
            </p>

            <canvas id="tapCanvas22" width="800" height="400"
                style="border:4px solid #7fd3ff; border-radius:8px; box-shadow:0 0 25px #7fd3ffaa; background:#041018;">
            </canvas>

            <p id="msg22" style="margin-top:8px; min-height:24px; font-size:1.05em;">
                Objectif : remplir le réservoir à 100%. Observe la contre-logique des robinets.
            </p>
        </div>
    `;

    const canvas = container.querySelector("#tapCanvas22");
    const ctx = canvas.getContext("2d");

    game22 = {
        ctx,
        canvas,
        onFinish,
        taps: {
            A: false,
            B: false,
            C: false,
            D: false
        },
        flowDir: 1,       // 1 = remplit, -1 = vide
        dEnabled: true,   // C active/désactive D comme source
        aMode: 1,         // 1 = inversion simple, 2 = double inversion
        reservoir: 0,     // 0 à 100
        gameOver: false,
        tapLayout: {
            A: { x: 150, y: 120 },
            B: { x: 650, y: 120 },
            C: { x: 150, y: 280 },
            D: { x: 650, y: 280 }
        }
    };

    canvas.addEventListener("click", onCanvasClick22);
    render22();
}

/* ---------- LOGIQUE DES ROBINETS ---------- */
/*
Contre-logique :
- Cliquer un robinet ne fait pas couler l'eau de ce robinet.
- Chaque robinet modifie un autre robinet ou le système :
    A : inverse l'état de C (et parfois aussi B)
    B : inverse le sens du flux (remplit / vide)
    C : active/désactive D comme source d'eau
    D : change le mode de A (simple ou double inversion)
- L'eau sort du robinet opposé à celui cliqué :
    A <-> C, B <-> D
- L'eau ne coule que si ce robinet opposé est OUVERT
  (et si D est activé quand c'est lui la source).
*/

function onCanvasClick22(e) {
    if (game22.gameOver) return;

    const rect = game22.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const tap = tapAt22(x, y);
    if (!tap) return;

    handleTapLogic22(tap);
    render22();
    checkWin22();
}

function tapAt22(x, y) {
    for (const key of Object.keys(game22.tapLayout)) {
        const t = game22.tapLayout[key];
        const dx = x - t.x;
        const dy = y - t.y;
        if (dx * dx + dy * dy <= 35 * 35) return key;
    }
    return null;
}

function handleTapLogic22(tap) {
    const state = game22;

    // 1) On "tourne" le robinet : on inverse son état (ouvert/fermé)
    state.taps[tap] = !state.taps[tap];

    // 2) Effets secondaires non intuitifs
    if (tap === "A") {
        // A inverse C, et en mode 2 inverse aussi B
        state.taps.C = !state.taps.C;
        if (state.aMode === 2) {
            state.taps.B = !state.taps.B;
        }
    } else if (tap === "B") {
        // B inverse le sens du flux
        state.flowDir *= -1;
    } else if (tap === "C") {
        // C active/désactive D comme source
        state.dEnabled = !state.dEnabled;
    } else if (tap === "D") {
        // D change le mode de A
        state.aMode = state.aMode === 1 ? 2 : 1;
    }

    // 3) L'eau sort du robinet opposé
    const oppositeMap = { A: "C", C: "A", B: "D", D: "B" };
    const source = oppositeMap[tap];

    let canFlow = state.taps[source];

    // D ne peut être source que si dEnabled est true
    if (source === "D" && !state.dEnabled) {
        canFlow = false;
    }

    if (canFlow) {
        // flux dans le sens actuel
        state.reservoir += 10 * state.flowDir;
        if (state.reservoir < 0) state.reservoir = 0;
        if (state.reservoir > 100) state.reservoir = 100;

        const dirText = state.flowDir === 1 ? "remplit" : "vide";
        setMsg22(
            `L'eau sort de ${source} et ${dirText} le réservoir (${state.reservoir}%).`
        );
    } else {
        setMsg22(
            `Tu as tourné ${tap}, mais l'eau ne coule pas : le robinet opposé n'est pas prêt.`
        );
    }
}

/* ---------- AFFICHAGE ---------- */

function render22() {
    const ctx = game22.ctx;
    const canvas = game22.canvas;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fond
    ctx.fillStyle = "#041018";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Tuyau central
    ctx.strokeStyle = "#1f3b4d";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(200, canvas.height / 2);
    ctx.lineTo(canvas.width - 200, canvas.height / 2);
    ctx.stroke();

    // Robinets
    for (const key of Object.keys(game22.tapLayout)) {
        const t = game22.tapLayout[key];
        drawTap22(ctx, t.x, t.y, key, game22.taps[key]);
    }

    // Flèche de direction du flux
    drawFlowDirection22(ctx);

    // Réservoir
    drawReservoir22(ctx);
}

function drawTap22(ctx, x, y, label, open) {
    ctx.save();

    // Corps du robinet
    ctx.fillStyle = open ? "#7fd3ff" : "#555b66";
    ctx.strokeStyle = "#cfd8e3";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Poignée
    ctx.strokeStyle = "#cfd8e3";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 20, y - 25);
    ctx.lineTo(x + 20, y - 25);
    ctx.stroke();

    // Lettre
    ctx.fillStyle = "#ffffff";
    ctx.font = "24px VT323";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x, y + 2);

    // État
    ctx.font = "14px VT323";
    ctx.fillStyle = open ? "#7fd3ff" : "#888";
    ctx.fillText(open ? "OUVERT" : "FERMÉ", x, y + 40);

    ctx.restore();
}

function drawFlowDirection22(ctx) {
    const dir = game22.flowDir;
    const cx = game22.canvas.width / 2;
    const cy = game22.canvas.height / 2;

    ctx.save();
    ctx.translate(cx, cy - 40);

    ctx.fillStyle = dir === 1 ? "#7fd3ff" : "#ff6b6b";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;

    // Flèche gauche-droite
    if (dir === 1) {
        // vers la droite
        ctx.beginPath();
        ctx.moveTo(-40, 0);
        ctx.lineTo(40, 0);
        ctx.lineTo(25, -10);
        ctx.moveTo(40, 0);
        ctx.lineTo(25, 10);
        ctx.stroke();
    } else {
        // vers la gauche
        ctx.beginPath();
        ctx.moveTo(40, 0);
        ctx.lineTo(-40, 0);
        ctx.lineTo(-25, -10);
        ctx.moveTo(-40, 0);
        ctx.lineTo(-25, 10);
        ctx.stroke();
    }

    ctx.font = "16px VT323";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(
        dir === 1 ? "Flux : remplissage" : "Flux : vidange",
        0,
        12
    );

    ctx.restore();
}

function drawReservoir22(ctx) {
    const x = 320;
    const y = 260;
    const w = 160;
    const h = 110;

    ctx.save();

    // Contour
    ctx.strokeStyle = "#cfd8e3";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);

    // Niveau d'eau
    const level = game22.reservoir / 100;
    const waterHeight = h * level;

    ctx.fillStyle = "#1e90ffaa";
    ctx.fillRect(x + 2, y + h - waterHeight + 2, w - 4, waterHeight - 4);

    // Texte
    ctx.fillStyle = "#ffffff";
    ctx.font = "18px VT323";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${game22.reservoir}%`, x + w / 2, y + h / 2);

    ctx.restore();
}

/* ---------- MESSAGES & VICTOIRE ---------- */

function setMsg22(text) {
    const el = document.getElementById("msg22");
    if (el) el.textContent = text;
}

function checkWin22() {
    if (game22.reservoir >= 100 && !game22.gameOver) {
        game22.gameOver = true;
        setMsg22("🎉 Tu as compris la contre-logique des robinets et rempli le réservoir !");
        setTimeout(() => game22.onFinish && game22.onFinish(), 1500);
    }
}
