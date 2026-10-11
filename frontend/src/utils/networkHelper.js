/**
 * Network Connectivity & Online/Offline Mode Manager
 * Handles browser online/offline events and player manual mode preferences
 */

const MODE_STORAGE_KEY = 'rtg_network_mode'; // 'AUTO' | 'ONLINE' | 'OFFLINE'
const listeners = new Set();

export const getNetworkMode = () => {
  try {
    return localStorage.getItem(MODE_STORAGE_KEY) || 'AUTO';
  } catch (e) {
    return 'AUTO';
  }
};

export const isOnline = () => {
  const mode = getNetworkMode();
  if (mode === 'OFFLINE') return false;
  if (mode === 'ONLINE') return true;
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

export const setNetworkMode = (mode) => {
  try {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  } catch (e) {}
  notifyListeners();
};

export const toggleOnlineOffline = () => {
  const current = isOnline();
  setNetworkMode(current ? 'OFFLINE' : 'ONLINE');
  return !current;
};

export const onNetworkChange = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

const notifyListeners = () => {
  const online = isOnline();
  listeners.forEach((fn) => {
    try {
      fn(online);
    } catch (e) {
      console.warn('Network listener error:', e);
    }
  });
};

if (typeof window !== 'undefined') {
  window.addEventListener('online', notifyListeners);
  window.addEventListener('offline', notifyListeners);
}

export default {
  isOnline,
  getNetworkMode,
  setNetworkMode,
  toggleOnlineOffline,
  onNetworkChange,
};
