import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import leaderboardService from '../services/leaderboardService';
import gameService from '../services/gameService';
import sounds from '../utils/soundEffects';
import { getLevelProgression, getLevelConfig, LEVELS } from '../utils/levelProgression';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/Dashboard.css';
import '../styles/CollageGameTheme.css';

/**
 * Dashboard Page
 * Purpose: Player-progress and performance page.
 * Displays:
 * - Current level and level progression
 * - Number of completed levels
 * - A visual progress bar
 * - Completed, current, and locked levels
 * - Best score and win rate, only if supported by actual data
 * - Recent games, only if available
 * - One Continue Playing button
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [profile, setProfile] = useState(null);
  const [allGames, setAllGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const progress = getLevelProgression();
  const currentLvlCfg = getLevelConfig(progress.unlockedLevel);

  const completedLevelsCount = Math.max(
    0,
    Object.keys(progress.levelStars || {}).filter((lvl) => (progress.levelStars[lvl] || 0) > 0).length,
    progress.unlockedLevel - 1
  );
  const progressPercent = Math.min(100, Math.round((completedLevelsCount / LEVELS.length) * 100));

  useEffect(() => {
    let user = authService.getCurrentUser();
    if (!user) {
      user = authService.loginAsGuest('Guest Player');
      setCurrentUser(user);
    }
    loadPlayerData(user.id);
  }, []);

  const loadPlayerData = async (userId) => {
    try {
      setLoading(true);
      const targetId = userId || currentUser?.id || 999999;
      const [profileData, historyData] = await Promise.all([
        leaderboardService.getPlayerProfile(targetId),
        gameService.getPlayerHistory(targetId),
      ]);
      setProfile(profileData);
      setAllGames(Array.isArray(historyData) ? historyData : []);
    } catch (err) {
      console.warn('Dashboard performance fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartLevel = (levelNumber = progress.unlockedLevel) => {
    sounds.playClick();
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

  // Derive actual performance metrics
  const totalGamesPlayed =
    profile?.gamesPlayed ?? profile?.totalGames ?? (allGames ? allGames.length : 0);

  const totalGamesWon =
    profile?.gamesWon ??
    profile?.wonGames ??
    (allGames ? allGames.filter((g) => g.status === 'WON').length : 0);

  const bestScore =
    profile?.bestScore ??
    (allGames && allGames.length > 0 ? Math.max(...allGames.map((g) => g.score || 0)) : null);

  const winRate =
    totalGamesPlayed > 0
      ? profile?.winRate !== undefined && profile?.winRate !== null
        ? parseFloat(profile.winRate).toFixed(1)
        : ((totalGamesWon / totalGamesPlayed) * 100).toFixed(1)
      : null;

  const hasActualPerformanceData =
    totalGamesPlayed > 0 && (bestScore !== null || winRate !== null);

  const hasRecentGames = Array.isArray(allGames) && allGames.length > 0;

  if (loading) {
    return <LoadingSpinner message="Loading player progression & stats..." fullScreen />;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper animate-fade-in">

        {/* 1. Header / Hero Profile Banner with ONE Continue Playing Button */}
        <div className="dashboard-hero-card">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge rounded-pill px-3 py-1 fw-bold bg-primary text-white font-monospace">
                  Lvl {progress.unlockedLevel}
                </span>
                <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.4)' }}>
                  ⭐ {progress.totalStars} Stars
                </span>
              </div>
              <h2 className="fw-black text-white mb-1 tracking-tight">
                Player Dashboard
              </h2>
              <p className="text-white-50 mb-0 small">
                Player: <strong className="text-white">{currentUser?.username || 'Player'}</strong> • Unlocked Level {progress.unlockedLevel} ({currentLvlCfg.title})
              </p>
            </div>

            {/* ONE Continue Playing Button */}
            <div>
              <button
                onClick={() => handleStartLevel(progress.unlockedLevel)}
                className="btn btn-dashboard-continue text-nowrap"
                title={`Continue Playing Level ${progress.unlockedLevel}`}
              >
                <i className="bi bi-play-fill fs-4"></i>
                <span>CONTINUE PLAYING (LEVEL {progress.unlockedLevel})</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Level Progression & Visual Progress Bar Card */}
        <div className="dashboard-section-card">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <h4 className="fw-black text-white mb-0 d-flex align-items-center gap-2">
              <span>🏆</span>
              <span>Level Progression</span>
            </h4>
            <div className="text-white-50 small font-monospace">
              Completed: <strong className="text-success">{completedLevelsCount}</strong> of {LEVELS.length} levels ({progressPercent}%)
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="mb-4">
            <div className="progress-track" title={`${progressPercent}% Campaign Completed`}>
              <div
                className="progress-fill"
                style={{ width: `${Math.max(4, progressPercent)}%` }}
              ></div>
            </div>
          </div>

          {/* Completed, Current, and Locked Levels */}
          <div className="mb-2">
            <div className="d-flex justify-content-between align-items-center mb-2.5">
              <span className="text-white-50 small fw-bold text-uppercase tracking-wider">
                Campaign Map (12 Levels)
              </span>
              <span className="text-info small">
                Target: 1 to {currentLvlCfg.max}
              </span>
            </div>

            <div className="levels-grid">
              {LEVELS.map((lvl) => {
                const isCompleted =
                  lvl.level < progress.unlockedLevel || Boolean(progress.levelStars[lvl.level]);
                const isCurrent = lvl.level === progress.unlockedLevel;
                const isLocked = lvl.level > progress.unlockedLevel;

                let chipClass = 'level-chip-locked';
                if (isCurrent) chipClass = 'level-chip-current';
                else if (isCompleted) chipClass = 'level-chip-completed';

                return (
                  <div
                    key={lvl.level}
                    className={`level-chip ${chipClass}`}
                    onClick={() => {
                      if (!isLocked) handleStartLevel(lvl.level);
                    }}
                    title={
                      isCompleted
                        ? `Level ${lvl.level}: ${lvl.title} (Completed) - Click to replay`
                        : isCurrent
                        ? `Level ${lvl.level}: ${lvl.title} (Current Active Level) - Click to play`
                        : `Level ${lvl.level}: Locked (Complete Level ${lvl.level - 1} first)`
                    }
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold font-monospace small" style={{ color: isCurrent ? '#38bdf8' : isCompleted ? '#10b981' : '#94a3b8' }}>
                        Lvl {lvl.level}
                      </span>
                      <span>
                        {isCompleted ? '⭐' : isCurrent ? '🔥' : '🔒'}
                      </span>
                    </div>

                    <div className="small fw-semibold text-truncate text-white mb-1" style={{ fontSize: '0.8rem' }}>
                      {lvl.title}
                    </div>

                    <div className="font-monospace text-white-50" style={{ fontSize: '0.74rem' }}>
                      1–{lvl.max}
                    </div>

                    <div className="mt-1">
                      {isCompleted && (
                        <span className="badge bg-success-subtle text-success rounded-pill font-monospace" style={{ fontSize: '0.65rem' }}>
                          ✓ Done
                        </span>
                      )}
                      {isCurrent && (
                        <span className="badge bg-info text-dark rounded-pill font-monospace" style={{ fontSize: '0.65rem' }}>
                          ▶ Play
                        </span>
                      )}
                      {isLocked && (
                        <span className="badge bg-secondary-subtle text-muted rounded-pill font-monospace" style={{ fontSize: '0.65rem' }}>
                          Locked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Performance Metrics (Best Score & Win Rate, only if supported by actual data) */}
        <div className="dashboard-section-card">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-black text-white mb-0 d-flex align-items-center gap-2">
              <span>📊</span>
              <span>Performance Metrics</span>
            </h4>
            <Link to="/history" className="text-info small text-decoration-none fw-semibold">
              Full Stats &rarr;
            </Link>
          </div>

          {hasActualPerformanceData ? (
            <div className="perf-stat-grid">
              {/* Best Score */}
              <div className="perf-stat-card">
                <span className="perf-stat-label">Best Score</span>
                <span className="perf-stat-val text-warning">
                  {bestScore?.toLocaleString() || 0}
                </span>
                <span className="perf-stat-sub">Highest match points</span>
              </div>

              {/* Win Rate */}
              <div className="perf-stat-card">
                <span className="perf-stat-label">Win Rate</span>
                <span className="perf-stat-val text-success">
                  {winRate}%
                </span>
                <span className="perf-stat-sub">
                  {totalGamesWon} wins in {totalGamesPlayed} matches
                </span>
              </div>

              {/* Matches Played */}
              <div className="perf-stat-card">
                <span className="perf-stat-label">Games Played</span>
                <span className="perf-stat-val text-info">
                  {totalGamesPlayed}
                </span>
                <span className="perf-stat-sub">Total rounds recorded</span>
              </div>

              {/* Current Streak */}
              <div className="perf-stat-card">
                <span className="perf-stat-label">Current Streak</span>
                <span className="perf-stat-val text-purple" style={{ color: '#c084fc' }}>
                  {profile?.currentStreak || 0}
                </span>
                <span className="perf-stat-sub">Consecutive wins</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-3 text-center" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px dashed rgba(168, 85, 247, 0.25)' }}>
              <span className="fs-3 d-block mb-2">🎯</span>
              <p className="text-white-50 mb-2 small">
                No match records found yet. Complete your first game to track your Best Score and Win Rate!
              </p>
              <button
                onClick={() => handleStartLevel(progress.unlockedLevel)}
                className="btn btn-sm btn-outline-warning rounded-pill px-3 fw-bold"
              >
                Start First Match
              </button>
            </div>
          )}
        </div>

        {/* 4. Recent Games (Only if available) */}
        <div className="dashboard-section-card">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-black text-white mb-0 d-flex align-items-center gap-2">
              <span>🕒</span>
              <span>Recent Games</span>
            </h4>
            {hasRecentGames && (
              <Link to="/history" className="text-info small text-decoration-none fw-semibold">
                View All &rarr;
              </Link>
            )}
          </div>

          {hasRecentGames ? (
            <div className="recent-games-table-wrapper">
              <table className="recent-games-table">
                <thead>
                  <tr>
                    <th>Outcome</th>
                    <th>Mode & Difficulty</th>
                    <th>Range</th>
                    <th>Attempts</th>
                    <th>Score</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {allGames.slice(0, 5).map((game, idx) => {
                    const isWin = game.status === 'WON';
                    const playedDate = game.completedAt || game.startedAt || game.createdAt;
                    const dateFormatted = playedDate
                      ? new Date(playedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                      : 'Recently';

                    return (
                      <tr key={game.id || game.gameId || idx}>
                        <td>
                          <span
                            className={`badge rounded-pill font-monospace fw-bold ${
                              isWin ? 'bg-success text-white' : 'bg-danger text-white'
                            }`}
                            style={{ fontSize: '0.72rem' }}
                          >
                            {isWin ? 'WON ✓' : 'LOST ✕'}
                          </span>
                        </td>
                        <td className="fw-semibold text-white">
                          {game.mode || 'CLASSIC'} • {game.difficulty || 'MEDIUM'}
                        </td>
                        <td className="font-monospace text-white-50">
                          {game.minNumber ?? 1}–{game.maxNumber ?? 100}
                        </td>
                        <td className="font-monospace">
                          {game.attemptsUsed || 0} / {game.attemptsAllowed || 7}
                        </td>
                        <td className="font-monospace fw-bold text-warning">
                          +{game.score || 0}
                        </td>
                        <td className="text-white-50 small">
                          {dateFormatted}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 rounded-3 text-center" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px dashed rgba(168, 85, 247, 0.25)' }}>
              <span className="fs-3 d-block mb-2">📜</span>
              <p className="text-white-50 mb-0 small">
                No recent games recorded yet. Your completed matches will appear here!
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
