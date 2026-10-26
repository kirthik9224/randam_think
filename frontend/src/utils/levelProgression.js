/**
 * Dynamic 5,000-Level Progression System for Random Thinking Game
 *
 * Supports exactly 5,000 numbered solo levels divided into 7 distinct stages:
 * - Levels 1–100: Beginner (up to 100)
 * - Levels 101–500: Intermediate (up to 1,000)
 * - Levels 501–1,000: Advanced (up to 10,000)
 * - Levels 1,001–2,000: Expert (up to 100,000)
 * - Levels 2,001–3,000: Master (up to 1,000,000)
 * - Levels 3,001–4,000: Grandmaster (up to 10,000,000)
 * - Levels 4,001–5,000: Legend (up to 1,000,000,000)
 *
 * Fully dynamic: computes configurations on-the-fly without heavy database or memory overhead.
 * Supports offline progress with localStorage and synchronizes with Spring Boot backend.
 */

export const MAX_LEVEL = 5000;

export const STAGES = [
  {
    id: 'BEGINNER',
    name: 'Beginner',
    start: 1,
    end: 100,
    minRange: 10,
    maxRange: 100,
    color: '#10b981',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    icon: '🌱',
    description: 'Master the fundamentals of number deduction with ranges up to 100.',
  },
  {
    id: 'INTERMEDIATE',
    name: 'Intermediate',
    start: 101,
    end: 500,
    minRange: 100,
    maxRange: 1000,
    color: '#06b6d4',
    badgeClass: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    icon: '⚡',
    description: 'Sharpen your binary search precision with numbers up to 1,000.',
  },
  {
    id: 'ADVANCED',
    name: 'Advanced',
    start: 501,
    end: 1000,
    minRange: 1000,
    maxRange: 10000,
    color: '#3b82f6',
    badgeClass: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    icon: '🛡️',
    description: 'Navigate high-order spans up to 10,000 with calculated strategic cuts.',
  },
  {
    id: 'EXPERT',
    name: 'Expert',
    start: 1001,
    end: 2000,
    minRange: 10000,
    maxRange: 100000,
    color: '#8b5cf6',
    badgeClass: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    icon: '🔮',
    description: 'Tackle formidable 5-digit horizons up to 100,000 with precision.',
  },
  {
    id: 'MASTER',
    name: 'Master',
    start: 2001,
    end: 3000,
    minRange: 100000,
    maxRange: 1000000,
    color: '#ec4899',
    badgeClass: 'bg-pink-500/20 text-pink-400 border border-pink-500/30',
    icon: '🧠',
    description: 'Elite domain with numbers stretching to 1,000,000.',
  },
  {
    id: 'GRANDMASTER',
    name: 'Grandmaster',
    start: 3001,
    end: 4000,
    minRange: 1000000,
    maxRange: 10000000,
    color: '#f97316',
    badgeClass: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    icon: '🔥',
    description: 'Nightmare-scale difficulty pushing intuition up to 10,000,000.',
  },
  {
    id: 'LEGEND',
    name: 'Legend',
    start: 4001,
    end: 5000,
    minRange: 10000000,
    maxRange: 1000000000,
    color: '#ef4444',
    badgeClass: 'bg-red-500/20 text-red-400 border border-red-500/30',
    icon: '👑',
    description: 'The pinnacle challenge: reach up to 1,000,000,000 to become The Living Legend.',
  },
];

/**
 * Deterministic logarithmic scaling matching backend SoloLevelConfigService.java
 */
export const getLevelConfig = (levelNumber) => {
  const safeLevel = Math.max(1, Math.min(parseInt(levelNumber, 10) || 1, MAX_LEVEL));
  const stage = STAGES.find((s) => safeLevel >= s.start && safeLevel <= s.end) || STAGES[0];
  const stageIndex = STAGES.findIndex((s) => s.id === stage.id) + 1;

  // Fractional position inside stage [0.0, 1.0]
  const fraction =
    stage.end === stage.start ? 1.0 : (safeLevel - stage.start) / (stage.end - stage.start);

  const logMin = Math.log10(stage.minRange);
  const logMax = Math.log10(stage.maxRange);
  const currentLog = logMin + fraction * (logMax - logMin);
  let maxNumber = Math.round(Math.pow(10, currentLog));

  if (safeLevel === stage.start) maxNumber = stage.minRange;
  if (safeLevel === stage.end) maxNumber = stage.maxRange;
  if (maxNumber < 10) maxNumber = 10;

  // Binary search optimal attempts: ceil(log2(maxNumber))
  const optimalAttempts = Math.ceil(Math.log2(maxNumber));

  // Determine milestone
  const isMilestone = safeLevel % 50 === 0 || safeLevel === 1 || safeLevel === MAX_LEVEL;
  let milestoneBadge = null;

  if (safeLevel === 100) milestoneBadge = 'Beginner Graduate';
  else if (safeLevel === 500) milestoneBadge = 'Intermediate Tactician';
  else if (safeLevel === 1000) milestoneBadge = 'Advanced Solver';
  else if (safeLevel === 2000) milestoneBadge = 'Expert Analyst';
  else if (safeLevel === 3000) milestoneBadge = 'Master Mind';
  else if (safeLevel === 4000) milestoneBadge = 'Grandmaster Oracle';
  else if (safeLevel === 5000) milestoneBadge = 'The Living Legend';
  else if (safeLevel % 250 === 0) milestoneBadge = `Stage Milestone ${safeLevel}`;

  // Attempts allowed with fair allowance
  let attemptsAllowed;
  if (safeLevel <= 10) {
    attemptsAllowed = Math.max(5, optimalAttempts + 2);
  } else if (safeLevel <= 100) {
    attemptsAllowed = Math.max(6, optimalAttempts + 1);
  } else if (safeLevel <= 1000) {
    attemptsAllowed = Math.max(7, optimalAttempts + (isMilestone ? 0 : 1));
  } else if (safeLevel <= 3000) {
    attemptsAllowed = Math.max(8, optimalAttempts);
  } else {
    attemptsAllowed = Math.max(8, optimalAttempts - (isMilestone ? 1 : 0));
  }

  // Milestone timer challenge
  let timeLimitSeconds = null;
  if (safeLevel >= 1001 && isMilestone) {
    timeLimitSeconds = safeLevel >= 4001 ? 30 : safeLevel >= 2001 ? 45 : 60;
  }

  // Rewards calculation
  const xpReward = safeLevel * 10;
  const coinReward = 50 + stageIndex * 25 + (isMilestone ? 100 : 0);

  let difficulty = 'MEDIUM';
  if (stage.id === 'BEGINNER') difficulty = safeLevel <= 30 ? 'EASY' : 'MEDIUM';
  else if (stage.id === 'INTERMEDIATE') difficulty = 'MEDIUM';
  else if (stage.id === 'ADVANCED') difficulty = 'HARD';
  else if (stage.id === 'EXPERT') difficulty = 'EXPERT';
  else if (stage.id === 'MASTER') difficulty = 'MASTER';
  else if (stage.id === 'GRANDMASTER') difficulty = 'NIGHTMARE';
  else if (stage.id === 'LEGEND') difficulty = 'FINAL BOSS';

  return {
    level: safeLevel,
    title: isMilestone ? `${stage.name} ${safeLevel} ★ Milestone` : `${stage.name} ${safeLevel}`,
    stage: stage.id,
    stageName: stage.name,
    min: 1,
    max: maxNumber,
    attempts: attemptsAllowed,
    timeLimitSeconds,
    xpReward,
    coinReward,
    isMilestone,
    milestoneBadge,
    color: stage.color,
    badgeClass: stage.badgeClass,
    difficulty,
    desc: `Guess a number between 1 and ${maxNumber.toLocaleString()}`,
  };
};

/**
 * Storage helpers with per-user caching and guest fallback
 */
const getStorageKey = () => {
  try {
    const raw = localStorage.getItem('rtg_user');
    if (raw) {
      const user = JSON.parse(raw);
      if (user && (user.id || user.username)) {
        return `rtg_level_progress_${user.id || user.username}`;
      }
    }
  } catch (e) {}
  return 'rtg_level_progress_v2';
};

export const getLevelProgression = () => {
  try {
    const key = getStorageKey();
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.unlockedLevel === 'number') {
        const unlocked = Math.max(1, Math.min(parsed.unlockedLevel, MAX_LEVEL));
        return {
          unlockedLevel: unlocked,
          currentLevel: Math.max(1, Math.min(parsed.currentLevel || unlocked, MAX_LEVEL)),
          levelStars: parsed.levelStars || {},
          totalStars: parsed.totalStars || 0,
          totalXp: parsed.totalXp || 0,
          badges: Array.isArray(parsed.badges) ? parsed.badges : ['BEGINNER_INITIATE'],
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
    totalXp: 0,
    badges: ['BEGINNER_INITIATE'],
  };
};

export const saveLevelProgression = (progress) => {
  try {
    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(progress));
  } catch (e) {
    console.warn('Error saving level progression:', e);
  }
};

export const calculateLevelStars = (attemptsUsed, maxAttempts) => {
  const safeUsed = attemptsUsed || 1;
  const safeMax = maxAttempts || 7;
  const ratio = safeUsed / safeMax;

  if (safeUsed <= 2 || ratio <= 0.35) return 3;
  if (safeUsed <= 4 || ratio <= 0.65) return 2;
  return 1;
};

/**
 * Completes a level, unlocks the next level, preserves progress, and saves locally.
 */
export const completeLevel = (levelNumber, attemptsUsed, maxAttempts) => {
  const currentProg = getLevelProgression();
  const starsEarned = calculateLevelStars(attemptsUsed, maxAttempts);
  const cfg = getLevelConfig(levelNumber);

  const existingStars = currentProg.levelStars[levelNumber] || 0;
  const newLevelStars = {
    ...currentProg.levelStars,
    [levelNumber]: Math.max(existingStars, starsEarned),
  };

  let newUnlocked = currentProg.unlockedLevel;
  let nextLevel = levelNumber;

  if (levelNumber >= currentProg.unlockedLevel && levelNumber < MAX_LEVEL) {
    newUnlocked = levelNumber + 1;
    nextLevel = levelNumber + 1;
  } else if (levelNumber < MAX_LEVEL) {
    nextLevel = levelNumber + 1;
  }

  const newTotalStars = Object.values(newLevelStars).reduce((acc, s) => acc + s, 0);
  const newTotalXp = (currentProg.totalXp || 0) + cfg.xpReward;

  const newBadges = [...currentProg.badges];
  if (cfg.milestoneBadge && !newBadges.includes(cfg.milestoneBadge)) {
    newBadges.push(cfg.milestoneBadge);
  }

  const updatedProgress = {
    unlockedLevel: newUnlocked,
    currentLevel: nextLevel,
    levelStars: newLevelStars,
    totalStars: newTotalStars,
    totalXp: newTotalXp,
    badges: newBadges,
  };

  saveLevelProgression(updatedProgress);

  return {
    stars: starsEarned,
    unlockedNext: newUnlocked > currentProg.unlockedLevel,
    nextLevel,
    isMaxLevel: levelNumber >= MAX_LEVEL,
    totalStars: newTotalStars,
    totalXp: newTotalXp,
    milestoneBadge: cfg.milestoneBadge,
    coinsEarned: cfg.coinReward,
  };
};

/**
 * Returns a fast slice of levels with status for a specific stage or page.
 */
export const getPaginatedLevels = (stageId, page = 1, pageSize = 50) => {
  const stage = STAGES.find((s) => s.id === stageId) || STAGES[0];
  const progress = getLevelProgression();

  const totalInStage = stage.end - stage.start + 1;
  const totalPages = Math.ceil(totalInStage / pageSize);
  const safePage = Math.max(1, Math.min(page, totalPages));

  const pageStartLevel = stage.start + (safePage - 1) * pageSize;
  const pageEndLevel = Math.min(stage.end, pageStartLevel + pageSize - 1);

  const levels = [];
  for (let lvl = pageStartLevel; lvl <= pageEndLevel; lvl++) {
    const cfg = getLevelConfig(lvl);
    const isCompleted = lvl < progress.unlockedLevel || Boolean(progress.levelStars[lvl]);
    const isCurrent = lvl === progress.currentLevel && !isCompleted;
    const isUnlocked = lvl <= progress.unlockedLevel;
    const stars = progress.levelStars[lvl] || 0;

    let status = 'LOCKED';
    if (isCompleted) status = 'COMPLETED';
    else if (isCurrent || lvl === progress.unlockedLevel) status = 'CURRENT';

    levels.push({
      ...cfg,
      isUnlocked,
      status,
      stars,
    });
  }

  return {
    stage,
    page: safePage,
    totalPages,
    pageSize,
    pageStartLevel,
    pageEndLevel,
    totalInStage,
    levels,
  };
};

export const resetLevelProgression = () => {
  const initial = {
    unlockedLevel: 1,
    currentLevel: 1,
    levelStars: {},
    totalStars: 0,
    totalXp: 0,
    badges: ['BEGINNER_INITIATE'],
  };
  saveLevelProgression(initial);
  return initial;
};

// Backwards-compatible 12-level sample for any old component references
export const LEVELS = Array.from({ length: 12 }, (_, i) => getLevelConfig(i + 1));
