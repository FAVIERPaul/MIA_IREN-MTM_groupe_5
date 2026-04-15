import { createGameTitle, createFeedbackDiv, setFeedback, errorMessages } from "../gameInterface.js";

export function startGame2(container, onFinish) {
  container.innerHTML = "";

  const title = createGameTitle("Déchiffre le code couleur");
  const feedbackDiv = createFeedbackDiv();
  container.appendChild(title);

  const colors = ["red", "blue", "green", "yellow"];
  const keys = ["z", "s", "a", "e"];
  const codeSequence = ["red", "blue", "green", "yellow"];
  let playerIndex = 0;

  // --- INTERFACE ---
  const gameWrapper = document.createElement("div");
  gameWrapper.style.display = "flex";
  gameWrapper.style.flexDirection = "column";
  gameWrapper.style.alignItems = "center";
  gameWrapper.style.gap = "40px"; // Plus d'espace pour le suspense
  container.appendChild(gameWrapper);

  // Rangée des carrés
  const sequenceDiv = document.createElement("div");
  sequenceDiv.style.display = "flex";
  sequenceDiv.style.gap = "20px";
  gameWrapper.appendChild(sequenceDiv);

  // Zone des indices mélangés
  const hintsContainer = document.createElement("div");
  hintsContainer.style.display = "flex";
  hintsContainer.style.gap = "20px";
  hintsContainer.style.padding = "15px 30px";
  hintsContainer.style.background = "rgba(255,255,255,0.03)";
  hintsContainer.style.borderRadius = "50px";
  hintsContainer.style.border = "1px solid rgba(255,255,255,0.1)";
  gameWrapper.appendChild(hintsContainer);

  // 1. Création des carrés (Vides)
  const boxes = codeSequence.map(() => {
    const box = document.createElement("div");
    box.style.width = "75px";
    box.style.height = "75px";
    box.style.background = "#000000";
    box.style.border = "1px solid rgba(255,255,255,0.2)";
    box.style.borderRadius = "12px";
    box.style.transition = "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    sequenceDiv.appendChild(box);
    return box;
  });

  // 2. Création des indices MÉLANGÉS
  const shuffledKeys = [...keys].sort(() => Math.random() - 0.5);
  shuffledKeys.forEach(k => {
    const hint = document.createElement("div");
    hint.style.width = "50px";
    hint.style.height = "50px";
    hint.style.display = "flex";
    hint.style.alignItems = "center";
    hint.style.justifyContent = "center";
    hint.style.fontFamily = "'Courier New', monospace";
    hint.style.fontSize = "18px";
    hint.style.fontWeight = "bold";
    hint.style.color = "white";
    hint.style.border = "1px solid rgba(255,255,255,0.3)";
    hint.style.borderRadius = "50%"; // Style bouton circulaire
    hint.innerText = k.toUpperCase();
    hintsContainer.appendChild(hint);
  });

  gameWrapper.appendChild(feedbackDiv);

  // --- LOGIQUE ---
  function handleKey(e) {
    const key = e.key.toLowerCase();
    if (!keys.includes(key)) return;

    const expectedColor = codeSequence[playerIndex];
    const expectedKey = keys[colors.indexOf(expectedColor)];
    const currentBox = boxes[playerIndex];

    if (key === expectedKey) {
      // RÉUSSITE : Couleur + Halo blanc
      currentBox.style.background = expectedColor;
      currentBox.style.borderColor = "#ffffff";
      // Box-shadow combinant la couleur et un halo blanc intense
      currentBox.style.boxShadow = `0 0 10px #ffffff, 0 0 30px ${expectedColor}`;
      currentBox.style.transform = "scale(1.1) translateY(-5px)";
      
      setFeedback(feedbackDiv, true, "✓ ACCÈS PARTIEL");
      playerIndex++;

      if (playerIndex === codeSequence.length) {
        document.removeEventListener("keydown", handleKey);
        setFeedback(feedbackDiv, true, "✓ SYSTÈME DÉVERROUILLÉ");
        setTimeout(onFinish, 800);
      }
    } else {
      // ERREUR : La case actuelle bouge (vibration)
      setFeedback(feedbackDiv, false, "ERREUR DE SÉQUENCE");
      
      currentBox.animate([
        { transform: 'translateX(-10px)', borderColor: 'red' },
        { transform: 'translateX(10px)', borderColor: 'red' },
        { transform: 'translateX(0)', borderColor: 'rgba(255,255,255,0.2)' }
      ], { duration: 100, iterations: 3 });

      // Reset de tout le jeu
      playerIndex = 0;
      setTimeout(() => {
        boxes.forEach(box => {
          box.style.background = "#000000";
          box.style.borderColor = "rgba(255,255,255,0.2)";
          box.style.boxShadow = "none";
          box.style.transform = "scale(1)";
        });
      }, 300);
    }
  }

  document.addEventListener("keydown", handleKey);
}