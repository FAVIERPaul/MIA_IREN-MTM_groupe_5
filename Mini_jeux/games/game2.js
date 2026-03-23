import { createGameTitle, createFeedbackDiv, setFeedback, errorMessages } from "../gameInterface.js";

export function startGame2(container, onFinish) {
  container.innerHTML = "";

  const title = createGameTitle("Déchiffre le code couleur");
  const feedbackDiv = createFeedbackDiv();
  container.appendChild(title);

  const sequenceDiv = document.createElement("div");
  container.appendChild(sequenceDiv);
  container.appendChild(feedbackDiv);

  const colors = ["red", "blue", "green", "yellow"];
  const keys = ["z", "s", "a", "e"];

  const codeSequence = ["red", "blue", "green", "yellow"];
  let playerIndex = 0;

  //  affichage
  codeSequence.forEach(color => {
    const box = document.createElement("div");
    box.style.background = color;
    box.style.width = "80px";
    box.style.height = "80px";
    box.style.display = "inline-block";
    box.style.margin = "5px";
    box.style.border = "2px solid white";

    sequenceDiv.appendChild(box);
  });

  //  input
  function showFeedback(isSuccess, message) {
    setFeedback(feedbackDiv, isSuccess, message);
  }

  function onWin() {
    showFeedback(true, "✓ Bien joué !");
    setTimeout(onFinish, 500);
  }

  function handleKey(e) {
    const key = e.key.toLowerCase();

    const expectedColor = codeSequence[playerIndex];
    const expectedKey = keys[colors.indexOf(expectedColor)];

    if (key === expectedKey) {
      showFeedback(true, "✓");
      playerIndex++;

      if (playerIndex === codeSequence.length) {
        document.removeEventListener("keydown", handleKey);
        onWin();
      }
    } else {
      showFeedback(false, errorMessages.incorrectKey || "✗");
      playerIndex = 0;
    }
  }

  document.addEventListener("keydown", handleKey);
}