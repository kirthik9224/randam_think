// Board Theme & Pin Customization Manager
import { getPlayerProgression } from './progressionHelper';

const STORAGE_THEME = 'rtg_selected_theme';
const STORAGE_PIN = 'rtg_selected_pin';

export const THEMES = [
  {
    id: 'CYBERPUNK',
    name: 'Cyberpunk Neon',
    icon: 'bi-cpu-fill',
    desc: 'Deep obsidian backdrop with glowing cyan grid & ambient magenta glow',
    minLevel: 1,
    previewColor: '#06b6d4',
  },
  {
    id: 'CASINO_GOLD',
    name: 'Casino Royale',
    icon: 'bi-gem',
    desc: 'Polished obsidian backdrop with royal amber-gold trims and luxury lighting',
    minLevel: 1,
    previewColor: '#f59e0b',
  },
  {
    id: 'MIDNIGHT_SPACE',
    name: 'Midnight Deep Space',
    icon: 'bi-stars',
    desc: 'Cosmic indigo gradient with subtle celestial nebula atmosphere',
    minLevel: 1,
    previewColor: '#6366f1',
  },
  {
    id: 'RETRO_8BIT',
    name: 'Retro Arcade 8-Bit',
    icon: 'bi-joystick',
    desc: 'Vintage phosphor green terminal scanlines with classic arcade CRT glow',
    minLevel: 1,
    previewColor: '#10b981',
  },
  {
    id: 'DEFAULT',
    name: 'Modern Clean',
    icon: 'bi-palette2',
    desc: 'Crisp minimalist dashboard with clean borders and soft slate glass',
    minLevel: 1,
    previewColor: '#3b82f6',
  },
];

export const PIN_ICONS = [
  { id: 'dart', icon: '🎯', label: 'Bullseye', minLevel: 1 },
  { id: 'bolt', icon: '⚡', label: 'Cyber Bolt', minLevel: 1 },
  { id: 'diamond', icon: '💎', label: 'Royal Gem', minLevel: 1 },
  { id: 'rocket', icon: '🚀', label: 'Space Rocket', minLevel: 1 },
  { id: 'clover', icon: '🍀', label: 'Lucky Clover', minLevel: 1 },
];

export const getSelectedTheme = () => {
  try {
    return localStorage.getItem(STORAGE_THEME) || 'CYBERPUNK';
  } catch (e) {
    return 'CYBERPUNK';
  }
};

export const setSelectedTheme = (themeId) => {
  try {
    localStorage.setItem(STORAGE_THEME, themeId);
    applyThemeClass(themeId);
  } catch (e) {}
};

export const getSelectedPin = () => {
  try {
    return localStorage.getItem(STORAGE_PIN) || '🎯';
  } catch (e) {
    return '🎯';
  }
};

export const setSelectedPin = (pinIcon) => {
  try {
    localStorage.setItem(STORAGE_PIN, pinIcon);
  } catch (e) {}
};

export const applyThemeClass = (themeId) => {
  const current = themeId || getSelectedTheme();
  const root = document.documentElement;
  // Remove all theme classes first
  THEMES.forEach((t) => {
    root.classList.remove(`theme-${t.id.toLowerCase()}`);
  });
  if (current) {
    root.classList.add(`theme-${current.toLowerCase()}`);
  }
};

export const getThemeAvailability = () => {
  const { level } = getPlayerProgression();
  return THEMES.map((t) => ({
    ...t,
    isUnlocked: level >= t.minLevel,
  }));
};

export const getPinAvailability = () => {
  const { level } = getPlayerProgression();
  return PIN_ICONS.map((p) => ({
    ...p,
    isUnlocked: level >= p.minLevel,
  }));
};

export default {
  THEMES,
  PIN_ICONS,
  getSelectedTheme,
  setSelectedTheme,
  getSelectedPin,
  setSelectedPin,
  applyThemeClass,
  getThemeAvailability,
  getPinAvailability,
};
