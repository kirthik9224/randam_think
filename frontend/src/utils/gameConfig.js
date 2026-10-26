/**
 * Single Authoritative Game Configuration for Random Thinking
 * Ensures consistent number ranges, attempt limits, and casual difficulty definitions across the entire application.
 */

export const GAME_DIFFICULTIES = {
  EASY: {
    id: 'EASY',
    name: 'Easy',
    min: 1,
    max: 20,
    attempts: 10,
    multiplier: '1x',
    badgeClass: 'bg-success',
    color: '#10b981',
    icon: 'bi-emoji-smile-fill',
    tag: 'Beginners & Kids',
    shortDesc: 'Numbers 1 to 20',
    description: 'Generous 10 attempts with numbers 1 to 20. Super easy and fun for quick wins!',
  },
  MEDIUM: {
    id: 'MEDIUM',
    name: 'Medium',
    min: 1,
    max: 100,
    attempts: 7,
    multiplier: '2x',
    badgeClass: 'bg-primary',
    color: '#3b82f6',
    icon: 'bi-star-fill',
    tag: 'Classic Default',
    shortDesc: 'Numbers 1 to 100',
    description: 'The classic 1 to 100 number challenge with 7 attempts. Perfect balance of fun & deduction!',
  },
  HARD: {
    id: 'HARD',
    name: 'Hard',
    min: 1,
    max: 500,
    attempts: 5,
    multiplier: '4x',
    badgeClass: 'bg-warning text-dark',
    color: '#f59e0b',
    icon: 'bi-fire',
    tag: 'Challengers',
    shortDesc: 'Numbers 1 to 500',
    description: 'Wider range from 1 to 500 with only 5 attempts. Great for players who love strategy!',
  },
  EXPERT: {
    id: 'EXPERT',
    name: 'Expert',
    min: 1,
    max: 1000,
    attempts: 5,
    multiplier: '8x',
    badgeClass: 'bg-danger',
    color: '#ef4444',
    icon: 'bi-trophy-fill',
    tag: 'Master Minds',
    shortDesc: 'Numbers 1 to 1000',
    description: 'High-stakes intuition across 1,000 possibilities. Available in More Options.',
  },
};

export const CASUAL_DIFFICULTIES = [
  GAME_DIFFICULTIES.EASY,
  GAME_DIFFICULTIES.MEDIUM,
  GAME_DIFFICULTIES.HARD,
];

export const CASUAL_PLAYER_MODES = [
  {
    id: 'SOLO',
    name: 'Play Solo',
    badge: 'Solo Mode',
    icon: 'bi-person-fill',
    description: 'Just you against the secret number. Relaxed and casual.',
    howTurnsWork: 'You make every guess until you find the number or run out of attempts.',
  },
  {
    id: '1P_VS_1P',
    name: 'Play with a Friend',
    badge: 'Same Device (Pass & Play)',
    icon: 'bi-people-fill',
    description: 'Pass the device back and forth! Take turns guessing with a friend.',
    howTurnsWork: 'Player 1 makes a guess, then hands the device to Player 2. The first to guess the secret number wins!',
  },
  {
    id: '1_VS_CPU',
    name: 'Play against Computer',
    badge: 'You vs AI',
    icon: 'bi-robot',
    description: 'Take turns guessing against a smart computer opponent.',
    howTurnsWork: 'You guess, then the Computer takes a turn. See who deduces the number first!',
  },
];

/**
 * Returns safe difficulty configuration with guaranteed fallbacks to prevent undefined values
 */
export const getDifficultyConfig = (diff) => {
  const key = (diff || 'MEDIUM').toUpperCase().trim();
  return GAME_DIFFICULTIES[key] || GAME_DIFFICULTIES.MEDIUM;
};

/**
 * Calculates 1 to 3 stars based on attempts used
 */
export const calculateStars = (attemptsUsed, maxAttempts, isWin = true) => {
  if (!isWin) return 0;
  const safeAttempts = attemptsUsed || 1;
  const safeMax = maxAttempts || 7;
  const ratio = safeAttempts / safeMax;

  if (safeAttempts <= 3 || ratio <= 0.35) return 3;
  if (safeAttempts <= 5 || ratio <= 0.65) return 2;
  return 1;
};

/**
 * Safe Range String formatter (guarantees no 'undefined - undefined')
 */
export const formatRange = (gameOrDiff) => {
  if (!gameOrDiff) return '1 – 100';
  if (typeof gameOrDiff === 'string') {
    const cfg = getDifficultyConfig(gameOrDiff);
    return `${cfg.min} – ${cfg.max}`;
  }
  const min = gameOrDiff.minNumber ?? (getDifficultyConfig(gameOrDiff.difficulty)?.min ?? 1);
  const max = gameOrDiff.maxNumber ?? (getDifficultyConfig(gameOrDiff.difficulty)?.max ?? 100);
  return `${min} – ${max}`;
};
