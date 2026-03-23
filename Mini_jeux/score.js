// Score management module

let scores = [];

// Add a new score
export function addScore(player, score) {
  scores.push({ player, score });
  scores.sort((a, b) => b.score - a.score); // Sort scores in descending order
}

// Get top scores
export function getTopScores(limit = 10) {
  return scores.slice(0, limit);
}

// Example usage
// addScore('Player1', 100);
// console.log(getTopScores());