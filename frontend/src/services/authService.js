const USER_KEY = 'rtg_user';

/**
 * Player Service (formerly AuthService)
 * Manages the active player session without requiring any login or signup setup.
 */
export const authService = {
  getCurrentUser() {
    try {
      const user = localStorage.getItem(USER_KEY);
      if (user) {
        const parsed = JSON.parse(user);
        if (parsed && parsed.username) {
          return parsed;
        }
      }
      return this.initPlayer('Player');
    } catch (e) {
      return this.initPlayer('Player');
    }
  },

  setCurrentUser(user) {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Error saving player session:', e);
    }
  },

  initPlayer(nickname = 'Player') {
    const defaultPlayer = {
      id: 1,
      username: nickname || 'Player',
      email: 'player@game.local',
      role: 'PLAYER',
      isGuest: false,
      createdAt: new Date().toISOString(),
    };
    this.setCurrentUser(defaultPlayer);
    return defaultPlayer;
  },

  loginAsGuest(nickname = 'Player') {
    return this.initPlayer(nickname);
  },

  isAuthenticated() {
    return true;
  },

  isGuest() {
    return false;
  },

  isAdmin() {
    return false;
  },

  async logout() {
    this.initPlayer('Player');
  },
};

export default authService;
