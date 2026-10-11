import React from 'react';
import { Link } from 'react-router-dom';
import sounds from '../utils/soundEffects';

const QuickActionsCard = ({ onPlayGame }) => {
  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-body h-100">
      <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
        <i className="bi bi-lightning-charge text-warning"></i>
        <span>Quick Actions</span>
      </h5>

      <div className="row g-2">
        <div className="col-6">
          <button
            type="button"
            className="btn btn-primary w-100 p-3 rounded-4 text-center d-flex flex-column align-items-center justify-content-center gap-1 shadow-xs hover-scale"
            onClick={() => {
              sounds.playClick();
              if (onPlayGame) onPlayGame();
            }}
          >
            <i className="bi bi-play-circle-fill fs-3"></i>
            <span className="fw-bold small">Play New Game</span>
          </button>
        </div>

        <div className="col-6">
          <Link
            to="/history"
            className="btn btn-outline-secondary w-100 p-3 rounded-4 text-center d-flex flex-column align-items-center justify-content-center gap-1 hover-scale text-decoration-none"
            onClick={() => sounds.playClick()}
          >
            <i className="bi bi-clock-history fs-3 text-primary"></i>
            <span className="fw-semibold small text-body">Game History</span>
          </Link>
        </div>

        <div className="col-6">
          <Link
            to="/leaderboard"
            className="btn btn-outline-secondary w-100 p-3 rounded-4 text-center d-flex flex-column align-items-center justify-content-center gap-1 hover-scale text-decoration-none"
            onClick={() => sounds.playClick()}
          >
            <i className="bi bi-trophy-fill fs-3 text-warning"></i>
            <span className="fw-semibold small text-body">Leaderboard</span>
          </Link>
        </div>

        <div className="col-6">
          <Link
            to="/profile"
            className="btn btn-outline-secondary w-100 p-3 rounded-4 text-center d-flex flex-column align-items-center justify-content-center gap-1 hover-scale text-decoration-none"
            onClick={() => sounds.playClick()}
          >
            <i className="bi bi-person-badge fs-3 text-info"></i>
            <span className="fw-semibold small text-body">My Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsCard;
