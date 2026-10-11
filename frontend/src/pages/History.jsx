import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import gameService from '../services/gameService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import sounds from '../utils/soundEffects';

const History = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDifficulty, setFilterDifficulty] = useState('ALL');
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    loadHistory();
  }, [currentUser?.id]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const playerId = currentUser?.id || 999999;
      const data = await gameService.getPlayerHistory(playerId);
      setGames(data || []);
    } catch (err) {
      setError('Failed to load game history records.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAgain = (difficulty) => {
    sounds.playClick();
    navigate('/game', { state: { difficulty } });
  };

  const openGameDetails = async (gameId) => {
    sounds.playClick();
    try {
      const detailed = await gameService.getGame(gameId);
      setSelectedGame(detailed);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredGames = games.filter((g) => {
    const matchStatus = filterStatus === 'ALL' || g.status === filterStatus;
    const matchDiff = filterDifficulty === 'ALL' || g.difficulty === filterDifficulty;
    return matchStatus && matchDiff;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Fetching your game logs..." fullScreen />;
  }

  return (
    <div className="history-page container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <i className="bi bi-clock-history text-primary me-2"></i> Game History
          </h2>
          <p className="text-muted mb-0">Review all your previous Random Thinking attempts and results</p>
        </div>
        <button
          onClick={() => handlePlayAgain('MEDIUM')}
          className="btn btn-primary rounded-pill px-4"
        >
          <i className="bi bi-controller me-1"></i> Start New Game
        </button>
      </div>

      <ErrorMessage message={error} onRetry={loadHistory} />

      {/* Filter Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-body">
        <div className="row g-3 align-items-center">
          <div className="col-md-6 d-flex align-items-center gap-2">
            <span className="small text-muted fw-bold text-nowrap">Status:</span>
            <div className="btn-group btn-group-sm w-100" role="group">
              {['ALL', 'WON', 'LOST'].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`btn ${filterStatus === st ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setFilterStatus(st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="col-md-6 d-flex align-items-center gap-2">
            <span className="small text-muted fw-bold text-nowrap">Difficulty:</span>
            <div className="btn-group btn-group-sm w-100" role="group">
              {['ALL', 'EASY', 'MEDIUM', 'HARD', 'EXPERT'].map((df) => (
                <button
                  key={df}
                  type="button"
                  className={`btn ${filterDifficulty === df ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setFilterDifficulty(df)}
                >
                  {df}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {filteredGames.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-body">
          <div className="display-4 mb-2">📜</div>
          <h5>No games found matching your filters</h5>
          <p className="text-muted mb-3">Play a game or clear your filters to view logs.</p>
          <button
            onClick={() => {
              setFilterStatus('ALL');
              setFilterDifficulty('ALL');
            }}
            className="btn btn-outline-secondary btn-sm rounded-pill px-3 mx-auto"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="table-responsive rounded-4 shadow-sm border overflow-hidden">
          <table className="table table-hover align-middle mb-0 bg-body">
            <thead className="table-dark">
              <tr>
                <th>Game ID</th>
                <th>Status</th>
                <th>Difficulty</th>
                <th>Range</th>
                <th>Attempts</th>
                <th>Score</th>
                <th>Time Taken</th>
                <th>Played At</th>
                <th className="text-end">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredGames.map((g) => (
                <tr key={g.gameId}>
                  <td className="font-monospace fw-bold">
                    #{g.gameId}
                    {(g.offline || String(g.gameId).startsWith('off_')) && (
                      <span className="badge bg-warning-subtle text-warning border border-warning-subtle ms-1 font-monospace" style={{ fontSize: '0.65rem' }}>
                        OFFLINE
                      </span>
                    )}
                  </td>
                  <td>
                    {g.status === 'WON' ? (
                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1">
                        <i className="bi bi-check-circle-fill me-1"></i> WON
                      </span>
                    ) : g.status === 'LOST' ? (
                      <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2.5 py-1">
                        <i className="bi bi-x-circle-fill me-1"></i> LOST
                      </span>
                    ) : (
                      <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2.5 py-1">
                        IN PROGRESS
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="badge bg-secondary-subtle text-body-secondary font-monospace">
                      {g.difficulty}
                    </span>
                  </td>
                  <td className="font-monospace small">{g.minNumber} – {g.maxNumber}</td>
                  <td className="font-monospace">{g.attemptsUsed} / {g.attemptsAllowed}</td>
                  <td className="fw-bold text-success fs-6">{g.score}</td>
                  <td className="font-monospace small">{g.timeTakenSeconds !== undefined ? `${g.timeTakenSeconds}s` : '--'}</td>
                  <td className="small text-muted">{formatDate(g.startedAt)}</td>
                  <td className="text-end">
                    <button
                      onClick={() => openGameDetails(g.gameId)}
                      className="btn btn-outline-info btn-sm rounded-pill me-1"
                      title="View Guesses"
                    >
                      <i className="bi bi-eye-fill"></i>
                    </button>
                    <button
                      onClick={() => handlePlayAgain(g.difficulty)}
                      className="btn btn-outline-primary btn-sm rounded-pill"
                      title="Replay Difficulty"
                    >
                      <i className="bi bi-arrow-repeat"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Game Details Modal */}
      {selectedGame && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-primary text-white border-0">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-journal-text me-2"></i> Game #{selectedGame.gameId} Breakdown
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedGame(null)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3 text-center mb-4">
                  <div className="col-3">
                    <div className="p-2.5 rounded-3 bg-body-tertiary border">
                      <div className="text-muted small">Status</div>
                      <span className={`badge ${selectedGame.status === 'WON' ? 'bg-success' : 'bg-danger'}`}>
                        {selectedGame.status}
                      </span>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-2.5 rounded-3 bg-body-tertiary border">
                      <div className="text-muted small">Difficulty</div>
                      <div className="fw-bold text-primary">{selectedGame.difficulty}</div>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-2.5 rounded-3 bg-body-tertiary border">
                      <div className="text-muted small">Final Score</div>
                      <div className="fw-bold text-success">{selectedGame.score} pts</div>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-2.5 rounded-3 bg-body-tertiary border">
                      <div className="text-muted small">Time Taken</div>
                      <div className="fw-bold font-monospace">{selectedGame.timeTakenSeconds || 0}s</div>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold mb-3">Guess Step-by-Step History</h6>
                {(!selectedGame.guesses || selectedGame.guesses.length === 0) ? (
                  <p className="text-muted small text-center py-3">No guess entries recorded.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Attempt #</th>
                          <th>Guess Number</th>
                          <th>Evaluation Hint</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedGame.guesses.map((gs) => (
                          <tr key={gs.id || gs.attemptNumber}>
                            <td className="font-monospace">#{gs.attemptNumber}</td>
                            <td className="fw-bold font-monospace fs-6">{gs.guessNumber}</td>
                            <td>
                              {gs.result === 'CORRECT' ? (
                                <span className="badge bg-success">CORRECT 🎯</span>
                              ) : gs.result === 'TOO_LOW' ? (
                                <span className="badge bg-info text-dark">TOO LOW ⬆️</span>
                              ) : (
                                <span className="badge bg-warning text-dark">TOO HIGH ⬇️</span>
                              )}
                            </td>
                            <td className="small text-muted">{formatDate(gs.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill px-4"
                  onClick={() => setSelectedGame(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4"
                  onClick={() => {
                    const diff = selectedGame.difficulty;
                    setSelectedGame(null);
                    handlePlayAgain(diff);
                  }}
                >
                  <i className="bi bi-arrow-repeat me-1"></i> Replay This Difficulty
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
