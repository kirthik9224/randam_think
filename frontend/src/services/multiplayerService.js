import api from './api';
import authService from './authService';
import { Client } from '@stomp/stompjs';

class MultiplayerService {
  constructor() {
    this.stompClient = null;
    this.activeSubscription = null;
    this.pollingInterval = null;
    this.currentRoomCode = null;
    this.onUpdateCallback = null;
  }

  getUserId() {
    const user = authService.getCurrentUser();
    return user?.id || 999999;
  }

  async createRoom(params = {}) {
    const userId = this.getUserId();
    const res = await api.post(`/multiplayer/rooms/create?playerId=${userId}`, params);
    return res.data;
  }

  async joinRoom(roomCode, team = 'SOLO') {
    const userId = this.getUserId();
    const res = await api.post(`/multiplayer/rooms/join?playerId=${userId}`, {
      roomCode: roomCode.trim().toUpperCase(),
      team,
    });
    return res.data;
  }

  async quickMatch() {
    const userId = this.getUserId();
    const res = await api.post(`/multiplayer/rooms/quick-match?playerId=${userId}`);
    return res.data;
  }

  async joinMatchmaking() {
    const userId = this.getUserId();
    const res = await api.post(`/multiplayer/matchmaking/join?playerId=${userId}`);
    return res.data;
  }

  async checkMatchmakingStatus() {
    const userId = this.getUserId();
    const res = await api.get(`/multiplayer/matchmaking/status?playerId=${userId}`);
    return res.data;
  }

  async cancelMatchmaking() {
    const userId = this.getUserId();
    const res = await api.post(`/multiplayer/matchmaking/cancel?playerId=${userId}`);
    return res.data;
  }

  async getRoom(roomCode) {
    const res = await api.get(`/multiplayer/rooms/${roomCode.trim().toUpperCase()}`);
    return res.data;
  }

  async toggleReady(roomCode) {
    const userId = this.getUserId();
    const res = await api.post(`/multiplayer/rooms/${roomCode}/ready?playerId=${userId}`);
    return res.data;
  }

  async switchTeam(roomCode, team) {
    const userId = this.getUserId();
    const res = await api.post(`/multiplayer/rooms/${roomCode}/team?playerId=${userId}&team=${encodeURIComponent(team)}`);
    return res.data;
  }

  async startMatch(roomCode) {
    const userId = this.getUserId();
    const res = await api.post(`/multiplayer/rooms/${roomCode}/start?playerId=${userId}`);
    return res.data;
  }

  async submitGuess(roomCode, guess) {
    const userId = this.getUserId();
    const res = await api.post(`/multiplayer/rooms/${roomCode}/guess?playerId=${userId}`, {
      guess: parseInt(guess, 10),
    });
    return res.data;
  }

  async nextRound(roomCode) {
    const userId = this.getUserId();
    const res = await api.post(`/multiplayer/rooms/${roomCode}/next-round?playerId=${userId}`);
    return res.data;
  }

  async leaveRoom(roomCode) {
    try {
      const userId = this.getUserId();
      const res = await api.post(`/multiplayer/rooms/${roomCode}/leave?playerId=${userId}`);
      return res.data;
    } catch (e) {
      console.warn('Error leaving room:', e);
      return null;
    } finally {
      this.disconnect();
    }
  }

  async getPlayerCoins() {
    const userId = this.getUserId();
    const res = await api.get(`/multiplayer/coins/${userId}`);
    return res.data;
  }

  async claimDailyBonus() {
    const userId = this.getUserId();
    const res = await api.post(`/multiplayer/coins/${userId}/claim-bonus`);
    return res.data;
  }

  async getLeaderboard() {
    const res = await api.get('/multiplayer/leaderboard');
    return res.data;
  }

  // Real-Time STOMP WebSocket with Auto-Fallback Polling
  connectToRoom(roomCode, onRoomUpdate) {
    this.disconnect();
    this.currentRoomCode = roomCode.toUpperCase();
    this.onUpdateCallback = onRoomUpdate;

    // Start background fallback polling (every 1.5 seconds) to ensure real-time consistency
    this.pollingInterval = setInterval(async () => {
      try {
        if (this.currentRoomCode && this.onUpdateCallback) {
          const room = await this.getRoom(this.currentRoomCode);
          this.onUpdateCallback(room);
        }
      } catch (err) {
        // Suppress poll errors
      }
    }, 1500);

    // Also attempt native STOMP WebSocket connection
    try {
      const socketUrl = 'ws://localhost:8080/ws-multiplayer';
      this.stompClient = new Client({
        brokerURL: socketUrl,
        reconnectDelay: 3000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          this.activeSubscription = this.stompClient.subscribe(
            `/topic/room/${this.currentRoomCode}`,
            (message) => {
              try {
                const roomData = JSON.parse(message.body);
                if (this.onUpdateCallback) {
                  this.onUpdateCallback(roomData);
                }
              } catch (e) {
                console.error('Error parsing room STOMP message:', e);
              }
            }
          );
        },
        onStompError: (frame) => {
          console.warn('STOMP broker error:', frame.headers['message']);
        },
        onWebSocketError: (event) => {
          console.warn('WebSocket connection error (REST polling remains active):', event);
        },
      });

      this.stompClient.activate();
    } catch (e) {
      console.warn('Could not initialize WebSocket STOMP client, relying on REST polling fallback:', e);
    }
  }

  disconnect() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    if (this.activeSubscription) {
      try {
        this.activeSubscription.unsubscribe();
      } catch (e) {
        // ignore
      }
      this.activeSubscription = null;
    }
    if (this.stompClient) {
      try {
        this.stompClient.deactivate();
      } catch (e) {
        // ignore
      }
      this.stompClient = null;
    }
    this.currentRoomCode = null;
    this.onUpdateCallback = null;
  }
}

export const multiplayerService = new MultiplayerService();
export default multiplayerService;
