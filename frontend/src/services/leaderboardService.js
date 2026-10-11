import api from './api';
import { isOnline } from '../utils/networkHelper';
import offlineGameEngine from '../utils/offlineGameEngine';

const getOfflineLeaderboardHelper = (difficulty = '', limit = 50) => {
  const history = offlineGameEngine.getOfflineHistory();
  return history
    .filter((g) => !difficulty || difficulty === 'ALL' || g.difficulty === difficulty)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, limit)
    .map((g, idx) => ({
      rank: idx + 1,
      gameId: g.gameId,
      playerId: g.playerId,
      username: g.username || 'Offline Player',
      score: g.score || 0,
      difficulty: g.difficulty,
      attemptsUsed: g.attemptsUsed,
      attemptsAllowed: g.attemptsAllowed,
      timeTakenSeconds: g.timeTakenSeconds || 30,
      playedAt: g.completedAt || g.startedAt,
    }));
};

export const leaderboardService = {
  async getLeaderboard(difficulty = '', limit = 50) {
    if (!isOnline()) {
      return getOfflineLeaderboardHelper(difficulty, limit);
    }
    try {
      const params = {};
      if (difficulty && difficulty !== 'ALL') {
        params.difficulty = difficulty;
      }
      if (limit) {
        params.limit = limit;
      }
      const response = await api.get('/leaderboard', { params });
      return response.data;
    } catch (err) {
      console.warn('Leaderboard API unreachable, returning local offline leaderboard:', err);
      return getOfflineLeaderboardHelper(difficulty, limit);
    }
  },

  async getTopLeaderboard() {
    if (!isOnline()) {
      return getOfflineLeaderboardHelper('ALL', 5);
    }
    try {
      const response = await api.get('/leaderboard/top');
      return response.data;
    } catch (err) {
      console.warn('Top leaderboard unreachable, returning offline top:', err);
      return getOfflineLeaderboardHelper('ALL', 5);
    }
  },

  async getPlayerProfile(playerId) {
    if (!isOnline()) {
      return offlineGameEngine.getOfflineProfile(playerId);
    }
    try {
      const response = await api.get(`/players/${playerId}`);
      return response.data;
    } catch (err) {
      console.warn('Player profile unreachable, calculating offline profile:', err);
      return offlineGameEngine.getOfflineProfile(playerId);
    }
  },

  async updateProfile(playerId, data) {
    if (!isOnline()) {
      return { id: playerId, ...data };
    }
    const response = await api.put(`/players/${playerId}`, data);
    return response.data;
  },

  async getAdminStats() {
    if (!isOnline()) {
      return { totalPlayers: 1, totalGames: 1, totalWins: 1 };
    }
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  async getAllPlayers() {
    if (!isOnline()) return [];
    const response = await api.get('/admin/players');
    return response.data;
  },

  async getAllGames() {
    if (!isOnline()) return offlineGameEngine.getOfflineHistory();
    const response = await api.get('/admin/games');
    return response.data;
  },

  async deletePlayer(playerId) {
    const response = await api.delete(`/admin/players/${playerId}`);
    return response.data;
  },

  async deleteGame(gameId) {
    const response = await api.delete(`/admin/games/${gameId}`);
    return response.data;
  },
};

export default leaderboardService;
