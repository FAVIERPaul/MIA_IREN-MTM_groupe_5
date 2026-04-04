export function startGame14(container, onFinish) {
  container.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = "Snake Inverse - But caché : devenir minuscule";
  title.style.textAlign = "center";
  title.style.color = "#1e4120";

  const status = document.createElement("div");
  status.style.margin = "6px 0";
  status.style.color = "#333";
  status.innerHTML = "Longueur : 8 | Manger = grandir, Mordre la queue = rétrécir";

  const info = document.createElement("p");
  info.style.color = "#555";
  info.style.fontSize = "14px";
  info.textContent = "Objectif caché : devenir le plus petit possible. Ne meurs pas !";

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 500;
  canvas.height = 500;
  canvas.style.border = "2px solid #2f4f4f";
  canvas.style.background = "#f0f8ff";

  const controls = document.createElement("p");
  controls.textContent = "MOZQ / flèches : déplacer";
  controls.style.color = "#333";

  container.appendChild(title);
  container.appendChild(status);
  container.appendChild(info);
  container.appendChild(canvas);
  container.appendChild(controls);

  const grid = 20;
  const cols = canvas.width / grid;
  const rows = canvas.height / grid;

  const snakeImg = new Image();
  snakeImg.src = "assets/images/serpent.png";

  const appleImgs = [new Image(), new Image()];
  appleImgs[0].src = ""; // pas nécessaire, on dessine à la volée
  appleImgs[1].src = "";

  let snake = [];
  let direction = { x: 1, y: 0 };
  let food = null;
  let running = true;

  const initialLength = 8;
  const minLength = 3;

  function reset() {
    snake = [];
    for (let i = 0; i < initialLength; i++) {
      snake.push({ x: 5 - i, y: 5 });
    }
    direction = { x: 1, y: 0 };
    placeFood();
    status.textContent = `Longueur : ${snake.length} | Manger = grandir, Mordre la queue = rétrécir`;
    running = true;
  }

  function placeFood() {
    let valid = false;
    while (!valid) {
      const x = Math.floor(Math.random() * cols);
      const y = Math.floor(Math.random() * rows);
      valid = !snake.some((seg) => seg.x === x && seg.y === y);
      if (valid) {
        const color = Math.random() < 0.5 ? "red" : "green";
        food = { x, y, color };
      }
    }
  }

  function drawSegment(seg, index) {
    const x = seg.x * grid;
    const y = seg.y * grid;

    const baseHue = 130;
    const hue = baseHue + (index % 6) * 5;
    const saturation = 70;
    const lightness = index === 0 ? 35 : 55 - (index % 4) * 5;

    const gradient = ctx.createLinearGradient(x, y, x + grid, y + grid);
    gradient.addColorStop(0, `hsl(${hue}, ${saturation}%, ${lightness}%)`);
    gradient.addColorStop(1, `hsl(${hue + 10}, ${saturation}%, ${Math.max(20, lightness - 15)}%)`);

    ctx.save();
    if (index === 0) {
      ctx.shadowColor = "rgba(255, 220, 120, 0.85)";
      ctx.shadowBlur = 12;
    } else {
      ctx.shadowColor = "rgba(120, 255, 120, 0.45)";
      ctx.shadowBlur = 8;
    }

    ctx.fillStyle = gradient;
    ctx.strokeStyle = "rgba(40, 80, 40, 0.85)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.roundRect(x + 1, y + 1, grid - 2, grid - 2, 6);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    if (index === 0) {
      // détails de tête
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(x + grid * 0.35, y + grid * 0.35, 2.3, 0, Math.PI * 2);
      ctx.arc(x + grid * 0.65, y + grid * 0.35, 2.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(x + grid * 0.35, y + grid * 0.35, 1.1, 0, Math.PI * 2);
      ctx.arc(x + grid * 0.65, y + grid * 0.35, 1.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#f52000";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + grid * 0.5, y + grid * 0.5);
      ctx.lineTo(x + grid * 0.5, y + grid * 0.84);
      ctx.stroke();

      ctx.fillStyle = "#ff4040";
      ctx.beginPath();
      ctx.moveTo(x + grid * 0.48, y + grid * 0.84);
      ctx.lineTo(x + grid * 0.52, y + grid * 0.84);
      ctx.lineTo(x + grid * 0.5, y + grid * 0.9);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawFood() {
    const x = food.x * grid;
    const y = food.y * grid;
    const gradient = ctx.createRadialGradient(x + grid / 2, y + grid / 2, 2, x + grid / 2, y + grid / 2, grid / 2);

    if (food.color === "green") {
      gradient.addColorStop(0, "#b9f2b9");
      gradient.addColorStop(1, "#2ca02c");
    } else {
      gradient.addColorStop(0, "#ffb3b3");
      gradient.addColorStop(1, "#d62828");
    }

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x + grid / 2, y + grid / 2, grid / 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#275113";
    ctx.fillRect(x + grid / 2 - 1, y + 2, 2, 6);
  }

  function draw() {
    const bg = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 50, canvas.width / 2, canvas.height / 2, canvas.width);
    bg.addColorStop(0, "#102a1c");
    bg.addColorStop(0.4, "#1f4a2f");
    bg.addColorStop(1, "#062016");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(181, 255, 191, 0.18)";
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

    drawFood();

    snake.forEach((segment, index) => {
      drawSegment(segment, index);
    });
  }

  function setStatus(text) {
    status.textContent = text;
  }

  const tickInterval = 120;
  let lastTick = 0;

  function step() {
    if (!running) return;

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
      const newX = (head.x + cols) % cols;
      const newY = (head.y + rows) % rows;
      snake.unshift({ x: newX, y: newY });
      for (let i = 0; i < 2; i++) snake.push({ ...snake[snake.length - 1] });
      setStatus(`Mur touché : +2 taille -> ${snake.length}. Evite de grandir trop.`);
      if (snake.length > 40) {
        setStatus('Trop grand, défaite. Partie redémarre.');
        running = false;
        setTimeout(() => {
          reset();
          requestAnimationFrame(loop);
        }, 1000);
        return;
      }
    } else {
      snake.unshift(head);
    }

    const collidedIndex = snake.slice(1).findIndex((seg) => seg.x === head.x && seg.y === head.y);
    if (collidedIndex >= 0) {
      const shrinkAmount = 2;
      let removed = 0;
      while (removed < shrinkAmount && snake.length > minLength) {
        snake.pop();
        removed++;
      }
      setStatus(`Auto-morsure : -${removed}. Longueur : ${snake.length}`);
      if (snake.length <= minLength) {
        setStatus('Objectif atteint 🎉');
        running = false;
        setTimeout(onFinish, 800);
        return;
      }
    }

    const ate = head.x === food.x && head.y === food.y;
    if (ate) {
      setStatus(`Pomme mangée ! +1. Longueur : ${snake.length}`);
      placeFood();
    } else {
      snake.pop();
    }

    if (snake.length <= minLength) {
      setStatus('Objectif atteint 🎉');
      running = false;
      setTimeout(onFinish, 800);
      return;
    }

    if (snake.length > 40) {
      setStatus('Trop grand, défaite. Partie redémarre.');
      running = false;
      setTimeout(() => {
        reset();
        requestAnimationFrame(loop);
      }, 1000);
      return;
    }

    draw();
  }

  function loop(timestamp) {
    if (!running) return;
    if (timestamp - lastTick > tickInterval) {
      lastTick = timestamp;
      step();
    }
    requestAnimationFrame(loop);
  }

  function handleKey(e) {
    const key = e.key.toLowerCase();
    if (key === "arrowup" || key === "z") {
      if (direction.y !== 1) direction = { x: 0, y: -1 };
    }
    if (key === "arrowdown" || key === "s") {
      if (direction.y !== -1) direction = { x: 0, y: 1 };
    }
    if (key === "arrowleft" || key === "q") {
      if (direction.x !== 1) direction = { x: -1, y: 0 };
    }
    if (key === "arrowright" || key === "d") {
      if (direction.x !== -1) direction = { x: 1, y: 0 };
    }
  }

  window.addEventListener("keydown", handleKey);

  reset();
  requestAnimationFrame(loop);
}
