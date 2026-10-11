import React, { useState } from 'react';

const DIFFICULTIES = [
  { id: 'EASY', name: 'Easy', range: '1–50', color: 'success', badge: 'bg-success' },
  { id: 'MEDIUM', name: 'Medium', range: '1–100', color: 'primary', badge: 'bg-primary' },
  { id: 'HARD', name: 'Hard', range: '1–500', color: 'warning', badge: 'bg-warning text-dark' },
  { id: 'EXPERT', name: 'Expert', range: '1–1000', color: 'danger', badge: 'bg-danger' },
];

const MODES = [
  { id: 'CLASSIC', name: 'Classic Guess', icon: 'bi-bullseye', color: 'primary' },
  { id: 'HOT_COLD', name: 'Hot or Cold', icon: 'bi-fire', color: 'danger' },
  { id: 'TIME_ATTACK', name: 'Blitz Time Attack', icon: 'bi-lightning-charge-fill', color: 'warning' },
  { id: 'DETECTIVE', name: 'Number Detective', icon: 'bi-search-heart-fill', color: 'info' },
  { id: 'HARDCORE', name: 'Sudden Death', icon: 'bi-skull-fill', color: 'dark' },
];

const PerformanceBreakdownCard = ({ history = [] }) => {
  const [activeTab, setActiveTab] = useState('difficulty');

  // Compute stats by difficulty
  const difficultyStats = DIFFICULTIES.map((d) => {
    const games = history.filter((g) => g.difficulty === d.id);
    const played = games.length;
    const won = games.filter((g) => g.status === 'WON').length;
    const winRate = played > 0 ? Math.round((won / played) * 100) : 0;
    const bestScore = games
      .filter((g) => g.status === 'WON')
      .reduce((max, g) => Math.max(max, g.score || 0), 0);
    return { ...d, played, won, winRate, bestScore };
  });

  // Compute stats by game mode
  const modeStats = MODES.map((m) => {
    const games = history.filter((g) => (g.gameMode || 'CLASSIC') === m.id);
    const played = games.length;
    const won = games.filter((g) => g.status === 'WON').length;
    const winRate = played > 0 ? Math.round((won / played) * 100) : 0;
    return { ...m, played, won, winRate };
  });

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-body h-100">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-pie-chart-fill text-primary"></i>
            <span>Performance Breakdown</span>
          </h5>
          <span className="small text-muted">Win rates & stats across categories</span>
        </div>

        {/* Tab switch */}
        <div className="btn-group btn-group-sm p-1 bg-body-tertiary rounded-pill border">
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${
              activeTab === 'difficulty' ? 'btn-primary' : 'btn-light border-0'
            }`}
            onClick={() => setActiveTab('difficulty')}
          >
            By Difficulty
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${
              activeTab === 'mode' ? 'btn-primary' : 'btn-light border-0'
            }`}
            onClick={() => setActiveTab('mode')}
          >
            By Game Mode
          </button>
        </div>
      </div>

      {activeTab === 'difficulty' ? (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 small">
            <thead className="table-light">
              <tr>
                <th>Difficulty</th>
                <th className="text-center">Played</th>
                <th className="text-center">Won</th>
                <th style={{ minWidth: '110px' }}>Win Rate</th>
                <th className="text-end">Best Score</th>
              </tr>
            </thead>
            <tbody>
              {difficultyStats.map((d) => (
                <tr key={d.id}>
                  <td>
                    <span className={`badge ${d.badge} rounded-pill`}>
                      {d.name}
                    </span>
                  </td>
                  <td className="text-center fw-semibold font-monospace">{d.played}</td>
                  <td className="text-center text-success fw-bold font-monospace">{d.won}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="progress flex-grow-1" style={{ height: '6px' }}>
                        <div
                          className={`progress-bar bg-${d.color}`}
                          style={{ width: `${d.winRate}%` }}
                        ></div>
                      </div>
                      <span className="font-monospace smaller fw-bold">{d.winRate}%</span>
                    </div>
                  </td>
                  <td className="text-end fw-bold text-primary font-monospace">
                    {d.bestScore > 0 ? `${d.bestScore} pts` : '--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 small">
            <thead className="table-light">
              <tr>
                <th>Game Mode</th>
                <th className="text-center">Played</th>
                <th className="text-center">Won</th>
                <th style={{ minWidth: '120px' }}>Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {modeStats.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <i className={`bi ${m.icon} text-${m.color} fs-6`}></i>
                      <span className="fw-semibold">{m.name}</span>
                    </div>
                  </td>
                  <td className="text-center fw-semibold font-monospace">{m.played}</td>
                  <td className="text-center text-success fw-bold font-monospace">{m.won}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="progress flex-grow-1" style={{ height: '6px' }}>
                        <div
                          className={`progress-bar bg-${m.color}`}
                          style={{ width: `${m.winRate}%` }}
                        ></div>
                      </div>
                      <span className="font-monospace smaller fw-bold">{m.winRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PerformanceBreakdownCard;
