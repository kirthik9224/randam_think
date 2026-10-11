/**
 * Universal Daily Mystery Challenge Helper
 * Generates deterministic daily numbers and manages streak tracking & brag sharing
 */

const STORAGE_KEY = 'rtg_daily_challenge_v1';

export const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDailySeed = (dateStr) => {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getDailySecretNumber = (dateStr = getTodayDateString()) => {
  const seed = getDailySeed(dateStr);
  // Universal daily range is 1 to 500
  return (seed % 500) + 1;
};

export const getDailyChallengeState = () => {
  const today = getTodayDateString();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        currentStreak: 0,
        bestStreak: 0,
        lastCompletedDate: null,
        todayStatus: 'UNPLAYED',
        todayAttempts: 0,
        history: {},
      };
    }
    const data = JSON.parse(raw);
    const todayRecord = data.history?.[today];
    return {
      currentStreak: data.currentStreak || 0,
      bestStreak: data.bestStreak || 0,
      lastCompletedDate: data.lastCompletedDate || null,
      todayStatus: todayRecord ? todayRecord.status : 'UNPLAYED',
      todayAttempts: todayRecord ? todayRecord.attempts : 0,
      todayGuesses: todayRecord ? todayRecord.guesses : [],
      history: data.history || {},
    };
  } catch (e) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      lastCompletedDate: null,
      todayStatus: 'UNPLAYED',
      todayAttempts: 0,
      history: {},
    };
  }
};

export const recordDailyChallengeResult = (status, attemptsUsed, guesses = []) => {
  const today = getTodayDateString();
  const state = getDailyChallengeState();

  // If already played today, do not double-increment
  if (state.history[today]) {
    return state;
  }

  let newCurrentStreak = state.currentStreak;
  if (status === 'WON') {
    // Check if yesterday was played to preserve streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (state.lastCompletedDate === yStr) {
      newCurrentStreak += 1;
    } else {
      newCurrentStreak = 1;
    }
  } else {
    newCurrentStreak = 0;
  }

  const newBestStreak = Math.max(state.bestStreak, newCurrentStreak);

  const updatedHistory = {
    ...state.history,
    [today]: {
      status,
      attempts: attemptsUsed,
      guesses,
      timestamp: new Date().toISOString(),
      secret: getDailySecretNumber(today),
    },
  };

  const newState = {
    currentStreak: newCurrentStreak,
    bestStreak: newBestStreak,
    lastCompletedDate: today,
    todayStatus: status,
    todayAttempts: attemptsUsed,
    todayGuesses: guesses,
    history: updatedHistory,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  } catch (e) {
    console.warn('Failed to save daily streak', e);
  }

  return newState;
};

export const generateDailyShareText = (state) => {
  const today = getTodayDateString();
  const won = state.todayStatus === 'WON';
  const attempts = state.todayAttempts || 0;
  const maxAttempts = 7;

  // Generate Wordle style emoji blocks
  let blocks = '';
  if (won) {
    for (let i = 1; i < attempts; i++) {
      blocks += (i % 2 === 0 ? '🟦' : '🟧');
    }
    blocks += '🟩';
  } else {
    blocks = '🟥'.repeat(maxAttempts);
  }

  const origin = typeof window !== 'undefined' && window.location ? window.location.origin : 'http://localhost:5173';
  return `🎯 Random Thinking Game — Daily Mystery #${today}
Result: ${won ? `🏆 Solved in ${attempts}/${maxAttempts} attempts!` : `💥 Out of attempts!`}
${blocks}
🔥 Daily Streak: ${state.currentStreak} Day${state.currentStreak === 1 ? '' : 's'} (Best: ${state.bestStreak})
Play the mystery: ${origin}`;
};

export const getTimeUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diffMs = Math.max(0, midnight - now);

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
};
