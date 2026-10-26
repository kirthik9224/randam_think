import React, { useState, useEffect, useMemo } from 'react';
import sounds from '../utils/soundEffects';
import {
  STAGES,
  MAX_LEVEL,
  getLevelConfig,
  getLevelProgression,
  getPaginatedLevels,
} from '../utils/levelProgression';

const LevelMap = ({ onSelectLevel, currentActiveLevel = 1 }) => {
  const progress = getLevelProgression();

  // Find the player's current stage based on their highest unlocked level
  const initialStage = useMemo(() => {
    const playerLvl = Math.max(1, Math.min(progress.unlockedLevel, MAX_LEVEL));
    const found = STAGES.find((s) => playerLvl >= s.start && playerLvl <= s.end);
    return found ? found.id : 'BEGINNER';
  }, [progress.unlockedLevel]);

  const [activeStageId, setActiveStageId] = useState(initialStage);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');

  // Auto-align page to player's current level when switching stages
  const activeStage = useMemo(
    () => STAGES.find((s) => s.id === activeStageId) || STAGES[0],
    [activeStageId]
  );

  // Calculate paginated levels
  const paginatedData = useMemo(() => {
    return getPaginatedLevels(activeStageId, currentPage, 50);
  }, [activeStageId, currentPage]);

  const handleStageChange = (stageId) => {
    sounds.playClick();
    setActiveStageId(stageId);
    setCurrentPage(1);
    setSearchError('');
  };

  const handleJumpToLevel = (e) => {
    if (e) e.preventDefault();
    setSearchError('');
    const target = parseInt(searchQuery, 10);
    if (isNaN(target) || target < 1 || target > MAX_LEVEL) {
      setSearchError(`Enter a valid level between 1 and ${MAX_LEVEL.toLocaleString()}`);
      return;
    }

    // Determine target stage & page
    const targetStage = STAGES.find((s) => target >= s.start && target <= s.end);
    if (!targetStage) return;

    const offsetInStage = target - targetStage.start;
    const targetPage = Math.floor(offsetInStage / 50) + 1;

    sounds.playClick();
    setActiveStageId(targetStage.id);
    setCurrentPage(targetPage);
    setSearchQuery('');
  };

  const handleLevelClick = (lvl) => {
    if (!lvl.isUnlocked) {
      sounds.playError?.() || sounds.playClick();
      return;
    }
    sounds.playClick();
    if (onSelectLevel) {
      onSelectLevel(lvl.level);
    }
  };

  // Milestone check for the current stage
  const stageMilestones = useMemo(() => {
    const list = [];
    if (activeStage.start === 1) list.push(1);
    for (let lvl = activeStage.start; lvl <= activeStage.end; lvl++) {
      if (lvl % 50 === 0 || lvl === activeStage.end) {
        list.push(lvl);
      }
    }
    return list;
  }, [activeStage]);

  return (
    <div className="level-map-container my-3 animate-fade-in">
      {/* 1. Header with Stats, Badges, and Search */}
      <div className="card border-0 rounded-4 p-3 p-md-4 mb-4 shadow-lg text-white" style={{ background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.95), rgba(49, 46, 129, 0.9))', backdropFilter: 'blur(12px)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
          <div>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
              <span className="badge px-3 py-1.5 rounded-pill fw-bold font-monospace fs-6 shadow-xs" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}>
                ⭐ {progress.totalStars} Stars Earned
              </span>
              <span className="badge px-3 py-1.5 rounded-pill font-monospace" style={{ background: 'rgba(99, 102, 241, 0.25)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
                Level {progress.unlockedLevel.toLocaleString()} of {MAX_LEVEL.toLocaleString()} Unlocked
              </span>
              <span className="badge px-3 py-1.5 rounded-pill font-monospace" style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                {activeStage.icon} Stage: {activeStage.name}
              </span>
            </div>
            <h3 className="fw-black mb-1 tracking-tight text-white">
              5,000 Levels Solo Campaign
            </h3>
            <p className="text-white-50 small mb-0">
              {activeStage.description}
            </p>
          </div>

          {/* Quick Jump / Search Form */}
          <form onSubmit={handleJumpToLevel} className="d-flex flex-column align-items-md-end gap-1">
            <div className="input-group" style={{ maxWidth: '280px' }}>
              <span className="input-group-text bg-dark text-white-50 border-secondary">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="number"
                min="1"
                max={MAX_LEVEL}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Jump to Level (1–5000)"
                className="form-control bg-dark text-white border-secondary small"
                style={{ fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn btn-primary px-3 fw-bold small">
                Go
              </button>
            </div>
            {searchError && (
              <span className="text-danger small" style={{ fontSize: '0.75rem' }}>
                {searchError}
              </span>
            )}
          </form>
        </div>

        {/* 2. Stage Navigation Tabs */}
        <div className="d-flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {STAGES.map((stg) => {
            const isStageActive = stg.id === activeStageId;
            const isStageUnlocked = progress.unlockedLevel >= stg.start;
            const stageProgress = Math.min(
              100,
              Math.max(0, Math.round(((progress.unlockedLevel - stg.start) / (stg.end - stg.start + 1)) * 100))
            );

            return (
              <button
                key={stg.id}
                onClick={() => handleStageChange(stg.id)}
                className={`btn text-start rounded-3 px-3 py-2 text-nowrap transition-all ${
                  isStageActive
                    ? 'btn-light text-dark fw-bold shadow-md'
                    : 'btn-outline-light border-opacity-25 text-white-50 hover-light'
                }`}
                style={{
                  minWidth: '150px',
                  background: isStageActive ? '#fff' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: isStageActive ? stg.color : 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small fw-black">{stg.icon} {stg.name}</span>
                  {isStageUnlocked ? (
                    <span className="badge rounded-pill bg-success-subtle text-success small" style={{ fontSize: '0.65rem' }}>
                      {stageProgress}%
                    </span>
                  ) : (
                    <span className="text-secondary small" style={{ fontSize: '0.65rem' }}>
                      <i className="bi bi-lock-fill"></i>
                    </span>
                  )}
                </div>
                <div className="small font-monospace" style={{ fontSize: '0.72rem', opacity: 0.8 }}>
                  Lvl {stg.start}–{stg.end.toLocaleString()}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Stage Pagination Controls */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 px-2">
        <div className="text-white small fw-bold">
          Showing Levels <span className="text-warning font-monospace">{paginatedData.pageStartLevel} – {paginatedData.pageEndLevel}</span> (Page {paginatedData.page} of {paginatedData.totalPages})
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              setCurrentPage((p) => Math.max(1, p - 1));
            }}
            disabled={paginatedData.page <= 1}
            className="btn btn-sm btn-outline-light rounded-pill px-3"
          >
            <i className="bi bi-chevron-left me-1"></i> Prev 50
          </button>
          <span className="text-white-50 font-monospace small px-2">
            {paginatedData.page} / {paginatedData.totalPages}
          </span>
          <button
            onClick={() => {
              sounds.playClick();
              setCurrentPage((p) => Math.min(paginatedData.totalPages, p + 1));
            }}
            disabled={paginatedData.page >= paginatedData.totalPages}
            className="btn btn-sm btn-outline-light rounded-pill px-3"
          >
            Next 50 <i className="bi bi-chevron-right ms-1"></i>
          </button>
        </div>
      </div>

      {/* 4. Grid of Paginated Level Cards */}
      <div className="row g-2.5 g-md-3 justify-content-start">
        {paginatedData.levels.map((lvl) => {
          const isCompleted = lvl.status === 'COMPLETED';
          const isCurrent = lvl.status === 'CURRENT' || lvl.level === currentActiveLevel;
          const isLocked = lvl.status === 'LOCKED';

          return (
            <div key={lvl.level} className="col-6 col-sm-4 col-md-3 col-lg-2">
              <div
                onClick={() => handleLevelClick(lvl)}
                className={`card h-100 rounded-3 text-center p-2.5 transition-all level-node-card ${
                  isLocked
                    ? 'bg-dark text-secondary opacity-60 pe-none border-secondary'
                    : isCurrent
                    ? 'border-primary bg-primary text-white shadow-lg ring-2 ring-warning cursor-pointer hover-scale'
                    : isCompleted
                    ? 'border-success-subtle bg-dark text-white shadow-sm cursor-pointer hover-lift'
                    : 'border-secondary bg-dark text-white shadow-sm cursor-pointer hover-lift'
                }`}
                style={{
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  borderWidth: isCurrent ? '2px' : '1px',
                  borderColor: isCurrent ? '#38bdf8' : isCompleted ? '#10b981' : 'rgba(255,255,255,0.15)',
                  background: isCurrent
                    ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.9), rgba(79, 70, 229, 0.9))'
                    : isCompleted
                    ? 'rgba(16, 185, 129, 0.08)'
                    : 'rgba(30, 27, 75, 0.6)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.18s ease-in-out',
                }}
              >
                {/* Node Status Badge */}
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="badge rounded-pill font-monospace small px-1.5 py-0.5" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.7rem' }}>
                    #{lvl.level}
                  </span>
                  {isCompleted ? (
                    <span className="text-success small fw-bold" style={{ fontSize: '0.7rem' }}>
                      <i className="bi bi-check-circle-fill"></i> Won
                    </span>
                  ) : isCurrent ? (
                    <span className="badge bg-warning text-dark rounded-pill px-1.5 py-0.5 small fw-bold" style={{ fontSize: '0.65rem' }}>
                      ▶ Play
                    </span>
                  ) : (
                    <span className="text-secondary small" style={{ fontSize: '0.7rem' }}>
                      <i className="bi bi-lock-fill"></i>
                    </span>
                  )}
                </div>

                {/* Level Circle Icon */}
                <div className="my-1.5">
                  <div
                    className={`rounded-circle mx-auto d-flex align-items-center justify-content-center shadow-xs ${
                      isLocked
                        ? 'bg-secondary bg-opacity-25 text-secondary'
                        : isCurrent
                        ? 'bg-warning text-dark shadow-md'
                        : isCompleted
                        ? 'bg-success text-white'
                        : 'bg-primary text-white'
                    }`}
                    style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}
                  >
                    {isLocked ? (
                      <i className="bi bi-lock-fill"></i>
                    ) : isCurrent ? (
                      <i className="bi bi-play-fill fs-4"></i>
                    ) : isCompleted ? (
                      <i className="bi bi-star-fill text-warning"></i>
                    ) : (
                      <i className="bi bi-unlock-fill"></i>
                    )}
                  </div>
                </div>

                {/* Range & Attempts */}
                <div className="fw-black font-monospace text-truncate text-white" style={{ fontSize: '0.85rem' }} title={`1 – ${lvl.max.toLocaleString()}`}>
                  1 – {lvl.max.toLocaleString()}
                </div>
                <div className="text-white-50 small mb-1" style={{ fontSize: '0.72rem' }}>
                  {lvl.attempts} attempts {lvl.timeLimitSeconds ? `• ⏱️ ${lvl.timeLimitSeconds}s` : ''}
                </div>

                {/* Milestone Pill */}
                {lvl.isMilestone && (
                  <div className="mb-1">
                    <span className="badge rounded-pill bg-warning text-dark px-1.5 py-0.5 fw-bold" style={{ fontSize: '0.62rem' }}>
                      ★ Milestone
                    </span>
                  </div>
                )}

                {/* Stars earned for this level */}
                <div className="mt-auto pt-1">
                  {isCompleted ? (
                    <div className="text-warning small" style={{ fontSize: '0.75rem' }} title={`${lvl.stars} Stars`}>
                      {lvl.stars === 3 ? '⭐⭐⭐' : lvl.stars === 2 ? '⭐⭐' : '⭐'}
                    </div>
                  ) : isCurrent ? (
                    <span className="badge bg-primary text-white rounded-pill small w-100 py-0.5" style={{ fontSize: '0.65rem' }}>
                      Active
                    </span>
                  ) : (
                    <span className="text-secondary small" style={{ fontSize: '0.68rem' }}>
                      Locked
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Bottom Stage Milestones Summary */}
      <div className="card border-0 rounded-4 p-3 mt-4 text-white" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div className="d-flex align-items-center gap-2 mb-2">
          <span className="fs-5">🏆</span>
          <h5 className="fw-bold mb-0">Major Milestones for {activeStage.name} Stage</h5>
        </div>
        <p className="text-white-50 small mb-2">
          Conquer milestone levels to earn prestige badges, bonus XP, and virtual coins!
        </p>
        <div className="d-flex flex-wrap gap-2">
          {stageMilestones.map((mLevel) => {
            const mCfg = getLevelConfig(mLevel);
            const isUnlocked = progress.unlockedLevel >= mLevel;
            return (
              <span
                key={mLevel}
                className={`badge px-2.5 py-1.5 rounded-pill font-monospace small ${
                  isUnlocked ? 'bg-success text-white shadow-xs' : 'bg-dark text-secondary border border-secondary'
                }`}
                style={{ fontSize: '0.75rem' }}
              >
                {isUnlocked ? '✓' : '🔒'} Level {mLevel.toLocaleString()}
                {mCfg.milestoneBadge ? ` (${mCfg.milestoneBadge})` : ''}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelMap;
