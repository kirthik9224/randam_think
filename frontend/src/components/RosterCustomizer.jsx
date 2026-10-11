import React from 'react';
import sounds from '../utils/soundEffects';
import { getPlayerModeTitle } from '../utils/playerModesHelper';

const RosterCustomizer = ({
  roster = [],
  onUpdatePlayerName,
  onUpdatePlayerTeam,
  onUpdateTeamName,
  onResetRoster,
  playerMode = '1_VS_CPU',
  isModal = false,
  onClose,
}) => {
  if (playerMode === 'SOLO' && !isModal) {
    return null;
  }

  // Extract unique teams
  const uniqueTeams = Array.from(new Set(roster.map((p) => p.team).filter(Boolean)));

  // Deduplicate contenders for editing (e.g. boss raid has repeated boss turns)
  const displayContenders = roster.filter((p, i, self) => {
    if (p.id && p.id.startsWith('cpu_boss')) {
      return self.findIndex((x) => x.id && x.id.startsWith('cpu_boss')) === i;
    }
    return true;
  });

  const content = (
    <div className={`roster-customizer-container ${isModal ? 'p-2' : ''}`}>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2 text-primary">
            <i className="bi bi-pencil-square"></i>
            <span>Edit {getPlayerModeTitle(playerMode)} Names</span>
          </h5>
          <span className="small text-muted">
            Customize team names, player nicknames, or computer opponent names
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          {onResetRoster && (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-1"
              onClick={() => {
                sounds.playClick();
                onResetRoster();
              }}
              title="Reset names and teams to defaults"
            >
              <i className="bi bi-arrow-counterclockwise"></i>
              <span>Reset Defaults</span>
            </button>
          )}
          {isModal && onClose && (
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
            ></button>
          )}
        </div>
      </div>

      {/* 1. Quick Team Names Editor (if mode has teams) */}
      {uniqueTeams.length > 0 && playerMode !== '4P_FFA' && (
        <div className="card border-0 bg-body rounded-4 p-3 mb-3 shadow-sm">
          <div className="d-flex align-items-center gap-2 mb-2">
            <i className="bi bi-shield-shaded text-primary"></i>
            <span className="fw-bold small text-uppercase tracking-wider">
              Team Names ({uniqueTeams.length} Teams)
            </span>
          </div>
          <div className="row g-2">
            {uniqueTeams.map((teamName, idx) => {
              // Find sample player for color badge
              const samplePlayer = roster.find((p) => p.team === teamName);
              const color = samplePlayer?.color || (idx === 0 ? 'primary' : 'danger');

              return (
                <div key={teamName + '-' + idx} className="col-12 col-md-6">
                  <div className="input-group input-group-sm">
                    <span className={`input-group-text bg-${color} text-white border-0 fw-bold`}>
                      <i className="bi bi-flag-fill me-1"></i> Team {idx + 1}
                    </span>
                    <input
                      type="text"
                      className="form-control fw-semibold"
                      placeholder={`Team ${idx + 1} Name`}
                      value={teamName}
                      maxLength={24}
                      onChange={(e) => {
                        if (onUpdateTeamName) {
                          onUpdateTeamName(teamName, e.target.value);
                        }
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Individual Player & Contender Details */}
      <div className="card border-0 bg-body rounded-4 p-3 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-bold small text-uppercase tracking-wider text-muted">
            <i className="bi bi-people-fill text-primary me-1"></i> Contenders ({displayContenders.length} Players)
          </span>
          <span className="small text-muted font-monospace">Turn Rotation Order</span>
        </div>

        <div className="row g-2.5">
          {displayContenders.map((player, idx) => (
            <div key={player.id} className="col-12 col-md-6 col-lg-4">
              <div className="p-2.5 rounded-3 bg-body-tertiary border border-secondary-subtle h-100">
                <div className="d-flex justify-content-between align-items-center mb-1.5">
                  <span className="badge bg-secondary-subtle text-secondary small font-monospace">
                    #{idx + 1}
                  </span>
                  <span
                    className={`badge rounded-pill ${
                      player.isAi ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'
                    }`}
                  >
                    <i className={`bi ${player.isAi ? 'bi-cpu-fill' : 'bi-person-fill'} me-1`}></i>
                    {player.isAi ? 'Computer (CPU)' : 'Player'}
                  </span>
                </div>

                {/* Player Name Input */}
                <div className="mb-2">
                  <label className="text-muted smaller fw-bold mb-0.5 d-block">
                    Player Name:
                  </label>
                  <div className="input-group input-group-sm">
                    <span className={`input-group-text bg-${player.color || 'primary'} text-white border-0`}>
                      <i className={`bi ${player.icon || 'bi-person-fill'}`}></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={`Player ${idx + 1}`}
                      value={player.name}
                      maxLength={20}
                      onChange={(e) => onUpdatePlayerName(player.id, e.target.value)}
                    />
                  </div>
                </div>

                {/* Team Name Input */}
                <div>
                  <label className="text-muted smaller fw-bold mb-0.5 d-block">
                    Assigned Team:
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-body-secondary text-secondary border-0">
                      <i className="bi bi-shield-fill"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control font-monospace small"
                      placeholder="Team Name"
                      value={player.team}
                      maxLength={24}
                      onChange={(e) => {
                        if (onUpdatePlayerTeam) {
                          onUpdatePlayerTeam(player.id, e.target.value);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModal && (
        <div className="d-flex justify-content-end gap-2 mt-3 pt-2">
          <button
            type="button"
            className="btn btn-primary rounded-pill px-4 fw-bold"
            onClick={() => {
              sounds.playClick();
              if (onClose) onClose();
            }}
          >
            <i className="bi bi-check2-circle me-1"></i> Save & Done
          </button>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)', zIndex: 1050 }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
          <div className="modal-content rounded-4 border-0 shadow-lg p-2">
            <div className="modal-body">{content}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 bg-body-tertiary rounded-4 p-3 mt-3 shadow-sm">
      {content}
    </div>
  );
};

export default RosterCustomizer;
