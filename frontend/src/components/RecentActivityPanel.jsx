import React from 'react';
import { Link } from 'react-router-dom';
import sounds from '../utils/soundEffects';

const RecentActivityPanel = ({ games = [], loading = false, error = '' }) => {
  const recentGames = games.slice(0, 5);

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getModeBadge = (mode) => {
    switch (mode) {
      case 'HOT_COLD':
        return <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill">🔥 Hot/Cold</span>;
      case 'TIME_ATTACK':
        return <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill">⚡ Blitz</span>;
      case 'DETECTIVE':
        return <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle rounded-pill">🕵️ Detective</span>;
      case 'HARDCORE':
        return <span className="badge bg-dark text-white rounded-pill">💀 Sudden Death</span>;
      case 'CLASSIC':
      default:
        return <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill">🎯 Classic</span>;
    }
  };

  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case 'EASY':
        return <span className="badge bg-success rounded-pill">Easy</span>;
      case 'HARD':
        return <span className="badge bg-warning text-dark rounded-pill">Hard</span>;
      case 'EXPERT':
        return <span className="badge bg-danger rounded-pill">Expert</span>;
      case 'MEDIUM':
      default:
        return <span className="badge bg-primary rounded-pill">Medium</span>;
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-body h-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-clock-history text-primary"></i>
            <span>Recent Activity</span>
          </h5>
          <span className="small text-muted">Latest match records & performance</span>
        </div>
        <Link
          to="/history"
          className="btn btn-outline-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
          onClick={() => sounds.playClick()}
        >
          <span>View All</span>
          <i className="bi bi-arrow-right"></i>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
          <p className="text-muted small mb-0">Loading recent matches...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger py-2 px-3 small rounded-3 mb-0">
          <i className="bi bi-exclamation-triangle-fill me-1"></i> {error}
        </div>
      ) : recentGames.length === 0 ? (
        <div className="text-center py-4 text-muted">
          <i className="bi bi-controller fs-2 mb-2 d-block text-secondary opacity-50"></i>
          <p className="small mb-1 fw-semibold">No games played yet</p>
          <span className="smaller text-muted">Start your first Random Thinking match above to record statistics!</span>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 small">
            <thead className="table-light">
              <tr>
                <th>Date & Time</th>
                <th>Mode</th>
                <th>Difficulty</th>
                <th className="text-center">Attempts</th>
                <th className="text-center">Result</th>
                <th className="text-end">Score</th>
              </tr>
            </thead>
            <tbody>
              {recentGames.map((g) => {
                const isWon = g.status === 'WON';
                return (
                  <tr key={g.gameId}>
                    <td className="text-muted font-monospace small">
                      {formatDate(g.completedAt || g.startedAt)}
                    </td>
                    <td>{getModeBadge(g.gameMode || 'CLASSIC')}</td>
                    <td>{getDifficultyBadge(g.difficulty)}</td>
                    <td className="text-center font-monospace">
                      <span className="fw-semibold">{g.attemptsUsed}</span>
                      <span className="text-muted opacity-60">/{g.attemptsAllowed}</span>
                    </td>
                    <td className="text-center">
                      <span className={`badge ${isWon ? 'bg-success' : 'bg-danger'} rounded-pill px-2.5 py-1`}>
                        {isWon ? (
                          <>
                            <i className="bi bi-trophy-fill me-1"></i> WON
                          </>
                        ) : (
                          <>
                            <i className="bi bi-x-circle-fill me-1"></i> LOST
                          </>
                        )}
                      </span>
                    </td>
                    <td className="text-end fw-bold font-monospace">
                      {isWon ? (
                        <span className="text-success">+{g.score || 0} pts</span>
                      ) : (
                        <span className="text-muted">0 pts</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentActivityPanel;
