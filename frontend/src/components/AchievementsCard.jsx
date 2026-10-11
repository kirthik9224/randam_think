import React, { useState } from 'react';
import { getPlayerProgression } from '../utils/progressionHelper';

const AchievementsCard = ({ profile, history = [] }) => {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const prog = getPlayerProgression();

  const gamesWon = profile?.gamesWon || 0;
  const totalGames = profile?.totalGames || 0;
  const bestScore = profile?.bestScore || profile?.highestScore || 0;
  const bestStreak = Math.max(profile?.bestStreak || 0, profile?.currentStreak || 0);

  const distinctModes = new Set(history.map((g) => g.gameMode || 'CLASSIC'));

  const wonSniper = history.some((g) => g.status === 'WON' && g.attemptsUsed <= 2);
  const wonClutch = history.some((g) => g.status === 'WON' && g.attemptsUsed === g.attemptsAllowed);
  const wonSpeed = history.some((g) => g.status === 'WON' && g.gameMode === 'TIME_ATTACK' && (g.timeTakenSeconds || 99) <= 20);
  const wonDetective = history.some((g) => g.status === 'WON' && g.gameMode === 'DETECTIVE');
  const wonRadar = history.some((g) => g.status === 'WON' && g.gameMode === 'HOT_COLD');
  const wonHard = history.some((g) => g.status === 'WON' && (g.difficulty === 'HARD' || g.difficulty === 'EXPERT'));
  const wonExpert = history.some((g) => g.status === 'WON' && g.difficulty === 'EXPERT');
  const wonBoss = history.some((g) => g.status === 'WON' && (g.playerMode === '3P_VS_1CPU' || String(g.winnerAnnouncement || '').includes('Boss')));
  const wonParty = history.some((g) => g.status === 'WON' && (g.playerMode === '1P_VS_1P' || g.playerMode === '2P_VS_2P' || g.playerMode === '4P_FFA' || g.playerMode === '4P_VS_4P'));

  const achievementsList = [
    {
      id: 'first_win',
      category: 'PROGRESSION',
      title: 'First Victory',
      desc: 'Win your very first Random Thinking game',
      icon: 'bi-trophy-fill',
      color: 'text-warning',
      isUnlocked: gamesWon >= 1,
      progress: `${Math.min(1, gamesWon)}/1`,
    },
    {
      id: 'sniper',
      category: 'MASTERY',
      title: 'Sniper Mind',
      desc: 'Crack the secret number in 2 attempts or fewer',
      icon: 'bi-crosshair',
      color: 'text-danger',
      isUnlocked: wonSniper,
      progress: wonSniper ? 'Completed' : 'Locked',
    },
    {
      id: 'clutch_king',
      category: 'MASTERY',
      title: 'Clutch King',
      desc: 'Win a match on the very last available attempt',
      icon: 'bi-heart-pulse-fill',
      color: 'text-danger',
      isUnlocked: wonClutch,
      progress: wonClutch ? 'Completed' : 'Locked',
    },
    {
      id: 'streak_3',
      category: 'MASTERY',
      title: 'Streak Master',
      desc: 'Build a consecutive win streak of 3 games',
      icon: 'bi-fire',
      color: 'text-danger',
      isUnlocked: bestStreak >= 3,
      progress: `${Math.min(3, bestStreak)}/3`,
    },
    {
      id: 'streak_5',
      category: 'MASTERY',
      title: 'Unstoppable Streak',
      desc: 'Achieve a winning streak of 5+ consecutive games',
      icon: 'bi-lightning-fill',
      color: 'text-warning',
      isUnlocked: bestStreak >= 5,
      progress: `${Math.min(5, bestStreak)}/5`,
    },
    {
      id: 'high_scorer',
      category: 'PROGRESSION',
      title: 'High Roller',
      desc: 'Achieve a score of 2,500+ in a single match',
      icon: 'bi-star-fill',
      color: 'text-warning',
      isUnlocked: bestScore >= 2500,
      progress: bestScore >= 2500 ? 'Completed' : `${bestScore}/2500`,
    },
    {
      id: 'speed_demon',
      category: 'MASTERY',
      title: 'Speed Demon',
      desc: 'Win Time Attack Blitz in under 20 seconds',
      icon: 'bi-alarm-fill',
      color: 'text-warning',
      isUnlocked: wonSpeed,
      progress: wonSpeed ? 'Completed' : 'Locked',
    },
    {
      id: 'mind_explorer',
      category: 'PROGRESSION',
      title: 'Mode Explorer',
      desc: 'Test your deduction across 3+ game modes',
      icon: 'bi-compass-fill',
      color: 'text-primary',
      isUnlocked: distinctModes.size >= 3,
      progress: `${Math.min(3, distinctModes.size)}/3`,
    },
    {
      id: 'special_agent',
      category: 'COMBAT',
      title: 'Secret Agent',
      desc: 'Win a match in Detective or Heat Radar mode',
      icon: 'bi-search-heart-fill',
      color: 'text-info',
      isUnlocked: wonDetective || wonRadar,
      progress: wonDetective || wonRadar ? 'Completed' : 'Locked',
    },
    {
      id: 'boss_slayer',
      category: 'COMBAT',
      title: 'MasterMind Slayer',
      desc: 'Defeat the 3v1 MasterMind Boss Computer Raid',
      icon: 'bi-cpu-fill',
      color: 'text-purple',
      isUnlocked: wonBoss,
      progress: wonBoss ? 'Completed' : 'Locked',
    },
    {
      id: 'party_champ',
      category: 'COMBAT',
      title: 'Social Gladiator',
      desc: 'Win any 1v1, 2v2, or 4v4 multiplayer match',
      icon: 'bi-people-fill',
      color: 'text-primary',
      isUnlocked: wonParty,
      progress: wonParty ? 'Completed' : 'Locked',
    },
    {
      id: 'hard_challenger',
      category: 'MASTERY',
      title: 'Iron Deductor',
      desc: 'Win a game on Hard or Expert difficulty',
      icon: 'bi-shield-shaded',
      color: 'text-purple',
      isUnlocked: wonHard,
      progress: wonHard ? 'Completed' : 'Locked',
    },
    {
      id: 'expert_oracle',
      category: 'MASTERY',
      title: 'Grand Oracle',
      desc: 'Conquer the 1–1000 Expert difficulty (3 attempts)',
      icon: 'bi-gem',
      color: 'text-info',
      isUnlocked: wonExpert,
      progress: wonExpert ? 'Completed' : 'Locked',
    },
    {
      id: 'level_5_badge',
      category: 'PROGRESSION',
      title: 'Code Breaker Rank',
      desc: 'Reach Player Level 5 in progression',
      icon: 'bi-award-fill',
      color: 'text-success',
      isUnlocked: prog.level >= 5,
      progress: `Lvl ${prog.level}/5`,
    },
    {
      id: 'veteran',
      category: 'PROGRESSION',
      title: 'Veteran Thinker',
      desc: 'Complete 10 total game sessions',
      icon: 'bi-patch-check-fill',
      color: 'text-success',
      isUnlocked: totalGames >= 10,
      progress: `${Math.min(10, totalGames)}/10`,
    },
    {
      id: 'century_mind',
      category: 'PROGRESSION',
      title: 'Century Master',
      desc: 'Complete 25 total game sessions',
      icon: 'bi-stars',
      color: 'text-warning',
      isUnlocked: totalGames >= 25,
      progress: `${Math.min(25, totalGames)}/25`,
    },
  ];

  const unlockedCount = achievementsList.filter((a) => a.isUnlocked).length;

  const filteredAchievements = achievementsList.filter((ach) => {
    if (filterCategory === 'ALL') return true;
    return ach.category === filterCategory;
  });

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-body h-100">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-award text-warning"></i>
            <span>Trophy Cabinet & Achievements</span>
          </h5>
          <span className="small text-muted">16 milestone badges across your deduction career</span>
        </div>
        <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1.5 fw-semibold font-monospace">
          {unlockedCount} / {achievementsList.length} Unlocked
        </span>
      </div>

      {/* Progress bar */}
      <div className="progress mb-3" style={{ height: '7px' }}>
        <div
          className="progress-bar bg-warning"
          style={{ width: `${(unlockedCount / achievementsList.length) * 100}%` }}
        ></div>
      </div>

      {/* Filter Tabs & Header Controls */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div className="btn-group btn-group-sm" role="group">
          {['ALL', 'MASTERY', 'COMBAT', 'PROGRESSION'].map((cat) => {
            const countInCat = cat === 'ALL' 
              ? achievementsList.length 
              : achievementsList.filter(a => a.category === cat).length;
            const unlockedInCat = cat === 'ALL'
              ? unlockedCount
              : achievementsList.filter(a => a.category === cat && a.isUnlocked).length;

            return (
              <button
                key={cat}
                type="button"
                className={`btn px-3 fw-semibold ${filterCategory === cat ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setFilterCategory(cat)}
              >
                {cat} <span className="opacity-75 smaller">({unlockedInCat}/{countInCat})</span>
              </button>
            );
          })}
        </div>
        <span className="small text-muted">
          Showing {filteredAchievements.length} of {achievementsList.length} badges
        </span>
      </div>

      {/* Grid of Achievement Badges */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-3">
        {filteredAchievements.map((ach) => (
          <div key={ach.id} className="col">
            <div
              className={`p-3 rounded-4 border h-100 d-flex flex-column justify-content-between transition-all ${
                ach.isUnlocked
                  ? 'bg-body-tertiary border-warning-subtle shadow-xs'
                  : 'bg-body-secondary border-dashed opacity-75'
              }`}
            >
              <div>
                <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center shadow-xs ${
                      ach.isUnlocked ? 'bg-warning-subtle' : 'bg-secondary-subtle'
                    }`}
                    style={{ width: '42px', height: '42px', minWidth: '42px' }}
                  >
                    <i
                      className={`bi ${ach.icon} ${
                        ach.isUnlocked ? ach.color : 'text-muted'
                      } fs-5`}
                    ></i>
                  </div>
                  {ach.isUnlocked ? (
                    <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill small py-1 px-2">
                      <i className="bi bi-check-circle-fill me-1"></i> Unlocked
                    </span>
                  ) : (
                    <span className="badge bg-secondary-subtle text-body-secondary border border-secondary-subtle rounded-pill smaller font-monospace py-1 px-2">
                      {ach.progress}
                    </span>
                  )}
                </div>

                <div>
                  <div className="fw-bold small mb-1 text-truncate" title={ach.title}>
                    {ach.title}
                  </div>
                  <div className="text-muted smaller" style={{ fontSize: '0.78rem', lineHeight: '1.3' }}>
                    {ach.desc}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-top border-secondary-subtle d-flex justify-content-between align-items-center">
                <span className="badge bg-body text-secondary border border-secondary-subtle rounded-pill smaller px-2 py-0.5" style={{ fontSize: '0.68rem' }}>
                  {ach.category}
                </span>
                {ach.isUnlocked ? (
                  <span className="text-warning small d-flex align-items-center gap-1">
                    <i className="bi bi-trophy-fill"></i>
                    <span className="smaller fw-bold">Earned</span>
                  </span>
                ) : (
                  <span className="text-muted small d-flex align-items-center gap-1 opacity-75">
                    <i className="bi bi-lock-fill"></i>
                    <span className="smaller">Locked</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsCard;
