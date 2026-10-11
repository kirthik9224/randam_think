import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import sounds from '../utils/soundEffects';
import NetworkStatusPill from './NetworkStatusPill';
import ThemeSelectorPill from './ThemeSelectorPill';
import { getPlayerProgression } from '../utils/progressionHelper';

const Navbar = ({ darkMode, toggleDarkMode, soundEnabled, toggleSound }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = authService.getCurrentUser();
  const prog = getPlayerProgression();

  const handleLogout = async () => {
    sounds.playClick();
    await authService.logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active fw-bold' : '';

  return (
    <nav className="navbar navbar-expand-lg sticky-top shadow-sm navbar-dark">
      <div className="container-fluid px-3 px-xl-4">
        <Link className="navbar-brand d-flex align-items-center gap-2 text-nowrap me-3 me-xl-4" to="/">
          <span className="game-brand-icon">🎯</span>
          <span className="fw-bold tracking-tight">
            RANDOM<span className="text-primary">THINKING</span>
          </span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-lg-center">
            <li className="nav-item">
              <Link className={`nav-link text-nowrap ${isActive('/')}`} to="/">
                <i className="bi bi-house-door me-1"></i> Home
              </Link>
            </li>
            {currentUser && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link text-nowrap ${isActive('/dashboard')}`} to="/dashboard">
                    <i className="bi bi-speedometer2 me-1"></i> Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link text-nowrap ${isActive('/game')}`} to="/game">
                    <i className="bi bi-controller me-1"></i> Play Game
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link text-nowrap ${isActive('/history')}`} to="/history">
                    <i className="bi bi-clock-history me-1"></i> History
                  </Link>
                </li>
              </>
            )}
            <li className="nav-item">
              <Link className={`nav-link text-nowrap ${isActive('/leaderboard')}`} to="/leaderboard">
                <i className="bi bi-trophy me-1"></i> Leaderboard
              </Link>
            </li>
            {currentUser && currentUser.role === 'ADMIN' && (
              <li className="nav-item">
                <Link className={`nav-link text-warning text-nowrap ${isActive('/admin')}`} to="/admin">
                  <i className="bi bi-shield-lock me-1"></i> Admin Panel
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2 flex-wrap flex-lg-nowrap ms-lg-auto mt-2 mt-lg-0">
            {/* Player Level Badge */}
            <div
              className="d-none d-xl-flex align-items-center gap-1.5 px-2.5 py-1 rounded-pill bg-body-tertiary border text-nowrap flex-shrink-0"
              title={`${prog.title} • ${prog.currentLevelXp}/${prog.nextLevelXp} XP (${prog.progressPercent}%)`}
              style={{ fontSize: '0.82rem' }}
            >
              <span className="badge bg-primary text-white rounded-pill px-2 py-0.5 font-monospace" style={{ fontSize: '0.7rem' }}>
                Lvl {prog.level}
              </span>
              <span className="fw-semibold text-body small text-nowrap">
                {prog.title}
              </span>
            </div>

            {/* Board Theme & Pin Selector Pill */}
            <ThemeSelectorPill />

            {/* Online / Offline Mode Indicator Pill */}
            <NetworkStatusPill />

            {/* Sound Toggle */}
            <button
              onClick={() => {
                toggleSound();
                sounds.playClick();
              }}
              className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center p-0 flex-shrink-0"
              style={{ width: '32px', height: '32px' }}
              title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            >
              <i className={`bi ${soundEnabled ? 'bi-volume-up-fill text-success' : 'bi-volume-mute-fill text-muted'}`}></i>
            </button>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={() => {
                toggleDarkMode();
                sounds.playClick();
              }}
              className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center p-0 flex-shrink-0"
              style={{ width: '32px', height: '32px' }}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <i className={`bi ${darkMode ? 'bi-sun-fill text-warning' : 'bi-moon-stars-fill text-primary'}`}></i>
            </button>

            {currentUser ? (
              <div className="dropdown flex-shrink-0">
                <button
                  className="btn btn-primary btn-sm dropdown-toggle rounded-pill d-flex align-items-center gap-1.5 px-3 py-1 text-nowrap"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle"></i>
                  <span>{currentUser.username}</span>
                  {currentUser.role === 'ADMIN' && (
                    <span className="badge bg-warning text-dark ms-1" style={{ fontSize: '0.65rem' }}>ADMIN</span>
                  )}
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="userDropdown">
                  <li>
                    <Link className="dropdown-item d-flex align-items-center gap-2" to="/profile">
                      <i className="bi bi-person"></i> My Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item d-flex align-items-center gap-2" to="/history">
                      <i className="bi bi-journal-text"></i> Game Logs
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right"></i> Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-primary btn-sm px-3 rounded-pill">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm px-3 rounded-pill">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
