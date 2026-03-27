export function startGame13(container, onFinish) {
    if (!container) return;
  
    container.innerHTML = "";
  
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 600;
    canvas.style.display = "block";
    canvas.style.margin = "auto";
    canvas.style.background = "#020617";
    container.appendChild(canvas);
  
    const ctx = canvas.getContext("2d");
  
    // ---------------- PLAYER ----------------
    const player = {
      x: 60,
      y: 300,
      size: 12,
      speed: 2.2,
    };
  
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
  
      // passage étroit (clé du puzzle)
      { x: 300, y: 0, w: 20, h: 250 },
      { x: 300, y: 350, w: 20, h: 250 },
    ];
  
    // ---------------- DOORS ----------------
    const doors = [
      { x: 200, y: 400, w: 20, h: 100, open: false }, // bouton 1
      { x: 450, y: 100, w: 20, h: 100, open: false }, // bouton 2
    ];
  
    // ---------------- BUTTONS ----------------
    const buttons = [
      { x: 140, y: 300, size: 30, required: 28, type: "normal" }, // gros obligatoire
      { x: 380, y: 80, size: 30, required: 10, type: "normal" },  // petit obligatoire
    ];
  
    // ---------------- ZONES ----------------
    const growZones = [
      { x: 80, y: 100, w: 100, h: 120 }, // déplacée loin du bouton
    ];
  
    const shrinkZones = [
      { x: 320, y: 250, w: 100, h: 100 }, // après passage étroit
    ];
  
    const exit = { x: 820, y: 300, size: 20 };
  
    // ---------------- INPUT ----------------
    const keys = {};
    const down = (e) => (keys[e.key] = true);
    const up = (e) => (keys[e.key] = false);
  
    document.addEventListener("keydown", down);
    document.addEventListener("keyup", up);
  
    // ---------------- UTILS ----------------
    function collideRect(r) {
      return (
        player.x < r.x + (r.w || r.size) &&
        player.x + player.size > r.x &&
        player.y < r.y + (r.h || r.size) &&
        player.y + player.size > r.y
      );
    }
  
    function movePlayer() {
      let vx = 0;
      let vy = 0;
  
      if (keys["ArrowUp"]) vy = -player.speed;
      if (keys["ArrowDown"]) vy = player.speed;
      if (keys["ArrowLeft"]) vx = -player.speed;
      if (keys["ArrowRight"]) vx = player.speed;
  
      player.x += vx;
      walls.forEach((w) => collideRect(w) && (player.x -= vx));
      doors.forEach((d) => !d.open && collideRect(d) && (player.x -= vx));
  
      player.y += vy;
      walls.forEach((w) => collideRect(w) && (player.y -= vy));
      doors.forEach((d) => !d.open && collideRect(d) && (player.y -= vy));
    }
  
    // ---------------- UPDATE ----------------
    function update() {
      movePlayer();
  
      // 🟢 GROW
      growZones.forEach((z) => {
        if (collideRect(z)) {
          player.size = Math.min(40, player.size + 0.25);
        }
      });
  
      // 🔵 SHRINK
      shrinkZones.forEach((z) => {
        if (collideRect(z)) {
          player.size = Math.max(8, player.size - 0.2);
        }
      });
  
      // BUTTONS
      buttons.forEach((b, i) => {
        if (collideRect(b) && player.size >= b.required) {
          doors[i].open = true;
        }
      });
  
      // EXIT
      if (
        Math.hypot(player.x - exit.x, player.y - exit.y) <
        player.size + exit.size
      ) {
        endGame("🧠 Bien joué t’as compris le puzzle !");
      }
    }
  
    // ---------------- DRAW ----------------
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      ctx.fillStyle = "#0f172a";
      walls.forEach((w) => ctx.fillRect(w.x, w.y, w.w, w.h));
  
      doors.forEach((d) => {
        if (!d.open) {
          ctx.fillRect(d.x, d.y, d.w, d.h);
        }
      });
  
      // zones
      ctx.fillStyle = "rgba(34,197,94,0.3)";
      growZones.forEach((z) => ctx.fillRect(z.x, z.y, z.w, z.h));
  
      ctx.fillStyle = "rgba(59,130,246,0.3)";
      shrinkZones.forEach((z) => ctx.fillRect(z.x, z.y, z.w, z.h));
  
      // buttons
      buttons.forEach((b, i) => {
        ctx.fillStyle = doors[i].open ? "#22c55e" : "#facc15";
        ctx.fillRect(b.x, b.y, b.size, b.size);
      });
  
      // exit
      ctx.fillStyle = "#22c55e";
      ctx.beginPath();
      ctx.arc(exit.x, exit.y, exit.size, 0, Math.PI * 2);
      ctx.fill();
  
      // player
      ctx.fillStyle = "#60a5fa";
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
      ctx.fill();
    }
  
    // ---------------- LOOP ----------------
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