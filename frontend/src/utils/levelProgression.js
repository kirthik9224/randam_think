/**
 * Level Progression System for Random Thinking
 * Manages levels 1 through 12 with increasing range and fair attempt limits.
 * Handles persistence in localStorage so progress remains after refresh or login.
 */

export const LEVELS = [
  {
    level: 1,
    title: 'The Beginning',
    min: 1,
    max: 10,
    attempts: 5,
    tag: 'Warm Up',
    color: '#10b981', // Emerald
    badgeClass: 'bg-success',
    desc: 'Guess a number from 1 to 10',
  },
  {
    level: 2,
    title: 'Stepping Up',
    min: 1,
    max: 20,
    attempts: 6,
    tag: 'Quick Step',
    color: '#06b6d4', // Cyan
    badgeClass: 'bg-info',
    desc: 'Guess a number from 1 to 20',
  },
  {
    level: 3,
    title: 'Rising Star',
    min: 1,
    max: 30,
    attempts: 7,
    tag: 'Getting Warmer',
    color: '#3b82f6', // Blue
    badgeClass: 'bg-primary',
    desc: 'Guess a number from 1 to 30',
  },
  {
    level: 4,
    title: 'Clever Thinker',
    min: 1,
    max: 50,
    attempts: 7,
    tag: 'Sharp Mind',
    color: '#6366f1', // Indigo
    badgeClass: 'bg-indigo',
    desc: 'Guess a number from 1 to 50',
  },
  {
    level: 5,
    title: 'Century Milestone',
    min: 1,
    max: 100,
    attempts: 7,
    tag: 'The Classic 100',
    color: '#8b5cf6', // Violet
    badgeClass: 'bg-purple',
    desc: 'Guess a number from 1 to 100',
  },
  {
    level: 6,
    title: 'Number Explorer',
    min: 1,
    max: 150,
    attempts: 8,
    tag: 'Century Plus',
    color: '#ec4899', // Pink
    badgeClass: 'bg-pink',
    desc: 'Guess a number from 1 to 150',
  },
  {
    level: 7,
    title: 'Double Century',
    min: 1,
    max: 200,
    attempts: 8,
    tag: 'Bigger Range',
    color: '#f43f5e', // Rose
    badgeClass: 'bg-danger',
    desc: 'Guess a number from 1 to 200',
  },
  {
    level: 8,
    title: 'Brain Booster',
    min: 1,
    max: 300,
    attempts: 8,
    tag: 'Intuition Test',
    color: '#f97316', // Orange
    badgeClass: 'bg-orange',
    desc: 'Guess a number from 1 to 300',
  },
  {
    level: 9,
    title: 'Puzzle Master',
    min: 1,
    max: 400,
    attempts: 9,
    tag: 'Strategy Pro',
    color: '#eab308', // Amber
    badgeClass: 'bg-warning text-dark',
    desc: 'Guess a number from 1 to 400',
  },
  {
    level: 10,
    title: 'Halfway Hero',
    min: 1,
    max: 500,
    attempts: 9,
    tag: 'High Stakes',
    color: '#14b8a6', // Teal
    badgeClass: 'bg-teal',
    desc: 'Guess a number from 1 to 500',
  },
  {
    level: 11,
    title: 'Grand Deduction',
    min: 1,
    max: 750,
    attempts: 10,
    tag: 'Elite Focus',
    color: '#0284c7', // Sky Blue
    badgeClass: 'bg-primary',
    desc: 'Guess a number from 1 to 750',
  },
  {
    level: 12,
    title: 'Ultimate Champion',
    min: 1,
    max: 1000,
    attempts: 10,
    tag: 'Legendary',
    color: '#e11d48', // Ruby
    badgeClass: 'bg-danger',
    desc: 'Guess a number from 1 to 1000',
  },
];

const STORAGE_KEY = 'rtg_level_progress';

export const getLevelProgression = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.unlockedLevel === 'number') {
        return {
          unlockedLevel: Math.max(1, Math.min(parsed.unlockedLevel, LEVELS.length)),
          currentLevel: Math.max(1, Math.min(parsed.currentLevel || parsed.unlockedLevel, LEVELS.length)),
          levelStars: parsed.levelStars || {},
          totalStars: parsed.totalStars || 0,
        };
      }
    }
  } catch (e) {
    console.warn('Error reading level progression:', e);
  }

  // Default initial state: Level 1 unlocked
  return {
    unlockedLevel: 1,
    currentLevel: 1,
    levelStars: {},
    totalStars: 0,
  };
};

export const saveLevelProgression = (progress) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Error saving level progression:', e);
  }
};

export const getLevelConfig = (levelNumber) => {
  const lvl = parseInt(levelNumber, 10) || 1;
  const found = LEVELS.find((l) => l.level === lvl);
  return found || LEVELS[0];
};

export const calculateLevelStars = (attemptsUsed, maxAttempts) => {
  const safeUsed = attemptsUsed || 1;
  const safeMax = maxAttempts || 7;
  const ratio = safeUsed / safeMax;

  if (safeUsed <= 2 || ratio <= 0.35) return 3;
  if (safeUsed <= 4 || ratio <= 0.65) return 2;
  return 1;
};

export const completeLevel = (levelNumber, attemptsUsed, maxAttempts) => {
  const currentProg = getLevelProgression();
  const starsEarned = calculateLevelStars(attemptsUsed, maxAttempts);

  const existingStars = currentProg.levelStars[levelNumber] || 0;
  const newLevelStars = {
    ...currentProg.levelStars,
    [levelNumber]: Math.max(existingStars, starsEarned),
  };

  let newUnlocked = currentProg.unlockedLevel;
  let nextLevel = levelNumber;

  if (levelNumber >= currentProg.unlockedLevel && levelNumber < LEVELS.length) {
    newUnlocked = levelNumber + 1;
    nextLevel = levelNumber + 1;
  } else if (levelNumber < LEVELS.length) {
    nextLevel = levelNumber + 1;
  }

  // Calculate sum of all stars
  const totalStars = Object.values(newLevelStars).reduce((acc, s) => acc + s, 0);

  const updatedProgress = {
    unlockedLevel: newUnlocked,
    currentLevel: nextLevel,
    levelStars: newLevelStars,
    totalStars,
  };

  saveLevelProgression(updatedProgress);

  return {
    stars: starsEarned,
    unlockedNext: newUnlocked > currentProg.unlockedLevel,
    nextLevel,
    isMaxLevel: levelNumber >= LEVELS.length,
    totalStars,
  };
};

export const getAllLevelsWithStatus = () => {
  const progress = getLevelProgression();
  return LEVELS.map((lvl) => {
    const isCompleted = lvl.level < progress.unlockedLevel || Boolean(progress.levelStars[lvl.level]);
    const isCurrent = lvl.level === progress.currentLevel && !isCompleted;
    const isUnlocked = lvl.level <= progress.unlockedLevel;
    const stars = progress.levelStars[lvl.level] || 0;

    let status = 'LOCKED';
    if (isCompleted) status = 'COMPLETED';
    else if (isCurrent || lvl.level === progress.unlockedLevel) status = 'CURRENT';

    return {
      ...lvl,
      isUnlocked,
      status,
      stars,
    };
  });
};

export const resetLevelProgression = () => {
  const initial = {
    unlockedLevel: 1,
    currentLevel: 1,
    levelStars: {},
    totalStars: 0,
  };
  saveLevelProgression(initial);
  return initial;
};
