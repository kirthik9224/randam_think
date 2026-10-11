/**
 * Helper utilities for multiplayer & computer player match modes
 */

export const getDefaultRoster = (playerMode, currentUsername = 'Player 1') => {
  const username = currentUsername || 'Player 1';

  switch (playerMode) {
    case '1_VS_CPU':
      return [
        { id: 'p1', name: `${username} (You)`, isAi: false, team: 'Player', color: 'primary', icon: 'bi-person-fill' },
        { id: 'cpu1', name: 'Computer (CPU)', isAi: true, team: 'Computer', color: 'danger', icon: 'bi-cpu-fill' },
      ];

    case '1P_VS_1P':
      return [
        { id: 'p1', name: `${username} (P1)`, isAi: false, team: 'Player 1', color: 'primary', icon: 'bi-person-fill' },
        { id: 'p2', name: 'Player 2', isAi: false, team: 'Player 2', color: 'success', icon: 'bi-person-fill' },
      ];

    case '2P_VS_2CPU':
      return [
        { id: 'p1', name: `${username} (P1)`, isAi: false, team: 'Team Players', color: 'primary', icon: 'bi-person-fill' },
        { id: 'cpu1', name: 'Computer 1', isAi: true, team: 'Team Computer', color: 'danger', icon: 'bi-cpu-fill' },
        { id: 'p2', name: 'Player 2', isAi: false, team: 'Team Players', color: 'primary', icon: 'bi-person-check-fill' },
        { id: 'cpu2', name: 'Computer 2', isAi: true, team: 'Team Computer', color: 'danger', icon: 'bi-cpu-fill' },
      ];

    case '2P_VS_2P':
      return [
        { id: 'p1', name: `${username} (P1)`, isAi: false, team: 'Team Blue', color: 'primary', icon: 'bi-person-fill' },
        { id: 'p3', name: 'Player 3', isAi: false, team: 'Team Red', color: 'danger', icon: 'bi-person-fill' },
        { id: 'p2', name: 'Player 2', isAi: false, team: 'Team Blue', color: 'primary', icon: 'bi-person-check-fill' },
        { id: 'p4', name: 'Player 4', isAi: false, team: 'Team Red', color: 'danger', icon: 'bi-person-check-fill' },
      ];

    case '3P_VS_1CPU':
      return [
        { id: 'p1', name: `${username} (P1)`, isAi: false, team: 'Challenger Squad', color: 'primary', icon: 'bi-person-fill' },
        { id: 'cpu_boss_1', name: 'MasterMind Boss', isAi: true, team: 'Boss Computer', color: 'danger', icon: 'bi-cpu-fill' },
        { id: 'p2', name: 'Player 2', isAi: false, team: 'Challenger Squad', color: 'primary', icon: 'bi-person-fill' },
        { id: 'cpu_boss_2', name: 'MasterMind Boss', isAi: true, team: 'Boss Computer', color: 'danger', icon: 'bi-cpu-fill' },
        { id: 'p3', name: 'Player 3', isAi: false, team: 'Challenger Squad', color: 'primary', icon: 'bi-person-fill' },
        { id: 'cpu_boss_3', name: 'MasterMind Boss', isAi: true, team: 'Boss Computer', color: 'danger', icon: 'bi-cpu-fill' },
      ];

    case '4P_FFA':
      return [
        { id: 'p1', name: `${username} (P1)`, isAi: false, team: 'Player 1', color: 'primary', icon: 'bi-person-fill' },
        { id: 'p2', name: 'Player 2', isAi: false, team: 'Player 2', color: 'success', icon: 'bi-person-fill' },
        { id: 'p3', name: 'Player 3', isAi: false, team: 'Player 3', color: 'warning', icon: 'bi-person-fill' },
        { id: 'p4', name: 'Player 4', isAi: false, team: 'Player 4', color: 'info', icon: 'bi-person-fill' },
      ];

    case '4P_VS_4P':
      return [
        { id: 'alpha1', name: `${username} (Alpha 1)`, isAi: false, team: 'Squad Alpha', color: 'primary', icon: 'bi-person-fill' },
        { id: 'omega1', name: 'Omega CPU 1', isAi: true, team: 'Squad Omega', color: 'danger', icon: 'bi-cpu-fill' },
        { id: 'alpha2', name: 'Alpha 2', isAi: false, team: 'Squad Alpha', color: 'primary', icon: 'bi-person-fill' },
        { id: 'omega2', name: 'Omega CPU 2', isAi: true, team: 'Squad Omega', color: 'danger', icon: 'bi-cpu-fill' },
        { id: 'alpha3', name: 'Alpha 3', isAi: false, team: 'Squad Alpha', color: 'primary', icon: 'bi-person-fill' },
        { id: 'omega3', name: 'Omega CPU 3', isAi: true, team: 'Squad Omega', color: 'danger', icon: 'bi-cpu-fill' },
        { id: 'alpha4', name: 'Alpha 4', isAi: false, team: 'Squad Alpha', color: 'primary', icon: 'bi-person-fill' },
        { id: 'omega4', name: 'Omega CPU 4', isAi: true, team: 'Squad Omega', color: 'danger', icon: 'bi-cpu-fill' },
      ];

    case 'SOLO':
    default:
      return [
        { id: 'p1', name: username, isAi: false, team: 'Solo', color: 'primary', icon: 'bi-person-fill' },
      ];
  }
};

export const getPlayerModeTitle = (playerMode) => {
  switch (playerMode) {
    case '1_VS_CPU':
      return '1 vs Computer';
    case '1P_VS_1P':
      return '1 Player vs 1 Player';
    case '2P_VS_2CPU':
      return '2 Players vs 2 Computers';
    case '2P_VS_2P':
      return '2 Players vs 2 Players';
    case '3P_VS_1CPU':
      return '3 Players vs 1 Computer';
    case '4P_FFA':
      return '4 Players (Individual)';
    case '4P_VS_4P':
      return '4 Players vs 4 Players';
    case 'SOLO':
    default:
      return 'Solo Practice';
  }
};

/**
 * Computer guessing algorithm
 * Computes an optimal number within [currentMin, currentMax] based on difficulty
 */
export const calculateAiGuess = (min, max, difficulty, previousGuesses = []) => {
  const low = Math.min(min, max);
  const high = Math.max(min, max);

  if (low === high) return low;

  const pastNumbers = new Set(previousGuesses.map((g) => g.guessNumber));
  const diff = high - low;
  const mid = Math.round((low + high) / 2);

  let guess = mid;

  if (difficulty === 'EXPERT') {
    guess = mid;
  } else if (difficulty === 'HARD') {
    // Sharp binary search with tiny variance (-1, 0, +1)
    const offset = Math.floor(Math.random() * 3) - 1;
    guess = mid + offset;
  } else if (difficulty === 'MEDIUM') {
    // Binary search with small random variance
    const maxOffset = Math.max(1, Math.floor(diff * 0.08));
    const offset = Math.floor(Math.random() * (maxOffset * 2 + 1)) - maxOffset;
    guess = mid + offset;
  } else {
    // Easy mode: random pick closer to center
    const rangeQuarter = Math.max(1, Math.floor(diff * 0.25));
    const offset = Math.floor(Math.random() * (rangeQuarter * 2 + 1)) - rangeQuarter;
    guess = mid + offset;
  }

  // Clamp within bounds
  guess = Math.max(low, Math.min(high, guess));

  // If already guessed, find the closest available number in range
  if (pastNumbers.has(guess)) {
    for (let delta = 1; delta <= diff; delta++) {
      if (guess + delta <= high && !pastNumbers.has(guess + delta)) {
        guess = guess + delta;
        break;
      }
      if (guess - delta >= low && !pastNumbers.has(guess - delta)) {
        guess = guess - delta;
        break;
      }
    }
  }

  return guess;
};
