/**
 * Network Connectivity Manager
 * Game runs connected directly to backend API.
 */

try {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('rtg_network_mode');
  }
} catch (e) {}

export const getNetworkMode = () => 'ONLINE';

export const isOnline = () => true;

export const setNetworkMode = () => {};

export const toggleOnlineOffline = () => true;

export const onNetworkChange = (callback) => {
  return () => {};
};

export default {
  isOnline,
  getNetworkMode,
  setNetworkMode,
  toggleOnlineOffline,
  onNetworkChange,
};
