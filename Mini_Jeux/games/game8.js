import { gameManager } from "../gameCleanup.js";
import { createMemoryGame } from "./game7.js";

// Paires du jeu 8
export function startGame8(container, onFinish) {
  const pairs = [
    { id: "alarm", pair: "sleep" },
    { id: "car", pair: "gasoline" },
    { id: "iphone", pair: "charger" },
    { id: "dog", pair: "pet-toy" },
  ];

  createMemoryGame(container, onFinish, pairs);
}
