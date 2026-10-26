/**
 * Web Push & In-Game Notification Helper
 * Provides browser notifications for Daily Rewards, Match Invites, and Milestones.
 */

export const isNotificationSupported = () => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = () => {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
};

export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) return false;
  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch (e) {
    console.warn('Error requesting notification permission:', e);
    return false;
  }
};

export const sendLocalNotification = (title, options = {}) => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return null;
  }

  const defaultOptions = {
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200],
    ...options,
  };

  try {
    return new Notification(title, defaultOptions);
  } catch (e) {
    // Mobile browsers may require ServiceWorkerRegistration.showNotification
    if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, defaultOptions);
      });
    }
  }
};

export const notifyDailyRewardReady = () => {
  sendLocalNotification('🎁 Daily Reward Ready!', {
    body: 'Your 50 daily login coins are ready to claim. Keep your win streak alive!',
    tag: 'daily-reward',
  });
};

export const notifyMatchTurn = (roomCode, playerName) => {
  sendLocalNotification("🎲 It's Your Turn!", {
    body: `${playerName} made a guess in Room ${roomCode}. Submit your deduction!`,
    tag: `room-${roomCode}`,
  });
};

export const notifyMilestoneUnlocked = (milestoneName, level) => {
  sendLocalNotification('🏆 Milestone Conquered!', {
    body: `Congratulations! You unlocked ${milestoneName} on Level ${level.toLocaleString()}!`,
    tag: `milestone-${level}`,
  });
};
