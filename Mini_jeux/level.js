// Level management module

const levels = [
  { game: 'game1', difficulty: 'easy' },
  { game: 'game2', difficulty: 'easy' },
  { game: 'game3', difficulty: 'easy' },
  { game: 'game4', difficulty: 'medium' },
  { game: 'game5', difficulty: 'medium' },
  { game: 'game6', difficulty: 'hard' },
  { game: 'game7', difficulty: 'hard' },
  { game: 'game8', difficulty: 'hard' }
];

// Get the next level
export function getNextLevel(currentLevelIndex) {
  return levels[currentLevelIndex + 1] || null;
}

// Get all levels
export function getAllLevels() {
  return levels;
}

// Example usage
// console.log(getNextLevel(0)); // { game: 'game2', difficulty: 'medium' }