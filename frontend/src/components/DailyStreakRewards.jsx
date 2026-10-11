import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import sounds from '../utils/soundEffects';
import { addDirectXp } from '../utils/progressionHelper';

const STORAGE_STREAK_DATA = 'rtg_daily_streak_rewards';

const STREAK_DAYS = [
  { day: 1, title: 'Day 1', reward: '+100 XP', icon: 'bi-star-fill', color: 'text-warning', xp: 100 },
  { day: 2, title: 'Day 2', reward: '50/50 Slicer', icon: 'bi-scissors', color: 'text-info', xp: 150 },
  { day: 3, title: 'Day 3', reward: '+200 XP Boost', icon: 'bi-lightning-charge-fill', color: 'text-primary', xp: 200 },
  { day: 4, title: 'Day 4', reward: 'Shield Boost', icon: 'bi-shield-check', color: 'text-success', xp: 250 },
  { day: 5, title: 'Day 5', reward: 'Rare Title', icon: 'bi-award-fill', color: 'text-danger', xp: 350 },
  { day: 6, title: 'Day 6', reward: '+500 Mega XP', icon: 'bi-fire', color: 'text-warning', xp: 500 },
  { day: 7, title: 'Day 7', reward: '🎁 Mystery Chest', icon: 'bi-gift-fill', color: 'text-purple', xp: 1000, isChest: true },
];

const DailyStreakRewards = ({ onRewardClaimed }) => {
  const [streakData, setStreakData] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_STREAK_DATA);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
      currentStreak: 1,
      lastClaimedDate: '',
      claimedDays: [],
    };
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const alreadyClaimedToday = streakData.lastClaimedDate === todayStr;

  const handleClaim = (dayItem) => {
    if (alreadyClaimedToday) return;

    sounds.playWin();
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (e) {}

    // Award XP
    if (dayItem.xp) {
      addDirectXp(dayItem.xp, `Day ${dayItem.day} Streak Reward`);
    }

    const nextStreak = (streakData.currentStreak % 7) + 1;
    const newStreakData = {
      currentStreak: nextStreak,
      lastClaimedDate: todayStr,
      claimedDays: [...(streakData.claimedDays || []), dayItem.day],
    };

    setStreakData(newStreakData);
    try {
      localStorage.setItem(STORAGE_STREAK_DATA, JSON.stringify(newStreakData));
    } catch (e) {}

    if (onRewardClaimed) {
      onRewardClaimed(dayItem);
    }
  };

  const activeDayIndex = Math.min(6, (streakData.currentStreak - 1) % 7);

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-body mb-4 streak-rewards-card">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-3 py-1 mb-1 fw-semibold font-monospace">
            🔥 Daily Habit Loop
          </span>
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <span>7-Day Dedication Calendar & Mystery Chest</span>
          </h5>
        </div>

        <div>
          {alreadyClaimedToday ? (
            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1.5 rounded-pill font-monospace">
              <i className="bi bi-check-circle-fill me-1"></i> Today Claimed! Next reward tomorrow
            </span>
          ) : (
            <button
              onClick={() => handleClaim(STREAK_DAYS[activeDayIndex])}
              className="btn btn-warning rounded-pill px-4 fw-bold shadow-sm animate-bounce"
            >
              <i className="bi bi-gift-fill me-1"></i> Claim Day {STREAK_DAYS[activeDayIndex].day} Reward!
            </button>
          )}
        </div>
      </div>

      <div className="row g-2">
        {STREAK_DAYS.map((d, idx) => {
          const isToday = idx === activeDayIndex;
          const isClaimed = idx < activeDayIndex || (isToday && alreadyClaimedToday);

          return (
            <div key={d.day} className="col-6 col-md">
              <div
                className={`card text-center p-2.5 rounded-3 border transition-all ${
                  d.isChest ? 'border-warning shadow-sm bg-warning-subtle' : 'bg-body-tertiary'
                } ${isToday && !alreadyClaimedToday ? 'border-2 border-primary shadow-sm' : ''}`}
                style={{
                  transform: isToday ? 'scale(1.04)' : 'scale(1)',
                }}
              >
                <div className="small text-muted font-monospace">{d.title}</div>
                <div className={`fs-3 my-1 ${d.color}`}>
                  <i className={`bi ${d.icon}`}></i>
                </div>
                <div className="fw-bold small text-truncate" style={{ fontSize: '0.8rem' }}>
                  {d.reward}
                </div>
                <div className="mt-1">
                  {isClaimed ? (
                    <span className="badge bg-success text-white rounded-pill" style={{ fontSize: '0.65rem' }}>
                      Claimed ✓
                    </span>
                  ) : isToday ? (
                    <span className="badge bg-primary text-white rounded-pill animate-pulse" style={{ fontSize: '0.65rem' }}>
                      Today!
                    </span>
                  ) : (
                    <span className="badge bg-secondary-subtle text-muted rounded-pill" style={{ fontSize: '0.65rem' }}>
                      Locked
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyStreakRewards;
