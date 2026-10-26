import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import multiplayerService from '../services/multiplayerService';
import MultiplayerLobby from '../components/multiplayer/MultiplayerLobby';
import MultiplayerArena from '../components/multiplayer/MultiplayerArena';
import MultiplayerResult from '../components/multiplayer/MultiplayerResult';
import '../styles/Multiplayer.css';

const MultiplayerRoomPage = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!roomCode) {
      navigate('/multiplayer');
      return;
    }

    // Initial fetch
    fetchRoom();

    // Connect to WebSocket + Polling stream
    multiplayerService.connectToRoom(roomCode, (updatedRoom) => {
      setRoom(updatedRoom);
      setLoading(false);
    });

    return () => {
      multiplayerService.disconnect();
    };
  }, [roomCode]);

  const fetchRoom = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await multiplayerService.getRoom(roomCode);
      setRoom(data);
    } catch (e) {
      setErrorMsg(e.message || 'Room not found');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReady = async () => {
    try {
      const updated = await multiplayerService.toggleReady(roomCode);
      setRoom(updated);
    } catch (e) {
      alert(e.message || 'Failed to toggle ready');
    }
  };

  const handleSwitchTeam = async (team) => {
    try {
      const updated = await multiplayerService.switchTeam(roomCode, team);
      setRoom(updated);
    } catch (e) {
      alert(e.message || 'Failed to switch team');
    }
  };

  const handleStartMatch = async () => {
    try {
      setLoading(true);
      const updated = await multiplayerService.startMatch(roomCode);
      setRoom(updated);
    } catch (e) {
      alert(e.message || 'Failed to start match');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitGuess = async (guess) => {
    try {
      const updated = await multiplayerService.submitGuess(roomCode, guess);
      setRoom(updated);
    } catch (e) {
      alert(e.message || 'Failed to submit guess');
    }
  };

  const handleNextRound = async () => {
    try {
      setLoading(true);
      const updated = await multiplayerService.nextRound(roomCode);
      setRoom(updated);
    } catch (e) {
      alert(e.message || 'Failed to start next round');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = async () => {
    await multiplayerService.leaveRoom(roomCode);
    navigate('/multiplayer');
  };

  if (loading && !room) {
    return (
      <div className="multiplayer-container d-flex align-items-center justify-content-center py-5">
        <div className="text-center text-white">
          <div className="spinner-border text-info mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
          <h4>Entering Arena...</h4>
          <p className="text-white-50">Room: {roomCode}</p>
        </div>
      </div>
    );
  }

  if (errorMsg && !room) {
    return (
      <div className="multiplayer-container d-flex align-items-center justify-content-center py-5">
        <div className="mp-glass-card p-5 text-center" style={{ maxWidth: '480px' }}>
          <span className="display-3 d-block mb-3">⚠️</span>
          <h3 className="fw-black text-danger mb-2">Room Unavailable</h3>
          <p className="text-white-50 mb-4">{errorMsg}</p>
          <button className="btn btn-primary rounded-pill px-4" onClick={() => navigate('/multiplayer')}>
            Back to Multiplayer Hub
          </button>
        </div>
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="multiplayer-container">
      {room.status === 'WAITING' && (
        <MultiplayerLobby
          room={room}
          currentUserId={currentUser.id}
          onToggleReady={handleToggleReady}
          onSwitchTeam={handleSwitchTeam}
          onStartMatch={handleStartMatch}
          onLeaveRoom={handleLeaveRoom}
          loading={loading}
        />
      )}

      {room.status === 'IN_PROGRESS' && (
        <MultiplayerArena
          room={room}
          currentUserId={currentUser.id}
          onSubmitGuess={handleSubmitGuess}
          onNextRound={handleNextRound}
          onLeaveRoom={handleLeaveRoom}
          loading={loading}
        />
      )}

      {room.status === 'FINISHED' && (
        <MultiplayerResult
          room={room}
          currentUserId={currentUser.id}
          onReturnToHub={() => navigate('/multiplayer')}
        />
      )}
    </div>
  );
};

export default MultiplayerRoomPage;
