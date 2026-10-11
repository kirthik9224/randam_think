import React, { useState, useEffect } from 'react';
import sounds from '../utils/soundEffects';
import {
  getTodayDateString,
  getDailyChallengeState,
  generateDailyShareText,
  getTimeUntilMidnight,
} from '../utils/dailyChallengeHelper';

const DailyChallengeCard = ({ onPlayDaily }) => {
  const [dailyState, setDailyState] = useState(getDailyChallengeState);
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyShare = async () => {
    sounds.playClick();
    const shareText = generateDailyShareText(dailyState);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } else {
        // Fallback prompt
        window.prompt('Copy your Daily Challenge Result:', shareText);
      }
    } catch (e) {
      console.warn('Failed to copy', e);
    }
  };

  const isPlayed = dailyState.todayStatus !== 'UNPLAYED';
  const isWon = dailyState.todayStatus === 'WON';

  return (
    <div className="daily-challenge-card card border-0 shadow-sm rounded-4 p-4 mb-4 text-white position-relative overflow-hidden">
      {/* Background ambient gradient glow */}
      <div className="daily-card-bg-gradient position-absolute top-0 start-0 w-100 h-100"></div>

      <div className="position-relative" style={{ zIndex: 2 }}>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
          <div className="d-flex align-items-center gap-2">
            <span className="fs-3">🌟</span>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h5 className="fw-bold mb-0">DAILY MYSTERY CHALLENGE</h5>
                <span className="badge bg-warning text-dark rounded-pill px-2.5 py-1 font-monospace fw-bold">
                  🔥 {dailyState.currentStreak} Day{dailyState.currentStreak === 1 ? '' : 's'} Streak
                </span>
              </div>
              <div className="small text-white-50">
                Universal daily secret number shared worldwide • Resets in{' '}
                <span className="font-monospace text-warning fw-bold">{countdown}</span>
              </div>
            </div>
          </div>

          {/* Quick Streak Stats Pills */}
          <div className="d-flex align-items-center gap-2">
            <div className="badge bg-black bg-opacity-25 border border-white-50 rounded-pill px-3 py-2 font-monospace">
              <span>🏆 Best Streak: </span>
              <strong className="text-warning">{dailyState.bestStreak} Days</strong>
            </div>
          </div>
        </div>

        {/* Content depending on unplayed vs played */}
        {!isPlayed ? (
          <div className="p-3 rounded-4 bg-black bg-opacity-25 border border-white border-opacity-10 d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <div className="fw-bold text-white mb-0.5 d-flex align-items-center gap-1.5">
                <span>Today's Mystery (#{getTodayDateString()}) is Live!</span>
              </div>
              <p className="small text-white-50 mb-0">
                Range: 1 – 500 • 7 Attempts • Can you keep your daily streak alive today?
              </p>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                if (onPlayDaily) onPlayDaily();
              }}
              className="btn btn-warning btn-lg px-4 py-2.5 rounded-pill fw-bold text-dark shadow d-flex align-items-center gap-2 hover-scale"
            >
              <i className="bi bi-play-circle-fill fs-5"></i>
              PLAY TODAY'S CHALLENGE
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-4 bg-black bg-opacity-25 border border-white border-opacity-10 d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <span className="fs-1">{isWon ? '🎉' : '💀'}</span>
              <div>
                <div className="fw-bold text-white mb-0.5 d-flex align-items-center gap-2">
                  <span>{isWon ? "Today's Challenge Completed!" : "Today's Attempt Finished"}</span>
                  <span className={`badge ${isWon ? 'bg-success' : 'bg-danger'} rounded-pill font-monospace`}>
                    {isWon ? `SOLVED IN ${dailyState.todayAttempts}/7` : 'OUT OF ATTEMPTS'}
                  </span>
                </div>
                <p className="small text-white-50 mb-0">
                  Next daily mystery arrives at midnight in{' '}
                  <span className="text-warning font-monospace fw-bold">{countdown}</span>.
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyShare}
              className={`btn ${copied ? 'btn-success' : 'btn-outline-light'} rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2`}
            >
              <i className={`bi ${copied ? 'bi-check2-all' : 'bi-share-fill'}`}></i>
              <span>{copied ? 'Copied to Clipboard! 🎉' : 'Share Result Card 📋'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyChallengeCard;
