import React, { useState, useEffect } from 'react';
import leaderboardService from '../services/leaderboardService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import sounds from '../utils/soundEffects';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsData, playersData, gamesData] = await Promise.all([
        leaderboardService.getAdminStats(),
        leaderboardService.getAllPlayers(),
        leaderboardService.getAllGames(),
      ]);
      setStats(statsData);
      setPlayers(playersData || []);
      setGames(gamesData || []);
    } catch (err) {
      setError('Failed to fetch administrator statistics and tables.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlayer = async (id, username) => {
    sounds.playClick();
    if (window.confirm(`Are you sure you want to permanently delete player "${username}" and all their game history?`)) {
      try {
        await leaderboardService.deletePlayer(id);
        setSuccessMsg(`Player "${username}" deleted successfully.`);
        loadAdminData();
      } catch (err) {
        setError(err.message || 'Failed to delete player.');
      }
    }
  };

  const handleDeleteGame = async (id) => {
    sounds.playClick();
    if (window.confirm(`Delete game log #${id}?`)) {
      try {
        await leaderboardService.deleteGame(id);
        setSuccessMsg(`Game record #${id} deleted.`);
        loadAdminData();
      } catch (err) {
        setError(err.message || 'Failed to delete game.');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner message="Accessing admin control center..." fullScreen />;
  }

  return (
    <div className="admin-dashboard-page container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <div className="badge bg-warning text-dark px-3 py-1 rounded-pill mb-2 fw-bold">
            <i className="bi bi-shield-lock-fill me-1"></i> ADMIN CONSOLE
          </div>
          <h2 className="fw-bold mb-0">System Control Dashboard</h2>
        </div>
        <button onClick={loadAdminData} className="btn btn-outline-secondary rounded-pill px-3">
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh Data
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show rounded-3" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i> {successMsg}
          <button type="button" className="btn-close" onClick={() => setSuccessMsg('')}></button>
        </div>
      )}
      <ErrorMessage message={error} onDismiss={() => setError('')} />

      {/* Tabs */}
      <ul className="nav nav-pills mb-4 gap-2">
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="bi bi-graph-up me-2"></i> System Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 ${activeTab === 'players' ? 'active' : ''}`}
            onClick={() => setActiveTab('players')}
          >
            <i className="bi bi-people me-2"></i> Players ({players.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 ${activeTab === 'games' ? 'active' : ''}`}
            onClick={() => setActiveTab('games')}
          >
            <i className="bi bi-joystick me-2"></i> Game Logs ({games.length})
          </button>
        </li>
      </ul>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm rounded-4 p-3 text-center bg-body">
                <div className="text-muted small">Total Registered Players</div>
                <div className="h2 fw-bold text-primary mb-0">{stats?.totalPlayers || 0}</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm rounded-4 p-3 text-center bg-body">
                <div className="text-muted small">Total Games Played</div>
                <div className="h2 fw-bold text-dark-emphasis mb-0">{stats?.totalGames || 0}</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm rounded-4 p-3 text-center bg-body">
                <div className="text-muted small">Games Won</div>
                <div className="h2 fw-bold text-success mb-0">{stats?.totalWins || 0}</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm rounded-4 p-3 text-center bg-body">
                <div className="text-muted small">Overall Win Rate</div>
                <div className="h2 fw-bold text-info mb-0">{stats?.overallWinRate || 0}%</div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-body">
            <h5 className="fw-bold mb-3">Games by Difficulty Level</h5>
            <div className="row g-3">
              {['EASY', 'MEDIUM', 'HARD', 'EXPERT'].map((diff) => (
                <div key={diff} className="col-6 col-md-3">
                  <div className="p-3 rounded-4 bg-body-tertiary border text-center">
                    <div className="fw-semibold text-muted">{diff}</div>
                    <div className="h4 fw-bold mb-0 text-primary">
                      {stats?.gamesByDifficulty?.[diff] || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Players Tab */}
      {activeTab === 'players' && (
        <div className="table-responsive rounded-4 shadow-sm border overflow-hidden">
          <table className="table table-hover align-middle mb-0 bg-body">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Total Games</th>
                <th>Wins</th>
                <th>Win Rate</th>
                <th>Highest Score</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr key={p.id}>
                  <td className="font-monospace">#{p.id}</td>
                  <td className="fw-semibold">{p.username}</td>
                  <td className="small text-muted">{p.email}</td>
                  <td>
                    <span className={`badge ${p.role === 'ADMIN' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                      {p.role}
                    </span>
                  </td>
                  <td>{p.totalGames}</td>
                  <td className="text-success fw-bold">{p.gamesWon}</td>
                  <td>{p.winRate}%</td>
                  <td className="fw-bold text-primary">{p.highestScore}</td>
                  <td className="text-end">
                    <button
                      onClick={() => handleDeletePlayer(p.id, p.username)}
                      className="btn btn-outline-danger btn-sm rounded-pill"
                      title="Delete Player"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Games Tab */}
      {activeTab === 'games' && (
        <div className="table-responsive rounded-4 shadow-sm border overflow-hidden">
          <table className="table table-hover align-middle mb-0 bg-body">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Player</th>
                <th>Status</th>
                <th>Difficulty</th>
                <th>Attempts</th>
                <th>Score</th>
                <th>Date</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g) => (
                <tr key={g.gameId}>
                  <td className="font-monospace fw-bold">#{g.gameId}</td>
                  <td className="fw-semibold">{g.username || `Player #${g.playerId}`}</td>
                  <td>
                    <span className={`badge ${g.status === 'WON' ? 'bg-success' : g.status === 'LOST' ? 'bg-danger' : 'bg-warning'}`}>
                      {g.status}
                    </span>
                  </td>
                  <td><span className="badge bg-secondary-subtle text-body-secondary">{g.difficulty}</span></td>
                  <td className="font-monospace">{g.attemptsUsed} / {g.attemptsAllowed}</td>
                  <td className="fw-bold text-success">{g.score}</td>
                  <td className="small text-muted">{new Date(g.startedAt).toLocaleString()}</td>
                  <td className="text-end">
                    <button
                      onClick={() => handleDeleteGame(g.gameId)}
                      className="btn btn-outline-danger btn-sm rounded-pill"
                      title="Delete Game Log"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
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

export default AdminDashboard;
