import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import leaderboardService from '../services/leaderboardService';
import gameService from '../services/gameService';
import DashboardStatsGrid from '../components/DashboardStatsGrid';
import PlayerModeSelector from '../components/PlayerModeSelector';
import RosterCustomizer from '../components/RosterCustomizer';
import GameModeSelector from '../components/GameModeSelector';
import DifficultySelector from '../components/DifficultySelector';
import ScoreProgressionChart from '../components/ScoreProgressionChart';
import PerformanceBreakdownCard from '../components/PerformanceBreakdownCard';
import RecentActivityPanel from '../components/RecentActivityPanel';
import AchievementsCard from '../components/AchievementsCard';
import QuickActionsCard from '../components/QuickActionsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import DailyChallengeCard from '../components/DailyChallengeCard';
import DailyStreakRewards from '../components/DailyStreakRewards';
import NetworkStatusPill from '../components/NetworkStatusPill';
import sounds from '../utils/soundEffects';
import { getDefaultRoster, getPlayerModeTitle } from '../utils/playerModesHelper';
import { getPlayerProgression } from '../utils/progressionHelper';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [profile, setProfile] = useState(null);
  const [allGames, setAllGames] = useState([]);
  const [selectedPlayerMode, setSelectedPlayerMode] = useState('1_VS_CPU');
  const [roster, setRoster] = useState(() => getDefaultRoster('1_VS_CPU', currentUser?.username));
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('MEDIUM');
  const [selectedMode, setSelectedMode] = useState('CLASSIC');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const prog = getPlayerProgression();

  useEffect(() => {
    let user = authService.getCurrentUser();
    if (!user) {
      user = authService.loginAsGuest('Guest Player');
      setCurrentUser(user);
    }
    loadDashboardData(user.id);
  }, []);

  const loadDashboardData = async (userId) => {
    const targetId = userId || currentUser?.id || 999999;
    try {
      setLoading(true);
      setError('');
      const [profileData, historyData] = await Promise.all([
        leaderboardService.getPlayerProfile(targetId),
        gameService.getPlayerHistory(targetId),
      ]);
      setProfile(profileData);
      setAllGames(Array.isArray(historyData) ? historyData : []);
    } catch (err) {
      console.warn('Dashboard data fetch issue, using offline profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlayerMode = (mode) => {
    if (selectedPlayerMode !== mode) {
      setSelectedPlayerMode(mode);
      setRoster(getDefaultRoster(mode, currentUser?.username));
    }
    // Automatically show the edit options of team name and players name
    setShowRosterModal(true);
  };

  const handleUpdatePlayerName = (id, newName) => {
    setRoster((prev) => {
      if (id && id.startsWith('cpu_boss')) {
        return prev.map((p) =>
          p.id && p.id.startsWith('cpu_boss') ? { ...p, name: newName } : p
        );
      }
      return prev.map((p) => (p.id === id ? { ...p, name: newName } : p));
    });
  };

  const handleUpdatePlayerTeam = (id, newTeam) => {
    setRoster((prev) =>
      prev.map((p) => (p.id === id ? { ...p, team: newTeam } : p))
    );
  };

  const handleUpdateTeamName = (oldTeamName, newTeamName) => {
    setRoster((prev) =>
      prev.map((p) => (p.team === oldTeamName ? { ...p, team: newTeamName } : p))
    );
  };

  const handleResetRoster = () => {
    setRoster(getDefaultRoster(selectedPlayerMode, currentUser?.username));
  };

  const handleStartGame = () => {
    sounds.playClick();
    navigate('/game', {
      state: {
        difficulty: selectedDifficulty,
        mode: selectedMode,
        playerMode: selectedPlayerMode,
        roster,
      },
    });
  };

  const handlePlayDaily = () => {
    sounds.playClick();
    navigate('/game', {
      state: {
        difficulty: 'MEDIUM',
        mode: 'DAILY',
        playerMode: 'SOLO',
        isDailyChallenge: true,
        roster: [
          {
            id: 'p1',
            name: `${currentUser?.username || 'Daily Thinker'}`,
            team: 'Solo',
            isAi: false,
            color: 'primary',
            icon: 'bi-person-fill',
          },
        ],
      },
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading your player dashboard..." fullScreen />;
  }

  return (
    <div className="dashboard-page container py-4">
      {/* 1. Welcome Banner */}
      <div className="card border-0 shadow-sm rounded-4 text-white mb-4 p-4 welcome-card">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div style={{ maxWidth: '620px' }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-white text-primary rounded-pill px-3 py-1 fw-bold font-monospace">
                Level {prog.level}
              </span>
              <span className="badge bg-warning text-dark rounded-pill px-3 py-1 fw-bold">
                <i className={`bi ${prog.icon} me-1`}></i> {prog.title}
              </span>
            </div>
            <h2 className="fw-bold mb-1">
              Welcome back, {currentUser?.username || 'Player'}! 🎯
            </h2>
            <p className="text-white-50 mb-2 small">
              Ready to test your instincts and climb the global leaderboards?
            </p>

            {/* Level XP Progress Bar */}
            <div className="bg-dark bg-opacity-25 p-2.5 rounded-3 border border-white border-opacity-10 mt-2">
              <div className="d-flex justify-content-between small font-monospace text-white-50 mb-1" style={{ fontSize: '0.75rem' }}>
                <span>XP PROGRESSION: {prog.currentLevelXp} / {prog.nextLevelXp} XP</span>
                <span>{prog.progressPercent}% TO LEVEL {prog.level + 1}</span>
              </div>
              <div className="progress bg-black bg-opacity-40" style={{ height: '6px' }}>
                <div
                  className="progress-bar bg-warning"
                  style={{ width: `${prog.progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
          <button
            onClick={handleStartGame}
            className="btn btn-warning btn-lg px-4 py-3 rounded-pill fw-bold shadow-sm d-flex align-items-center gap-2 hover-scale text-dark"
          >
            <i className="bi bi-play-circle-fill fs-5"></i>
            PLAY NOW ({getPlayerModeTitle(selectedPlayerMode)} • {selectedDifficulty})
          </button>
        </div>
      </div>

      {/* Universal Daily Mystery Challenge Card & Global Streak */}
      <DailyChallengeCard onPlayDaily={handlePlayDaily} />

      {/* 7-Day Dedication Calendar & Mystery Loot Chest */}
      <DailyStreakRewards onRewardClaimed={() => loadDashboardData()} />

      <ErrorMessage message={error} onRetry={loadDashboardData} />

      {/* 2. Top Primary Statistics Cards (6 Core Metrics) */}
      <DashboardStatsGrid profile={profile} history={allGames} />

      {/* 3. Interactive Game Arena: Player Matchup, Mode & Difficulty Selectors */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-body">
        {/* Step 1: Mode of Players (Matchup Format) */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
              <span className="badge bg-primary rounded-circle px-2 py-1 fs-6">1</span>
              <span>Choose Mode of Players</span>
            </h5>
            <span className="small text-muted">Select Solo, 1v1, Co-op vs Computer, or Squad Battles</span>
          </div>
          <PlayerModeSelector
            selectedPlayerMode={selectedPlayerMode}
            onSelectPlayerMode={handleSelectPlayerMode}
          />

          {/* Quick Roster Summary & Trigger Bar */}
          <div className="card border-0 bg-primary-subtle rounded-4 p-3 mt-3 shadow-sm">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-shield-check fs-4 text-primary"></i>
                <div>
                  <div className="fw-bold text-primary">
                    Selected Matchup: {getPlayerModeTitle(selectedPlayerMode)}
                  </div>
                  <div className="small text-secondary">
                    {roster.map((p) => `${p.name} [${p.team}]`).join(' • ')}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary rounded-pill px-3.5 py-1.5 fw-bold shadow-sm d-flex align-items-center gap-1.5 hover-scale"
                onClick={() => {
                  sounds.playClick();
                  setShowRosterModal(true);
                }}
              >
                <i className="bi bi-pencil-square"></i>
                <span>Edit Teams & Players</span>
              </button>
            </div>
          </div>
        </div>

        <hr className="my-4 opacity-25" />

        {/* Step 2: Game Style & Rules */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
              <span className="badge bg-primary rounded-circle px-2 py-1 fs-6">2</span>
              <span>Choose Game Style & Rules</span>
            </h5>
            <span className="small text-muted">Select your deduction style & clues</span>
          </div>
          <GameModeSelector
            selectedMode={selectedMode}
            onSelectMode={setSelectedMode}
          />
        </div>

        <hr className="my-4 opacity-25" />

        {/* Step 3: Difficulty Level */}
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
              <span className="badge bg-primary rounded-circle px-2 py-1 fs-6">3</span>
              <span>Choose Difficulty & Multiplier</span>
            </h5>
            <span className="small text-muted">Higher difficulty awards higher base scores</span>
          </div>
          <DifficultySelector
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={setSelectedDifficulty}
          />
        </div>

        <div className="text-center mt-4 pt-2">
          <button
            onClick={handleStartGame}
            className="btn btn-primary btn-lg px-5 py-3 rounded-pill fw-bold shadow-lg d-inline-flex align-items-center gap-2 hover-scale"
          >
            <i className="bi bi-play-fill fs-4"></i>
            <span>
              Start {getPlayerModeTitle(selectedPlayerMode)} ({selectedMode.replace('_', ' ')} • {selectedDifficulty})
            </span>
          </button>
        </div>
      </div>

      {/* 4. Secondary Statistics: Score Progression Chart & Breakdown */}
      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <ScoreProgressionChart games={allGames} />
        </div>
        <div className="col-lg-6">
          <PerformanceBreakdownCard history={allGames} />
        </div>
      </div>

      {/* 5. Recent Activity & Quick Actions */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <RecentActivityPanel
            games={allGames}
            loading={loading}
            error={error}
          />
        </div>

        <div className="col-lg-4">
          <QuickActionsCard onPlayGame={handleStartGame} />
        </div>
      </div>

      {/* 6. Trophy Cabinet & Achievements Showcase */}
      <div className="mb-4">
        <AchievementsCard profile={profile} history={allGames} />
      </div>

      {/* Modal for Automatic & Manual Player & Team Editing */}
      {showRosterModal && (
        <RosterCustomizer
          roster={roster}
          onUpdatePlayerName={handleUpdatePlayerName}
          onUpdatePlayerTeam={handleUpdatePlayerTeam}
          onUpdateTeamName={handleUpdateTeamName}
          onResetRoster={handleResetRoster}
          playerMode={selectedPlayerMode}
          isModal={true}
          onClose={() => setShowRosterModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
