import { createFeedbackDiv, setFeedback } from "../gameInterface.js";
import { gameManager } from "../gameCleanup.js";

export function startGame36(container, onFinish) {
  gameManager.cleanup();
  container.innerHTML = "";

  const feedbackDiv = createFeedbackDiv();
  container.appendChild(feedbackDiv);

  const canvas = document.createElement("canvas");
  const tileSize = 30;

  const map = [
    "11111111111111111111",
    "10000000000000000001",
    "10111101111101111101",
    "10000000000000000001",
    "10111111111111111101",
    "10000000000000000001",
    "11111111111111111111"
  ];

  canvas.width = map[0].length * tileSize;
  canvas.height = map.length * tileSize;
  canvas.style.border = "2px solid #00f5ff";
  canvas.style.background = "black";
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  let player = { x: 1, y: 1 };
  let ghost = { x: 18, y: 5 };

  let direction = 0; // orientation Pacman
  let frameCount = 0;

  const keys = {};

  function down(e) { keys[e.key] = true; }
  function up(e) { keys[e.key] = false; }

  gameManager.addEventListener(document, "keydown", down);
  gameManager.addEventListener(document, "keyup", up);

  function canMove(x, y) {
    if (y < 0 || y >= map.length) return false;
    if (x < 0 || x >= map[0].length) return false;
    return map[y][x] !== "1";
  }

  function move(entity, dx, dy) {
    const nx = entity.x + dx;
    const ny = entity.y + dy;
    if (canMove(nx, ny)) {
      entity.x = nx;
      entity.y = ny;
    }
  }

  function update() {
    let dx = 0, dy = 0;

    if (keys["ArrowUp"]) {
      dy = -1;
      direction = -Math.PI / 2;
    }
    if (keys["ArrowDown"]) {
      dy = 1;
      direction = Math.PI / 2;
    }
    if (keys["ArrowLeft"]) {
      dx = -1;
      direction = Math.PI;
    }
    if (keys["ArrowRight"]) {
      dx = 1;
      direction = 0;
    }

    move(player, dx, dy);

    // ghost lent
    frameCount++;
    if (frameCount % 12 === 0) {
      if (ghost.x < player.x) move(ghost, 1, 0);
      else if (ghost.x > player.x) move(ghost, -1, 0);
      else if (ghost.y < player.y) move(ghost, 0, 1);
      else if (ghost.y > player.y) move(ghost, 0, -1);
    }

    // condition 
    if (ghost.x === player.x && ghost.y === player.y) {
      win();
    }
  }

  function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // murs
    ctx.fillStyle = "#00f5ff";
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        if (map[y][x] === "1") {
          ctx.fillRect(
            x * tileSize + 3,
            y * tileSize + 3,
            tileSize - 6,
            tileSize - 6
          );
        }
      }
    }

    //  PACMAN orienté
    const time = Date.now() / 120;
    const mouth = Math.abs(Math.sin(time)) * 0.6;

    const px = player.x * tileSize + tileSize / 2;
    const py = player.y * tileSize + tileSize / 2;

    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.moveTo(px, py);

    ctx.arc(
      px,
      py,
      12,
      direction + mouth,
      direction + Math.PI * 2 - mouth
    );

    ctx.closePath();
    ctx.fill();

    // 👻 fantôme
    const gx = ghost.x * tileSize + tileSize / 2;
    const gy = ghost.y * tileSize + tileSize / 2;

    ctx.fillStyle = "red";
    ctx.fillRect(gx - 12, gy - 8, 24, 16);

    ctx.beginPath();
    ctx.arc(gx, gy - 8, 12, Math.PI, 0);
    ctx.fill();

    // yeux
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(gx - 5, gy - 8, 3, 0, Math.PI * 2);
    ctx.arc(gx + 5, gy - 8, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(gx - 5, gy - 8, 1.5, 0, Math.PI * 2);
    ctx.arc(gx + 5, gy - 8, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // texte troll
    ctx.fillStyle = "#fff";
    ctx.font = "14px monospace";
    ctx.fillText("Survis le plus longtemps possible...", 10, 20);
  }

  function win() {
    gameManager.cleanup();
    setFeedback(feedbackDiv, true, "🎉 Bien joué… tu as perdu !");
    gameManager.addTimeout(setTimeout(onFinish, 1200));
  }

  function loop() {
    update();
    draw();
    const frame = requestAnimationFrame(loop);
    gameManager.addAnimationFrame(frame);
  }

  loop();
}