export function startGame13(container, onFinish) {
  if (!container) return;

  container.innerHTML = "";

  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 600;
  canvas.style.display = "block";
  canvas.style.margin = "auto";
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  const player = {
    x: 60,
    y: 300,
    size: 12,
    speed: 2.2,
  };

  let time = 0;
  let exitTimer = 0;

  // ---------------- WALLS ----------------
  const walls = [
    { x: 0, y: 0, w: 900, h: 20 },
    { x: 0, y: 580, w: 900, h: 20 },
    { x: 0, y: 0, w: 20, h: 600 },
    { x: 880, y: 0, w: 20, h: 600 },

    { x: 200, y: 0, w: 20, h: 400 },
    { x: 200, y: 500, w: 20, h: 100 },

    { x: 450, y: 200, w: 20, h: 400 },
    { x: 450, y: 0, w: 20, h: 100 },

    { x: 300, y: 0, w: 20, h: 250 },
    { x: 300, y: 350, w: 20, h: 250 },

    { x: 450, y: 100, w: 20, h: 40 },
    { x: 450, y: 160, w: 20, h: 40 },
  ];

  const doors = [
    { x: 200, y: 400, w: 20, h: 100, open: false },
    { x: 450, y: 140, w: 20, h: 20, open: false },
  ];

  const buttons = [
    { x: 140, y: 300, size: 30, min: 22, max: 30, activated: false },
    { x: 380, y: 80, size: 30, min: 13, max: 17, activated: false },
  ];

  const growZones = [{ x: 80, y: 100, w: 100, h: 120 }];

  const shrinkZones = [
    { x: 60, y: 350, w: 100, h: 100 },
    { x: 320, y: 250, w: 100, h: 100 },
  ];

  const exit = { x: 820, y: 300, size: 20 };

  const keys = {};
  const down = (e) => (keys[e.key] = true);
  const up = (e) => (keys[e.key] = false);

  document.addEventListener("keydown", down);
  document.addEventListener("keyup", up);

  // 🔥 COLLISION PROPRE
  function collideRect(r) {
    const padding = 0.5;

    const rx = r.x - padding;
    const ry = r.y - padding;
    const rw = (r.w || r.size) + padding * 2;
    const rh = (r.h || r.size) + padding * 2;

    const closestX = Math.max(rx, Math.min(player.x, rx + rw));
    const closestY = Math.max(ry, Math.min(player.y, ry + rh));

    const dx = player.x - closestX;
    const dy = player.y - closestY;

    return dx * dx + dy * dy < player.size * player.size;
  }

  function isColliding() {
    return (
      walls.some(collideRect) ||
      doors.some((d) => !d.open && collideRect(d))
    );
  }

  // 🔥 MOUVEMENT ULTRA STABLE (SUBSTEPS)
  function movePlayer() {
    let vx = 0;
    let vy = 0;

    if (keys["ArrowUp"]) vy = -player.speed;
    if (keys["ArrowDown"]) vy = player.speed;
    if (keys["ArrowLeft"]) vx = -player.speed;
    if (keys["ArrowRight"]) vx = player.speed;

    const steps = 4; // 🔥 clé anti glitch
    const stepX = vx / steps;
    const stepY = vy / steps;

    for (let i = 0; i < steps; i++) {
      player.x += stepX;
      if (isColliding()) player.x -= stepX;

      player.y += stepY;
      if (isColliding()) player.y -= stepY;
    }
  }

  function changeSize(amount, min, max) {
    const oldSize = player.size;
    player.size = Math.max(min, Math.min(max, player.size + amount));

    if (isColliding()) player.size = oldSize;
  }

  function rect(x, y, w, h) {
    ctx.fillRect(x, y, w, h);
  }

  function roundRect(x, y, w, h, r) {
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
  }

  function isPlayerFullyInsideExit() {
    const dx = player.x - exit.x;
    const dy = player.y - exit.y;
    const distance = Math.hypot(dx, dy);
    return distance + player.size <= exit.size;
  }

  function update() {
    movePlayer();
    time += 0.05;

    growZones.forEach((z) => {
      if (collideRect(z)) changeSize(0.25, 5, 40);
    });

    shrinkZones.forEach((z) => {
      if (collideRect(z)) changeSize(-0.2, 5, 40);
    });

    buttons.forEach((b, i) => {
      if (b.activated) return;

      if (
        collideRect(b) &&
        player.size >= b.min &&
        player.size <= b.max
      ) {
        b.activated = true;
        doors[i].open = true;
      }
    });

    if (isPlayerFullyInsideExit()) {
      exitTimer++;
      if (exitTimer > 60) {
        endGame("🧠 Bien joué t’as compris le puzzle !");
      }
    } else {
      exitTimer = 0;
    }
  }

  function draw() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#020617");
    gradient.addColorStop(1, "#0f172a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#1e293b";
    walls.forEach((w) => rect(w.x, w.y, w.w, w.h));

    doors.forEach((d) => {
      if (!d.open) {
        ctx.fillStyle = "#475569";
        rect(d.x, d.y, d.w, d.h);
      }
    });

    const pulse = Math.sin(time) * 0.1 + 0.3;

    ctx.fillStyle = `rgba(34,197,94,${pulse})`;
    growZones.forEach((z) => roundRect(z.x, z.y, z.w, z.h, 10));

    ctx.fillStyle = `rgba(59,130,246,${pulse})`;
    shrinkZones.forEach((z) => roundRect(z.x, z.y, z.w, z.h, 10));

    buttons.forEach((b) => {
      if (b.activated) ctx.fillStyle = "#22c55e";
      else if (player.size > b.max) ctx.fillStyle = "#ef4444";
      else if (player.size < b.min) ctx.fillStyle = "#3b82f6";
      else ctx.fillStyle = "#facc15";

      roundRect(b.x, b.y, b.size, b.size, 8);
    });

    const active = isPlayerFullyInsideExit();
    ctx.fillStyle = active ? "#4ade80" : "#22c55e";

    ctx.beginPath();
    ctx.arc(exit.x, exit.y, exit.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#60a5fa";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fill();
  }

  let running = true;

  function loop() {
    if (!running) return;
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function endGame(msg) {
    running = false;
    document.removeEventListener("keydown", down);
    document.removeEventListener("keyup", up);
    alert(msg);
    onFinish && onFinish();
  }

  loop();
}