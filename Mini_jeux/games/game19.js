let game17 = {};

export function startGame17(container, onFinish) {
    container.innerHTML = `
        <div style="text-align:center; font-family: 'VT323', monospace; color: white; background: #050509; padding: 20px; border-radius: 15px;">
            
            <div style="font-size: 1.1em; margin-bottom: 8px;">
                🔦 Miroirs placés : <span id="mirrors17" style="color:#00e5ff;">0</span> / 3
            </div>

            <canvas id="laserCanvas" width="520" height="380"
                style="border:4px solid #ff3860; border-radius:8px; box-shadow:0 0 25px #ff3860aa; cursor:crosshair;">
            </canvas>

            <div style="margin-top:10px;">
                <button id="fire17" style="padding:6px 16px; border-radius:6px; border:none; background:#00e5ff; color:#050509; font-size:1em; cursor:pointer;">
                    Lancer le laser
                </button>

                <button id="reset17" style="padding:6px 16px; border-radius:6px; border:none; background:#ff3860; color:#fff; font-size:1em; cursor:pointer; margin-left:10px;">
                    Réinitialiser
                </button>
            </div>

            <p id="msg17" style="margin-top:10px; min-height:24px; font-size:1.1em;">
                Place jusqu'à 3 miroirs, puis lance le laser pour toucher la couronne blanche (évite le centre rouge).
            </p>
        </div>
    `;

    const canvas = container.querySelector("#laserCanvas");
    const ctx = canvas.getContext("2d");

    game17 = {
        ctx,
        canvas,
        onFinish,
        mirrors: [],
        maxMirrors: 3,
        path: [],

        // Laser déplacé pour rendre le puzzle intéressant
        laserStart: { x: 60, y: 80 },
        laserDir: normalize17({ x: 1, y: 0 }),

        // Cible
        target: {
            x: 430,
            y: 280,
            rInnerRed: 18,
            rWhiteInner: 30,
            rWhiteOuter: 55
        }
    };

    canvas.addEventListener("click", onCanvasClick17);
    container.querySelector("#fire17").addEventListener("click", fireLaser17);
    container.querySelector("#reset17").addEventListener("click", resetGame17);

    window.addEventListener("keydown", e => {
        if (e.code === "Space") {
            e.preventDefault();
            fireLaser17();
        }
    });

    renderLaserGame17();
}

/* ------------------ RESET ------------------ */

function resetGame17() {
    game17.mirrors = [];
    game17.path = [];
    document.getElementById("mirrors17").textContent = 0;
    document.getElementById("msg17").textContent =
        "Place jusqu'à 3 miroirs, puis lance le laser.";
    renderLaserGame17();
}

/* ------------------ INPUT ------------------ */

function onCanvasClick17(e) {
    const rect = game17.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Rotation si clic sur un miroir
    const m = findMirrorAt17(mx, my);
    if (m) {
        m.angle += Math.PI / 4;
        setMirrorAngle17(m, m.angle);
        renderLaserGame17();
        return;
    }

    // Placement d'un miroir
    if (game17.mirrors.length >= game17.maxMirrors) return;

    const mirror = createMirrorAt17(mx, my, Math.PI / 4);
    game17.mirrors.push(mirror);
    document.getElementById("mirrors17").textContent = game17.mirrors.length;
    renderLaserGame17();
}

/* ------------------ FIRE ------------------ */

function fireLaser17() {
    simulateLaser17();
    renderLaserGame17();
}

/* ------------------ MIRRORS ------------------ */

function createMirrorAt17(cx, cy, angle) {
    const len = 60;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    return {
        angle,
        x1: cx - dx * len / 2,
        y1: cy - dy * len / 2,
        x2: cx + dx * len / 2,
        y2: cy + dy * len / 2
    };
}

function setMirrorAngle17(m, angle) {
    const cx = (m.x1 + m.x2) / 2;
    const cy = (m.y1 + m.y2) / 2;
    const len = distance17({ x: m.x1, y: m.y1 }, { x: m.x2, y: m.y2 });

    const dx = Math.cos(angle);
    const dy = Math.sin(angle);

    m.x1 = cx - dx * len / 2;
    m.y1 = cy - dy * len / 2;
    m.x2 = cx + dx * len / 2;
    m.y2 = cy + dy * len / 2;
    m.angle = angle;
}

function findMirrorAt17(x, y) {
    for (const m of game17.mirrors) {
        const d = pointToSegmentDistance17({ x, y }, { x: m.x1, y: m.y1 }, { x: m.x2, y: m.y2 });
        if (d < 10) return m;
    }
    return null;
}

/* ------------------ LASER SIMULATION ------------------ */

function simulateLaser17() {
    game17.path = [];

    let pos = { x: game17.laserStart.x, y: game17.laserStart.y };
    let dir = { x: game17.laserDir.x, y: game17.laserDir.y };

    const step = 3;
    const maxSteps = 4000;
    const maxBounces = 12;
    let bounces = 0;

    game17.path.push({ x: pos.x, y: pos.y });

    for (let i = 0; i < maxSteps; i++) {
        const next = { x: pos.x + dir.x * step, y: pos.y + dir.y * step };

        // Sortie écran
        if (next.x < 0 || next.x > game17.canvas.width || next.y < 0 || next.y > game17.canvas.height) {
            document.getElementById("msg17").textContent = "Le laser est sorti de l'écran.";
            return;
        }

        // Cible
        const d = distance17(next, { x: game17.target.x, y: game17.target.y });

        // ❌ Centre rouge → reset immédiat
        if (d <= game17.target.rInnerRed) {
            resetGame17();
            document.getElementById("msg17").textContent = "❌ Tu as touché le centre rouge ! Recommence.";
            return;
        }

        // 🎉 Couronne blanche → victoire
        if (d > game17.target.rWhiteInner && d <= game17.target.rWhiteOuter) {
            game17.path.push(next);
            document.getElementById("msg17").textContent = "🎉 Tu as touché la couronne blanche !";
            setTimeout(() => game17.onFinish && game17.onFinish(), 1500);
            return;
        }

        // Miroir ?
        const hit = findMirrorHit17(pos, next);
        if (hit) {
            const hitPoint = hit.point;
            game17.path.push(hitPoint);

            const mx = hit.mirror.x2 - hit.mirror.x1;
            const my = hit.mirror.y2 - hit.mirror.y1;
            const tangent = normalize17({ x: mx, y: my });
            const normal = { x: -tangent.y, y: tangent.x };

            const dot = dir.x * normal.x + dir.y * normal.y;
            dir = {
                x: dir.x - 2 * dot * normal.x,
                y: dir.y - 2 * dot * normal.y
            };
            dir = normalize17(dir);

            pos = { x: hitPoint.x, y: hitPoint.y };
            bounces++;
            if (bounces > maxBounces) {
                document.getElementById("msg17").textContent = "Trop de rebonds, le laser s'épuise.";
                return;
            }
            continue;
        }

        pos = next;
        game17.path.push({ x: pos.x, y: pos.y });
    }

    document.getElementById("msg17").textContent = "Le laser s'est dissipé.";
}

/* ------------------ RENDER ------------------ */

function renderLaserGame17() {
    const ctx = game17.ctx;
    const { width, height } = game17.canvas;

    ctx.fillStyle = "#050509";
    ctx.fillRect(0, 0, width, height);

    // Grille
    ctx.strokeStyle = "#111320";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 26) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    for (let y = 0; y < height; y += 26) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    drawTarget17(ctx, game17.target);

    // Miroirs
    for (const m of game17.mirrors) {
        ctx.strokeStyle = "#86eefa";
        ctx.lineWidth = 5;
        ctx.shadowColor = "#86eefa";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(m.x1, m.y1);
        ctx.lineTo(m.x2, m.y2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        const cx = (m.x1 + m.x2) / 2;
        const cy = (m.y1 + m.y2) / 2;
        ctx.fillStyle = "#afff9f";
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Laser
    if (game17.path.length > 1) {
        ctx.strokeStyle = "#ff3860";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#ff3860";
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.moveTo(game17.path[0].x, game17.path[0].y);
        for (let i = 1; i < game17.path.length; i++) {
            ctx.lineTo(game17.path[i].x, game17.path[i].y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // Point de départ
    ctx.fillStyle = "#ff9df8";
    ctx.beginPath();
    ctx.arc(game17.laserStart.x, game17.laserStart.y, 7, 0, Math.PI * 2);
    ctx.fill();
}

function drawTarget17(ctx, t) {
    ctx.save();
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 20;

    ctx.beginPath();
    ctx.fillStyle = "#1b1f3b";
    ctx.arc(t.x, t.y, t.rWhiteOuter + 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    ctx.arc(t.x, t.y, t.rWhiteOuter, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = "#050509";
    ctx.arc(t.x, t.y, t.rWhiteInner, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = "#ff3860";
    ctx.arc(t.x, t.y, t.rInnerRed, 0, Math.PI * 2);
    ctx.fill();
}

/* ------------------ UTILS ------------------ */

function normalize17(v) {
    const len = Math.hypot(v.x, v.y);
    return len === 0 ? { x: 0, y: 0 } : { x: v.x / len, y: v.y / len };
}

function distance17(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function pointToSegmentDistance17(p, a, b) {
    const ab = { x: b.x - a.x, y: b.y - a.y };
    const ap = { x: p.x - a.x, y: p.y - a.y };
    const ab2 = ab.x * ab.x + ab.y * ab.y;
    if (ab2 === 0) return distance17(p, a);
    let t = (ap.x * ab.x + ap.y * ab.y) / ab2;
    t = Math.max(0, Math.min(1, t));
    const proj = { x: a.x + ab.x * t, y: a.y + ab.y * t };
    return distance17(p, proj);
}

function segmentIntersection17(p1, p2, p3, p4) {
    const x1 = p1.x, y1 = p1.y;
    const x2 = p2.x, y2 = p2.y;
    const x3 = p3.x, y3 = p3.y;
    const x4 = p4.x, y4 = p4.y;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < 1e-6) return null;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return {
            x: x1 + t * (x2 - x1),
            y: y1 + t * (y2 - y1)
        };
    }
    return null;
}
