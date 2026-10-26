/**
 * Pure Client-Side Offline Game Engine
 * Simulates complete Spring Boot backend mechanics when playing offline
 */

import { getDifficultyConfig } from './gameConfig';

const STORAGE_ACTIVE_GAME = 'rtg_offline_active_game';
const STORAGE_HISTORY = 'rtg_offline_history';

// In-memory active game holder
let activeGame = null;

const loadActiveGame = () => {
  if (activeGame) return activeGame;
  try {
    const raw = localStorage.getItem(STORAGE_ACTIVE_GAME);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed) {
        const cfg = getDifficultyConfig(parsed.difficulty);
        parsed.minNumber = parsed.minNumber ?? cfg.min;
        parsed.maxNumber = parsed.maxNumber ?? cfg.max;
        parsed.attemptsAllowed = parsed.attemptsAllowed ?? cfg.attempts;
        activeGame = parsed;
      }
    }
  } catch (e) {}
  return activeGame;
};

const saveActiveGame = (game) => {
  activeGame = game;
  try {
    if (game) {
      localStorage.setItem(STORAGE_ACTIVE_GAME, JSON.stringify(game));
    } else {
      localStorage.removeItem(STORAGE_ACTIVE_GAME);
    }
  } catch (e) {}
};

export const getOfflineHistory = (playerId) => {
  try {
    const raw = localStorage.getItem(STORAGE_HISTORY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (playerId) {
      return list.filter((g) => String(g.playerId) === String(playerId) || !g.playerId);
    }
    return list;
  } catch (e) {
    return [];
  }
};

const saveCompletedOfflineGame = (game) => {
  try {
    const list = getOfflineHistory();
    list.unshift(game);
    // Keep last 100 offline games
    const trimmed = list.slice(0, 100);
    localStorage.setItem(STORAGE_HISTORY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Failed to save offline game history:', e);
  }
};

const isPrime = (n) => {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) == 0) return false;
  }
  return true;
};

const generateDetectiveClue = (secret, attempt, min, max) => {
  switch (attempt) {
    case 1:
      return `🕵️ Clue #1: The secret number is ${secret % 2 === 0 ? 'EVEN.' : 'ODD.'}`;
    case 2:
      if (secret % 10 === 0) return '🕵️ Clue #2: The secret number is a multiple of 10.';
      if (secret % 5 === 0) return '🕵️ Clue #2: The secret number is divisible by 5.';
      if (secret % 3 === 0) return '🕵️ Clue #2: The secret number is divisible by 3.';
      if (secret % 7 === 0) return '🕵️ Clue #2: The secret number is divisible by 7.';
      if (isPrime(secret)) return '🕵️ Clue #2: The secret number is a PRIME number!';
      return '🕵️ Clue #2: The secret number is NOT divisible by 3 or 5.';
    case 3: {
      let sum = 0;
      let temp = secret;
      while (temp > 0) {
        sum += temp % 10;
        temp = Math.floor(temp / 10);
      }
      return `🕵️ Clue #3: The sum of digits of the secret number is ${sum}.`;
    }
    case 4:
      return `🕵️ Clue #4: The secret number ends with the digit ${secret % 10}.`;
    default: {
      const lowerTens = Math.floor(secret / 10) * 10;
      const upperTens = lowerTens + 9;
      return `🕵️ Clue #${attempt}: The secret number lies between ${Math.max(min, lowerTens)} and ${Math.min(max, upperTens)}.`;
    }
  }
};

const calculateOfflineScore = (game) => {
  let baseScore = 1000;
  let multiplier = 1.0;

  switch (game.difficulty) {
    case 'EASY':
      baseScore = 500;
      multiplier = 1.0;
      break;
    case 'MEDIUM':
      baseScore = 1500;
      multiplier = 2.0;
      break;
    case 'HARD':
      baseScore = 3000;
      multiplier = 4.0;
      break;
    case 'EXPERT':
      baseScore = 6000;
      multiplier = 8.0;
      break;
    default:
      break;
  }

  const penaltyPerExtraAttempt = baseScore / (game.attemptsAllowed * 1.5);
  const attemptPenalty = (game.attemptsUsed - 1) * penaltyPerExtraAttempt;

  let secondsElapsed = 30;
  if (game.startedAt) {
    secondsElapsed = Math.max(1, Math.floor((Date.now() - new Date(game.startedAt).getTime()) / 1000));
  }
  const timePenalty = secondsElapsed * 3.0 * multiplier;

  let modeMultiplier = 1.0;
  if (game.gameMode === 'HARDCORE') modeMultiplier = 3.0;
  else if (game.gameMode === 'DETECTIVE') modeMultiplier = 1.3;
  else if (game.gameMode === 'TIME_ATTACK') modeMultiplier = 1.5;

  const finalScore = Math.round((baseScore - attemptPenalty - timePenalty) * modeMultiplier);
  const minimumScore = Math.round(200 * multiplier * modeMultiplier);
  return Math.max(minimumScore, finalScore);
};

export const startOfflineGame = (playerId = 999999, difficulty = 'MEDIUM', gameMode = 'CLASSIC', playerMode = 'SOLO', customOptions = {}) => {
  const diffConfig = getDifficultyConfig(difficulty);
  const minNumber = customOptions.minNumber ?? diffConfig.min;
  const maxNumber = customOptions.maxNumber ?? diffConfig.max;
  let attemptsAllowed = customOptions.attemptsAllowed ?? diffConfig.attempts;
  const level = customOptions.level || null;

  // Multiplayer attempt multiplier
  switch (playerMode) {
    case '2P_VS_2CPU':
    case '2P_VS_2P':
    case '3P_VS_1CPU':
    case '4P_FFA':
      attemptsAllowed *= 2;
      break;
    case '4P_VS_4P':
      attemptsAllowed *= 3;
      break;
    default:
      break;
  }

  const secretNumber = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
  const gameId = Date.now();

  const game = {
    gameId,
    playerId: playerId || 999999,
    username: 'Offline Player',
    difficulty,
    gameMode,
    playerMode,
    minNumber,
    maxNumber,
    attemptsAllowed,
    attemptsUsed: 0,
    attemptsRemaining: attemptsAllowed,
    score: 0,
    status: 'IN_PROGRESS',
    startedAt: new Date().toISOString(),
    completedAt: null,
    timeTakenSeconds: 0,
    secretNumber,
    guesses: [],
    isOffline: true,
    level,
  };

  saveActiveGame(game);

  return {
    gameId: game.gameId,
    playerId: game.playerId,
    username: game.username,
    difficulty: game.difficulty,
    gameMode: game.gameMode,
    playerMode: game.playerMode,
    minNumber: game.minNumber,
    maxNumber: game.maxNumber,
    attemptsAllowed: game.attemptsAllowed,
    attemptsUsed: 0,
    attemptsRemaining: game.attemptsAllowed,
    score: 0,
    status: 'IN_PROGRESS',
    startedAt: game.startedAt,
    completedAt: null,
    timeTakenSeconds: 0,
    guesses: [],
    isOffline: true,
    level,
  };
};

export const makeOfflineGuess = (gameId, guessNum) => {
  let game = loadActiveGame();
  if (!game || String(game.gameId) !== String(gameId)) {
    // If not found, create a fallback active game
    game = startOfflineGame();
  }

  const guess = parseInt(guessNum, 10);
  if (!Array.isArray(game.guesses)) {
    game.guesses = [];
  }

  // Safe duplicate check in offline engine
  const alreadyGuessed = game.guesses.some((g) => g.guessNumber === guess);
  if (alreadyGuessed) {
    return {
      duplicate: true,
      result: 'DUPLICATE',
      message: `You already guessed ${guess}! Try a different number.`,
      attemptsUsed: game.attemptsUsed,
      attemptsRemaining: game.attemptsRemaining,
      score: game.score,
      status: game.status,
      gameId: game.gameId,
      gameOver: false,
      guessNumber: guess,
      attemptNumber: game.attemptsUsed,
      isOffline: true,
    };
  }
  const secret = game.secretNumber;
  const attemptsUsed = game.attemptsUsed + 1;
  game.attemptsUsed = attemptsUsed;
  game.attemptsRemaining = Math.max(0, game.attemptsAllowed - attemptsUsed);

  const totalRange = Math.max(1, game.maxNumber - game.minNumber);
  const distance = Math.abs(guess - secret);
  const ratio = distance / totalRange;

  let proximity;
  if (distance === 0) proximity = 'CORRECT';
  else if (distance <= Math.max(3, Math.round(totalRange * 0.04))) proximity = 'BOILING_HOT';
  else if (ratio <= 0.12) proximity = 'HOT';
  else if (ratio <= 0.25) proximity = 'WARM';
  else if (ratio <= 0.50) proximity = 'COLD';
  else proximity = 'FREEZING';

  let extraClue = null;
  if (game.gameMode === 'DETECTIVE' && guess !== secret) {
    extraClue = generateDetectiveClue(secret, attemptsUsed, game.minNumber, game.maxNumber);
  }

  let result;
  let message;
  let gameOver = false;

  if (guess === secret) {
    result = 'CORRECT';
    message = 'Correct — you win!';
    game.status = 'WON';
    game.completedAt = new Date().toISOString();
    game.score = calculateOfflineScore(game);
    gameOver = true;
  } else if (guess < secret) {
    result = 'TOO_LOW';
    if (attemptsUsed >= game.attemptsAllowed) {
      message = 'Game Over! Maximum attempts reached.';
      game.status = 'LOST';
      game.score = 0;
      game.completedAt = new Date().toISOString();
      gameOver = true;
    } else {
      message = 'Too Low — try a bigger number.';
    }
  } else {
    result = 'TOO_HIGH';
    if (attemptsUsed >= game.attemptsAllowed) {
      message = 'Game Over! Maximum attempts reached.';
      game.status = 'LOST';
      game.score = 0;
      game.completedAt = new Date().toISOString();
      gameOver = true;
    } else {
      message = 'Too High — try a smaller number.';
    }
  }

  const guessDetail = {
    id: Date.now(),
    guessNumber: guess,
    result,
    attemptNumber: attemptsUsed,
    createdAt: new Date().toISOString(),
    proximity,
    extraClue,
    distance,
  };
  game.guesses.push(guessDetail);

  if (gameOver) {
    saveCompletedOfflineGame(game);
    saveActiveGame(null);
  } else {
    saveActiveGame(game);
  }

  return {
    result,
    message,
    attemptsUsed,
    attemptsRemaining: game.attemptsRemaining,
    score: game.score,
    status: game.status,
    gameId: game.gameId,
    gameOver,
    guessNumber: guess,
    attemptNumber: attemptsUsed,
    createdAt: guessDetail.createdAt,
    gameMode: game.gameMode,
    proximity,
    extraClue,
    distance,
    isOffline: true,
    level: game.level || null,
  };
};

export const useOfflinePowerUp = (gameId, type, currentMin = 1, currentMax = 1000) => {
  const game = loadActiveGame();
  const secret = game ? game.secretNumber : Math.floor((currentMin + currentMax) / 2);

  switch (type.toLowerCase()) {
    case 'slice50': {
      const min = Math.max(game ? game.minNumber : 1, currentMin);
      const max = Math.min(game ? game.maxNumber : 1000, currentMax);
      const lowerSpan = Math.max(0, secret - min);
      const upperSpan = Math.max(0, max - secret);

      let newMin = min;
      let newMax = max;
      let slicedCount = 0;

      if (upperSpan >= lowerSpan && upperSpan > 1) {
        const cut = Math.floor(upperSpan / 2);
        newMax = max - cut;
        slicedCount = cut;
      } else if (lowerSpan > 1) {
        const cut = Math.floor(lowerSpan / 2);
        newMin = min + cut;
        slicedCount = cut;
      }

      return {
        powerUpType: 'slice50',
        newMin,
        newMax,
        slicedCount,
        message: `Offline Quantum Slicer vaporized ${slicedCount} false candidates!`,
      };
    }

    case 'oracle': {
      let clue = secret % 2 === 0 ? 'The secret number is EVEN.' : 'The secret number is ODD.';
      if (secret % 10 === 0) clue += ' Multiple of 10.';
      else if (secret % 5 === 0) clue += ' Divisible by 5.';
      else if (secret % 3 === 0) clue += ' Divisible by 3.';
      else if (isPrime(secret)) clue += ' It is a PRIME number!';

      let sum = 0;
      let temp = secret;
      while (temp > 0) {
        sum += temp % 10;
        temp = Math.floor(temp / 10);
      }
      clue += ` (Sum of digits = ${sum})`;

      return {
        powerUpType: 'oracle',
        clue,
        message: `Oracle revealed: ${clue}`,
      };
    }

    case 'shield': {
      if (game) {
        game.attemptsAllowed += 1;
        game.attemptsRemaining += 1;
        saveActiveGame(game);
      }
      return {
        powerUpType: 'shield',
        attemptsAllowed: game ? game.attemptsAllowed : 8,
        attemptsRemaining: game ? game.attemptsRemaining : 8,
        message: 'Second Chance Shield granted +1 attempt offline!',
      };
    }

    case 'empfreeze':
    default:
      return {
        powerUpType: type,
        message: "Turn Freeze activated! Opponent's turn skipped.",
      };
  }
};

export const getOfflineProfile = (playerId) => {
  const history = getOfflineHistory(playerId);
  const totalGames = history.length;
  const wonGames = history.filter((g) => g.status === 'WON').length;
  const winRate = totalGames > 0 ? ((wonGames / totalGames) * 100).toFixed(1) : '0.0';
  const bestScore = history.reduce((max, g) => Math.max(max, g.score || 0), 0);

  // Compute streak
  let currentStreak = 0;
  let bestStreak = 0;
  let running = 0;
  for (let g of [...history].reverse()) {
    if (g.status === 'WON') {
      running++;
      bestStreak = Math.max(bestStreak, running);
    } else {
      running = 0;
    }
  }
  currentStreak = running;

  return {
    id: playerId || 999999,
    username: 'Offline Player',
    email: 'offline@rtg.local',
    totalGames,
    wonGames,
    winRate: Number(winRate),
    bestScore,
    currentStreak,
    bestStreak,
    isOffline: true,
  };
};

export const getOfflineGame = (gameId) => {
  const active = loadActiveGame();
  if (active && String(active.gameId) === String(gameId)) {
    return active;
  }
  const history = getOfflineHistory();
  const found = history.find((g) => String(g.gameId) === String(gameId));
  if (found) return found;
  return active || null;
};

export default {
  startOfflineGame,
  makeOfflineGuess,
  useOfflinePowerUp,
  getOfflineHistory,
  getOfflineGame,
  getOfflineProfile,
};

