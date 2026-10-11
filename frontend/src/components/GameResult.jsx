import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import sounds from '../utils/soundEffects';
import { awardGameXp } from '../utils/progressionHelper';

const GameResult = ({ result, onPlayAgain }) => {
  const isWon = result?.status === 'WON';
  const [copied, setCopied] = useState(false);
  const [xpResult, setXpResult] = useState(null);

  useEffect(() => {
    // Award XP
    const awarded = awardGameXp(result);
    setXpResult(awarded);

    if (isWon) {
      sounds.playWin();
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
        setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 300);

        if (awarded.leveledUp) {
          setTimeout(() => {
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.4 },
            });
          }, 800);
        }
      } catch (e) {
        console.warn('Confetti error', e);
      }
    } else {
      sounds.playGameOver();
    }
  }, [isWon, result]);

  // Generate Wordle-Style Share Card
  const generateShareText = () => {
    const diffEmoji =
      result?.difficulty === 'EASY'
        ? '🟢 EASY'
        : result?.difficulty === 'HARD'
        ? '🔥 HARD'
        : result?.difficulty === 'EXPERT'
        ? '💀 EXPERT'
        : '⚡ MEDIUM';

    const statusHeader = isWon
      ? `VICTORY! 🎯 (${result?.attemptsUsed}/${result?.attemptsAllowed} attempts in ${result?.timeTakenSeconds || 0}s)`
      : `DEFEATED 💀 (Exhausted ${result?.attemptsAllowed} attempts)`;

    const guessHistory = result?.guesses || [];
    let emojiTrail = '';

    if (guessHistory.length > 0) {
      // Sort oldest to newest
      const sorted = [...guessHistory].sort((a, b) => (a.attemptNumber || 0) - (b.attemptNumber || 0));
      sorted.forEach((g) => {
        if (g.result === 'CORRECT') emojiTrail += '🎯 🟩 BULLSEYE!\n';
        else if (g.proximity === 'BOILING_HOT') emojiTrail += '🌋 🟨 Boiling Hot!\n';
        else if (g.result === 'TOO_LOW') emojiTrail += '⬆️ 🟦 Too Low\n';
        else if (g.result === 'TOO_HIGH') emojiTrail += '⬇️ 🟧 Too High\n';
      });
    } else {
      emojiTrail = isWon ? '🎯 🟩 Solved the puzzle!' : '❌ Out of attempts';
    }

    return `🧠 RANDOM THINKING GAME
Difficulty: ${diffEmoji} | Mode: ${result?.gameMode || 'CLASSIC'}
Status: ${statusHeader}
Final Score: ${result?.score || 0} pts

${emojiTrail}
Can you deduce the secret number faster?
👉 Play here: ${window.location.origin}`;
  };

  const handleCopyShare = async () => {
    sounds.playClick();
    const text = generateShareText();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (e) {
      console.warn('Clipboard copy error', e);
    }
  };

  const handleNativeShare = async () => {
    sounds.playClick();
    const text = generateShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Random Thinking Game Score',
          text,
          url: window.location.origin,
        });
      } catch (e) {}
    } else {
      handleCopyShare();
    }
  };

  return (
    <div className="card shadow-lg border-0 text-center result-card overflow-hidden my-4 animate-fade-in">
      <div className={`card-header py-4 text-white ${isWon ? 'bg-success' : 'bg-danger'}`}>
        <div className="display-1 mb-2">{isWon ? '🏆' : '💀'}</div>
        <h2 className="display-6 fw-bold mb-1">{isWon ? 'VICTORY!' : 'GAME OVER!'}</h2>
        <p className="lead mb-0 text-white-50">
          {isWon
            ? 'Awesome thinking! You mastered the Random Thinking challenge.'
            : 'Better luck next time! Maximum attempts reached.'}
        </p>
      </div>

      <div className="card-body p-4 p-md-5">
        {/* Level Up Banner */}
        {xpResult?.leveledUp && (
          <div className="alert alert-warning border-2 border-warning rounded-4 py-3 px-4 mb-4 fw-bold shadow-sm animate-bounce text-dark">
            <div className="fs-3 mb-1">🎉 LEVEL UP!</div>
            <div className="fs-5 mb-0">
              You achieved <strong>Level {xpResult.newLevel}</strong>: <span className="badge bg-dark text-warning">{xpResult.newRankTitle}</span>!
            </div>
          </div>
        )}

        {/* Winner Announcement for Multiplayer */}
        {result?.winnerAnnouncement && (
          <div className="alert alert-primary rounded-4 py-3 px-4 mb-4 fw-bold shadow-sm border-2">
            <div className="fs-4 mb-1">{result.winnerAnnouncement}</div>
            {result.winner && (
              <div className="small text-muted font-monospace">
                Winning Contender: <strong className="text-primary">{result.winner.name}</strong> ({result.winner.team})
              </div>
            )}
          </div>
        )}

        <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
          {result?.playerMode && (
            <span className="badge bg-primary-subtle text-primary border rounded-pill px-3 py-1.5 fs-6">
              Matchup: <strong>{result.playerMode.replace(/_/g, ' ')}</strong>
            </span>
          )}
          <span className="badge bg-secondary-subtle text-body border rounded-pill px-3 py-1.5 fs-6">
            Style: <strong className="text-primary">{result?.gameMode ? result.gameMode.replace('_', ' ') : 'CLASSIC'}</strong>
          </span>
        </div>

        {/* Score & Attempt Statistics Grid */}
        <div className="row g-3 justify-content-center mb-4">
          <div className="col-6 col-md-3">
            <div className="p-3 rounded-4 bg-body-tertiary border">
              <div className="text-muted small text-uppercase">Final Score</div>
              <div className={`h2 fw-bold mb-0 ${isWon ? 'text-success' : 'text-danger'}`}>
                {result?.score || 0}
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-3 rounded-4 bg-body-tertiary border">
              <div className="text-muted small text-uppercase">Attempts Used</div>
              <div className="h2 fw-bold text-primary mb-0">
                {result?.attemptsUsed} / {result?.attemptsAllowed}
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-3 rounded-4 bg-body-tertiary border">
              <div className="text-muted small text-uppercase">Time Taken</div>
              <div className="h2 fw-bold text-warning-emphasis mb-0 font-monospace">
                {result?.timeTakenSeconds !== undefined ? `${result.timeTakenSeconds}s` : '--'}
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-3 rounded-4 bg-body-tertiary border">
              <div className="text-muted small text-uppercase">Difficulty</div>
              <div className="h2 fw-bold text-info mb-0">
                {result?.difficulty || 'MEDIUM'}
              </div>
            </div>
          </div>
        </div>

        {/* XP Progression Bar Card */}
        {xpResult && (
          <div className="card p-3 rounded-4 border bg-body-tertiary mb-4 text-start">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-primary rounded-pill px-3 py-1 font-monospace">
                  Level {xpResult.newProg.level}
                </span>
                <span className="fw-bold text-body">{xpResult.newProg.title}</span>
              </div>
              <span className="badge bg-success text-white rounded-pill px-3 py-1 fw-bold font-monospace">
                +{xpResult.earnedXp} XP EARNED!
              </span>
            </div>

            <div className="progress mb-2" style={{ height: '8px' }}>
              <div
                className="progress-bar bg-primary"
                style={{ width: `${xpResult.newProg.progressPercent}%` }}
              ></div>
            </div>

            <div className="d-flex justify-content-between small text-muted font-monospace">
              <span>{xpResult.newProg.currentLevelXp} / {xpResult.newProg.nextLevelXp} XP</span>
              <span>{100 - xpResult.newProg.progressPercent}% to Level {xpResult.newProg.level + 1}</span>
            </div>
          </div>
        )}

        {/* Wordle-Style Brag Card Share Section */}
        <div className="card p-4 rounded-4 border-2 border-primary-subtle bg-primary-subtle mb-4 shadow-sm">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="text-start">
              <h5 className="fw-bold mb-1 text-primary d-flex align-items-center gap-2">
                <i className="bi bi-share-fill"></i>
                <span>Share Victory Card & Brag to Friends!</span>
              </h5>
              <p className="small text-muted mb-0">
                Copy your clean, spoiler-free deduction emoji grid to WhatsApp, Discord, or Instagram!
              </p>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                onClick={handleCopyShare}
                className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
              >
                <i className={`bi ${copied ? 'bi-check2' : 'bi-clipboard-check'}`}></i>
                <span>{copied ? 'Copied to Clipboard! 🎉' : 'Copy Brag Card'}</span>
              </button>

              {typeof navigator !== 'undefined' && navigator.share && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="btn btn-outline-primary rounded-pill px-3"
                  title="Share natively"
                >
                  <i className="bi bi-box-arrow-up"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
          <button
            onClick={() => {
              sounds.playClick();
              if (onPlayAgain) onPlayAgain();
            }}
            className="btn btn-primary btn-lg px-4 rounded-pill shadow-sm"
          >
            <i className="bi bi-arrow-repeat me-2"></i> Play Again
          </button>
          <Link
            to="/leaderboard"
            className="btn btn-outline-warning btn-lg px-4 rounded-pill text-dark"
            onClick={() => sounds.playClick()}
          >
            <i className="bi bi-trophy me-2"></i> Leaderboard
          </Link>
          <Link
            to="/history"
            className="btn btn-outline-secondary btn-lg px-4 rounded-pill"
            onClick={() => sounds.playClick()}
          >
            <i className="bi bi-clock-history me-2"></i> View History
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GameResult;
