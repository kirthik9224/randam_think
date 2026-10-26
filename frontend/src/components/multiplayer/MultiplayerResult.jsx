import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import sounds from '../../utils/soundEffects';

const MultiplayerResult = ({ room, currentUserId, onReturnToHub }) => {
  const navigate = useNavigate();
  const isTeamBattle = room.matchType === 'TEAM_BATTLE';
  const isWinner = isTeamBattle
    ? (room.matchWinningTeam === 'TEAM_RED' && room.players.find((p) => p.playerId === currentUserId)?.team === 'TEAM_RED') ||
      (room.matchWinningTeam === 'TEAM_BLUE' && room.players.find((p) => p.playerId === currentUserId)?.team === 'TEAM_BLUE')
    : room.matchWinnerId === currentUserId;

  useEffect(() => {
    sounds.playVictory();
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="container py-5">
      <div className="mp-glass-card p-5 mx-auto text-center" style={{ maxWidth: '640px' }}>
        <div className="mb-3">
          <span className="display-1">🏆</span>
        </div>

        <h1 className="fw-black text-white mb-2">Match Finished!</h1>

        <div className="my-4 p-4 rounded-4" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          {isTeamBattle ? (
            <div>
              <span className="badge bg-warning text-dark px-3 py-1 rounded-pill mb-2 fw-bold">
                TEAM BATTLE CHAMPIONS
              </span>
              <h2 className={`fw-black mb-1 ${room.matchWinningTeam === 'TEAM_RED' ? 'text-danger' : 'text-primary'}`}>
                {room.matchWinnerName}
              </h2>
              <div className="d-flex justify-content-center gap-4 text-white-50 mt-2">
                <span>🔥 Team Red: <strong className="text-white">{room.teamRedScore}</strong></span>
                <span>•</span>
                <span>⚡ Team Blue: <strong className="text-white">{room.teamBlueScore}</strong></span>
              </div>
            </div>
          ) : (
            <div>
              <span className="badge bg-warning text-dark px-3 py-1 rounded-pill mb-2 fw-bold">
                MATCH WINNER
              </span>
              <h2 className="fw-black text-white mb-1">
                {room.matchWinnerName || 'No Winner (Draw)'}
              </h2>
            </div>
          )}

          {isWinner && (
            <div className="mt-3 pt-3 border-top border-secondary text-warning fw-bold">
              <span className="mp-coin-badge fs-6 d-inline-flex align-items-center gap-1.5">
                <span>🪙</span>
                <span>
                  {isTeamBattle ? '+150 Team Battle Victory Coins Awarded!' : '+100 Quick Match Victory Coins Awarded!'}
                </span>
                {room.totalPrizePool > 0 && <span>(+ Stake Share)</span>}
              </span>
            </div>
          )}
          {!isWinner && room.totalPrizePool > 0 && (
            <div className="mt-3 pt-3 border-top border-secondary">
              <span className="mp-coin-badge fs-6">
                🪙 Total Prize Pool: {room.totalPrizePool} Coins
              </span>
            </div>
          )}
        </div>

        {/* Players Score Summary */}
        <div className="mb-4 text-start">
          <h6 className="fw-bold text-white-50 mb-3 text-center">Final Player Standings</h6>
          <div className="d-flex flex-column gap-2">
            {room.players.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-3 d-flex justify-content-between align-items-center"
                style={{
                  background: p.playerId === currentUserId ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: p.playerId === currentUserId ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="d-flex align-items-center gap-2">
                  <span
                    className="rounded-circle d-inline-block"
                    style={{ width: '12px', height: '12px', backgroundColor: p.avatarColor }}
                  ></span>
                  <span className="fw-bold text-white">{p.username}</span>
                  {p.playerId === currentUserId && <span className="badge bg-secondary small">YOU</span>}
                  {p.team && p.team !== 'SOLO' && (
                    <span className={`badge small ${p.team === 'TEAM_RED' ? 'bg-danger' : 'bg-primary'}`}>
                      {p.team === 'TEAM_RED' ? 'Red' : 'Blue'}
                    </span>
                  )}
                </div>

                <div className="d-flex align-items-center gap-3">
                  <span className="text-warning fw-bold">🏆 {p.roundsWon} wins</span>
                  <span className="badge bg-dark border border-secondary text-white">{p.score} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="d-flex flex-column gap-2">
          <button
            className="btn btn-primary py-3 rounded-pill fw-black fs-5 shadow"
            onClick={() => {
              sounds.playClick();
              onReturnToHub();
            }}
          >
            Return to Multiplayer Hub 🏠
          </button>
          <button
            className="btn btn-outline-warning py-2 rounded-pill fw-bold"
            onClick={() => {
              sounds.playClick();
              navigate('/wallet');
            }}
          >
            🪙 Open Coin Wallet & Shop
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerResult;
