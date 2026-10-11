import api from './api';

const USER_KEY = 'rtg_user';

export const authService = {
  async register(username, email, password, confirmPassword) {
    const response = await api.post('/auth/register', {
      username,
      email,
      password,
      confirmPassword,
    });
    if (response.data && response.data.data) {
      this.setCurrentUser(response.data.data);
    }
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    if (response.data && response.data.data) {
      this.setCurrentUser(response.data.data);
    }
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Logout API call failed, clearing local storage anyway', e);
    } finally {
      localStorage.removeItem(USER_KEY);
    }
  },

  getCurrentUser() {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.error('Error parsing stored user:', e);
      return null;
    }
  },

  setCurrentUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  isAuthenticated() {
    return !!this.getCurrentUser();
  },

  isGuest() {
    const user = this.getCurrentUser();
    return Boolean(user && user.isGuest);
  },

  loginAsGuest(nickname = 'Guest Explorer') {
    const guestUser = {
      id: 999999,
      username: nickname || 'Guest Explorer',
      email: 'guest@offline.local',
      role: 'PLAYER',
      isGuest: true,
      createdAt: new Date().toISOString(),
    };
    this.setCurrentUser(guestUser);
    return guestUser;
  },

  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'ADMIN';
  },
};

export default authService;
