export function startGame2(container, onFinish) {
  container.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = "Déchiffre le code couleur";

  const sequenceDiv = document.createElement("div");
  const feedbackDiv = document.createElement("div");

  container.appendChild(title);
  container.appendChild(sequenceDiv);
  container.appendChild(feedbackDiv);

  // 🔑 données
  const colors = ["red", "blue", "green", "yellow"];
  const keys = ["z", "s", "a", "e"];

  const codeSequence = ["red", "blue", "green", "yellow"];
  let playerIndex = 0;

  // 🎨 affichage
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

  // 🎹 input
  function handleKey(e) {
    const key = e.key.toLowerCase();

    const expectedColor = codeSequence[playerIndex];
    const expectedKey = keys[colors.indexOf(expectedColor)];

    if (key === expectedKey) {
      feedbackDiv.style.color = "lime";
      feedbackDiv.textContent = "✓";
      playerIndex++;

      if (playerIndex === codeSequence.length) {
        document.removeEventListener("keydown", handleKey);
        setTimeout(() => {
          onFinish(); // 🔥 passe au niveau suivant
        }, 200);
      }
    } else {
      feedbackDiv.style.color = "red";
      feedbackDiv.textContent = "✗";
      playerIndex = 0;
    }
  }

  document.addEventListener("keydown", handleKey);
}