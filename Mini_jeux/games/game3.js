export function startGame3(container, onFinish) {
  container.innerHTML = "";
  
  const instructions = document.createElement("div");
  instructions.style.cssText = `
    background: rgba(106, 90, 205, 0.2);
    border: 2px solid #836fff;
    border-radius: 12px;
    padding: 15px;
    margin-bottom: 20px;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  `;
  instructions.innerHTML = `
    <h3 style="margin-top: 0; color: #a28bff;">⚠️ LABYRINTHE INVISIBLE</h3>
    <p style="font-size: 14px; margin: 10px 0;">Les murs sont cachés. Trouve ton chemin !</p>
    <div id="controls" style="font-size: 16px; color: #6a5acd; font-weight: bold; margin-top: 10px;"></div>
  `;

  const canvas = document.createElement("canvas");
  container.appendChild(instructions);
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  canvas.width = 700;
  canvas.height = 700;

  const tileSize = 70;

  // 🗺️ Labyrinthe très complexe
  const level = {
    map: [
      [1,1,1,1,1,1,1,1,1,1],
      [1,0,1,0,0,0,1,0,0,1],
      [1,0,1,0,1,0,1,0,1,1],
      [1,0,0,0,1,0,0,0,0,1],
      [1,1,1,0,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,1,0,1],
      [1,0,1,1,1,1,0,1,0,1],
      [1,0,0,0,0,1,0,0,0,1],
      [1,1,1,1,0,0,0,1,2,1],
      [1,1,1,1,1,1,1,1,1,1]
    ],
    playerStart: { x: 1, y: 1 }
  };

  // 🎲 Génération de touches ALÉATOIRES (dispersées sur le clavier)
  const allKeys = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 
    'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 
    'u', 'v', 'w', 'x', 'y', 'z', '1', '2', '3', '4',
    '5', '6', '7', '8', '9', '0'
  ];

  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const shuffledKeys = shuffleArray(allKeys);
  const controls = {
    up: shuffledKeys[0],
    down: shuffledKeys[1],
    left: shuffledKeys[2],
    right: shuffledKeys[3]
  };

  // Affichage des contrôles
  document.getElementById('controls').innerHTML = `
    Haut: <span style="color: #fff; background: #6a5acd; padding: 3px 8px; border-radius: 5px;">${controls.up.toUpperCase()}</span> | 
    Bas: <span style="color: #fff; background: #6a5acd; padding: 3px 8px; border-radius: 5px;">${controls.down.toUpperCase()}</span> | 
    Gauche: <span style="color: #fff; background: #6a5acd; padding: 3px 8px; border-radius: 5px;">${controls.left.toUpperCase()}</span> | 
    Droite: <span style="color: #fff; background: #6a5acd; padding: 3px 8px; border-radius: 5px;">${controls.right.toUpperCase()}</span>
  `;

  let player = { ...level.playerStart };
  let keys = {};
  let trail = []; // Trace du chemin parcouru

  document.onkeydown = (e) => keys[e.key.toLowerCase()] = true;
  document.onkeyup = (e) => keys[e.key.toLowerCase()] = false;

  function move(dx, dy) {
    let newX = player.x + dx;
    let newY = player.y + dy;

    if (level.map[newY][newX] !== 1) {
      // Ajoute la position actuelle à la trace
      trail.push({ x: player.x, y: player.y });
      if (trail.length > 15) trail.shift(); // Limite la trace

      player.x = newX;
      player.y = newY;

      if (level.map[newY][newX] === 2) {
        setTimeout(() => {
          onFinish();
        }, 300);
      }
    }
  }

  function update() {
    if (keys[controls.up]) move(0, -1);
    if (keys[controls.down]) move(0, 1);
    if (keys[controls.left]) move(-1, 0);
    if (keys[controls.right]) move(1, 0);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fond noir (rien n'est visible)
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 🎯 Départ (vert fluo pulsant)
    const startX = level.playerStart.x * tileSize;
    const startY = level.playerStart.y * tileSize;
    const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
    
    ctx.shadowBlur = 20;
    ctx.shadowColor = "lime";
    ctx.fillStyle = `rgba(0, 255, 0, ${pulse})`;
    ctx.fillRect(startX, startY, tileSize, tileSize);
    ctx.shadowBlur = 0;

    // 🏁 Arrivée (rouge fluo pulsant)
    for (let y = 0; y < level.map.length; y++) {
      for (let x = 0; x < level.map[y].length; x++) {
        if (level.map[y][x] === 2) {
          const endPulse = Math.sin(Date.now() / 250) * 0.3 + 0.7;
          ctx.shadowBlur = 25;
          ctx.shadowColor = "red";
          ctx.fillStyle = `rgba(255, 0, 0, ${endPulse})`;
          ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
          ctx.shadowBlur = 0;
        }
      }
    }

    // 👣 Trace du chemin (s'estompe progressivement)
    trail.forEach((pos, i) => {
      const alpha = (i / trail.length) * 0.4;
      ctx.fillStyle = `rgba(131, 111, 255, ${alpha})`;
      ctx.fillRect(
        pos.x * tileSize + 15,
        pos.y * tileSize + 15,
        tileSize - 30,
        tileSize - 30
      );
    });

    // 🔴 Joueur (avec halo lumineux)
    ctx.shadowBlur = 30;
    ctx.shadowColor = "#836fff";
    ctx.fillStyle = "#a28bff";
    ctx.beginPath();
    ctx.arc(
      player.x * tileSize + tileSize / 2,
      player.y * tileSize + tileSize / 2,
      tileSize / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  loop();
}