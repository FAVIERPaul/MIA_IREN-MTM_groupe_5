import { gameManager } from "../gameCleanup.js";

// FONCTIONS RÉUTILISABLES pour les jeux MEMORY 

// Crée une carte de memory avec une image au dos et un effet de retournement (flip)
function createCardElement(cardData) {
  const card = document.createElement("div");
  card.style.width = "120px";
  card.style.height = "120px";
  card.style.perspective = "1000px";
  card.style.cursor = "pointer";

  const cardInner = document.createElement("div");
  cardInner.style.width = "100%";
  cardInner.style.height = "100%";
  cardInner.style.position = "relative";
  cardInner.style.transformStyle = "preserve-3d";
  cardInner.style.transition = "transform 0.5s, box-shadow 0.3s";
  cardInner.style.borderRadius = "15px";
  cardInner.style.overflow = "visible";
  cardInner.style.boxShadow = "0 6px 12px rgba(0,0,0,0.25)";

  const cardFront = document.createElement("div");
  cardFront.style.width = "100%";
  cardFront.style.height = "100%";
  cardFront.style.position = "absolute";
  cardFront.style.backfaceVisibility = "hidden";
  cardFront.style.background = "linear-gradient(135deg, #d6aefc, #c4a3fa)";
  cardFront.style.borderRadius = "15px";

  const cardBack = document.createElement("div");
  cardBack.style.width = "100%";
  cardBack.style.height = "100%";
  cardBack.style.position = "absolute";
  cardBack.style.backfaceVisibility = "hidden";
  cardBack.style.transform = "rotateY(180deg)";
  cardBack.style.backgroundColor = "#f8f8f8";
  cardBack.style.borderRadius = "15px";

  const img = document.createElement("img");
  img.src = `./assets/images/${cardData.id}.png`;
  img.style.width = "70%";
  img.style.height = "70%";
  img.style.objectFit = "contain";
  img.style.margin = "15%";
  cardBack.appendChild(img);

  cardInner.appendChild(cardFront);
  cardInner.appendChild(cardBack);
  card.appendChild(cardInner);

  return { card, cardInner, cardBack };
}

/* Gère le clic sur une carte :
- retourne la carte
- gère la sélection de 2 cartes
- vérifie si elles correspondent
- laisse visibles les paires ou les retourne sinon
- termine le jeu quand toutes les paires sont trouvées*/
function createClickHandler(cardData, cardInner, firstCardRef, secondCardRef, matchedPairsRef, totalPairsToMatch, onGameFinish) {
  return () => {
    if (!gameManager.isRunning) return;
    if (cardData.flipped || cardData.matched || secondCardRef.current) return;

    cardData.flipped = true;
    cardInner.style.transform = "rotateY(180deg)";

    if (!firstCardRef.current) {
      firstCardRef.current = { card: cardInner.parentElement, cardData };
    } else {
      secondCardRef.current = { card: cardInner.parentElement, cardData };

      if (firstCardRef.current.cardData.pair === secondCardRef.current.cardData.id) {
        matchedPairsRef.current++;

        firstCardRef.current.cardData.matched = true;
        secondCardRef.current.cardData.matched = true;

        firstCardRef.current.cardData.flipped = true;
        secondCardRef.current.cardData.flipped = true;

        firstCardRef.current.card.style.pointerEvents = "none";
        secondCardRef.current.card.style.pointerEvents = "none";

        const inner1 = firstCardRef.current.card.firstChild;
        const inner2 = secondCardRef.current.card.firstChild;

        inner1.style.boxShadow = "0 0 35px rgba(76, 175, 80, 0.8)";
        inner2.style.boxShadow = "0 0 35px rgba(76, 175, 80, 0.8)";

        inner1.style.transform += " scale(0.95)";
        inner2.style.transform += " scale(0.95)";

        firstCardRef.current = null;
        secondCardRef.current = null;

        if (matchedPairsRef.current === totalPairsToMatch) {
          gameManager.cleanup();
          setTimeout(() => {
            onGameFinish();
          }, 500);
        }

      } else {
        const timeout = setTimeout(() => {
          if (gameManager.isRunning) {
            firstCardRef.current.cardData.flipped = false;
            secondCardRef.current.cardData.flipped = false;

            firstCardRef.current.card.firstChild.style.transform = "rotateY(0deg)";
            secondCardRef.current.card.firstChild.style.transform = "rotateY(0deg)";

            firstCardRef.current = null;
            secondCardRef.current = null;
          }
        }, 700);
        gameManager.addTimeout(timeout);
      }
    }
  };
}

/* Crée le jeu de memory :
- affiche le titre et la grille
- crée les cartes (paires + intrus) et les mélange
- initialise les variables du jeu (cartes sélectionnées, score)
- gère la fin du jeu (victoire ou fonction personnalisée)*/

export function createMemoryGame(container, onFinish, pairs, pairsToNotDuplicate = [], onGameFinish = null) {
  container.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = "Memory";
  title.style.textAlign = "center";
  title.style.color = "#4CAF50";
  title.style.marginBottom = "20px";
  container.appendChild(title);

  const cardContainer = document.createElement("div");
  cardContainer.style.display = "grid";
  cardContainer.style.gridTemplateColumns = "repeat(4, 1fr)";
  cardContainer.style.gap = "12px";
  cardContainer.style.margin = "20px auto";
  cardContainer.style.maxWidth = "600px";
  container.appendChild(cardContainer);

  const duplicatedPairs = pairs.map(({ id, pair }) => ({ id: pair, pair: id }));
  const cards = [
    ...pairs,
    ...duplicatedPairs,
    ...pairsToNotDuplicate
  ]
    .sort(() => Math.random() - 0.5)
    .map(({ id, pair }) => ({
      id,
      pair,
      flipped: false,
      matched: false,
      isIntruder: pairsToNotDuplicate.some(p => p.id === id)
    }));

  const firstCardRef = { current: null };
  const secondCardRef = { current: null };
  const matchedPairsRef = { current: 0 };
  const totalPairsToMatch = pairs.length;
  const cardElementsMap = new Map();

  const finalOnFinish = () => {
    if (onGameFinish) {
      onGameFinish(cards, cardElementsMap);
    } else {
      alert("Bravo, vous avez gagné !");
      onFinish();
    }
  };

  cards.forEach((cardData) => {
    const { card, cardInner, cardBack } = createCardElement(cardData);
    cardElementsMap.set(cardData.id, { card, cardInner, cardBack, cardData });
    
    const clickHandler = createClickHandler(cardData, cardInner, firstCardRef, secondCardRef, matchedPairsRef, totalPairsToMatch, finalOnFinish);
    
    gameManager.addEventListener(card, "click", clickHandler);
    cardContainer.appendChild(card);
  });
}

// Paires du jeu 7 
export function startGame7(container, onFinish) {
  const pairs = [
    { id: "sun", pair: "rain" },
    { id: "fire", pair: "snowflake" },
    { id: "diet", pair: "fast-food" },
    { id: "sleep", pair: "wake-up" },
    { id: "running", pair: "walking" },
    { id: "keep-quiet", pair: "noise" },
    { id: "skiing", pair: "summer" },
    { id: "holidays", pair: "working" },
  ];

  createMemoryGame(container, onFinish, pairs);
}
