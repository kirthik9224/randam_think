import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import multiplayerService from '../services/multiplayerService';
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
  const [modalError, setModalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState('FRIENDS');

  // Form states
  const [roomName, setRoomName] = useState('');
  const [stakeAmount, setStakeAmount] = useState(0);
  const [totalRounds, setTotalRounds] = useState(3);
  const [joinCode, setJoinCode] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('TEAM_RED');

  useEffect(() => {
    initSession();
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
      const data = await multiplayerService.getPlayerCoins();
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
      const res = await multiplayerService.claimDailyBonus();
      setCoins(res.virtualCoins);
      setSuccessMsg(res.message);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      setErrorMsg(e.message || 'Could not claim daily bonus');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickMatch = async () => {
    sounds.playClick();
    try {
      setLoading(true);
      setErrorMsg('');
      await authService.ensureUser();
      const room = await multiplayerService.quickMatch();
      navigate(`/multiplayer/room/${room.roomCode}`);
    } catch (e) {
      setErrorMsg(e.message || 'Quick match failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = (mode) => {
    sounds.playClick();
    setSelectedMode(mode);
    setModalError('');
    setShowCreateModal(true);
  };

  const openJoinModal = (mode) => {
    sounds.playClick();
    setSelectedMode(mode);
    setModalError('');
    setShowJoinModal(true);
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    sounds.playClick();
    try {
      setLoading(true);
      setModalError('');
      const user = await authService.ensureUser();
      const room = await multiplayerService.createRoom({
        matchType: selectedMode,
        roomName: roomName || `${user?.username || 'Player'}'s ${selectedMode === 'TEAM_BATTLE' ? 'Battle' : 'Match'}`,
        stakeAmount: Number(stakeAmount),
        totalRounds: selectedMode === 'TEAM_BATTLE' ? Number(totalRounds) : 1,
        team: selectedTeam,
        maxPlayers: selectedMode === 'TEAM_BATTLE' ? 4 : 4,
        minNumber: 1,
        maxNumber: 100,
        attemptsPerRound: 7,
      });
      setShowCreateModal(false);
      navigate(`/multiplayer/room/${room.roomCode}`);
    } catch (e) {
      setModalError(e.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    sounds.playClick();
    if (!joinCode || joinCode.trim().length < 4) {
      setModalError('Please enter a valid room code');
      return;
    }
    try {
      setLoading(true);
      setModalError('');
      await authService.ensureUser();
      const room = await multiplayerService.joinRoom(joinCode.trim().toUpperCase(), selectedTeam);
      setShowJoinModal(false);
      navigate(`/multiplayer/room/${room.roomCode}`);
    } catch (e) {
      setModalError(e.message || 'Failed to join room. Please check the code.');
    } finally {
      setLoading(false);
    }
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

            <div className="d-flex align-items-center gap-3">
              <div className="mp-coin-badge fs-5">
                <span>🪙</span>
                <span>{coins.toLocaleString()} Coins</span>
              </div>
              <button
                className="btn btn-warning rounded-pill px-3 py-2 fw-bold text-dark shadow-sm"
                onClick={handleClaimBonus}
                disabled={loading}
              >
                +250 Free Bonus
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

                  <div className="d-flex flex-column gap-2">
                    <button
                      className="btn btn-info py-2.5 rounded-pill fw-bold text-dark shadow-sm"
                      onClick={() => openCreateModal('FRIENDS')}
                    >
                      Create Private Room
                    </button>
                    <button
                      className="btn btn-outline-info py-2.5 rounded-pill fw-bold"
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

                  <button
                    className="btn btn-primary py-3 rounded-pill fw-black fs-5 shadow"
                    onClick={handleQuickMatch}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Searching...
                      </>
                    ) : (
                      '🚀 Find Match Now'
                    )}
                  </button>
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

                  <div className="d-flex flex-column gap-2">
                    <button
                      className="btn btn-danger py-2.5 rounded-pill fw-bold shadow-sm"
                      onClick={() => openCreateModal('TEAM_BATTLE')}
                    >
                      Create Team Battle
                    </button>
                    <button
                      className="btn btn-outline-danger py-2.5 rounded-pill fw-bold"
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

        {/* CREATE ROOM MODAL */}
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
                    Create {selectedMode === 'TEAM_BATTLE' ? '⚔️ Team Battle' : '👥 Private Room'}
                  </h4>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowCreateModal(false)}
                  ></button>
                </div>

                {modalError && <div className="alert alert-danger py-2 small mb-3">{modalError}</div>}

                <form onSubmit={handleCreateRoom}>
                  <div className="mb-3">
                    <label className="form-label text-white-50 small">Room Name</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      placeholder="My Epic Match"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                    />
                  </div>

                  {selectedMode === 'TEAM_BATTLE' && (
                    <div className="mb-3">
                      <label className="form-label text-white-50 small">Choose Your Team</label>
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
                        Winner / winning team claims the entire prize pool! 100% refunded if cancelled.
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
                      'Create & Enter Lobby 🚀'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* JOIN ROOM MODAL */}
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
                  <h4 className="fw-black text-white mb-0">Join Private Match</h4>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowJoinModal(false)}
                  ></button>
                </div>

                {modalError && <div className="alert alert-danger py-2 small mb-3">{modalError}</div>}

                <form onSubmit={handleJoinRoom}>
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
                      <label className="form-label text-white-50 small">Preferred Team</label>
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
                      'Join Match 🎮'
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
