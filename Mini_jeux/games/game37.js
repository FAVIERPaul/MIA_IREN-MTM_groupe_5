import { createInputField, createValidationButton, createFeedbackDiv, setFeedback } from "../gameInterface.js";
import { gameManager } from "../gameCleanup.js";

export function startGame37(container, onFinish) {
  const levels = [
  {
    question: "Let's snake!"
  }
  ];
  container.innerHTML = "";

  // --- UI ---
  const title = document.createElement("h2");
  title.textContent = "Snake Futuriste – Grandis avec les objets";
  title.style.textAlign = "center";
  title.style.color = "#7dd3ff";

  const status = document.createElement("div");
  status.style.margin = "6px 0";
  status.style.color = "#bfeaff";

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 520;
  canvas.height = 520;
  canvas.style.border = "2px solid #4fc3f7";
  canvas.style.background = "#031526";

  container.appendChild(title);
  container.appendChild(status);
  container.appendChild(canvas);

  // --- CONFIG ---
  const grid = 20;
  const cols = canvas.width / grid;
  const rows = canvas.height / grid;

  const TARGET_SIZE = 25;
  const MIN_SIZE = 4;

  let snake = [];
  let direction = { x: 1, y: 0 };
  let nextDirection = { x: 1, y: 0 };
  let items = [];
  let obstacles = [];
  let speed = 130;
  let lastTick = 0;
  let running = true;

  // --- INIT ---
  function reset() {
    snake = [];
    for (let i = 0; i < MIN_SIZE + 2; i++) {
      snake.push({ x: 5 - i, y: 5 });
    }
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    items = [];
    obstacles = [];
    spawnObstacles();
    for (let i = 0; i < 3; i++) spawnItem();
    updateStatus();
    running = true;
    lastTick = 0;
  }

  function updateStatus() {
    status.textContent = `Taille : ${snake.length} / ${TARGET_SIZE}`;
  }

  // --- OBSTACLES ---
  function spawnObstacles() {
    const count = 3; // moins d'obstacles
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * cols);
      const y = Math.floor(Math.random() * rows);
      obstacles.push({ x, y });
    }
  }

  // --- ITEMS ---
  function spawnItem() {
    const types = [
      { type: "object", color: "#4fc3f7", emoji: "🔧", weight: 3 },
      { type: "object", color: "#4fc3f7", emoji: "🔨", weight: 3 },
      { type: "food", color: "#ff5252", emoji: "🍎", weight: 3 },
      { type: "food", color: "#ffca28", emoji: "🍌", weight: 3 },
      { type: "speed", color: "#69f0ae", emoji: "🍏", weight: 1 }
    ];

    // pondération
    const pool = [];
    types.forEach(t => { for (let i = 0; i < t.weight; i++) pool.push(t); });

    let valid = false;
    while (!valid) {
      const x = Math.floor(Math.random() * cols);
      const y = Math.floor(Math.random() * rows);
      valid =
        !snake.some(s => s.x === x && s.y === y) &&
        !obstacles.some(o => o.x === x && o.y === y) &&
        !items.some(it => it.x === x && it.y === y);

      if (valid) {
        const item = pool[Math.floor(Math.random() * pool.length)];
        items.push({ x, y, ...item });
      }
    }
  }

  // --- DRAW ---
  function draw() {
    // fond futuriste
    const bg = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 40,
      canvas.width / 2, canvas.height / 2, canvas.width
    );
    bg.addColorStop(0, "#083a63");
    bg.addColorStop(1, "#031526");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // grille lumineuse
    ctx.strokeStyle = "rgba(100,200,255,0.18)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * grid, 0);
      ctx.lineTo(i * grid, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i <= rows; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * grid);
      ctx.lineTo(canvas.width, i * grid);
      ctx.stroke();
    }

    // obstacles stylisés
    obstacles.forEach(o => {
      ctx.fillStyle = "#0a3d66";
      ctx.shadowColor = "#4fc3f7";
      ctx.shadowBlur = 10;
      ctx.fillRect(o.x * grid + 3, o.y * grid + 3, grid - 6, grid - 6);
      ctx.shadowBlur = 0;
    });

    // items
    items.forEach(it => {
      ctx.fillStyle = it.color;
      ctx.font = "18px sans-serif";
      ctx.fillText(it.emoji, it.x * grid + 4, it.y * grid + 16);
    });

    // serpent
    snake.forEach((seg, i) => {
      const x = seg.x * grid;
      const y = seg.y * grid;

      const grad = ctx.createLinearGradient(x, y, x + grid, y + grid);
      grad.addColorStop(0, "#4fc3f7");
      grad.addColorStop(1, "#b3e5fc");

      ctx.fillStyle = grad;
      ctx.shadowColor = "#81d4fa";
      ctx.shadowBlur = i === 0 ? 14 : 6;
      ctx.fillRect(x + 2, y + 2, grid - 4, grid - 4);
      ctx.shadowBlur = 0;
    });
  }

  // --- UPDATE ---
  function step() {
    direction = nextDirection;

    const head = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y
    };

    // murs
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
      running = false;
      status.textContent = "Collision murale ❌";
      setTimeout(() => {
        reset();
        requestAnimationFrame(loop);
      }, 900);
      return;
    }

    // obstacles
    if (obstacles.some(o => o.x === head.x && o.y === head.y)) {
      running = false;
      status.textContent = "Obstacle touché ❌";
      setTimeout(() => {
        reset();
        requestAnimationFrame(loop);
      }, 900);
      return;
    }

    // queue
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
      running = false;
      status.textContent = "Auto-collision ❌";
      setTimeout(() => {
        reset();
        requestAnimationFrame(loop);
      }, 900);
      return;
    }

    snake.unshift(head);

    // item ?
    const itemIndex = items.findIndex(it => it.x === head.x && it.y === head.y);
    if (itemIndex >= 0) {
      const it = items[itemIndex];

      if (it.type === "object") {
        // grandit
      } else if (it.type === "food") {
        snake.pop();
        snake.pop();
      } else if (it.type === "speed") {
        speed = 80;
        setTimeout(() => speed = 130, 4000);
      }

      items.splice(itemIndex, 1);
      while (items.length < 3) spawnItem();
    } else {
      snake.pop();
    }

    updateStatus();

    if (snake.length >= TARGET_SIZE) {
      status.textContent = "Objectif atteint 🎉";
      running = false;
      setTimeout(onFinish, 800);
    }
  }

  // --- LOOP ---
  function loop(ts) {
    if (!running) return;
    if (ts - lastTick > speed) {
      lastTick = ts;
      step();
    }
    draw();
    requestAnimationFrame(loop);
  }

  // --- INPUT ---
  window.onkeydown = e => {
    const k = e.key.toLowerCase();

    if ((k === "arrowup" || k === "z") && direction.y !== 1)
      nextDirection = { x: 0, y: -1 };

    if ((k === "arrowdown" || k === "s") && direction.y !== -1)
      nextDirection = { x: 0, y: 1 };

    if ((k === "arrowleft" || k === "q") && direction.x !== 1)
      nextDirection = { x: -1, y: 0 };

    if ((k === "arrowright" || k === "d") && direction.x !== -1)
      nextDirection = { x: 1, y: 0 };
  };

  reset();
  requestAnimationFrame(loop);
}