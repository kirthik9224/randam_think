import React, { useState, useEffect } from 'react';
import leaderboardService from '../services/leaderboardService';
import LeaderboardTable from '../components/LeaderboardTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import sounds from '../utils/soundEffects';
import '../styles/Leaderboard.css';

const Leaderboard = () => {
  const [entries, setEntries] = useState([]);
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard(difficultyFilter);
  }, [difficultyFilter]);

  const fetchLeaderboard = async (diff) => {
    try {
      setLoading(true);
      setError('');
      const data = await leaderboardService.getLeaderboard(diff, 50);
      setEntries(data || []);
    } catch (err) {
      setError('Failed to fetch leaderboard records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDifficultyChange = (diff) => {
    sounds.playClick();
    setDifficultyFilter(diff);
  };

  const filteredEntries = entries.filter((item) =>
    item.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topThree = filteredEntries.slice(0, 3);

  return (
    <div className="leaderboard-page container py-4">
      {/* Header Banner */}
      <div className="text-center mb-5">
        <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-3 py-1 mb-2 fw-semibold">
          🏆 Top Random Thinking Titans
        </span>
        <h2 className="display-6 fw-bold mb-2">Global Leaderboard</h2>
        <p className="text-muted mb-1">Discover the top ranking players and their highest scores</p>
        <div className="small text-muted mb-2">
          <i className="bi bi-shield-check text-success me-1"></i> Verified deduction scores • Local demo scores labeled accordingly
        </div>
      </div>

      <ErrorMessage message={error} onRetry={() => fetchLeaderboard(difficultyFilter)} />

      {/* Top 3 Podium View */}
      {topThree.length >= 1 && (
        <div className="row g-3 justify-content-center align-items-end mb-5 podium-section">
          {/* 2nd Place */}
          {topThree[1] && (
            <div className="col-12 col-md-4 order-2 order-md-1">
              <div className="card border-0 shadow-sm rounded-4 text-center p-3 bg-body-tertiary podium-card silver-podium">
                <div className="fs-1 mb-1">🥈</div>
                <div className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill px-3 py-1 mb-2 font-monospace">
                  2nd Place
                </div>
                <h5 className="fw-bold mb-0">{topThree[1].username}</h5>
                <div className="h3 fw-bold text-success my-2">{topThree[1].score} pts</div>
                <div className="small text-muted">
                  <span className="badge bg-primary me-1">{topThree[1].difficulty}</span>
                  <span>{topThree[1].attemptsUsed} attempts in {topThree[1].timeTakenSeconds}s</span>
                </div>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <div className="col-12 col-md-4 order-1 order-md-2">
              <div className="card border-0 shadow-lg rounded-4 text-center p-4 bg-warning text-dark podium-card gold-podium border-2 border-warning">
                <div className="display-4 mb-1">👑</div>
                <div className="badge bg-dark text-warning rounded-pill px-3 py-1.5 mb-2 font-monospace fs-6">
                  🥇 Champion
                </div>
                <h4 className="fw-bold mb-0">{topThree[0].username}</h4>
                <div className="display-6 fw-bold my-2">{topThree[0].score} pts</div>
                <div className="small text-dark-50">
                  <span className="badge bg-dark text-white me-1">{topThree[0].difficulty}</span>
                  <span>{topThree[0].attemptsUsed} attempts in {topThree[0].timeTakenSeconds}s</span>
                </div>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="col-12 col-md-4 order-3 order-md-3">
              <div className="card border-0 shadow-sm rounded-4 text-center p-3 bg-body-tertiary podium-card bronze-podium">
                <div className="fs-1 mb-1">🥉</div>
                <div className="badge bg-danger-subtle text-danger-emphasis rounded-pill px-3 py-1 mb-2 font-monospace">
                  3rd Place
                </div>
                <h5 className="fw-bold mb-0">{topThree[2].username}</h5>
                <div className="h3 fw-bold text-success my-2">{topThree[2].score} pts</div>
                <div className="small text-muted">
                  <span className="badge bg-primary me-1">{topThree[2].difficulty}</span>
                  <span>{topThree[2].attemptsUsed} attempts in {topThree[2].timeTakenSeconds}s</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-body">
        <div className="row g-3 align-items-center justify-content-between">
          <div className="col-12 col-md-auto">
            <div className="btn-group flex-wrap" role="group" aria-label="Difficulty Filter">
              {['ALL', 'EASY', 'MEDIUM', 'HARD', 'EXPERT'].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  className={`btn btn-sm ${
                    difficultyFilter === diff ? 'btn-primary active fw-bold' : 'btn-outline-secondary'
                  }`}
                  onClick={() => handleDifficultyChange(diff)}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-body-secondary border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by player username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setSearchTerm('')}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <LeaderboardTable entries={filteredEntries} loading={loading} />
    </div>
  );
};

export default Leaderboard;
