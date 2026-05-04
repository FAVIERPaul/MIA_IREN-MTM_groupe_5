import { gameManager } from "../gameCleanup.js";
import { createMemoryGame } from "./game7.js";

// Paires du jeu 9
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
    { id: "anise", pair: "anise" },
    { id: "flower purple", pair: "flower purple" },
  ];

  // Révéler les deux cartes intrus en Rouge une fois que toutes les paires sont trouvées
  function revealIntruders(cards, cardElementsMap) {
    cards.forEach((cardData) => {
      if (cardData.isIntruder) {
        const cardInfo = cardElementsMap.get(cardData.id);
        
        if (cardInfo) {
          const { card, cardInner } = cardInfo;
          
          // Retourner la carte
          cardInner.style.transform = "rotateY(180deg)";
          
          // Appliquer la lueur ROUGE au cardInner (comme le VERT pour les paires)
          cardInner.style.boxShadow = "0 0 35px rgba(255, 0, 0, 0.8)";
          
          // Appliquer une légère échelle comme pour les paires
          cardInner.style.transform = "rotateY(180deg) scale(0.95)";
        }
      }
    });
    
    // Afficher l'alerte après la révélation
    setTimeout(() => {
      alert("Bravo, vous avez gagné !\nLes cartes avec la lueur rouge sont les intrus 😏");
      onFinish();
    }, 1500);
  }

  // Passer la fonction de révélation comme callback
  createMemoryGame(container, onFinish, pairs, intruders, revealIntruders);
}
