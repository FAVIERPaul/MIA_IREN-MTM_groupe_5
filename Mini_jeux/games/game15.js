let gameState = {};

export function startGame13(container, onFinish) {
    // 1. Agrandissement de la Grille (8x8) pour l'UX
    container.innerHTML = `
        <div style="text-align:center; font-family: 'Segoe UI', sans-serif; color: white; background: #1a1a1a; padding: 20px; border-radius: 15px;">
            <div style="font-size: 1.2em; margin-bottom: 10px;">📦 Mouvements : <span id="moves" style="color: #2ecc71;">0</span></div>
            <canvas id="gameCanvas" width="480" height="480" style="border: 4px solid #34495e; border-radius: 8px; box-shadow: 0 0 20px rgba(0,0,0,0.5); cursor: grab;"></canvas>
            <p id="gameMessage" style="margin-top: 15px; font-weight: bold; min-height: 24px;">Trouvez la sortie... 👀</p>
        </div>
    `;

    const canvas = container.querySelector("#gameCanvas");
    const ctx = canvas.getContext("2d");

    // Taille de grille 8x8 avec des cellules de 60px
    gameState = {
        ctx, canvas, cell: 60, vehicules: [],
        selected: null, offset: { x: 0, y: 0 },
        moves: 0, exitVisible: false, onFinish, status: "PLAYING"
    };

    creerVehicules();
    canvas.addEventListener("mousedown", down);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);

    function loop() {
        render();
        if (gameState.status !== "WIN") requestAnimationFrame(loop);
    }
    loop();
}

// ---------------- VÉHICULES ----------------

function creerVehicules() {
    // 2. Repositionnement pour un Puzzle non-superposé mais tactique
    gameState.vehicules = [
        // Le joueur : La Benne (Largeur 2, Hauteur 1)
        { id: "player", x: 1, y: 3, w: 2, h: 1, dir: "h", color: "#27ae60", type: "garbage" },

        // Autres voitures et camions (Positions ajustées pour la grille 8x8)
        // BLOCAGE DIRECT
        { x: 3, y: 3, w: 1, h: 2, dir: "v", color: "#e74c3c", type: "truck" }, // Bloque la voie directe
        { x: 3, y: 2, w: 1, h: 1, dir: "v", color: "#3498db", type: "car" },   // Bloque le camion rouge

        // OBSTACLES PERIPHERIQUES (Complexité)
        { x: 0, y: 0, w: 3, h: 1, dir: "h", color: "#f1c40f", type: "truck" }, // Camion jaune
        { x: 0, y: 2, w: 1, h: 2, dir: "v", color: "#9b59b6", type: "car" }, // Voiture violette
        { x: 1, y: 1, w: 2, h: 1, dir: "h", color: "#d35400", type: "car" },   // Voiture orange
        { x: 4, y: 1, w: 1, h: 3, dir: "v", color: "#e67e22", type: "truck" }, // Camion marron
        { x: 5, y: 2, w: 2, h: 1, dir: "h", color: "#1abc9c", type: "car" },   // Voiture turquoise
        { x: 2, y: 5, w: 1, h: 2, dir: "v", color: "#95a5a6", type: "car" },   // Voiture grise
        { x: 4, y: 5, w: 2, h: 2, dir: "v", color: "#c0392b", type: "truck" }, // Gros camion rouge
        { x: 0, y: 6, w: 2, h: 1, dir: "h", color: "#1abc9c", type: "car" }    // Voiture turquoise
    ];
}

// ---------------- INPUT (Contrôles) ----------------

function down(e) {
    if (gameState.status !== "PLAYING") return;
    const rect = gameState.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    gameState.vehicules.forEach(v => {
        if (mx >= v.x * 60 && mx <= (v.x + v.w) * 60 && my >= v.y * 60 && my <= (v.y + v.h) * 60) {
            gameState.selected = v;
            gameState.offset.x = mx - v.x * 60;
            gameState.offset.y = my - v.y * 60;
        }
    });
}

function move(e) {
    const v = gameState.selected;
    if (!v) return;
    const rect = gameState.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let nx = v.x, ny = v.y;
    if (v.dir === "h") nx = Math.round((mx - gameState.offset.x) / 60);
    else ny = Math.round((my - gameState.offset.y) / 60);

    if (isValid(v, nx, ny)) {
        if (nx !== v.x || ny !== v.y) {
            v.x = nx; v.y = ny;
            gameState.moves++;
            document.getElementById("moves").textContent = gameState.moves;
           // La sortie apparaît uniquement si on déplace la voiture violette (A2–A3)
if (v.color === "#9b59b6") {
    gameState.exitVisible = true;
}

            checkWin();
        }
    }
}

function up() { gameState.selected = null; }

// ---------------- LOGIQUE (Mouvements / Victoire) ----------------

function isValid(v, nx, ny) {
    // Limites de la grille 8x8
    if (nx < 0 || ny < 0 || nx + v.w > 8 || ny + v.h > 8) return false;
    return !gameState.vehicules.some(o => {
        if (o === v) return false;
        return nx < o.x + o.w && nx + v.w > o.x && ny < o.y + o.h && ny + v.h > o.y;
    });
}

function checkWin() {
    const p = gameState.vehicules[0];
    
    // 3. Piège (Positionné stratégiquement sur 8x8)
    if (p.x >= 6 && p.y === 3) {
        document.getElementById("gameMessage").textContent = "💀 Piège ! Le trou était profond...";
        gameState.status = "TRAP";
        setTimeout(() => { p.x = 1; p.y = 3; gameState.status = "PLAYING"; document.getElementById("gameMessage").textContent = "Réessayez !"; }, 1000);
    }
    
    // Vraie sortie (Cachée, mais à débloquer)
    if (gameState.exitVisible && p.x <= 0 && p.y === 3) {
        gameState.status = "WIN";
        document.getElementById("gameMessage").textContent = "🎉 La benne est à l'abri !";
        setTimeout(gameState.onFinish, 1500);
    }
}

// ---------------- RENDER (Graphismes) ----------------

function drawVehicle(v) {
    const ctx = gameState.ctx;
    const x = v.x * 60 + 4;
    const y = v.y * 60 + 4;
    const w = v.w * 60 - 8;
    const h = v.h * 60 - 8;
    const radius = 10;

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;

    ctx.fillStyle = v.color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fill();
    ctx.shadowBlur = 0;

    // --- Détails selon le type (Look Arcade) ---
    ctx.fillStyle = "rgba(255,255,255,0.2)"; // Reflet carrosserie
    ctx.fillRect(x + 5, y + 5, w - 10, h / 4);

    if (v.type === "garbage") {
        // Look Benne à ordures
        ctx.fillStyle = "#1e8449";
        ctx.fillRect(x + w * 0.1, y + h * 0.1, w * 0.6, h * 0.8); // Zone de chargement
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(x + w * 0.1, y + h * 0.1, w * 0.6, h * 0.8);
        ctx.fillStyle = "#2ecc71";
        ctx.fillRect(x + w * 0.75, y + h * 0.15, w * 0.2, h * 0.7); // Cabine
        ctx.fillStyle = "orange"; // Gyrophare
        ctx.beginPath(); ctx.arc(x + w * 0.7, y + h * 0.2, 4, 0, Math.PI * 2); ctx.fill();
    } else {
        // Look Voiture / Camion classique
        const isVert = v.dir === "v";
        ctx.fillStyle = "#34495e"; // Pare-brise
        if (isVert) {
            ctx.fillRect(x + w * 0.1, y + h * 0.2, w * 0.8, h * 0.15); // Avant
            ctx.fillRect(x + w * 0.1, y + h * 0.7, w * 0.8, h * 0.05); // Arrière
        } else {
            ctx.fillRect(x + w * 0.7, y + h * 0.1, w * 0.15, h * 0.8); // Avant
            ctx.fillRect(x + w * 0.1, y + h * 0.1, w * 0.05, h * 0.8); // Arrière
        }
    }

    // Phares (Lumière)
    ctx.fillStyle = "#f1c40f";
    if (v.dir === "h") {
        ctx.fillRect(x + w - 5, y + 5, 5, 10);
        ctx.fillRect(x + w - 5, y + h - 15, 5, 10);
    } else {
        ctx.fillRect(x + 5, y - 2, 10, 5);
        ctx.fillRect(x + w - 15, y - 2, 10, 5);
    }

    ctx.restore();
}

function render() {
    const ctx = gameState.ctx;
    // Fond bitume (Ajusté pour 8x8)
    ctx.fillStyle = "#34495e";
    ctx.fillRect(0, 0, 480, 480);

    // Lignes de route
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 2;
    for (let i = 1; i < 8; i++) {
        ctx.beginPath(); ctx.moveTo(i * 60, 0); ctx.lineTo(i * 60, 480); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * 60); ctx.lineTo(480, i * 60); ctx.stroke();
    }

    // Piège (Bouche d'égout ouverte, Positionné sur la grille 8x8)
    ctx.fillStyle = "#111";
    ctx.beginPath(); ctx.arc(480, 210, 30, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Vraie sortie (Cachée, mais à débloquer tactiquement)
    if (gameState.exitVisible) {
        ctx.fillStyle = "#2ecc71";
        ctx.fillRect(0, 180, 15, 60);
        ctx.fillStyle = "white";
        ctx.font = "bold 12px Arial";
        ctx.fillText("EXIT", 18, 215);
    }

    gameState.vehicules.forEach(drawVehicle);
}