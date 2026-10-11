import React from 'react';

const BossRaidHud = ({
  bossName = 'MasterMind Boss Computer',
  minNumber = 1,
  maxNumber = 100,
  currentMin = 1,
  currentMax = 100,
  attemptsRemaining = 5,
  isCurrentAiTurn = false,
}) => {
  const totalSpan = Math.max(1, maxNumber - minNumber + 1);
  const currentSpan = Math.max(1, currentMax - currentMin + 1);
  const hpPercent = Math.min(100, Math.max(0, Math.round((currentSpan / totalSpan) * 100)));

  let phaseTitle = 'Phase 1: Defenses Intact';
  let phaseColor = 'success';
  let bossQuote = "Your squad attempts are ticking. Let's see if you can crack the secret code.";

  if (hpPercent <= 20) {
    phaseTitle = 'PHASE 3: FINAL CRITICAL RANGE!';
    phaseColor = 'danger';
    bossQuote = 'Target perimeter is critical! The secret number is right here!';
  } else if (hpPercent <= 50) {
    phaseTitle = 'Phase 2: Perimeter Narrowing';
    phaseColor = 'warning';
    bossQuote = 'Impressive teamwork! You are closing the gap faster than expected.';
  }

  return (
    <div className="card boss-raid-card text-white rounded-4 p-3 mb-4 shadow">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
        <div className="d-flex align-items-center gap-2">
          <span className="fs-3">👾</span>
          <div>
            <h5 className="fw-bold mb-0 text-white d-flex align-items-center gap-2">
              <span>{bossName}</span>
              <span className="badge bg-danger rounded-pill font-monospace" style={{ fontSize: '0.75rem' }}>
                RAID BOSS
              </span>
            </h5>
            <div className="small text-white-50 font-monospace">{phaseTitle}</div>
          </div>
        </div>

        <div className="text-end">
          <span className="badge bg-dark bg-opacity-50 border border-white border-opacity-25 px-3 py-1 font-monospace">
            Matrix Integrity: <strong className={`text-${phaseColor}`}>{hpPercent}%</strong> ({currentSpan} spans left)
          </span>
        </div>
      </div>

      {/* Health Bar */}
      <div className="boss-hp-bar mb-2 shadow-inner">
        <div
          className={`boss-hp-fill ${hpPercent <= 20 ? 'animate-pulse' : ''}`}
          style={{
            width: `${hpPercent}%`,
            background:
              hpPercent <= 20
                ? 'linear-gradient(90deg, #dc2626, #ef4444)'
                : hpPercent <= 50
                ? 'linear-gradient(90deg, #f59e0b, #eab308)'
                : 'linear-gradient(90deg, #10b981, #06b6d4)',
          }}
        ></div>
      </div>

      {/* Boss Quote & Status */}
      <div className="d-flex justify-content-between align-items-center small text-white-50 font-monospace">
        <div>
          <i className="bi bi-chat-quote-fill me-1 text-warning"></i>
          <em>"{bossQuote}"</em>
        </div>
        <div>
          {isCurrentAiTurn && (
            <span className="badge bg-danger text-white rounded-pill px-2 py-0.5 animate-pulse">
              Boss Counter-Attacking...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BossRaidHud;
