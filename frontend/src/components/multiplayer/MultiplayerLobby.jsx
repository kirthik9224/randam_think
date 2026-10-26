import React, { useState } from 'react';
import sounds from '../../utils/soundEffects';

const MultiplayerLobby = ({
  room,
  currentUserId,
  onToggleReady,
  onSwitchTeam,
  onStartMatch,
  onLeaveRoom,
  loading,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const isHost = room.hostPlayerId === currentUserId;
  const currentPlayer = room.players.find((p) => p.playerId === currentUserId);
  const isReady = currentPlayer?.isReady || false;

  const handleCopyCode = () => {
    sounds.playClick();
    navigator.clipboard.writeText(room.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareInvite = async () => {
    sounds.playClick();
    const inviteUrl = `${window.location.origin}/multiplayer/room/${room.roomCode}`;
    const shareData = {
      title: 'Join my Random Thinking Match!',
      text: `Let's play Guess the Number! Join my 10-round match with code ${room.roomCode}`,
      url: inviteUrl,
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (e) {}
    }
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const isTeamBattle = room.matchType === 'TEAM_BATTLE';
  const redPlayers = room.players.filter((p) => p.team === 'TEAM_RED');
  const bluePlayers = room.players.filter((p) => p.team === 'TEAM_BLUE');

  const canHostStart = () => {
    if (room.players.length < 2) return false;
    const allReady = room.players.every((p) => p.isHost || p.isReady);
    if (!allReady) return false;
    if (isTeamBattle) {
      return redPlayers.length >= 1 && bluePlayers.length >= 1;
    }
    return true;
  };

  return (
    <div className="container py-4">
      {/* Header & Room Code Bar */}
      <div className="mp-glass-card p-4 mb-4 text-center">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
          <div>
            <span className="badge bg-primary px-3 py-1.5 rounded-pill text-uppercase fw-bold me-2">
              {room.matchType.replace('_', ' ')}
            </span>
            <span className="text-white-50 small">
              Range: {room.minNumber} - {room.maxNumber} • Attempts: {room.attemptsPerRound}
              {isTeamBattle ? ` • Best of ${room.totalRounds} Rounds` : ''}
            </span>
          </div>

          {room.stakeAmount > 0 && (
            <div className="d-flex align-items-center gap-2">
              <span className="text-white-50 small">Stake: 🪙 {room.stakeAmount}</span>
              <span className="mp-coin-badge">
                🏆 Pool: 🪙 {room.stakeAmount * room.players.length}
              </span>
            </div>
          )}
        </div>

        <h2 className="fw-black text-white mb-2">{room.roomName || 'Multiplayer Lobby'}</h2>
        <p className="text-white-50 mb-3">Share this private room code with your friends to join:</p>

        <div className="d-inline-flex flex-column align-items-center gap-2">
          <div className="d-flex align-items-center gap-2 flex-wrap justify-content-center">
            <div className="mp-code-pill d-flex align-items-center gap-3 cursor-pointer" onClick={handleCopyCode} title="Click to copy room code">
              <span>{room.roomCode}</span>
              <i className={`bi ${copied ? 'bi-check-circle-fill text-success' : 'bi-clipboard'} fs-5`}></i>
            </div>
            <button
              onClick={handleShareInvite}
              className="btn btn-outline-info rounded-pill px-3 py-2 small fw-bold d-inline-flex align-items-center gap-2 shadow-sm"
              title="Share room link via WhatsApp, Telegram, or Copy"
            >
              <i className="bi bi-share-fill"></i>
              <span>{copiedLink ? '✓ Link Copied!' : 'Share Room Link'}</span>
            </button>
          </div>
          {copied && <span className="text-success small fw-bold">✓ Room code copied to clipboard!</span>}
          {copiedLink && <span className="text-info small fw-bold">✓ Direct invite link copied to clipboard!</span>}
        </div>
      </div>

      {/* Players List / Team Layout */}
      {isTeamBattle ? (
        <div className="row g-4 mb-4">
          {/* TEAM RED */}
          <div className="col-md-6">
            <div className="mp-glass-card p-4 team-red-card h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-black text-danger mb-0 d-flex align-items-center gap-2">
                  <span>🔥</span> {room.teamRedName || 'TEAM RED'} ({redPlayers.length})
                </h4>
                {currentPlayer?.team !== 'TEAM_RED' && (
                  <button
                    className="btn btn-sm btn-outline-danger rounded-pill px-3"
                    onClick={() => {
                      sounds.playClick();
                      onSwitchTeam('TEAM_RED');
                    }}
                    disabled={loading}
                  >
                    Join Red
                  </button>
                )}
              </div>

              <div className="d-flex flex-column gap-2">
                {redPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="p-3 rounded-3 d-flex justify-content-between align-items-center"
                    style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)' }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className="rounded-circle d-inline-block"
                        style={{ width: '12px', height: '12px', backgroundColor: player.avatarColor }}
                      ></span>
                      <strong className="text-white">{player.username}</strong>
                      {player.isHost && <span className="badge bg-warning text-dark small">HOST</span>}
                      {player.playerId === currentUserId && <span className="badge bg-secondary small">YOU</span>}
                    </div>
                    <div>
                      {player.isHost ? (
                        <span className="badge bg-success-subtle text-success border border-success">Ready</span>
                      ) : player.isReady ? (
                        <span className="badge bg-success-subtle text-success border border-success">Ready</span>
                      ) : (
                        <span className="badge bg-secondary-subtle text-secondary">Waiting</span>
                      )}
                    </div>
                  </div>
                ))}
                {redPlayers.length === 0 && (
                  <div className="text-center py-4 text-white-50 fst-italic">No players in Team Red yet</div>
                )}
              </div>
            </div>
          </div>

          {/* TEAM BLUE */}
          <div className="col-md-6">
            <div className="mp-glass-card p-4 team-blue-card h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-black text-primary mb-0 d-flex align-items-center gap-2">
                  <span>⚡</span> {room.teamBlueName || 'TEAM BLUE'} ({bluePlayers.length})
                </h4>
                {currentPlayer?.team !== 'TEAM_BLUE' && (
                  <button
                    className="btn btn-sm btn-outline-primary rounded-pill px-3"
                    onClick={() => {
                      sounds.playClick();
                      onSwitchTeam('TEAM_BLUE');
                    }}
                    disabled={loading}
                  >
                    Join Blue
                  </button>
                )}
              </div>

              <div className="d-flex flex-column gap-2">
                {bluePlayers.map((player) => (
                  <div
                    key={player.id}
                    className="p-3 rounded-3 d-flex justify-content-between align-items-center"
                    style={{ background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.25)' }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className="rounded-circle d-inline-block"
                        style={{ width: '12px', height: '12px', backgroundColor: player.avatarColor }}
                      ></span>
                      <strong className="text-white">{player.username}</strong>
                      {player.isHost && <span className="badge bg-warning text-dark small">HOST</span>}
                      {player.playerId === currentUserId && <span className="badge bg-secondary small">YOU</span>}
                    </div>
                    <div>
                      {player.isHost ? (
                        <span className="badge bg-success-subtle text-success border border-success">Ready</span>
                      ) : player.isReady ? (
                        <span className="badge bg-success-subtle text-success border border-success">Ready</span>
                      ) : (
                        <span className="badge bg-secondary-subtle text-secondary">Waiting</span>
                      )}
                    </div>
                  </div>
                ))}
                {bluePlayers.length === 0 && (
                  <div className="text-center py-4 text-white-50 fst-italic">No players in Team Blue yet</div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* SOLO / FRIENDS LIST */
        <div className="mp-glass-card p-4 mb-4">
          <h4 className="fw-black text-white mb-3 d-flex align-items-center gap-2">
            <span>👥</span> Players ({room.players.length}/{room.maxPlayers})
          </h4>
          <div className="row g-3">
            {room.players.map((player) => (
              <div key={player.id} className="col-sm-6 col-lg-3">
                <div
                  className="p-3 rounded-3 text-center h-100"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: player.playerId === currentUserId ? '1px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div
                    className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-2"
                    style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: player.avatarColor,
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: '#090518',
                    }}
                  >
                    {player.username.charAt(0).toUpperCase()}
                  </div>
                  <h6 className="fw-bold text-white mb-1 text-truncate">{player.username}</h6>
                  <div className="d-flex justify-content-center gap-1 mb-2">
                    {player.isHost && <span className="badge bg-warning text-dark small">HOST</span>}
                    {player.playerId === currentUserId && <span className="badge bg-info small">YOU</span>}
                  </div>
                  <div>
                    {player.isHost ? (
                      <span className="badge bg-success-subtle text-success border border-success">Ready</span>
                    ) : player.isReady ? (
                      <span className="badge bg-success-subtle text-success border border-success">Ready</span>
                    ) : (
                      <span className="badge bg-secondary-subtle text-secondary">Not Ready</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="mp-glass-card p-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
        <button
          className="btn btn-outline-danger px-4 rounded-pill fw-bold"
          onClick={() => {
            sounds.playClick();
            onLeaveRoom();
          }}
          disabled={loading}
        >
          <i className="bi bi-box-arrow-left me-1"></i> Leave Room
        </button>

        <div className="d-flex align-items-center gap-3">
          {!isHost && (
            <button
              className={`btn px-4 py-2.5 rounded-pill fw-black ${isReady ? 'btn-outline-warning' : 'btn-success'}`}
              onClick={() => {
                sounds.playClick();
                onToggleReady();
              }}
              disabled={loading}
            >
              {isReady ? 'Cancel Ready' : "I'm Ready! ✓"}
            </button>
          )}

          {isHost && (
            <button
              className="btn btn-warning px-5 py-2.5 rounded-pill fw-black text-dark fs-5 shadow-lg"
              onClick={() => {
                sounds.playClick();
                onStartMatch();
              }}
              disabled={loading || !canHostStart()}
            >
              🚀 Start Match
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiplayerLobby;
