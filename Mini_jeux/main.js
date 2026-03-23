import { startGame1 } from "./games/game1.js";
import { startGame2 } from "./games/game2.js";

let currentLevel = 0;

// Ajout d'un élément pour afficher le titre du mini-jeu
const gameTitle = document.createElement("h2");
gameTitle.id = "gameTitle";
gameTitle.style.marginTop = "20px";
gameTitle.style.color = "#836fff";
gameTitle.style.textShadow = "2px 2px 5px rgba(0, 0, 0, 0.7)";
document.body.insertBefore(gameTitle, document.getElementById("gameContainer"));

window.startGame = function () {
  currentLevel = 0;
  loadLevel();
};

function loadLevel() {
  const container = document.getElementById("gameContainer");

  if (currentLevel === 0) {
    gameTitle.textContent = "Mini-jeu 1 : Labyrinthe";
    startGame1(container, nextLevel);
  } else if (currentLevel === 1) {
    gameTitle.textContent = "Mini-jeu 2 : Code couleur";
    startGame2(container, nextLevel);
  }
}

function nextLevel() {
  currentLevel++;
  if (currentLevel > 1) {
    alert("Bravo, tu as terminé tous les jeux !");
  } else {
    loadLevel();
  }
}