import React from 'react';

const ScoreCard = ({ score, difficulty, attemptsUsed, attemptsAllowed }) => {
  const getDifficultyMultiplier = (diff) => {
    switch (diff) {
      case 'EASY': return '1x Multiplier';
      case 'MEDIUM': return '2x Multiplier';
      case 'HARD': return '4x Multiplier';
      case 'EXPERT': return '8x Multiplier';
      default: return '2x Multiplier';
    }
  };

  return (
    <div className="card shadow-sm border-0 bg-primary text-white overflow-hidden position-relative">
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="text-white-50 small text-uppercase tracking-wider">Estimated Score</div>
            <h2 className="display-6 fw-bold mb-0">{score}</h2>
          </div>
          <div className="text-end">
            <span className="badge bg-white text-primary rounded-pill px-2.5 py-1 mb-1">
              {difficulty || 'MEDIUM'}
            </span>
            <div className="small text-white-50">{getDifficultyMultiplier(difficulty)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;
