import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import multiplayerService from '../services/multiplayerService';
import coinWalletService from '../services/coinWalletService';
import TeamLeaderboard from '../components/multiplayer/TeamLeaderboard';
import sounds from '../utils/soundEffects';
import '../styles/Multiplayer.css';

const MultiplayerHub = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());

  const [activeTab, setActiveTab] = useState('modes'); // 'modes' | 'leaderboard'
  const [coins, setCoins] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState('FRIENDS'); // 'FRIENDS' | 'TEAM_BATTLE'
  const [modalError, setModalError] = useState('');

  // Matchmaking (Quick Match) State
  const [isSearchingMatch, setIsSearchingMatch] = useState(false);
  const [searchElapsedSeconds, setSearchElapsedSeconds] = useState(0);
  const [matchStatusMessage, setMatchStatusMessage] = useState('Searching for an opponent...');
  const searchTimerRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Form states - Creation
  const [roomName, setRoomName] = useState('');
  const [minNumber, setMinNumber] = useState(1);
  const [maxNumber, setMaxNumber] = useState(100);
  const [attemptsPerRound, setAttemptsPerRound] = useState(8);
  const [totalRounds, setTotalRounds] = useState(10);
  const [stakeAmount, setStakeAmount] = useState(0);
  const [teamRedName, setTeamRedName] = useState('Team Red');
  const [teamBlueName, setTeamBlueName] = useState('Team Blue');
  const [teamSize, setTeamSize] = useState(4); // 2 or 4 players total
  const [selectedTeam, setSelectedTeam] = useState('TEAM_RED');

  // Form states - Joining
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    initSession();

    const handleWalletUpdate = (e) => {
      if (e?.detail?.coins !== undefined) {
        setCoins(e.detail.coins);
      }
    };
    window.addEventListener('rtg-wallet-updated', handleWalletUpdate);

    return () => {
      window.removeEventListener('rtg-wallet-updated', handleWalletUpdate);
      cleanupMatchmaking();
    };
  }, []);

  const initSession = async () => {
    try {
      const user = await authService.ensureUser();
      setCurrentUser(user);
      fetchCoins();
    } catch (e) {
      console.warn('Could not initialize session:', e);
      fetchCoins();
    }
  };

  const fetchCoins = async () => {
    try {
      const data = await coinWalletService.getWallet();
      if (data && data.virtualCoins !== undefined) {
        setCoins(data.virtualCoins);
      }
    } catch (e) {
      console.warn('Could not load coins:', e);
    }
  };

  const handleClaimBonus = async () => {
    sounds.playClick();
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await coinWalletService.claimDailyLogin();
      setCoins(res.virtualCoins);
      sounds.playPowerUp();
      setSuccessMsg(res.message);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      sounds.playError();
      setErrorMsg(e.message || 'Could not claim daily bonus');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // QUICK MATCH / MATCHMAKING LOGIC
  // -------------------------------------------------------------
  const handleStartQuickMatch = async () => {
    sounds.playClick();
    setErrorMsg('');
    setMatchStatusMessage('Searching for a live challenger...');
    setSearchElapsedSeconds(0);
    setIsSearchingMatch(true);

    try {
      await authService.ensureUser();
      const res = await multiplayerService.joinMatchmaking();

      if (res.status === 'MATCHED' && res.roomCode) {
        // Immediate match found!
        sounds.playVictory();
        setIsSearchingMatch(false);
        navigate(`/multiplayer/room/${res.roomCode}`);
        return;
      }

      // Start elapsed timer
      searchTimerRef.current = setInterval(() => {
        setSearchElapsedSeconds((prev) => prev + 1);
      }, 1000);

      // Start status poll (every 1.5 seconds)
      pollIntervalRef.current = setInterval(async () => {
        try {
          const statusRes = await multiplayerService.checkMatchmakingStatus();
          if (statusRes.status === 'MATCHED' && statusRes.roomCode) {
            cleanupMatchmaking();
            sounds.playVictory();
            setMatchStatusMessage('Opponent Found! Entering Match...');
            setTimeout(() => {
              navigate(`/multiplayer/room/${statusRes.roomCode}`);
            }, 600);
          } else if (statusRes.status === 'TIMEOUT') {
            cleanupMatchmaking();
            setMatchStatusMessage(statusRes.message || 'No live opponent found in queue.');
          } else if (statusRes.waitTimeSeconds !== undefined) {
            setSearchElapsedSeconds(statusRes.waitTimeSeconds);
          }
        } catch (pollErr) {
          console.warn('Matchmaking poll error:', pollErr);
        }
      }, 1500);

    } catch (err) {
      cleanupMatchmaking();
      setErrorMsg(err.message || 'Failed to start matchmaking search');
    }
  };

  const handleCancelQuickMatch = async () => {
    sounds.playClick();
    cleanupMatchmaking();
    try {
      await multiplayerService.cancelMatchmaking();
    } catch (e) {
      // ignore
    }
  };

  const cleanupMatchmaking = () => {
    if (searchTimerRef.current) {
      clearInterval(searchTimerRef.current);
      searchTimerRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsSearchingMatch(false);
  };

  // -------------------------------------------------------------
  // MODAL CONTROLS
  // -------------------------------------------------------------
  const openCreateModal = (mode) => {
    console.log('Action: openCreateModal ->', mode);
    sounds.playClick();
    setSelectedMode(mode);
    setModalError('');
    if (mode === 'TEAM_BATTLE') {
      setRoomName('Red vs Blue Clash');
      setTotalRounds(3);
      setTeamSize(4);
      setAttemptsPerRound(7);
    } else {
      setRoomName('Private Friends Match');
      setTotalRounds(1);
      setTeamSize(4);
      setAttemptsPerRound(7);
    }
    setShowJoinModal(false);
    setShowCreateModal(true);
  };

  const openJoinModal = (mode) => {
    console.log('Action: openJoinModal ->', mode);
    sounds.playClick();
    setSelectedMode(mode);
    setJoinCode('');
    setModalError('');
    setShowCreateModal(false);
    setShowJoinModal(true);
  };

  const handleCreateRoomSubmit = async (e) => {
    e.preventDefault();
    sounds.playClick();
    setModalError('');

    const min = parseInt(minNumber, 10);
    const max = parseInt(maxNumber, 10);
    if (isNaN(min) || isNaN(max) || min >= max) {
      setModalError('Max number must be greater than min number');
      return;
    }

    try {
      setLoading(true);
      const user = await authService.ensureUser();

      const payload = {
        matchType: selectedMode,
        roomName: roomName.trim() || `${user?.username || 'Player'}'s Match`,
        minNumber: min,
        maxNumber: max,
        attemptsPerRound: parseInt(attemptsPerRound, 10) || 8,
        totalRounds: parseInt(totalRounds, 10) || 10,
        stakeAmount: Number(stakeAmount),
        maxPlayers: parseInt(teamSize, 10) || 4,
        team: selectedTeam,
        teamRedName: teamRedName.trim() || 'Team Red',
        teamBlueName: teamBlueName.trim() || 'Team Blue',
      };

      const room = await multiplayerService.createRoom(payload);
      setShowCreateModal(false);
      navigate(`/multiplayer/room/${room.roomCode}`);
    } catch (err) {
      setModalError(err.message || 'Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoomSubmit = async (e) => {
    e.preventDefault();
    sounds.playClick();
    setModalError('');

    const cleanCode = joinCode.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 4) {
      setModalError('Please enter a valid 6-character room code');
      return;
    }

    try {
      setLoading(true);
      await authService.ensureUser();
      const room = await multiplayerService.joinRoom(cleanCode, selectedMode === 'TEAM_BATTLE' ? selectedTeam : 'SOLO');
      setShowJoinModal(false);
      navigate(`/multiplayer/room/${room.roomCode}`);
    } catch (err) {
      setModalError(err.message || 'Could not join room. Check code or room status.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="multiplayer-container py-5">
      <div className="container">
        {/* Banner with Virtual Coins */}
        <div className="mp-glass-card p-4 mb-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <span className="badge bg-info text-dark fw-bold px-3 py-1 rounded-pill mb-2">
                MULTIPLAYER ARENA
              </span>
              <h2 className="fw-black text-white mb-1">Live Number Battle</h2>
              <p className="text-white-50 mb-0">
                Compete turn-by-turn with friends or team up in Team Battle!
              </p>
            </div>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div
                className="mp-coin-badge fs-5"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/wallet')}
                title="Click to view Coin Wallet & Shop"
              >
                <span>🪙</span>
                <span>{coins.toLocaleString()} Coins</span>
              </div>
              <button
                className="btn btn-warning rounded-pill px-3 py-2 fw-bold text-dark shadow-sm d-flex align-items-center gap-1.5"
                onClick={handleClaimBonus}
                disabled={loading}
              >
                <span>🎁</span> +50 Daily Login
              </button>
              <button
                className="btn btn-outline-info rounded-pill px-3 py-2 fw-bold shadow-sm d-flex align-items-center gap-1.5"
                onClick={() => navigate('/wallet')}
              >
                <i className="bi bi-wallet2"></i>
                <span>Wallet & Shop</span>
              </button>
            </div>
          </div>

          {successMsg && <div className="alert alert-success mt-3 py-2 small">{successMsg}</div>}
          {errorMsg && <div className="alert alert-danger mt-3 py-2 small">{errorMsg}</div>}
        </div>

        {/* Tab Selector */}
        <div className="d-flex gap-2 mb-4">
          <button
            className={`btn rounded-pill px-4 fw-bold ${activeTab === 'modes' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => {
              sounds.playClick();
              setActiveTab('modes');
            }}
          >
            🎮 Game Modes
          </button>
          <button
            className={`btn rounded-pill px-4 fw-bold ${activeTab === 'leaderboard' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => {
              sounds.playClick();
              setActiveTab('leaderboard');
            }}
          >
            🏆 Leaderboard
          </button>
        </div>

        {activeTab === 'modes' ? (
          <div>
            <div className="row g-4 mb-4">
              {/* Card 1: Play with Friends */}
              <div className="col-lg-4">
                <div
                  className="mp-glass-card mp-mode-card p-4 h-100 d-flex flex-column justify-content-between"
                  style={{ borderTop: '4px solid #38bdf8' }}
                >
                  <div>
                    <span className="display-4 d-block mb-3">👥</span>
                    <h3 className="fw-black text-white mb-2">Play with Friends</h3>
                    <p className="text-white-50 small mb-4">
                      Create a private room with a custom 6-character code and invite 2 to 4 friends to guess against each other.
                    </p>
                  </div>

                  <div className="d-flex flex-column gap-2" style={{ position: 'relative', zIndex: 10 }}>
                    <button
                      type="button"
                      data-testid="create-private-room-btn"
                      className="btn btn-info py-2.5 rounded-pill fw-bold text-dark shadow-sm"
                      style={{ position: 'relative', zIndex: 10, cursor: 'pointer' }}
                      onClick={() => openCreateModal('FRIENDS')}
                    >
                      Create Private Room
                    </button>
                    <button
                      type="button"
                      data-testid="join-with-code-btn"
                      className="btn btn-outline-info py-2.5 rounded-pill fw-bold"
                      style={{ position: 'relative', zIndex: 10, cursor: 'pointer' }}
                      onClick={() => openJoinModal('FRIENDS')}
                    >
                      Join with Code
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: Quick Match */}
              <div className="col-lg-4">
                <div
                  className="mp-glass-card mp-mode-card p-4 h-100 d-flex flex-column justify-content-between"
                  style={{ borderTop: '4px solid #a855f7' }}
                >
                  <div>
                    <span className="display-4 d-block mb-3">⚡</span>
                    <h3 className="fw-black text-white mb-2">Quick Match</h3>
                    <p className="text-white-50 small mb-4">
                      Jump into an instant 1v1 matchmaking queue and test your deduction speed against live opponents.
                    </p>
                  </div>

                  <div style={{ position: 'relative', zIndex: 10 }}>
                    <button
                      type="button"
                      data-testid="find-match-now-btn"
                      className="btn btn-primary w-100 py-3 rounded-pill fw-black fs-5 shadow"
                      style={{ position: 'relative', zIndex: 10, cursor: 'pointer' }}
                      onClick={handleStartQuickMatch}
                      disabled={isSearchingMatch}
                    >
                      🚀 Find Match Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 3: Team Battle */}
              <div className="col-lg-4">
                <div
                  className="mp-glass-card mp-mode-card p-4 h-100 d-flex flex-column justify-content-between"
                  style={{ borderTop: '4px solid #f43f5e' }}
                >
                  <div>
                    <span className="display-4 d-block mb-3">⚔️</span>
                    <h3 className="fw-black text-white mb-2">Team Battle</h3>
                    <p className="text-white-50 small mb-4">
                      Team Red vs Team Blue! Compete in best-of-three rounds with alternating turns and optional virtual coin stakes.
                    </p>
                  </div>

                  <div className="d-flex flex-column gap-2" style={{ position: 'relative', zIndex: 10 }}>
                    <button
                      type="button"
                      data-testid="create-team-battle-btn"
                      className="btn btn-danger py-2.5 rounded-pill fw-bold shadow-sm"
                      style={{ position: 'relative', zIndex: 10, cursor: 'pointer' }}
                      onClick={() => openCreateModal('TEAM_BATTLE')}
                    >
                      Create Team Battle
                    </button>
                    <button
                      type="button"
                      data-testid="join-battle-code-btn"
                      className="btn btn-outline-danger py-2.5 rounded-pill fw-bold"
                      style={{ position: 'relative', zIndex: 10, cursor: 'pointer' }}
                      onClick={() => openJoinModal('TEAM_BATTLE')}
                    >
                      Join Battle Code
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <TeamLeaderboard />
        )}

        {/* ------------------------------------------------------------------ */}
        {/* QUICK MATCH SEARCHING MODAL */}
        {/* ------------------------------------------------------------------ */}
        {isSearchingMatch && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(5, 2, 18, 0.9)', backdropFilter: 'blur(10px)', zIndex: 1070 }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content mp-glass-card p-5 text-center border-0 shadow-2xl">
                <div className="mp-radar-circle">
                  <span className="fs-1">🎯</span>
                </div>

                <h3 className="fw-black text-white mb-2">Searching for Opponent</h3>
                <p className="text-info fw-bold mb-1">{matchStatusMessage}</p>
                <div className="display-6 fw-mono text-warning my-3">
                  {formatTimer(searchElapsedSeconds)}
                </div>
                <p className="text-white-50 small mb-4">
                  Looking for another player waiting in the matchmaking queue...
                </p>

                <button
                  className="btn btn-outline-danger px-4 py-2.5 rounded-pill fw-bold"
                  onClick={handleCancelQuickMatch}
                >
                  <i className="bi bi-x-circle me-1"></i> Cancel Search
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* CREATE ROOM MODAL (Friends & Team Battle) */}
        {/* ------------------------------------------------------------------ */}
        {showCreateModal && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(5, 2, 18, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1060 }}
            onClick={() => setShowCreateModal(false)}
          >
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content mp-glass-card p-4 border-0">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="fw-black text-white mb-0">
                    {selectedMode === 'TEAM_BATTLE' ? '⚔️ Create Team Battle' : '👥 Create Private Room'}
                  </h4>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowCreateModal(false)}
                  ></button>
                </div>

                {modalError && <div className="alert alert-danger py-2 small mb-3">{modalError}</div>}

                <form onSubmit={handleCreateRoomSubmit}>
                  {/* Room / Match Name */}
                  <div className="mb-3">
                    <label className="form-label text-white-50 small">Match Name</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      placeholder={selectedMode === 'TEAM_BATTLE' ? 'Red vs Blue Clash' : 'My Private Match'}
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                    />
                  </div>

                  {/* Team Battle Specific Fields */}
                  {selectedMode === 'TEAM_BATTLE' && (
                    <>
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <label className="form-label text-danger small fw-bold">🔥 Team 1 Name</label>
                          <input
                            type="text"
                            className="form-control bg-dark text-white border-danger"
                            value={teamRedName}
                            onChange={(e) => setTeamRedName(e.target.value)}
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label text-primary small fw-bold">⚡ Team 2 Name</label>
                          <input
                            type="text"
                            className="form-control bg-dark text-white border-primary"
                            value={teamBlueName}
                            onChange={(e) => setTeamBlueName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-white-50 small">Join Which Team First?</label>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className={`btn flex-grow-1 fw-bold rounded-pill ${selectedTeam === 'TEAM_RED' ? 'btn-danger' : 'btn-outline-danger'}`}
                            onClick={() => setSelectedTeam('TEAM_RED')}
                          >
                            🔥 {teamRedName || 'Team Red'}
                          </button>
                          <button
                            type="button"
                            className={`btn flex-grow-1 fw-bold rounded-pill ${selectedTeam === 'TEAM_BLUE' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setSelectedTeam('TEAM_BLUE')}
                          >
                            ⚡ {teamBlueName || 'Team Blue'}
                          </button>
                        </div>
                      </div>

                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <label className="form-label text-white-50 small">Total Rounds</label>
                          <select
                            className="form-select bg-dark text-white border-secondary"
                            value={totalRounds}
                            onChange={(e) => setTotalRounds(Number(e.target.value))}
                          >
                            <option value={10}>10 Rounds (Gauntlet: R9 Nightmare, R10 Final Boss)</option>
                            <option value={5}>Best of 5 (First to 3)</option>
                            <option value={3}>Best of 3 (First to 2)</option>
                            <option value={1}>Single Sudden Death</option>
                          </select>
                        </div>
                        <div className="col-6">
                          <label className="form-label text-white-50 small">Match Size</label>
                          <select
                            className="form-select bg-dark text-white border-secondary"
                            value={teamSize}
                            onChange={(e) => setTeamSize(Number(e.target.value))}
                          >
                            <option value={2}>1v1 (2 Players Total)</option>
                            <option value={4}>2v2 (4 Players Total)</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Friends Mode Total Rounds */}
                  {selectedMode === 'FRIENDS' && (
                    <div className="mb-3">
                      <label className="form-label text-white-50 small">Total Rounds</label>
                      <select
                        className="form-select bg-dark text-white border-secondary"
                        value={totalRounds}
                        onChange={(e) => setTotalRounds(Number(e.target.value))}
                      >
                        <option value={10}>10 Rounds (Full Gauntlet — R9 Nightmare, R10 Final Boss)</option>
                        <option value={5}>5 Rounds</option>
                        <option value={3}>3 Rounds</option>
                        <option value={1}>1 Round (Sudden Death)</option>
                      </select>
                    </div>
                  )}

                  {/* Range & Attempts */}
                  <div className="row g-2 mb-3">
                    <div className="col-4">
                      <label className="form-label text-white-50 small">Min Number</label>
                      <input
                        type="number"
                        className="form-control bg-dark text-white border-secondary"
                        value={minNumber}
                        onChange={(e) => setMinNumber(e.target.value)}
                        min={1}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label text-white-50 small">Max Number</label>
                      <input
                        type="number"
                        className="form-control bg-dark text-white border-secondary"
                        value={maxNumber}
                        onChange={(e) => setMaxNumber(e.target.value)}
                        min={2}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label text-white-50 small">Attempts/Round</label>
                      <input
                        type="number"
                        className="form-control bg-dark text-white border-secondary"
                        value={attemptsPerRound}
                        onChange={(e) => setAttemptsPerRound(e.target.value)}
                        min={3}
                        max={15}
                      />
                    </div>
                  </div>

                  {/* Virtual Coin Stake Selector */}
                  <div className="mb-4">
                    <label className="form-label text-white-50 small d-flex justify-content-between">
                      <span>Virtual Coin Stake</span>
                      <span className="text-warning fw-bold">Balance: 🪙 {coins}</span>
                    </label>
                    <div className="d-flex gap-2">
                      {[0, 50, 100, 250].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          className={`btn flex-grow-1 rounded-pill fw-bold ${stakeAmount === amt ? 'btn-warning text-dark' : 'btn-outline-secondary text-white'}`}
                          onClick={() => setStakeAmount(amt)}
                          disabled={amt > coins}
                        >
                          {amt === 0 ? 'Free' : `🪙 ${amt}`}
                        </button>
                      ))}
                    </div>
                    {stakeAmount > 0 && (
                      <div className="text-info small mt-2">
                        Winner or winning team claims the entire prize pool! 100% refunded if cancelled.
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-3 rounded-pill fw-black fs-5 shadow"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Creating Room...
                      </>
                    ) : (
                      selectedMode === 'TEAM_BATTLE' ? 'Create Battle & Enter Lobby ⚔️' : 'Create & Enter Lobby 🚀'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* JOIN ROOM MODAL (Friends & Team Battle) */}
        {/* ------------------------------------------------------------------ */}
        {showJoinModal && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(5, 2, 18, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1060 }}
            onClick={() => setShowJoinModal(false)}
          >
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content mp-glass-card p-4 border-0">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="fw-black text-white mb-0">
                    {selectedMode === 'TEAM_BATTLE' ? '⚔️ Join Team Battle' : '👥 Join Private Room'}
                  </h4>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowJoinModal(false)}
                  ></button>
                </div>

                {modalError && <div className="alert alert-danger py-2 small mb-3">{modalError}</div>}

                <form onSubmit={handleJoinRoomSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-white-50 small">Enter 6-Character Room Code</label>
                    <input
                      type="text"
                      className="form-control form-control-lg text-center bg-dark text-warning border-secondary fw-black fs-3 text-uppercase"
                      placeholder="e.g. 7X9K2A"
                      maxLength={8}
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      autoFocus
                    />
                  </div>

                  {selectedMode === 'TEAM_BATTLE' && (
                    <div className="mb-4">
                      <label className="form-label text-white-50 small">Preferred Team to Join</label>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className={`btn flex-grow-1 fw-bold rounded-pill ${selectedTeam === 'TEAM_RED' ? 'btn-danger' : 'btn-outline-danger'}`}
                          onClick={() => setSelectedTeam('TEAM_RED')}
                        >
                          🔥 Team Red
                        </button>
                        <button
                          type="button"
                          className={`btn flex-grow-1 fw-bold rounded-pill ${selectedTeam === 'TEAM_BLUE' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => setSelectedTeam('TEAM_BLUE')}
                        >
                          ⚡ Team Blue
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-warning w-100 py-3 rounded-pill fw-black fs-5 text-dark shadow"
                    disabled={loading || !joinCode}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Joining...
                      </>
                    ) : (
                      selectedMode === 'TEAM_BATTLE' ? 'Join Battle ⚔️' : 'Join Match 🎮'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiplayerHub;
