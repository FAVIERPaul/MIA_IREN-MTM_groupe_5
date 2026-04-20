import { gameManager } from "../gameCleanup.js";

export function startGame12(container, onFinish) {
  if (!container) return;

  container.innerHTML = "";

  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 600;
  canvas.style.background = "#0f172a"; 
  canvas.style.display = "block";
  canvas.style.margin = "auto";

  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  const player = {
    x: 300,
    y: 300,
    size: 8,
    speed: 2
  };

  let foods = [];
  let shrinkZones = [];

  const foodColors = ["#60a5fa", "#34d399", "#fbbf24", "#f87171"];
  const zoneColor = "rgba(59, 130, 246, 0.15)";

  let smallTime = 0;
  const requiredSmallTime = 20;

  const keys = {};

  function handleKeyDown(e) {
    keys[e.key] = true;
  }

  function handleKeyUp(e) {
    keys[e.key] = false;
  }

  gameManager.addEventListener(document, "keydown", handleKeyDown);
  gameManager.addEventListener(document, "keyup", handleKeyUp);

  function preventScroll(e) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
    }
  }
  gameManager.addEventListener(window, "keydown", preventScroll);

  function spawnFood() {
    
    foods.push({
      x: Math.random() * 600,
      y: Math.random() * 600,
      size: 6,
      color: foodColors[Math.floor(Math.random() * foodColors.length)]
    });
  }

  function spawnZone() {
    
    shrinkZones.push({
      x: Math.random() * 600,
      y: Math.random() * 600,
      radius: 50
    });
  }

  const foodInterval = gameManager.addInterval(setInterval(spawnFood, 900));
  const zoneInterval = gameManager.addInterval(setInterval(spawnZone, 2500));

  let running = true;

  function update() {
    
    
    if (keys["ArrowUp"]) player.y -= player.speed;
    if (keys["ArrowDown"]) player.y += player.speed;
    if (keys["ArrowLeft"]) player.x -= player.speed;
    if (keys["ArrowRight"]) player.x += player.speed;

    player.x = Math.max(player.size, Math.min(600 - player.size, player.x));
    player.y = Math.max(player.size, Math.min(600 - player.size, player.y));

    foods = foods.filter((f) => {
      const dx = player.x - f.x;
      const dy = player.y - f.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < player.size + f.size) {
        player.size += 1.5;
        return false;
      }
      return true;
    });

    shrinkZones.forEach((z) => {
      const dx = player.x - z.x;
      const dy = player.y - z.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < z.radius) {
        player.size -= 0.15;
      }
    });

    player.size = Math.max(4, player.size);

    if (player.size > 40) {
      endGame("💀 Trop gros !");
    }

    if (player.size <= 10) {
      smallTime += 1 / 60;
    } else {
      smallTime = 0;
    }

    if (smallTime >= requiredSmallTime) {
      endGame("🎉 Tu es resté petit 20s !");
    }
  }

  function draw() {
    ctx.clearRect(0, 0, 600, 600);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, 600, 600);

    foods.forEach((f) => {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      ctx.fillStyle = f.color;
      ctx.shadowColor = f.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    shrinkZones.forEach((z) => {
      ctx.beginPath();
      ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2);
      ctx.fillStyle = zoneColor;
      ctx.fill();
    });

    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fillStyle = player.size <= 10 ? "#22c55e" : "#ffffff";
    ctx.shadowColor = player.size <= 10 ? "#22c55e" : "#ffffff";
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = "16px Arial";
    ctx.fillStyle = "#e5e7eb";
    ctx.fillText(`Taille: ${player.size.toFixed(1)}`, 10, 25);
  }

  let animFrameId = null;
  function gameLoop() {
    
    update();
    draw();
    animFrameId = requestAnimationFrame(gameLoop);
    gameManager.addAnimationFrame(animFrameId);
  }

  function endGame(message) {
    running = false;

    const timeout = gameManager.addTimeout(setTimeout(() => {
      if (gameManager.isRunning) {
        gameManager.cleanup();
        alert(message);
        onFinish();
      }
    }, 100));
  }

  gameLoop(); 
}
