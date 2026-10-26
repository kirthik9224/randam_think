import React from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import sounds from '../utils/soundEffects';
import { getLevelProgression, getLevelConfig } from '../utils/levelProgression';
import '../styles/Home.css';
import '../styles/CollageGameTheme.css';

/**
 * Home Page
 * Purpose: Main entry point for playing the game.
 * - Game logo and title
 * - Tagline: "Think • Guess • Win!"
 * - Short game description
 * - Small current-level indicator for returning players
 * - One prominent Play Now button
 */
const Home = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const progress = getLevelProgression();
  const activeLevelCfg = getLevelConfig(progress.unlockedLevel);

  const completedLevelsCount = Math.max(
    0,
    Object.keys(progress.levelStars || {}).filter((lvl) => (progress.levelStars[lvl] || 0) > 0).length,
    progress.unlockedLevel - 1
  );
  const isReturningPlayer = progress.unlockedLevel > 1 || completedLevelsCount > 0;

  const ensureGuest = () => {
    if (!currentUser) {
      return authService.loginAsGuest('Guest Player');
    }
    return currentUser;
  };

  const handleStartGame = (levelNumber = progress.unlockedLevel) => {
    sounds.playClick();
    ensureGuest();
    const lvlCfg = getLevelConfig(levelNumber);
    navigate('/game', {
      state: {
        level: lvlCfg.level,
        difficulty:
          lvlCfg.level <= 2
            ? 'EASY'
            : lvlCfg.level <= 5
            ? 'MEDIUM'
            : lvlCfg.level <= 10
            ? 'HARD'
            : 'EXPERT',
        minNumber: lvlCfg.min,
        maxNumber: lvlCfg.max,
        attemptsAllowed: lvlCfg.attempts,
        mode: 'CLASSIC',
        playerMode: 'SOLO',
      },
    });
  };

  return (
    <div className="dashboard-page-container">
      {/* Main Clean Gaming Home Card */}
      <div className="dashboard-main-card animate-fade-in text-center">
        
        {/* Game Logo & Illustration */}
        <div className="dashboard-lightbulb-glow">
          <span className="bulb-emoji" role="img" aria-label="Glowing Lightbulb">
            💡
          </span>
          <span className="floating-chip chip-q">?</span>
          <span className="floating-chip chip-num">{activeLevelCfg.max}</span>
        </div>

        {/* Game Title */}
        <h1 className="dashboard-title">
          GUESS THE NUMBER
        </h1>

        {/* Tagline */}
        <div className="dashboard-tagline">
          Think • Guess • Win!
        </div>

        {/* Short Game Description */}
        <p className="dashboard-desc">
          “I'm thinking of a number. Can you guess it?”
        </p>

        {/* Small current-level indicator for returning players */}
        {isReturningPlayer && (
          <div className="mb-4">
            <span
              className="badge rounded-pill px-3.5 py-2 font-monospace fw-bold"
              style={{
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                fontSize: '0.88rem',
                letterSpacing: '0.03em',
              }}
            >
              ⭐ Current Level: {progress.unlockedLevel} • Numbers 1 to {activeLevelCfg.max}
            </span>
          </div>
        )}

        {/* One Prominent Play Now Button */}
        <div className="pt-2">
          <button
            onClick={() => handleStartGame(progress.unlockedLevel)}
            className="btn btn-dashboard-play"
            title={isReturningPlayer ? `Play Level ${progress.unlockedLevel}` : 'Start Playing'}
          >
            <i className="bi bi-play-fill fs-1"></i>
            <span>PLAY NOW</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Home;
