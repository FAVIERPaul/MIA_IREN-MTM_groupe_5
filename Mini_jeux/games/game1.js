import { createGameTitle, createFeedbackDiv, setFeedback } from "../gameInterface.js";
import { gameManager } from "../gameCleanup.js";

export function startGame1(container, onFinish) {
  container.innerHTML = "";

  const title = createGameTitle("Pizza Cut");
  const feedbackDiv = createFeedbackDiv();
  container.appendChild(title);
  container.appendChild(feedbackDiv);

  const canvas = document.createElement("canvas");
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  canvas.width = 600;
  canvas.height = 600;

  const center = { x: 300, y: 300 };
  const radius = 250;

  // --- IMAGES ---
  const pizzaImg = new Image();
  pizzaImg.src = "assets/pizza.png"; // ta pizza réaliste (celle que tu as envoyée)

  const knifeImg = new Image();
  knifeImg.src = "assets/knife.png"; // couteau vu du dessus, fond transparent

  let cuts = [];
  let mouse = { x: 0, y: 0, isDown: false };

  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }

  function onMouseDown() {
    mouse.isDown = true;
  }

  function onMouseUp() {
    if (!mouse.isDown) return;
    mouse.isDown = false;

    const angle = Math.atan2(mouse.y - center.y, mouse.x - center.x);

    cuts.push({
      angle,
      x1: center.x,
      y1: center.y,
      x2: center.x + Math.cos(angle) * radius,
      y2: center.y + Math.sin(angle) * radius
    });

    checkWin();
  }

  gameManager.addEventListener(canvas, "mousemove", onMouseMove);
  gameManager.addEventListener(canvas, "mousedown", onMouseDown);
  gameManager.addEventListener(canvas, "mouseup", onMouseUp);

  // --- PIZZA STATIQUE ---
  function drawPizza() {
    ctx.drawImage(pizzaImg, center.x - radius, center.y - radius, radius * 2, radius * 2);
  }

  // --- TRAITS BLANCS DE COUPE ---
  function drawCuts() {
    cuts.forEach(c => {
      ctx.save();
      ctx.strokeStyle = "white"; // couleur du fond, comme sur ton image
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(c.x1, c.y1);
      ctx.lineTo(c.x2, c.y2);
      ctx.stroke();
      ctx.restore();
    });
  }

  // --- COUTEAU PNG ---
  function drawKnife() {
    ctx.save();
    const angle = Math.atan2(mouse.y - center.y, mouse.x - center.x);
    ctx.translate(mouse.x, mouse.y);
    ctx.rotate(angle);

    const scale = 0.4;
    ctx.drawImage(
      knifeImg,
      -knifeImg.width * scale / 2,
      -knifeImg.height * scale / 2,
      knifeImg.width * scale,
      knifeImg.height * scale
    );

    ctx.restore();
  }

  // --- CHECK WIN ---
  function checkWin() {
    if (cuts.length < 4) return;

    const angles = cuts.map(c => c.angle).sort((a, b) => a - b);

    let parts = [];
    for (let i = 0; i < angles.length; i++) {
      const a1 = angles[i];
      const a2 = angles[(i + 1) % angles.length];
      let diff = a2 - a1;
      if (diff < 0) diff += Math.PI * 2;
      parts.push(diff);
    }

    const min = Math.min(...parts);
    const max = Math.max(...parts);

    if (min / max < 0.8) {
      cuts = [];
      setFeedback(feedbackDiv, false, "✗ Les parts sont trop similaires !");
      return;
    }

    onWin();
  }

  function onWin() {
    gameManager.cleanup();
    setFeedback(feedbackDiv, true, "✓ Bien joué !");
    gameManager.addTimeout(setTimeout(onFinish, 500));
  }

  // --- LOOP ---
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPizza();
    drawCuts();
    drawKnife();
    requestAnimationFrame(draw);
  }

  draw();
}