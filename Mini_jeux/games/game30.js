import { createInputField, createValidationButton, createFeedbackDiv, setFeedback } from "../gameInterface.js";
import { gameManager } from "../gameCleanup.js";

export function startGame10(container, onFinish) {
  const levels = [
  
  {
    question: "3, 5, 4, 4, 3, ?",
    answer: "5",
    hint: "Nombre de lettres de mots : THREE, FOUR, FIVE, SIX, ..."
  },
  {
    question: "10, 9, 8, 7, ?",
    answer: "5",
    hint: "La vraie logique ici n'est pas la suite décroit : c'est l'indice (1→10, 2→9 ...)."
  },
  {
    question: "2, 4, 8, 16, ?",
    answer: "?",
    hint: "Cette fois on brise le pattern : double → rupture. Réponse attendue exacte ' ? '."
  },
  {
    question: "5, 10, 20, ?",
    answer: "je ne sais pas",
    hint: "Meta : le jeu a changé les règles, réponds honnêtement."
  },
  {
    question: "Dernier niveau : il n'y a pas de logique !"
    ,answer: "il n'y a pas de logique",
    hint: "Fais confiance à ton intuition finale."
  }
  ];
  container.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = "Pattern Breaker";
  title.style.textAlign = "center";
  title.style.color = "#836fff";
  title.style.marginBottom = "16px";

  const question = document.createElement("p");
  question.id = "pb-question";
  question.style.textAlign = "center";
  question.style.fontSize = "26px";
  question.style.color = "#fff";
  question.style.margin = "12px 0";

  const input = createInputField();
  const button = createValidationButton();
  const feedback = createFeedbackDiv();

  let currentLevel = 0;
  let attempts = 0;

  function loadLevel() {
    const level = levels[currentLevel];
    question.textContent = level.question;
    input.value = "";
    attempts = 0;
    setFeedback(feedback, true, "Bonne chance !");
    input.focus();
  }

  function showProgressHint() {
    if (attempts === 2) {
      setFeedback(feedback, false, `Indice : ${levels[currentLevel].hint}`);
    } else if (attempts === 4) {
      setFeedback(feedback, false, "Un autre indice : relis bien l'énoncé, ce n'est pas toujours la même règle.");
    } else {
      const messages = [
        "✗ Essaie encore.",
        "✗ Tiens bon, c'est intéressant !",
        "✗ Petit effort de plus...",
        "✗ Là c'est le moment d'un gros break mental."
      ];
      setFeedback(feedback, false, messages[Math.min(attempts - 1, messages.length - 1)]);
    }
  }

  function checkAnswer() {
    const userInput = input.value.trim().toLowerCase();
    const expected = levels[currentLevel].answer.trim().toLowerCase();

    attempts++;

    if (userInput === "") {
      setFeedback(feedback, false, "Tu dois saisir une réponse.");
      return;
    }

    if (userInput === expected) {
      if (currentLevel === levels.length - 1) {
        setFeedback(feedback, true, "🎉 Tu as trouvé la dernière règle cachée !");
        setTimeout(() => {
          alert("Wow ! Pattern Breaker complété 🎉");
          onFinish();
        }, 250);
        return;
      }

      setFeedback(feedback, true, "✅ Correct ! Niveau suivant...");
      currentLevel++;

      setTimeout(() => {
        loadLevel();
      }, 500);
      return;
    }

    showProgressHint();
  }

  button.addEventListener("click", checkAnswer);

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      checkAnswer();
    }
  });

  container.appendChild(title);
  container.appendChild(question);
  container.appendChild(input);
  container.appendChild(button);
  container.appendChild(feedback);

  loadLevel();
}