import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import sounds from '../utils/soundEffects';
import '../styles/CollageGameTheme.css';

const GameResult = ({ result, onPlayAgain, onNextLevel, onHome }) => {
  const navigate = useNavigate();
  const isWon = result?.status === 'WON';
  const stars = result?.stars || (isWon ? 2 : 0);
  const currentLvl = result?.level || 1;
  const nextLvl = result?.nextLevel || (currentLvl + 1);
  const hasNextLevel = isWon && nextLvl <= 12 && nextLvl > currentLvl;

  const secretNumber = result?.secretNumber || result?.winningGuess || '?';
  const attemptsUsed = result?.attemptsUsed || 0;
  const attemptsAllowed = result?.attemptsAllowed || 7;
  const timeTaken = result?.timeTakenSeconds || 0;

  useEffect(() => {
    if (isWon) {
      sounds.playWin();
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (e) {
        console.warn('Confetti error', e);
      }
    } else {
      sounds.playGameOver();
    }
  }, [isWon]);

  const handleNext = () => {
    sounds.playClick();
    if (onNextLevel) {
      onNextLevel(nextLvl);
    } else {
      navigate('/game', {
        state: { level: nextLvl },
      });
    }
  };

  const handleRetry = () => {
    sounds.playClick();
    if (onPlayAgain) {
      onPlayAgain();
    } else {
      navigate('/game', {
        state: { level: currentLvl },
      });
    }
  };

  const handleGoHome = () => {
    sounds.playClick();
    if (onHome) {
      onHome();
    } else {
      navigate('/');
    }
  };

  return (
    <div
      className={`card border-0 text-center text-white overflow-hidden my-4 animate-fade-in mx-auto p-4 p-md-5 shadow-2xl ${
        isWon ? 'victory-card-collage' : 'gameover-card-collage'
      }`}
      style={{ maxWidth: '580px' }}
    >
      {/* Trophy or Game Over Icon */}
      <div className="mb-3">
        <div
          className="rounded-circle mx-auto d-flex align-items-center justify-content-center shadow-lg"
          style={{
            width: '90px',
            height: '90px',
            fontSize: '3rem',
            background: isWon ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
            border: isWon ? '2px solid #10b981' : '2px solid #ef4444',
            boxShadow: isWon ? '0 0 25px rgba(16, 185, 129, 0.5)' : '0 0 25px rgba(239, 68, 68, 0.5)',
          }}
        >
          {isWon ? '🏆' : '💔'}
        </div>
      </div>

      {/* Main Announcement Header */}
      <h2 className="display-6 fw-black mb-1">
        {isWon ? 'Congratulations!' : 'Game Over!'}
      </h2>
      <p className="fs-5 mb-4 fw-medium text-white-50">
        {isWon ? 'You guessed the number!' : 'You used all your attempts.'}
      </p>

      {/* Star Rating for Victory */}
      {isWon && (
        <div className="p-2.5 rounded-4 mb-4 mx-auto" style={{ background: 'rgba(0, 0, 0, 0.35)', maxWidth: '340px' }}>
          <div className="display-5 text-warning mb-1">
            {stars === 3 ? '⭐⭐⭐' : stars === 2 ? '⭐⭐' : '⭐'}
          </div>
          <span className="fw-bold small text-white-50">
            {stars === 3 ? 'Perfect Instincts! (3 Stars)' : stars === 2 ? 'Great Strategy! (2 Stars)' : 'Level Cleared! (1 Star)'}
          </span>
        </div>
      )}

      {/* Prominent Correct Number Card */}
      <div className="mb-4">
        <div className="revealed-number-box">
          <span className="text-white-50 small d-block font-monospace text-uppercase fw-semibold mb-1">
            {isWon ? 'The Correct Number Was' : 'The Secret Number Was'}
          </span>
          <div
            className="display-3 fw-black font-monospace"
            style={{
              color: isWon ? '#34d399' : '#f87171',
              filter: isWon ? 'drop-shadow(0 0 12px rgba(52, 211, 153, 0.6))' : 'drop-shadow(0 0 12px rgba(248, 113, 113, 0.6))',
            }}
          >
            {secretNumber}
          </div>
        </div>
      </div>

      {/* Attempts Used & Elapsed Time Info Cards */}
      <div className="row g-2.5 mb-4 justify-content-center">
        <div className="col-6">
          <div className="p-3 rounded-4" style={{ background: 'rgba(0, 0, 0, 0.35)' }}>
            <span className="text-white-50 small d-block">Attempts Used</span>
            <strong className="fs-4 font-monospace text-white">
              {attemptsUsed} / {attemptsAllowed}
            </strong>
          </div>
        </div>
        <div className="col-6">
          <div className="p-3 rounded-4" style={{ background: 'rgba(0, 0, 0, 0.35)' }}>
            <span className="text-white-50 small d-block">Completion Time</span>
            <strong className="fs-4 font-monospace text-info">
              {timeTaken}s
            </strong>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex flex-column gap-2.5 mt-2">
        {isWon && hasNextLevel ? (
          <button
            onClick={handleNext}
            className="btn btn-collage-play btn-lg py-3.5 fs-3 w-100 shadow-lg d-inline-flex align-items-center justify-content-center gap-2"
          >
            <span>NEXT LEVEL</span>
            <i className="bi bi-arrow-right-circle-fill fs-4"></i>
          </button>
        ) : !isWon ? (
          <button
            onClick={handleRetry}
            className="btn btn-danger btn-lg py-3.5 fs-3 rounded-pill fw-black shadow-lg d-inline-flex align-items-center justify-content-center gap-2"
            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none' }}
          >
            <i className="bi bi-arrow-repeat fs-4"></i>
            <span>TRY AGAIN</span>
          </button>
        ) : (
          <button
            onClick={handleRetry}
            className="btn btn-collage-play btn-lg py-3.5 fs-3 w-100 shadow-lg"
          >
            PLAY AGAIN
          </button>
        )}

        {isWon && hasNextLevel && (
          <button
            onClick={handleRetry}
            className="btn btn-outline-light rounded-pill py-2.5 fw-semibold small"
          >
            <i className="bi bi-arrow-repeat me-1.5"></i> Replay This Level
          </button>
        )}

        <button
          onClick={handleGoHome}
          className="btn btn-outline-secondary rounded-pill py-2.5 text-white-50 small fw-semibold"
          style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          <i className="bi bi-house-door me-1.5"></i> Back to Home
        </button>
      </div>
    </div>
  );
};

export default GameResult;
