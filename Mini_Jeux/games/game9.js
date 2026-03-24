import { createMemoryGame } from "../gameInterface.js";

export function startGame9(container, onFinish) {
  const pairs = [
    { id: "saturn-black-shape-with-stars-around", pair: "cat" },
    { id: "mark", pair: "moon" },
    { id: "flower yellow", pair: "sun" },
    { id: "nature", pair: "pink-cosmos" },
    { id: "wave", pair: "butterfly" },
    { id: "strawberry", pair: "fruit" },
    { id: "plant", pair: "sea" },
  ];

  const intruders = [
    { id: "anise" },
    { id: "flower purple" }
  ];

  const cards = [
    ...pairs.map((pair) => ({ ...pair, flipped: false, matched: false })),
    ...intruders.map((intruder) => ({ ...intruder, flipped: false, matched: false }))
  ].sort(() => Math.random() - 0.5);

  function highlightIntruderCards() {
    // Highlight intruder cards in red
    cards.forEach((card) => {
      if (intruders.some((i) => i.id === card.id)) {
        card.color = "#ff0000"; // Red color for intruders
      }
    });
  }

  function checkAndHighlightIntruders() {
    // Check if all pairs are found
    const allPairsFound = cards.every((card) => card.matched || intruders.some((i) => i.id === card.id));

    if (allPairsFound) {
      cards.forEach((card) => {
        if (intruders.some((i) => i.id === card.id)) {
          card.flipped = true; // Flip the intruder cards
          card.color = "#ff0000"; // Red color for intruders
        }
      });

      setTimeout(() => {
        onFinish(); // Delay the onFinish call to ensure intruders are visible
      }, 1000);
    }
  }

  createMemoryGame(container, onFinish, cards, checkAndHighlightIntruders);
}