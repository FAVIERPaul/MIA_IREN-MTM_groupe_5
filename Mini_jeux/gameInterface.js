export function createGameTitle(text) {
    const title = document.createElement("h2");
    title.textContent = text;
    title.style.textAlign = "center";
    title.style.color = "#4CAF50";
    title.style.fontSize = "28px";
    title.style.marginBottom = "20px";
    return title;
}

export function createRebusDisplay(rebus) {
    const rebusDiv = document.createElement("div");
    rebusDiv.style.fontSize = "80px";
    rebusDiv.style.margin = "20px auto";
    rebusDiv.style.textAlign = "center";
    rebusDiv.textContent = rebus;
    return rebusDiv;
}

export function createInputField() {
    const input = document.createElement("input");
    input.placeholder = "Tape ta réponse...";
    input.style.margin = "10px auto";
    input.style.display = "block";
    input.style.fontSize = "18px";
    input.style.padding = "10px";
    input.style.width = "60%";
    input.style.backgroundColor = "#4B0082";
    input.style.color = "white";
    input.style.border = "2px solid #ccc";
    input.style.borderRadius = "8px";
    input.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";
    return input;
}

export function createValidationButton() {
    const button = document.createElement("button");
    button.textContent = "Valider";
    button.style.margin = "10px auto";
    button.style.display = "block";
    button.style.fontSize = "14px";
    button.style.padding = "8px 16px";
    return button;
}

export function createFeedbackDiv() {
    const feedbackDiv = document.createElement("div");
    feedbackDiv.style.textAlign = "center";
    feedbackDiv.style.marginTop = "20px";
    return feedbackDiv;
}

export const errorMessages = [
  "✗ Essaie encore",
  "✗ Tu peux y arriver, j'ai confiance !",
  "✗ Oh.. il va falloir réfléchir un peu plus",
  "✗ Tu t'es endormi ?",
  "✗ Ça commence à être inquiétant...",
  "✗ Allez, un dernier effort !",
  "✗ Tu veux un indice ?",
];

export function setFeedback(feedbackDiv, isSuccess, message) {
  feedbackDiv.style.color = isSuccess ? "lime" : "red";
  feedbackDiv.textContent = message;
}

// Système global robuste de cleanup pour arrêter complètement les jeux
export const GameCleanup = {
  intervals: [],
  timeouts: [],
  eventListeners: [],
  animationFrames: [],
  originalHandlers: {},
  gameRunning: false,

  addInterval(interval) {
    this.intervals.push(interval);
    return interval;
  },

  addTimeout(timeout) {
    this.timeouts.push(timeout);
    return timeout;
  },

  addAnimationFrame(frameId) {
    this.animationFrames.push(frameId);
    return frameId;
  },

  addEventListener(element, event, handler) {
    if (!element) return;
    this.eventListeners.push({ element, event, handler });
    element.addEventListener(event, handler);
  },

  cleanup() {
    // Arrêter tous les animation frames
    this.animationFrames.forEach(frameId => cancelAnimationFrame(frameId));
    this.animationFrames = [];

    // Arrêter tous les intervals
    this.intervals.forEach(interval => {
      if (interval !== null && interval !== undefined) {
        clearInterval(interval);
      }
    });
    this.intervals = [];

    // Arrêter tous les timeouts
    this.timeouts.forEach(timeout => {
      if (timeout !== null && timeout !== undefined) {
        clearTimeout(timeout);
      }
    });
    this.timeouts = [];

    // Supprimer tous les event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      if (element && handler) {
        element.removeEventListener(event, handler);
      }
    });
    this.eventListeners = [];

    // Marquer le jeu comme arrêté
    this.gameRunning = false;
  },

  reset() {
    this.cleanup();
  },

  startGame() {
    this.gameRunning = true;
  }
};

export function createMemoryGame(container, onFinish, pairs, pairsToNotDuplicate = []) {
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

  // Dupliquer les paires normales mais pas les intrus
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
      matched: false
    }));

  let firstCard = null;
  let secondCard = null;
  let matchedPairs = 0;
  const totalPairsToMatch = pairs.length;

  function createCard(cardData) {
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

    const clickHandler = () => {
      if (!GameCleanup.gameRunning) return;
      if (cardData.flipped || cardData.matched || secondCard) return;

      cardData.flipped = true;
      cardInner.style.transform = "rotateY(180deg)";

      if (!firstCard) {
        firstCard = { card, cardData };
      } else {
        secondCard = { card, cardData };

        if (firstCard.cardData.pair === secondCard.cardData.id) {
          matchedPairs++;

          firstCard.cardData.matched = true;
          secondCard.cardData.matched = true;

          firstCard.cardData.flipped = true;
          secondCard.cardData.flipped = true;

          firstCard.card.style.pointerEvents = "none";
          secondCard.card.style.pointerEvents = "none";

          const inner1 = firstCard.card.firstChild;
          const inner2 = secondCard.card.firstChild;

          inner1.style.boxShadow = "0 0 35px rgba(76, 175, 80, 0.8)";
          inner2.style.boxShadow = "0 0 35px rgba(76, 175, 80, 0.8)";

          inner1.style.transform += " scale(0.95)";
          inner2.style.transform += " scale(0.95)";

          firstCard = null;
          secondCard = null;

          if (matchedPairs === totalPairsToMatch) {
            GameCleanup.cleanup();
            setTimeout(() => {
              alert("Bravo, vous avez gagné !");
              onFinish();
            }, 500);
          }

        } else {
          const timeout = setTimeout(() => {
            if (GameCleanup.gameRunning) {
              firstCard.cardData.flipped = false;
              secondCard.cardData.flipped = false;

              firstCard.card.firstChild.style.transform = "rotateY(0deg)";
              secondCard.card.firstChild.style.transform = "rotateY(0deg)";

              firstCard = null;
              secondCard = null;
            }
          }, 700);
          GameCleanup.addTimeout(timeout);
        }
      }
    };

    GameCleanup.addEventListener(card, "click", clickHandler);

    return card;
  }

  cards.forEach((cardData) => {
    const card = createCard(cardData);
    cardContainer.appendChild(card);
  });
}
