export function startGame1(container, onFinish) {
  container.innerHTML = "";

  const canvas = document.createElement("canvas");
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  canvas.width = 600;
  canvas.height = 600;

  const tileSize = 60;

  const level = {
    map: [
      [1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,1,0,0,0,0,1],
      [1,0,1,0,1,0,1,1,0,1],
      [1,0,1,0,0,0,0,1,0,1],
      [1,0,1,1,1,1,0,1,0,1],
      [1,0,0,0,0,1,0,0,0,1],
      [1,1,1,1,0,1,1,1,0,1],
      [1,0,0,1,0,0,0,1,0,1],
      [1,0,0,0,0,1,0,0,2,1],
      [1,1,1,1,1,1,1,1,1,1]
    ],
    playerStart: { x: 1, y: 1 },
    controls: { up: "s", down: "z", left: "e", right: "a" }
  };

  let player = { ...level.playerStart };
  let keys = {};

  document.onkeydown = (e) => keys[e.key.toLowerCase()] = true;
  document.onkeyup = (e) => keys[e.key.toLowerCase()] = false;

  function move(dx, dy) {
    let newX = player.x + dx;
    let newY = player.y + dy;

    if (level.map[newY][newX] !== 1) {
      player.x = newX;
      player.y = newY;

      if (level.map[newY][newX] === 2) {
        setTimeout(() => {
          onFinish(); // 🔥 IMPORTANT
        }, 200);
      }
    }
  }

  function update() {
    const c = level.controls;

    if (keys[c.up]) move(0, -1);
    if (keys[c.down]) move(0, 1);
    if (keys[c.left]) move(-1, 0);
    if (keys[c.right]) move(1, 0);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < level.map.length; y++) {
      for (let x = 0; x < level.map[y].length; x++) {
        let tile = level.map[y][x];

        ctx.fillStyle = tile === 1 ? "white" : tile === 2 ? "green" : "black";
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }

    ctx.fillStyle = "red";
    ctx.fillRect(
      player.x * tileSize + 10,
      player.y * tileSize + 10,
      tileSize - 20,
      tileSize - 20
    );
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  loop();
}