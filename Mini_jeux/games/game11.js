import { createGameTitle, setFeedback } from "../gameInterface.js";
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function startGame11(container, onFinish) {
  container.innerHTML = "";

  const app = document.createElement("div");
  app.style.fontFamily = "Arial, sans-serif";
  app.style.color = "#222";
  app.style.padding = "10px";
  app.style.background = "#d6c8a3";
  app.style.borderRadius = "12px";

  const title = createGameTitle("Shape Matcher 3D");
  title.style.color = "#222";
  title.style.textShadow = "1px 1px 3px rgba(0,0,0,0.2)";

  const info = document.createElement("div");
  info.style.display = "flex";
  info.style.justifyContent = "space-between";
  info.style.marginBottom = "8px";

  const scoreEl = document.createElement("span" );
  scoreEl.textContent = "Réussi: 0/5";
  const timerEl = document.createElement("span");
  timerEl.textContent = "Temps: 00:00";

  info.appendChild(scoreEl);
  info.appendChild(timerEl);

  const main = document.createElement("div");
  main.style.display = "grid";
  main.style.gridTemplateColumns = "1fr 1fr";
  main.style.gap = "12px";

  const svgWrapper = document.createElement("div");
  svgWrapper.style.border = "2px solid #a18564";
  svgWrapper.style.borderRadius = "10px";
  svgWrapper.style.background = "linear-gradient(120deg, #f5eedb, #f1e2b5)";
  svgWrapper.style.padding = "8px";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "620");
  svg.setAttribute("height", "360");
  svg.style.display = "block";
  svg.style.width = "100%";
  svg.style.height = "360px";
  svgWrapper.appendChild(svg);

  const threeWrapper = document.createElement("div");
  threeWrapper.style.border = "2px solid #a18564";
  threeWrapper.style.borderRadius = "10px";
  threeWrapper.style.background = "#eeedec";
  threeWrapper.style.height = "360px";
  threeWrapper.style.position = "relative";

  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  threeWrapper.appendChild(canvas);

  main.appendChild(svgWrapper);
  main.appendChild(threeWrapper);

  const actions = document.createElement("div");
  actions.style.marginTop = "10px";
  actions.style.display = "flex";
  actions.style.gap = "8px";

  const resetBtn = document.createElement("button");
  resetBtn.textContent = "Réinitialiser";
  resetBtn.style.padding = "6px 10px";

  const instructBtn = document.createElement("button");
  instructBtn.textContent = "Instructions";
  instructBtn.style.padding = "6px 10px";

  const feedback = document.createElement("div");
  feedback.style.marginTop = "8px";
  feedback.style.minHeight = "22px";
  feedback.style.fontWeight = "bold";

  actions.appendChild(resetBtn);
  actions.appendChild(instructBtn);

  app.appendChild(title);
  app.appendChild(info);
  app.appendChild(main);
  app.appendChild(actions);
  app.appendChild(feedback);
  container.appendChild(app);

  const shapes2D = [
    { id: "cercle", cotes: 0, couleur: "cyan", x: 120, y: 100 },
    { id: "triangle", cotes: 3, couleur: "orange", x: 320, y: 100 },
    { id: "carre", cotes: 4, couleur: "yellow", x: 520, y: 100 },
    { id: "pentagone", cotes: 5, couleur: "pink", x: 220, y: 260 },
    { id: "hexagone", cotes: 6, couleur: "lime", x: 420, y: 260 }
  ];

  const zones = [];

  function createPolygonPoints(cx, cy, r, sides) {
    const points = [];
    for (let i = 0; i < sides; i += 1) {
      const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      points.push(`${px},${py}`);
    }
    return points.join(" ");
  }

  function draw2D() {
    svg.innerHTML = "";
    zones.length = 0;
    shapes2D.forEach((s) => {
      const zone = document.createElementNS("http://www.w3.org/2000/svg", "g");
      const back = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      back.setAttribute("x", s.x - 48);
      back.setAttribute("y", s.y - 48);
      back.setAttribute("width", 96);
      back.setAttribute("height", 96);
      back.setAttribute("rx", 16);
      back.setAttribute("fill", "rgba(255,255,255,0.12)");
      back.setAttribute("stroke", "#fff");
      back.setAttribute("stroke-width", "2");
      zone.appendChild(back);

      if (s.cotes === 0) {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", s.x);
        circle.setAttribute("cy", s.y);
        circle.setAttribute("r", 34);
        circle.setAttribute("fill", "none");
        circle.setAttribute("stroke", s.couleur);
        circle.setAttribute("stroke-width", "6");
        circle.setAttribute("stroke-dasharray", "4 4");
        zone.appendChild(circle);
      } else {
        const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        poly.setAttribute("points", createPolygonPoints(s.x, s.y, 34, s.cotes));
        poly.setAttribute("fill", "none");
        poly.setAttribute("stroke", s.couleur);
        poly.setAttribute("stroke-width", "6");
        poly.setAttribute("stroke-dasharray", "4 4");
        zone.appendChild(poly);
      }

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", s.x);
      label.setAttribute("y", s.y + 70);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("fill", "#333");
      label.setAttribute("font-size", "14");
      label.textContent = `${s.cotes} côtés`;
      zone.appendChild(label);

      svg.appendChild(zone);
      zones.push({ ...s });
    });
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, threeWrapper.clientWidth / threeWrapper.clientHeight, 1, 1000);
  camera.position.set(0, 120, 260);
  camera.lookAt(0, 30, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(threeWrapper.clientWidth, threeWrapper.clientHeight);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const directional = new THREE.DirectionalLight(0xffffff, 0.8);
  directional.position.set(80, 150, 120);
  scene.add(directional);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(520, 320), new THREE.MeshPhongMaterial({ color: 0xede3cf }));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const geometryMap = {
    sphere: new THREE.SphereGeometry(30, 18, 16),
    pyramid3: new THREE.ConeGeometry(35, 70, 3),
    cube: new THREE.BoxGeometry(60, 60, 60),
    pyramid5: new THREE.ConeGeometry(35, 70, 5),
    prism6: new THREE.CylinderGeometry(30, 30, 70, 6)
  };

  const material = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.1 });

  const objects = [
    { id: 'sphere', cotes: 0, type: 'sphere', color: 0x00ffff, init: { x: -170, y: 36, z: 20 } },
    { id: 'pyramid3', cotes: 3, type: 'pyramid3', color: 0xffa500, init: { x: -80, y: 36, z: 80 } },
    { id: 'cube', cotes: 4, type: 'cube', color: 0xffdd57, init: { x: 0, y: 36, z: -20 } },
    { id: 'pyramid5', cotes: 5, type: 'pyramid5', color: 0xffc0cb, init: { x: 80, y: 36, z: 80 } },
    { id: 'prism6', cotes: 6, type: 'prism6', color: 0x00ff7f, init: { x: 170, y: 36, z: 20 } }
  ];

  objects.forEach((o) => {
    o.mesh = new THREE.Mesh(geometryMap[o.type], material(o.color));
    o.mesh.position.set(o.init.x, o.init.y, o.init.z);
    o.mesh.userData = { id: o.id, cotes: o.cotes, matched: false, init: o.init };
    scene.add(o.mesh);
  });

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let activeObject = null;
  let dragging = false;

  function setScore(value) {
    scoreEl.textContent = `Réussi: ${value}/5`;
  }

  function setFeedbackText(text, success) {
    setFeedback(feedback, !!success, text);
  }

  let score = 0;
  function incrementScore() {
    score += 1;
    setScore(score);
  }

  function gameEndCheck() {
    if (score >= 5) {
      setFeedbackText('Bravo ! Toutes les formes sont correspondantes.', true);
      onFinish();
      stopTimer();
    }
  }

  function inDropZone(obj) {
    const pos = obj.mesh.position.clone();
    pos.project(camera);
    const rect = renderer.domElement.getBoundingClientRect();
    const x = (pos.x * 0.5 + 0.5) * rect.width + rect.left;
    const y = (-pos.y * 0.5 + 0.5) * rect.height + rect.top;

    let best = null;
    let bestDist = Infinity;
    zones.forEach((z) => {
      const dx = z.x - x;
      const dy = z.y - y;
      const d = Math.hypot(dx, dy);
      if (d < bestDist) {
        bestDist = d;
        best = z;
      }
    });

    return bestDist < 70 ? best : null;
  }

  function resetGame() {
    score = 0;
    setScore(score);
    draw2D();
    objects.forEach((o) => {
      o.mesh.position.set(o.init.x, o.init.y, o.init.z);
      o.mesh.userData.matched = false;
      o.mesh.visible = true;
      o.mesh.material.emissive.setHex(0x000000);
    });
    setFeedbackText('Jeu réinitialisé, c\'est reparti !', true);
    startTimer();
  }

  function currentTimer() {
    let sec = 0;
    timerEl.textContent = 'Temps: 00:00';
    return setInterval(() => {
      sec += 1;
      const m = String(Math.floor(sec / 60)).padStart(2, '0');
      const s = String(sec % 60).padStart(2, '0');
      timerEl.textContent = `Temps: ${m}:${s}`;
    }, 1000);
  }

  let timerId = currentTimer();
  function stopTimer() {
    clearInterval(timerId);
  }

  function onPointerDown(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
      return;
    }
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    mouse.set(x, y);
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(objects.map(o => o.mesh).filter(m => !m.userData.matched));
    if (hits.length > 0) {
      activeObject = hits[0].object;
      dragging = true;
      activeObject.material.emissive = new THREE.Color(0x555555);
      document.body.style.cursor = 'grabbing';
    }
  }

  function onPointerMove(event) {
    if (!dragging || !activeObject) return;
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    mouse.set(x, y);
    raycaster.setFromCamera(mouse, camera);
    const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersect = new THREE.Vector3();
    raycaster.ray.intersectPlane(ground, intersect);
    if (intersect) {
      activeObject.position.set(intersect.x, 20, intersect.z);
    }
  }

  function onPointerUp() {
    if (!dragging || !activeObject) return;
    dragging = false;
    document.body.style.cursor = 'default';

    const obj = objects.find((o) => o.mesh === activeObject);
    const zone = inDropZone(obj);
    if (zone && obj.cotes === zone.cotes) {
      obj.mesh.userData.matched = true;
      obj.mesh.visible = false;
      incrementScore();
      setFeedbackText(`Match correct (${obj.id} => ${zone.id})`, true);
      draw2D();
      gameEndCheck();
    } else {
      obj.mesh.position.set(obj.init.x, obj.init.y, obj.init.z);
      setFeedbackText('Mauvaise cible, réessaye.', false);
      setTimeout(() => {
        if (obj.mesh) obj.mesh.material.emissive.setHex(0x000000);
      }, 300);
    }

    activeObject = null;
  }

  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  resetBtn.addEventListener('click', resetGame);

  instructBtn.addEventListener('click', () => {
    alert('Glisse la forme 3D au-dessus du trou 2D avec le même nombre de côtés (autre design visuel).');
  });

  function animate() {
    requestAnimationFrame(animate);
    objects.forEach((o) => {
      if (!o.mesh.userData.matched) {
        o.mesh.rotation.y += 0.005;
        o.mesh.rotation.x += 0.002;
      }
    });
    renderer.render(scene, camera);
  }

  draw2D();
  resetGame();
  animate();
}
