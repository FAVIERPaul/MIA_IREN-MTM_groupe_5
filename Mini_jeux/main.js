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

const DECORATIVE_IMAGE_LAYOUT = [
  { selector: ".side-canard", side: "left", row: -2, scale: 0.96, rotate: -12 },
  { selector: ".side-planete", side: "right", row: 0, scale: 0.92, rotate: -10 },
  { selector: ".side-fantome", side: "left", row: 1, scale: 0.9, rotate: 8 },
  { selector: ".side-pizza", side: "right", row: 1, scale: 0.95, rotate: -16 },
  { selector: ".side-manette2", side: "left", row: 2, scale: 0.84, rotate: -10 },
  { selector: ".side-bloc", side: "right", row: 2, scale: 0.92, rotate: -8 },
  { selector: ".side-manette", side: "right", row: 3, scale: 0.92, rotate: 10 },
  { selector: ".side-martien", side: "right", row: 3, scale: 0.9, rotate: 8 },
  { selector: ".side-pacman-echo", side: "left", row: 4, scale: 0.72, rotate: -14 },
  { selector: ".side-fusee", side: "right", row: 4, scale: 0.86, rotate: 22 },
  { selector: ".side-pizza-echo", side: "left", row: 5, scale: 0.66, rotate: 11 },
  { selector: ".side-planete-echo", side: "left", row: 5, scale: 0.68, rotate: 9 },
  { selector: ".side-pacman", side: "right", row: 6, scale: 0.88, rotate: 14 },
];

function applyDecorativeImageLayout() {
  const items = DECORATIVE_IMAGE_LAYOUT
    .map((entry) => ({ ...entry, element: document.querySelector(entry.selector) }))
    .filter((entry) => entry.element);

  if (items.length === 0) return;

  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const marginY = Math.max(42, Math.round(viewportHeight * 0.075));
  const usableHeight = viewportHeight - marginY * 2;
  const gap = items.length > 0 ? usableHeight / (items.length + 1) : usableHeight;
  const baseSize = Math.max(90, Math.min(160, Math.round(viewportWidth * 0.1)));
  const sizeVariants = [0.78, 0.92, 1.08, 0.86, 1.14, 0.82, 0.98];
  const rotationVariants = [-18, 14, -10, 22, -16, 8, -24, 18, -12, 26, -8, 16, -20];
  const sideInset = Math.max(18, Math.round(viewportWidth * 0.022));

  items.forEach((item, index) => {
    const isLeftSide = item.side === "left";
    const top = marginY + gap * (index + 1);
    const size = Math.round(baseSize * sizeVariants[index % sizeVariants.length]);
    const rotation = rotationVariants[index % rotationVariants.length];
    const horizontalOffset = sideInset;

    item.element.style.width = `${size}px`;
    item.element.style.height = `${size}px`;
    item.element.style.top = `${top}px`;
    item.element.style.left = "auto";
    item.element.style.right = "auto";
    item.element.style[isLeftSide ? "left" : "right"] = `${horizontalOffset}px`;
    item.element.style.transform = `translateY(-50%) rotate(${rotation}deg)`;
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

window.startGame = startGameFlow;
