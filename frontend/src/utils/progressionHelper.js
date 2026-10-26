// Progression System: XP, Player Levels, Rank Titles and Rewards
const STORAGE_XP = 'rtg_player_xp';
const STORAGE_STATS = 'rtg_progression_stats';
const STORAGE_AWARDED_GAMES = 'rtg_awarded_game_ids';

const RANK_TIERS = [
  { minLevel: 50, title: 'Cosmic Thinker', icon: 'bi-stars', color: '#ec4899', badge: 'bg-danger text-white' },
  { minLevel: 35, title: 'Grandmaster Oracle', icon: 'bi-gem', color: '#8b5cf6', badge: 'bg-purple text-white' },
  { minLevel: 20, title: 'Mind Reader', icon: 'bi-eye-fill', color: '#6366f1', badge: 'bg-primary text-white' },
  { minLevel: 10, title: 'Probability Master', icon: 'bi-calculator-fill', color: '#3b82f6', badge: 'bg-info text-dark' },
  { minLevel: 5,  title: 'Code Breaker', icon: 'bi-cpu-fill', color: '#10b981', badge: 'bg-success text-white' },
  { minLevel: 1,  title: 'Rookie Detective', icon: 'bi-search', color: '#f59e0b', badge: 'bg-warning text-dark' },
];

export const getXpForLevel = (level) => {
  // Linear-geometric curve: Level 1 requires 250 XP, Level 2 requires 500 XP, etc.
  return level * 250;
};

export const calculateLevelFromXp = (totalXp) => {
  let level = 1;
  let remainingXp = Math.max(0, totalXp);

  while (true) {
    const needed = getXpForLevel(level);
    if (remainingXp >= needed) {
      remainingXp -= needed;
      level += 1;
    } else {
      break;
    }
  }

  const nextLevelXp = getXpForLevel(level);
  const currentLevelXp = remainingXp;
  const progressPercent = Math.min(100, Math.round((currentLevelXp / nextLevelXp) * 100));

  const rank = RANK_TIERS.find((r) => level >= r.minLevel) || RANK_TIERS[RANK_TIERS.length - 1];

  return {
    level,
    totalXp,
    currentLevelXp,
    nextLevelXp,
    progressPercent,
    title: rank.title,
    icon: rank.icon,
    color: rank.color,
    badge: rank.badge,
  };
};

export const getPlayerProgression = () => {
  try {
    const rawXp = localStorage.getItem(STORAGE_XP);
    const totalXp = rawXp ? parseInt(rawXp, 10) : 0;
    return calculateLevelFromXp(totalXp);
  } catch (e) {
    return calculateLevelFromXp(0);
  }
};

export const awardGameXp = (gameResult, isDailyChallenge = false) => {
  if (!gameResult) {
    const prog = getPlayerProgression();
    return { earnedXp: 0, breakdown: [], prevProg: prog, newProg: prog, leveledUp: false };
  }

  // Deduplicate rewards: Never award duplicate rewards from repeated requests or page refreshes
  const gameId = gameResult.gameId || (gameResult.startedAt ? `${gameResult.startedAt}_${gameResult.attemptsUsed}` : null);
  if (gameId) {
    try {
      const awardedRaw = localStorage.getItem(STORAGE_AWARDED_GAMES) || '[]';
      const awardedIds = JSON.parse(awardedRaw);
      if (awardedIds.includes(String(gameId))) {
        const prog = getPlayerProgression();
        return {
          earnedXp: 0,
          breakdown: [],
          prevProg: prog,
          newProg: prog,
          leveledUp: false,
          alreadyAwarded: true,
        };
      }
      awardedIds.push(String(gameId));
      if (awardedIds.length > 200) awardedIds.shift();
      localStorage.setItem(STORAGE_AWARDED_GAMES, JSON.stringify(awardedIds));
    } catch (e) {}
  }
  const isWon = gameResult?.status === 'WON';
  const attemptsAllowed = gameResult?.attemptsAllowed || 7;
  const attemptsUsed = gameResult?.attemptsUsed || attemptsAllowed;
  const unusedAttempts = Math.max(0, attemptsAllowed - attemptsUsed);
  const difficulty = gameResult?.difficulty || 'MEDIUM';
  const gameMode = gameResult?.gameMode || 'CLASSIC';

  let difficultyMultiplier = 1.0;
  if (difficulty === 'EASY') difficultyMultiplier = 1.0;
  else if (difficulty === 'MEDIUM') difficultyMultiplier = 1.5;
  else if (difficulty === 'HARD') difficultyMultiplier = 2.0;
  else if (difficulty === 'EXPERT') difficultyMultiplier = 3.0;

  let modeMultiplier = 1.0;
  if (gameMode === 'HARDCORE') modeMultiplier = 2.0;
  else if (gameMode === 'TIME_ATTACK') modeMultiplier = 1.5;
  else if (gameMode === 'DETECTIVE') modeMultiplier = 1.3;

  // XP Breakdown items
  const breakdown = [];
  let earnedXp = 50; // Participation XP
  breakdown.push({ label: 'Match Participation', xp: 50 });

  if (isWon) {
    const winXp = Math.round(150 * difficultyMultiplier * modeMultiplier);
    earnedXp += winXp;
    breakdown.push({ label: `Victory (${difficulty} ${gameMode})`, xp: winXp });

    if (unusedAttempts > 0) {
      const efficiencyXp = unusedAttempts * 30;
      earnedXp += efficiencyXp;
      breakdown.push({ label: `Attempt Efficiency (+${unusedAttempts} left)`, xp: efficiencyXp });
    }

    if (attemptsUsed <= 2) {
      earnedXp += 100;
      breakdown.push({ label: '🎯 Sniper Bonus (≤2 Attempts)', xp: 100 });
    }
  }

  if (isDailyChallenge) {
    earnedXp += 150;
    breakdown.push({ label: '📅 Daily Mystery Challenge Bonus', xp: 150 });
  }

  // Update stored XP
  const prevProg = getPlayerProgression();
  const newTotalXp = prevProg.totalXp + earnedXp;

  try {
    localStorage.setItem(STORAGE_XP, String(newTotalXp));
  } catch (e) {}

  const newProg = calculateLevelFromXp(newTotalXp);
  const leveledUp = newProg.level > prevProg.level;

  return {
    earnedXp,
    breakdown,
    prevProg,
    newProg,
    leveledUp,
    newLevel: newProg.level,
    newRankTitle: newProg.title,
  };
};

export const addDirectXp = (amount, reason = 'Bonus Reward') => {
  const prevProg = getPlayerProgression();
  const newTotalXp = prevProg.totalXp + amount;
  try {
    localStorage.setItem(STORAGE_XP, String(newTotalXp));
  } catch (e) {}
  const newProg = calculateLevelFromXp(newTotalXp);
  return {
    amount,
    reason,
    prevProg,
    newProg,
    leveledUp: newProg.level > prevProg.level,
  };
};

export default {
  getPlayerProgression,
  calculateLevelFromXp,
  awardGameXp,
  addDirectXp,
  getXpForLevel,
};
