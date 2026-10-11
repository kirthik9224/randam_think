import React from 'react';
import { Link } from 'react-router-dom';

const GameCard = ({ difficulty, onQuickPlay }) => {
  const getBadgeColor = (diff) => {
    switch (diff) {
      case 'EASY': return 'bg-success';
      case 'MEDIUM': return 'bg-primary';
      case 'HARD': return 'bg-warning text-dark';
      case 'EXPERT': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getRange = (diff) => {
    switch (diff) {
      case 'EASY': return '1 – 50';
      case 'MEDIUM': return '1 – 100';
      case 'HARD': return '1 – 500';
      case 'EXPERT': return '1 – 1000';
      default: return '1 – 100';
    }
  };

  const getAttempts = (diff) => {
    switch (diff) {
      case 'EASY': return 10;
      case 'MEDIUM': return 7;
      case 'HARD': return 5;
      case 'EXPERT': return 3;
      default: return 7;
    }
  };

  return (
    <div className="card shadow-sm h-100 hover-lift border-0 bg-body-tertiary">
      <div className="card-body p-4 text-center d-flex flex-column">
        <span className={`badge ${getBadgeColor(difficulty)} align-self-center px-3 py-1.5 rounded-pill mb-3`}>
          {difficulty}
        </span>
        <h4 className="fw-bold mb-1">Range: {getRange(difficulty)}</h4>
        <p className="text-muted small mb-4">
          Max attempts allowed: <span className="fw-bold text-dark">{getAttempts(difficulty)}</span>
        </p>

        <div className="mt-auto">
          <button
            onClick={() => onQuickPlay && onQuickPlay(difficulty)}
            className="btn btn-primary w-100 rounded-pill shadow-sm"
          >
            <i className="bi bi-play-circle-fill me-1"></i> Quick Start
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
