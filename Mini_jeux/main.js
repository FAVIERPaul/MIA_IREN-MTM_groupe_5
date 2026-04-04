import { getAllLevels } from "./level.js";

const levels = getAllLevels();
let currentLevel = 0;

const homeScreen = document.getElementById("homeScreen");
const playArea = document.getElementById("playArea");
const startBtn = document.getElementById("startBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const levelTitle = document.getElementById("levelTitle");
const container = document.getElementById("gameContainer");

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
    const module = await import(getGameFilePath(currentLevelData.game));
    const startGameFunction = resolveStarter(module, currentLevelData.game);

    if (!startGameFunction) {
      throw new Error(`Aucune fonction de demarrage trouvee dans ${currentLevelData.game}.js`);
    }

    startGameFunction(container, nextLevel);
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

window.startGame = startGameFlow;