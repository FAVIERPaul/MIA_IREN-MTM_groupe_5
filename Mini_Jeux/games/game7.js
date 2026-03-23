export function startGame7(container, onFinish) {
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

  const cards = [...pairs, ...pairs.map(({ id, pair }) => ({ id: pair, pair: id }))]
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
    cardFront.style.background = "linear-gradient(135deg, #d6aefc, #c4a3fa)"; // Slightly lighter purple
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

    card.addEventListener("click", () => {
      if (cardData.flipped || cardData.matched || secondCard) return;

      cardData.flipped = true;
      cardInner.style.transform = "rotateY(180deg)";

      if (!firstCard) {
        firstCard = { card, cardData };
      } else {
        secondCard = { card, cardData };

        if (firstCard.cardData.pair === secondCard.cardData.id) {
          // BONNE PAIRE
          matchedPairs++;

          firstCard.cardData.matched = true;
          secondCard.cardData.matched = true;

          firstCard.cardData.flipped = true;
          secondCard.cardData.flipped = true;

          firstCard.card.style.pointerEvents = "none";
          secondCard.card.style.pointerEvents = "none";

          // GLOW VERT PROPRE (derrière)
          const inner1 = firstCard.card.firstChild;
          const inner2 = secondCard.card.firstChild;

          inner1.style.boxShadow = "0 0 35px rgba(76, 175, 80, 0.8)";
          inner2.style.boxShadow = "0 0 35px rgba(76, 175, 80, 0.8)";

          // effet smooth
          inner1.style.transform += " scale(0.95)";
          inner2.style.transform += " scale(0.95)";

          firstCard = null;
          secondCard = null;

          if (matchedPairs === pairs.length) {
            setTimeout(() => {
              alert("Bravo, vous avez gagné !");
              onFinish();
            }, 500);
          }

        } else {
          // MAUVAISE PAIRE
          setTimeout(() => {
            firstCard.cardData.flipped = false;
            secondCard.cardData.flipped = false;

            firstCard.card.firstChild.style.transform = "rotateY(0deg)";
            secondCard.card.firstChild.style.transform = "rotateY(0deg)";

            firstCard = null;
            secondCard = null;
          }, 700);
        }
      }
    });

    return card;
  }

  cards.forEach((cardData) => {
    const card = createCard(cardData);
    cardContainer.appendChild(card);
  });
}