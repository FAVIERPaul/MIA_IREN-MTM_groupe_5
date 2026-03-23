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