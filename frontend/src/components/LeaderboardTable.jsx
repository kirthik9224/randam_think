import React from 'react';
import { Link } from 'react-router-dom';

const LeaderboardTable = ({ entries = [], loading = false }) => {
  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return <span className="badge bg-warning text-dark fs-6 px-2.5 py-1">🥇 1st</span>;
      case 2:
        return <span className="badge bg-secondary-subtle text-secondary-emphasis fs-6 px-2.5 py-1">🥈 2nd</span>;
      case 3:
        return <span className="badge bg-danger-subtle text-danger-emphasis fs-6 px-2.5 py-1">🥉 3rd</span>;
      default:
        return <span className="badge bg-light text-dark border font-monospace">#{rank}</span>;
    }
  };

  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case 'EASY': return <span className="badge bg-success">Easy</span>;
      case 'MEDIUM': return <span className="badge bg-primary">Medium</span>;
      case 'HARD': return <span className="badge bg-warning text-dark">Hard</span>;
      case 'EXPERT': return <span className="badge bg-danger">Expert</span>;
      default: return <span className="badge bg-secondary">{diff}</span>;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading leaderboard...</span>
        </div>
        <p className="mt-2 text-muted">Fetching leaderboard rankings...</p>
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-5 bg-body-tertiary rounded-4 border p-4">
        <div className="display-4 mb-2">🎯</div>
        <h5 className="fw-bold mb-1">No games recorded yet!</h5>
        <p className="text-muted mb-3">Be the first player to complete a match and claim the #1 spot on the board.</p>
        <Link to="/game" className="btn btn-primary rounded-pill px-4 fw-bold">
          <i className="bi bi-play-circle-fill me-1.5"></i> Play Now
        </Link>
      </div>
    );
  }

  return (
    <div className="table-responsive rounded-4 shadow-sm border overflow-hidden">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-dark">
          <tr>
            <th scope="col" className="text-center" style={{ width: '80px' }}>Rank</th>
            <th scope="col">Player</th>
            <th scope="col" className="text-end">Score</th>
            <th scope="col" className="text-center">Difficulty</th>
            <th scope="col" className="text-center">Attempts</th>
            <th scope="col" className="text-center">Time</th>
            <th scope="col" className="text-end">Date</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((item, idx) => {
            const rank = item.rank || idx + 1;
            const isTop3 = rank <= 3;
            return (
              <tr key={item.gameId || idx} className={isTop3 ? 'table-warning-subtle' : ''}>
                <td className="text-center fw-bold">
                  {getRankBadge(rank)}
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div className="avatar-circle bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '14px', fontWeight: 'bold' }}>
                      {item.username ? item.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="fw-semibold text-body">{item.username}</div>
                      <div>
                        <span className="badge bg-success-subtle text-success border border-success-subtle font-monospace" style={{ fontSize: '0.68rem' }}>
                          <i className="bi bi-shield-check me-1"></i> Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="text-end">
                  <span className="fw-bold text-success fs-5">{item.score}</span>
                </td>
                <td className="text-center">
                  {getDifficultyBadge(item.difficulty)}
                </td>
                <td className="text-center">
                  <span className="badge bg-secondary-subtle text-body-secondary font-monospace">
                    {item.attemptsUsed} / {item.attemptsAllowed}
                  </span>
                </td>
                <td className="text-center font-monospace small">
                  {item.timeTakenSeconds !== undefined ? `${item.timeTakenSeconds}s` : '--'}
                </td>
                <td className="text-end small text-muted">
                  {formatDate(item.playedAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;
