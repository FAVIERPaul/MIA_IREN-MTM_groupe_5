import { getAllLevels } from "./level.js";
import { gameManager } from "./gameCleanup.js";

const levels = getAllLevels();
let currentLevel = 0;

const homeScreen = document.getElementById("homeScreen");
const playArea = document.getElementById("playArea");
const startBtn = document.getElementById("startBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const levelTitle = document.getElementById("levelTitle");
const container = document.getElementById("gameContainer");
const STAR_RAIN_LAYER_ID = "starRainLayer";

const DECORATIVE_IMAGE_LAYOUT = [
  { selector: ".side-canard", row: 0, col: 1, scale: 1.18, rotate: -12 },
  { selector: ".side-planete", row: 0, col: 4, scale: 1.08, rotate: 10 },

  { selector: ".side-manette", row: 1, col: 2, scale: 1.04, rotate: -10 },
  { selector: ".side-bloc", row: 1, col: 3, scale: 1.2, rotate: 8 },

  { selector: ".side-fantome", row: 2, col: 1, scale: 1.18, rotate: 12 },
  { selector: ".side-pizza", row: 2, col: 4, scale: 1.08, rotate: -14 },

  { selector: ".side-planete-echo", row: 3, col: 2, scale: 0.96, rotate: -10 },
  { selector: ".side-pacman", row: 3, col: 3, scale: 1.02, rotate: 14 },

  { selector: ".side-fusee-echo", row: 4, col: 1, scale: 0.98, rotate: 12 },
  { selector: ".side-fusee", row: 4, col: 4, scale: 1.16, rotate: 20 },

  { selector: ".side-pizza-echo", row: 5, col: 2, scale: 0.86, rotate: 9 },
  { selector: ".side-martien", row: 5, col: 3, scale: 1.08, rotate: -8 },

  { selector: ".side-pacman-echo", row: 6, col: 1, scale: 0.88, rotate: -12 },
  { selector: ".side-manette2", row: 6, col: 4, scale: 1.0, rotate: -12 },
];

function getOrCreateStarRainLayer() {
  let layer = document.getElementById(STAR_RAIN_LAYER_ID);
  if (layer) return layer;

  layer = document.createElement("div");
  layer.id = STAR_RAIN_LAYER_ID;
  layer.className = "star-rain-layer";
  document.body.appendChild(layer);
  return layer;
}

function triggerStarRain(originX, originY) {
  const layer = getOrCreateStarRainLayer();
  const viewportWidth = window.innerWidth;
  const totalStars = 34;

  for (let i = 0; i < totalStars; i += 1) {
    const star = document.createElement("span");
    star.className = "star-rain-particle";

    const left = originX + (Math.random() - 0.5) * 360;
    const clampedLeft = Math.max(12, Math.min(viewportWidth - 12, left));
    const size = 7 + Math.random() * 10;
    const duration = 1050 + Math.random() * 1100;
    const delay = Math.random() * 200;
    const drift = (Math.random() - 0.5) * 140;
    const startOffsetY = -80 - Math.random() * (Math.max(originY, 60) * 0.2);

    star.style.left = `${clampedLeft}px`;
    star.style.top = `${startOffsetY}px`;
    star.style.setProperty("--star-size", `${size}px`);
    star.style.setProperty("--star-fall-duration", `${duration}ms`);
    star.style.setProperty("--star-fall-delay", `${delay}ms`);
    star.style.setProperty("--star-drift", `${drift}px`);

    star.addEventListener("animationend", () => {
      star.remove();
    });

    layer.appendChild(star);
  }
}

function setupDecorativeImageClicks() {
  const images = document.querySelectorAll(".side-image");
  images.forEach((image) => {
    image.addEventListener("click", () => {
      if (homeScreen.classList.contains("hidden")) return;

      const bounds = image.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;

      image.classList.remove("side-image-burst");
      void image.offsetWidth;
      image.classList.add("side-image-burst");

      triggerStarRain(centerX, centerY);
    });
  });
}

function applyDecorativeImageLayout() {
  const items = DECORATIVE_IMAGE_LAYOUT
    .map((entry) => ({ ...entry, element: document.querySelector(entry.selector) }))
    .filter((entry) => entry.element);

  if (items.length === 0) return;

  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const rows = 7;
  const marginY = Math.max(42, Math.round(viewportHeight * 0.08));
  const usableHeight = Math.max(220, viewportHeight - marginY * 2);
  const rowGap = usableHeight / (rows - 1);
  const baseSize = Math.max(96, Math.min(182, Math.round(viewportWidth * 0.11)));
  const edgeInset = Math.max(16, Math.round(viewportWidth * 0.02));
  const innerOffset = Math.max(84, Math.round(viewportWidth * 0.12));
  const edgeNudge = Math.max(8, Math.round(viewportWidth * 0.01));

  const columnX = {
    1: edgeInset + edgeNudge,
    2: edgeInset + innerOffset,
    3: viewportWidth - (edgeInset + innerOffset),
    4: viewportWidth - (edgeInset + edgeNudge),
  };

  items.forEach((item, index) => {
    const safeRow = Math.max(0, Math.min(rows - 1, item.row));
    const safeCol = columnX[item.col] ? item.col : 1;
    const top = marginY + safeRow * rowGap;
    const size = Math.round(baseSize * (item.scale || 1));
    const rotation = item.rotate || 0;

    item.element.style.width = `${size}px`;
    item.element.style.height = `${size}px`;
    item.element.style.top = `${top}px`;
    item.element.style.left = `${columnX[safeCol]}px`;
    item.element.style.right = "auto";
    item.element.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
    item.element.style.transformOrigin = "50% 50%";
    item.element.style.zIndex = String(10 + index);
  });
}

window.addEventListener("resize", applyDecorativeImageLayout);

function getGameFilePath(levelGameId) {
  return `./games/${levelGameId}.js`;
}

function resolveStarter(module, levelGameId) {
  const expectedExport = `start${levelGameId.charAt(0).toUpperCase()}${levelGameId.slice(1)}`;

  if (typeof module[expectedExport] === "function") {
    return module[expectedExport];
  }

  const firstMatchingExport = Object.keys(module).find((key) => /^startGame\d+$/.test(key) && typeof module[key] === "function");
  if (firstMatchingExport) {
    return module[firstMatchingExport];
  }

  return null;
}

function updateNavButtons() {
  prevBtn.style.display = currentLevel > 0 ? "inline-block" : "none";
  nextBtn.style.display = currentLevel < levels.length - 1 ? "inline-block" : "none";
}

async function loadLevel() {
  const currentLevelData = levels[currentLevel];

  // ARRÊTER COMPLÈTEMENT le jeu précédent
  gameManager.cleanup();

  if (!currentLevelData) {
    levelTitle.textContent = "Bravo !";
    container.innerHTML = "<h3>Tous les jeux sont terminés</h3>";
    prevBtn.style.display = levels.length > 0 ? "inline-block" : "none";
    nextBtn.style.display = "none";
    return;
  }

  levelTitle.textContent = `Niveau ${currentLevel + 1} - ${currentLevelData.game}`;
  container.innerHTML = "";

  try {
    // Démarrer le système de tracking des timers
    gameManager.startGame();

    const module = await import(getGameFilePath(currentLevelData.game));
    const startGameFunction = resolveStarter(module, currentLevelData.game);

    if (!startGameFunction) {
      throw new Error(`Aucune fonction de demarrage trouvee dans ${currentLevelData.game}.js`);
    }

    const onFinishWrapper = () => {
      gameManager.cleanup();
      nextLevel();
    };

    startGameFunction(container, onFinishWrapper);
    updateNavButtons();
  } catch (error) {
    console.error(error);
    container.innerHTML = `<p>Erreur de chargement pour ${currentLevelData.game}.</p>`;
    updateNavButtons();
  }
}

function startGameFlow() {
  currentLevel = 0;
  homeScreen.classList.add("hidden");
  playArea.classList.remove("hidden");
  document.body.classList.add("in-game");
  loadLevel();
}

function nextLevel() {
  if (currentLevel < levels.length - 1) {
    currentLevel += 1;
    loadLevel();
  } else {
    levelTitle.textContent = "Bravo !";
    container.innerHTML = "<h3>Tous les jeux sont terminés</h3>";
    updateNavButtons();
  }
}

function previousLevel() {
  if (currentLevel > 0) {
    currentLevel -= 1;
    loadLevel();
  }
}

startBtn.addEventListener("click", startGameFlow);
nextBtn.addEventListener("click", nextLevel);
prevBtn.addEventListener("click", previousLevel);

applyDecorativeImageLayout();
setupDecorativeImageClicks();

window.startGame = startGameFlow;
