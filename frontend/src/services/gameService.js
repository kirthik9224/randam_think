import api from './api';
import { isOnline } from '../utils/networkHelper';
import offlineGameEngine from '../utils/offlineGameEngine';

export const gameService = {
  async startGame(playerId, difficulty, gameMode = 'CLASSIC', playerMode = 'SOLO', customOptions = {}) {
    if (!isOnline()) {
      return offlineGameEngine.startOfflineGame(playerId, difficulty, gameMode, playerMode, customOptions);
    }
    try {
      const payload = {
        playerId,
        difficulty,
        gameMode,
        playerMode,
        minNumber: customOptions.minNumber,
        maxNumber: customOptions.maxNumber,
        attemptsAllowed: customOptions.attemptsAllowed,
        level: customOptions.level,
      };
      const response = await api.post('/games/start', payload);
      const data = response.data;
      if (customOptions.level) data.level = customOptions.level;
      return data;
    } catch (err) {
      console.warn('Backend start game unreachable, falling back to offline game engine:', err);
      return offlineGameEngine.startOfflineGame(playerId, difficulty, gameMode, playerMode, customOptions);
    }
  },

  async makeGuess(gameId, guess) {
    if (!isOnline()) {
      return offlineGameEngine.makeOfflineGuess(gameId, guess);
    }
    try {
      const response = await api.post(`/games/${gameId}/guess`, {
        guess: parseInt(guess, 10),
      });
      return response.data;
    } catch (err) {
      if (err.message && (err.message.includes('already guessed') || err.message.includes('between') || err.message.includes('finished'))) {
        throw err;
      }
      console.warn('Backend guess unreachable, evaluating offline:', err);
      return offlineGameEngine.makeOfflineGuess(gameId, guess);
    }
  },

  async getGame(gameId) {
    if (!isOnline() || (gameId && String(gameId).startsWith('off_'))) {
      const offline = offlineGameEngine.getOfflineGame(gameId);
      if (offline) return offline;
      return offlineGameEngine.startOfflineGame();
    }
    try {
      const response = await api.get(`/games/${gameId}`);
      return response.data;
    } catch (err) {
      const offline = offlineGameEngine.getOfflineGame(gameId);
      if (offline) return offline;
      return offlineGameEngine.startOfflineGame();
    }
  },

  async restartGame(gameId) {
    if (!isOnline() || (gameId && String(gameId).startsWith('off_'))) {
      const oldGame = offlineGameEngine.getOfflineGame(gameId);
      return offlineGameEngine.startOfflineGame(
        oldGame?.playerId || 999999,
        oldGame?.difficulty || 'MEDIUM',
        oldGame?.gameMode || 'CLASSIC',
        oldGame?.playerMode || 'SOLO'
      );
    }
    try {
      const response = await api.post(`/games/${gameId}/restart`);
      return response.data;
    } catch (err) {
      const oldGame = offlineGameEngine.getOfflineGame(gameId);
      return offlineGameEngine.startOfflineGame(
        oldGame?.playerId || 999999,
        oldGame?.difficulty || 'MEDIUM',
        oldGame?.gameMode || 'CLASSIC',
        oldGame?.playerMode || 'SOLO'
      );
    }
  },

  async getPlayerHistory(playerId) {
    const offlineList = offlineGameEngine.getOfflineHistory(playerId);
    if (!isOnline()) {
      return offlineList;
    }
    try {
      const response = await api.get(`/games/player/${playerId}`);
      const onlineList = Array.isArray(response.data) ? response.data : [];
      // Combine online and offline history records
      return [...offlineList, ...onlineList];
    } catch (err) {
      console.warn('Backend player history unreachable, returning offline history:', err);
      return offlineList;
    }
  },

  async getGameResult(gameId) {
    if (!isOnline()) {
      return { gameId, status: 'WON', score: 1000 };
    }
    try {
      const response = await api.get(`/games/${gameId}/result`);
      return response.data;
    } catch (err) {
      return { gameId, status: 'WON', score: 1000 };
    }
  },

  async usePowerUp(gameId, type, currentMin = 1, currentMax = 1000) {
    if (!isOnline()) {
      return offlineGameEngine.useOfflinePowerUp(gameId, type, currentMin, currentMax);
    }
    try {
      const response = await api.post(`/games/${gameId}/powerup/${type}?currentMin=${currentMin}&currentMax=${currentMax}`);
      return response.data;
    } catch (err) {
      console.warn('Backend power-up unreachable, executing locally:', err);
      return offlineGameEngine.useOfflinePowerUp(gameId, type, currentMin, currentMax);
    }
  },
};

export default gameService;
