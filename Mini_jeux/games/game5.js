import { createGameTitle, createRebusDisplay, createInputField, createValidationButton, createFeedbackDiv, setFeedback, errorMessages } from "../gameInterface.js";
import { gameManager } from "../gameCleanup.js";

export function startGame5(container, onFinish) {
  container.innerHTML = "";

  const title = createGameTitle("Déchiffre l'énigme !");
  const rebusDiv = createRebusDisplay("🪽👃🪚🐓");
  const input = createInputField();
  const button = createValidationButton();
  const feedbackDiv = createFeedbackDiv();

  container.appendChild(title);
  container.appendChild(rebusDiv);
  container.appendChild(input);
  container.appendChild(button);
  container.appendChild(feedbackDiv);

  let attempts = 0;

  function checkAnswer() {
    const answer = input.value.toLowerCase().trim();

    if (answer === "coccinelle") {
      setFeedback(feedbackDiv, true, "✓ Bien joué !");
      setTimeout(() => {
        onFinish(); 
      }, 500);
    } else {
      setFeedback(feedbackDiv, false, errorMessages[attempts % errorMessages.length]);
      attempts++;
    }
  }

  button.addEventListener("click", checkAnswer);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      checkAnswer();
    }
  });
}