import React, { useState, useEffect } from 'react';
import multiplayerService from '../../services/multiplayerService';

const TeamLeaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await multiplayerService.getLeaderboard();
      setLeaders(data || []);
    } catch (e) {
      console.warn('Error fetching multiplayer leaderboard:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mp-glass-card p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-black text-white mb-0 d-flex align-items-center gap-2">
          <span>🏆</span> Multiplayer Leaderboard
        </h4>
        <button
          className="btn btn-sm btn-outline-info rounded-pill px-3"
          onClick={fetchLeaderboard}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4 text-white-50">
          <div className="spinner-border spinner-border-sm text-info me-2" role="status"></div>
          Loading leaderboard...
        </div>
      ) : leaders.length === 0 ? (
        <div className="text-center py-4 text-white-50 fst-italic">No multiplayer records yet.</div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {leaders.map((entry) => {
            let rankBadge = 'bg-secondary';
            if (entry.rank === 1) rankBadge = 'bg-warning text-dark';
            else if (entry.rank === 2) rankBadge = 'bg-light text-dark';
            else if (entry.rank === 3) rankBadge = 'bg-danger text-white';

            return (
              <div
                key={entry.playerId}
                className="p-3 rounded-3 d-flex justify-content-between align-items-center"
                style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                <div className="d-flex align-items-center gap-3">
                  <span className={`badge rounded-circle p-2 fw-black ${rankBadge}`} style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {entry.rank}
                  </span>
                  <span className="fw-bold text-white fs-6">{entry.username}</span>
                </div>

                <div className="mp-coin-badge">
                  🪙 {entry.virtualCoins.toLocaleString()} Coins
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeamLeaderboard;
