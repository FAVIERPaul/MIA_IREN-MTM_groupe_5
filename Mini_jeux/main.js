import { startGame1 } from "./games/game1.js";
import { startGame2 } from "./games/game2.js";
import { startGame3 } from "./games/game3.js";
import { startGame4 } from "./games/game4.js";
import { startGame5 } from "./games/game5.js";
import { startGame6 } from "./games/game6.js";
import { startGame7 } from "./games/game7.js";
import { getAllLevels } from "./level.js";

const levels = getAllLevels();

let currentLevel = 0;

// Ajout d'un élément pour afficher le titre du mini-jeu
const gameTitle = document.createElement("h2");
gameTitle.id = "gameTitle";
gameTitle.style.marginTop = "20px";
gameTitle.style.color = "#836fff";
gameTitle.style.textShadow = "2px 2px 5px rgba(0, 0, 0, 0.7)";
document.body.insertBefore(gameTitle, document.getElementById("gameContainer"));

// Ensure global logic for the 'nextGameButton' is centralized here.
const nextGameButton = document.createElement("button");
nextGameButton.id = "nextGameButton";
nextGameButton.textContent = "Passer";
nextGameButton.style.position = "fixed";
nextGameButton.style.top = "10px";
nextGameButton.style.right = "10px";
nextGameButton.style.backgroundColor = "#4CAF50";
nextGameButton.style.color = "white";
nextGameButton.style.border = "none";
nextGameButton.style.padding = "10px";
nextGameButton.style.borderRadius = "5px";
nextGameButton.style.cursor = "pointer";
nextGameButton.style.zIndex = "1000";

document.body.appendChild(nextGameButton);

nextGameButton.addEventListener("click", nextLevel);

const previousGameButton = document.createElement("button");
previousGameButton.id = "previousGameButton";
previousGameButton.textContent = "Précédent";
previousGameButton.style.position = "fixed";
previousGameButton.style.top = "10px";
previousGameButton.style.left = "10px";
previousGameButton.style.backgroundColor = "#4CAF50";
previousGameButton.style.color = "white";
previousGameButton.style.border = "none";
previousGameButton.style.padding = "10px";
previousGameButton.style.borderRadius = "5px";
previousGameButton.style.cursor = "pointer";
previousGameButton.style.zIndex = "1000";

document.body.appendChild(previousGameButton);

previousGameButton.addEventListener("click", previousLevel);

window.startGame = function () {
  currentLevel = 0;
  loadLevel();
};

const gameFunctions = {
  game1: startGame1,
  game2: startGame2,
  game3: startGame3,
  game4: startGame4,
  game5: startGame5,
  game6: startGame6,
  game7: startGame7,
};

function loadLevel() {
  const container = document.getElementById("gameContainer");
  const currentLevelData = levels[currentLevel];

  if (currentLevelData) {
    gameTitle.textContent = `Mini-jeu ${currentLevel + 1} : ${currentLevelData.game}`;
    const startGameFunction = gameFunctions[currentLevelData.game];
    if (startGameFunction) {
      startGameFunction(container, nextLevel);
    } else {
      console.error(`No function found for game: ${currentLevelData.game}`);
    }
  } else {
    alert("Bravo, tu as terminé tous les jeux !");
  }
}

function nextLevel() {
  currentLevel++;
  loadLevel();
}

function previousLevel() {
  if (currentLevel > 0) {
    currentLevel--;
    loadLevel();
  } else {
    alert("Vous êtes déjà au premier niveau !");
  }
}