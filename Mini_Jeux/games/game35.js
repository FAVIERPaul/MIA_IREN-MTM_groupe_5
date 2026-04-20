import { createGameTitle } from "../gameInterface.js";

export function startGame35(container, onFinish) {
  if (!container) return;
  container.innerHTML = "";

  const title = createGameTitle(" Labyrinthe Neural");
  container.appendChild(title);

  const hud = document.createElement("div");
  hud.style.color = "#94a3b8";
  hud.style.textAlign = "center";
  hud.style.marginBottom = "10px";
  hud.innerHTML = "Trouve la sortie… mais tout n’est pas logique.";
  container.appendChild(hud);

  // VARIABLES AVANT UTILISATION
  const cols = 25;
  const rows = 15;
  const cellSize = 36;

  const canvas = document.createElement("canvas");
  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;
  canvas.style.display = "block";
  canvas.style.margin = "auto";
  canvas.style.border = "2px solid #0ea5e9";
  canvas.style.boxShadow = "0 0 30px #0ea5e955";
  canvas.style.borderRadius = "10px";
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  const grid = [];

  let seed = 1337;
  function random() {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  }

  function Cell(x, y) {
    this.x = x;
    this.y = y;
    this.walls = [true, true, true, true];
    this.visited = false;
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      grid.push(new Cell(x, y));
    }
  }

  function index(x, y) {
    if (x < 0 || y < 0 || x >= cols || y >= rows) return -1;
    return x + y * cols;
  }

  function removeWalls(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    if (dx === 1) { a.walls[3] = false; b.walls[1] = false; }
    if (dx === -1) { a.walls[1] = false; b.walls[3] = false; }
    if (dy === 1) { a.walls[0] = false; b.walls[2] = false; }
    if (dy === -1) { a.walls[2] = false; b.walls[0] = false; }
  }

  // ===== DFS =====
  let stack = [];
  let current = grid[0];
  current.visited = true;

  while (true) {
    const neighbors = [];

    const dirs = [
      grid[index(current.x, current.y - 1)],
      grid[index(current.x + 1, current.y)],
      grid[index(current.x, current.y + 1)],
      grid[index(current.x - 1, current.y)]
    ];

    dirs.forEach(n => n && !n.visited && neighbors.push(n));

    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(random() * neighbors.length)];
      next.visited = true;
      stack.push(current);
      removeWalls(current, next);
      current = next;
    } else if (stack.length > 0) {
      current = stack.pop();
    } else break;
  }

  // ===== LOOPS =====
  for (let i = 0; i < 120; i++) {
    const a = grid[Math.floor(random() * grid.length)];
    const b = grid[index(a.x + (random() > 0.5 ? 1 : 0), a.y + (random() > 0.5 ? 1 : 0))];
    if (b) removeWalls(a, b);
  }

  // ===== BREAK LONG WALLS =====
  for (let y = 0; y < rows; y++) {
    let streak = 0;
    for (let x = 0; x < cols - 1; x++) {
      const cell = grid[index(x, y)];
      const right = grid[index(x + 1, y)];

      if (cell.walls[1] && right.walls[3]) {
        streak++;
        if (streak > 2 && random() > 0.3) {
          removeWalls(cell, right);
          streak = 0;
        }
      } else streak = 0;
    }
  }

  for (let x = 0; x < cols; x++) {
    let streak = 0;
    for (let y = 0; y < rows - 1; y++) {
      const cell = grid[index(x, y)];
      const bottom = grid[index(x, y + 1)];

      if (cell.walls[2] && bottom.walls[0]) {
        streak++;
        if (streak > 2 && random() > 0.3) {
          removeWalls(cell, bottom);
          streak = 0;
        }
      } else streak = 0;
    }
  }

  // ===== SUPPRIME MUR BAS =====
  for (let x = 0; x < cols; x++) {
    const cell = grid[index(x, rows - 1)];
    cell.walls[2] = false;
  }

  // ===== PLAYER =====
  const player = {
    x: cellSize / 2,
    y: cellSize / 2,
    size: 10,
    speed: 2.2,
  };

  const exit = {
    x: (cols - 2) * cellSize + cellSize / 2,
    y: (rows - 2) * cellSize + cellSize / 2,
    size: 12,
  };

  const keys = {};
  document.addEventListener("keydown", e => keys[e.key] = true);
  document.addEventListener("keyup", e => keys[e.key] = false);

  function canMoveTo(nx, ny) {
    if (
      nx - player.size < 0 ||
      nx + player.size > canvas.width ||
      ny - player.size < 0 ||
      ny + player.size > canvas.height
    ) return false;

    const col = Math.floor(nx / cellSize);
    const row = Math.floor(ny / cellSize);
    const cell = grid[index(col, row)];
    if (!cell) return false;

    const offsetX = nx % cellSize;
    const offsetY = ny % cellSize;
    const margin = player.size;

    if (cell.walls[0] && offsetY < margin) return false;
    if (cell.walls[1] && offsetX > cellSize - margin) return false;
    if (cell.walls[2] && offsetY > cellSize - margin) return false;
    if (cell.walls[3] && offsetX < margin) return false;

    return true;
  }

  function movePlayer() {
    let vx = 0, vy = 0;

    if (keys["ArrowUp"]) vy -= player.speed;
    if (keys["ArrowDown"]) vy += player.speed;
    if (keys["ArrowLeft"]) vx -= player.speed;
    if (keys["ArrowRight"]) vx += player.speed;

    let nx = player.x + vx;
    if (canMoveTo(nx, player.y)) player.x = nx;

    let ny = player.y + vy;
    if (canMoveTo(player.x, ny)) player.y = ny;
  }

  function update() {
    movePlayer();
    if (Math.hypot(player.x - exit.x, player.y - exit.y) < 12) {
      endGame("🧠 Tu vois les patterns maintenant.");
    }
  }

  function draw() {
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    grid.forEach(cell => {
      const x = cell.x * cellSize;
      const y = cell.y * cellSize;

      if (cell.walls[0]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y); ctx.stroke(); }
      if (cell.walls[1]) { ctx.beginPath(); ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize); ctx.stroke(); }
      if (cell.walls[2]) { ctx.beginPath(); ctx.moveTo(x + cellSize, y + cellSize); ctx.lineTo(x, y + cellSize); ctx.stroke(); }
      if (cell.walls[3]) { ctx.beginPath(); ctx.moveTo(x, y + cellSize); ctx.lineTo(x, y); ctx.stroke(); }
    });

    // effet bas
    ctx.fillStyle = "rgba(14,165,233,0.05)";
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

    ctx.shadowColor = "#22c55e";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.arc(exit.x, exit.y, exit.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.shadowColor = "#60a5fa";
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#60a5fa";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
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
    alert(msg);
    onFinish && onFinish();
  }

  loop();
}