import { createMemoryGame } from "../gameInterface.js";
import { startGame13 } from "./game13.js";

export function startGame9(container, onFinish) {
  // Paires normales (seront dupliquées)
  const pairs = [
    { id: "saturn-black-shape-with-stars-around", pair: "cat" },
    { id: "mark", pair: "moon" },
    { id: "flower yellow", pair: "sun" },
    { id: "nature", pair: "pink-cosmos" },
    { id: "wave", pair: "butterfly" },
    { id: "strawberry", pair: "fruit" },
    { id: "plant", pair: "sea" },
  ];

  // Intrus (ne seront pas dupliqués)
  const intruders = [
    { id: "anise", pair: "anise" },
    { id: "flower purple", pair: "flower purple" },
  ];

  // Lancer le jeu
  createMemoryGame(container, onFinish, pairs, intruders);
}
