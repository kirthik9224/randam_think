import api from './api';
import authService from './authService';

const getEffectivePlayerId = (playerId) => {
  if (playerId && playerId > 0) return playerId;
  const user = authService.getCurrentUser();
  if (user && user.id && user.id > 0) return user.id;
  return 999999;
};

export const coinWalletService = {
  getWallet: async (playerId = null) => {
    const pid = getEffectivePlayerId(playerId);
    const response = await api.get(`/wallet/${pid}`);
    if (response.data && response.data.virtualCoins !== undefined) {
      coinWalletService.syncUserCoins(response.data.virtualCoins);
    }
    return response.data;
  },

  claimDailyLogin: async (playerId = null) => {
    const pid = getEffectivePlayerId(playerId);
    const response = await api.post(`/wallet/${pid}/daily-login`);
    if (response.data && response.data.virtualCoins !== undefined) {
      coinWalletService.syncUserCoins(response.data.virtualCoins);
    }
    return response.data;
  },

  claimDailyChallenge: async (playerId = null) => {
    const pid = getEffectivePlayerId(playerId);
    const response = await api.post(`/wallet/${pid}/daily-challenge`);
    if (response.data && response.data.virtualCoins !== undefined) {
      coinWalletService.syncUserCoins(response.data.virtualCoins);
    }
    return response.data;
  },

  purchaseItem: async (itemId, playerId = null) => {
    const pid = getEffectivePlayerId(playerId);
    const response = await api.post(`/wallet/${pid}/purchase`, { itemId });
    if (response.data && response.data.virtualCoins !== undefined) {
      coinWalletService.syncUserCoins(response.data.virtualCoins);
    }
    return response.data;
  },

  syncUserCoins: (coins) => {
    try {
      const raw = localStorage.getItem('rtg_user');
      if (raw) {
        const u = JSON.parse(raw);
        u.virtualCoins = coins;
        localStorage.setItem('rtg_user', JSON.stringify(u));
      }
      window.dispatchEvent(new CustomEvent('rtg-wallet-updated', { detail: { coins } }));
    } catch (e) {
      // ignore
    }
  },
};

export default coinWalletService;
