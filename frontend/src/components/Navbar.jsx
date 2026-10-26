import React, { useState } from 'react';
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

  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => {
    return localStorage.getItem('rtg_reduced_motion') === 'true';
  });

  const handleToggleMotion = () => {
    sounds.playClick();
    setReducedMotion((prev) => {
      const next = !prev;
      localStorage.setItem('rtg_reduced_motion', String(next));
      return next;
    });
  };

  const isActive = (path) => (location.pathname === path ? 'active fw-bold' : '');

  return (
    <>
      <nav className="navbar navbar-expand-lg sticky-top shadow-sm navbar-dark">
        <div className="container-fluid px-3 px-xl-4">
          <Link className="navbar-brand d-flex align-items-center gap-2 text-nowrap me-3 me-xl-4" to="/">
            <span className="game-brand-icon fs-4">💡</span>
            <span className="fw-black tracking-tight text-white">
              GUESS<span style={{ color: '#fbbf24' }}> THE NUMBER</span>
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
                  <i className="bi bi-bar-chart-fill me-1"></i> Stats
                </Link>
              </li>

              <li className="nav-item">
                <Link className={`nav-link text-nowrap ${isActive('/leaderboard')}`} to="/leaderboard">
                  <i className="bi bi-trophy me-1"></i> Leaderboard
                </Link>
              </li>

              <li className="nav-item">
                <button
                  type="button"
                  className="nav-link btn btn-link text-nowrap border-0 text-start"
                  onClick={() => {
                    sounds.playClick();
                    setShowHowToPlayModal(true);
                  }}
                  style={{ textDecoration: 'none' }}
                >
                  <i className="bi bi-question-circle me-1"></i> How to Play
                </button>
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

              {/* Settings Modal Toggle */}
              <button
                onClick={() => {
                  sounds.playClick();
                  setShowSettingsModal(true);
                }}
                className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center p-0 flex-shrink-0"
                style={{ width: '32px', height: '32px' }}
                title="Settings & Audio"
              >
                <i className="bi bi-gear-fill text-info"></i>
              </button>

              {/* Player Profile Pill (Direct access, no login/logout required) */}
              <Link
                to="/profile"
                className="btn btn-primary btn-sm rounded-pill d-flex align-items-center gap-1.5 px-3 py-1 text-nowrap"
                title="View Player Profile"
              >
                <i className="bi bi-person-circle"></i>
                <span>{currentUser?.username || 'Player'}</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HOW TO PLAY MODAL */}
      {showHowToPlayModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(5, 2, 18, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1060 }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content collage-card border-0 p-4 shadow-2xl">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-black text-white mb-0 d-flex align-items-center gap-2">
                  <span>🎮</span>
                  <span>How to Play</span>
                </h4>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowHowToPlayModal(false)}
                  aria-label="Close"
                ></button>
              </div>

              <div className="d-flex flex-column gap-3 mb-4 text-start">
                <div className="p-3 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.05)', borderLeft: '4px solid #fbbf24' }}>
                  <div className="fw-bold text-warning mb-1">1. The Secret Number</div>
                  <div className="text-white-50 small">
                    The game secretly selects a number in the level range (e.g. 1 to 10 for Level 1).
                  </div>
                </div>

                <div className="p-3 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.05)', borderLeft: '4px solid #10b981' }}>
                  <div className="fw-bold text-success mb-1">2. Submit Your Guess</div>
                  <div className="text-white-50 small">
                    Type a number or tap <strong>🎲 RANDOM</strong>, then hit <strong>Submit Guess</strong>.
                  </div>
                </div>

                <div className="p-3 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.05)', borderLeft: '4px solid #38bdf8' }}>
                  <div className="fw-bold text-info mb-1">3. Follow The Hints</div>
                  <div className="text-white-50 small">
                    Get instant color-coded feedback: <strong>Too Low!</strong> ⬆️ or <strong>Too High!</strong> ⬇️.
                  </div>
                </div>

                <div className="p-3 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.05)', borderLeft: '4px solid #c084fc' }}>
                  <div className="fw-bold text-purple mb-1">4. Win & Unlock Levels</div>
                  <div className="text-white-50 small">
                    Find the number before running out of attempts to earn stars and unlock the next level!
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-warning w-100 py-2.5 fs-5 fw-black rounded-pill m-0 text-dark shadow-sm"
                onClick={() => {
                  setShowHowToPlayModal(false);
                  navigate('/game');
                }}
              >
                Got It! Play Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(5, 2, 18, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1060 }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content collage-card border-0 p-4 shadow-2xl">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-black text-white mb-0">⚙️ Settings</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowSettingsModal(false)}
                  aria-label="Close"
                ></button>
              </div>

              <div className="d-flex flex-column gap-3 mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong className="d-block small text-white">Sound Effects</strong>
                    <span className="text-white-50 small">Audio chimes</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      toggleSound();
                      sounds.playClick();
                    }}
                    className={`btn btn-sm rounded-pill px-3 fw-bold ${soundEnabled ? 'btn-success' : 'btn-outline-secondary'}`}
                  >
                    {soundEnabled ? '🔊 ON' : '🔇 OFF'}
                  </button>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong className="d-block small text-white">Animations</strong>
                    <span className="text-white-50 small">Reduce motion</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleMotion}
                    className={`btn btn-sm rounded-pill px-3 fw-bold ${reducedMotion ? 'btn-success' : 'btn-outline-secondary'}`}
                  >
                    {reducedMotion ? 'REDUCED' : 'FULL'}
                  </button>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong className="d-block small text-white">Theme</strong>
                    <span className="text-white-50 small">{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      toggleDarkMode();
                      sounds.playClick();
                    }}
                    className="btn btn-sm rounded-pill px-3 fw-bold btn-outline-info"
                  >
                    {darkMode ? '🌙 Dark' : '☀️ Light'}
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary rounded-pill w-100 py-2 small"
                onClick={() => setShowSettingsModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
