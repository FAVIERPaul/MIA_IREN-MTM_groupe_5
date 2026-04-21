// Level management module

const levels = [
  { game: 'game1', difficulty: 'easy' },
  { game: 'game2', difficulty: 'easy' },
  { game: 'game3', difficulty: 'easy' },
  { game: 'game4', difficulty: 'medium' },
  { game: 'game5', difficulty: 'medium' },
  { game: 'game6', difficulty: 'hard' },
  { game: 'game7', difficulty: 'hard' },
  { game: 'game8', difficulty: 'hard' },
  { game: 'game9', difficulty: 'hard' },
  { game: 'game10', difficulty: 'hard' },
  { game: 'game11', difficulty: 'hard' },
  { game: 'game12', difficulty: 'hard' },
  { game: 'game13', difficulty: 'hard' },
  { game: 'game14', difficulty: 'hard' },
  { game: 'game15', difficulty: 'hard' },
  { game: 'game16', difficulty: 'hard' },
  { game: 'game17', difficulty: 'hard' },
  { game: 'game18', difficulty: 'hard' },
  { game: 'game19', difficulty: 'hard' },
  { game: 'game20', difficulty: 'hard' },
  { game: 'game21', difficulty: 'hard' },
  { game: 'game22', difficulty: 'hard' },
  { game: 'game23', difficulty: 'hard' },
  { game: 'game24', difficulty: 'hard' },
  { game: 'game25', difficulty: 'hard' },
  { game: 'game26', difficulty: 'hard' },
  { game: 'game27', difficulty: 'hard' },
  { game: 'game28', difficulty: 'hard' },
  { game: 'game30', difficulty: 'hard' },
  { game: 'game31', difficulty: 'hard' },
  { game: 'game32', difficulty: 'hard' },
  { game: 'game33', difficulty: 'hard' },
  { game: 'game34', difficulty: 'hard' },
  { game: 'game35', difficulty: 'hard' },
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