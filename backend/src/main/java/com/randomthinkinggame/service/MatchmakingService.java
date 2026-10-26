package com.randomthinkinggame.service;

import com.randomthinkinggame.dto.CreateRoomRequest;
import com.randomthinkinggame.dto.JoinRoomRequest;
import com.randomthinkinggame.dto.MultiplayerRoomDTO;
import com.randomthinkinggame.entity.Player;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MatchmakingService {

    public static class QueuedPlayer {
        private final Long playerId;
        private final String username;
        private final long enqueuedAt;
        private volatile String matchedRoomCode;

        public QueuedPlayer(Long playerId, String username) {
            this.playerId = playerId;
            this.username = username;
            this.enqueuedAt = Instant.now().toEpochMilli();
            this.matchedRoomCode = null;
        }

        public Long getPlayerId() {
            return playerId;
        }

        public String getUsername() {
            return username;
        }

        public long getEnqueuedAt() {
            return enqueuedAt;
        }

        public String getMatchedRoomCode() {
            return matchedRoomCode;
        }

        public void setMatchedRoomCode(String matchedRoomCode) {
            this.matchedRoomCode = matchedRoomCode;
        }
    }

    private final MultiplayerService multiplayerService;
    private final ConcurrentHashMap<Long, QueuedPlayer> queueMap = new ConcurrentHashMap<>();
    private static final long QUEUE_TIMEOUT_MS = 60_000L; // 60 seconds

    @Autowired
    public MatchmakingService(MultiplayerService multiplayerService) {
        this.multiplayerService = multiplayerService;
    }

    public synchronized Map<String, Object> joinQueue(Long playerId) {
        Player player = multiplayerService.resolvePlayer(playerId);
        Long resolvedId = player.getId();

        cleanExpiredEntries();

        // If player already in queue and already matched
        QueuedPlayer existing = queueMap.get(resolvedId);
        if (existing != null && existing.getMatchedRoomCode() != null) {
            String code = existing.getMatchedRoomCode();
            queueMap.remove(resolvedId);
            Map<String, Object> res = new HashMap<>();
            res.put("status", "MATCHED");
            res.put("roomCode", code);
            res.put("message", "Opponent found! Match starting...");
            return res;
        }

        // Look for an available opponent waiting in queue
        QueuedPlayer opponent = null;
        for (QueuedPlayer candidate : queueMap.values()) {
            if (!candidate.getPlayerId().equals(resolvedId) && candidate.getMatchedRoomCode() == null) {
                opponent = candidate;
                break;
            }
        }

        if (opponent != null) {
            // Match found! Create match room with 2 players
            CreateRoomRequest createReq = new CreateRoomRequest();
            createReq.setMatchType("QUICK_MATCH");
            createReq.setRoomName("Quick Match: " + opponent.getUsername() + " vs " + player.getUsername());
            createReq.setMaxPlayers(2);
            createReq.setMinNumber(1);
            createReq.setMaxNumber(100);
            createReq.setAttemptsPerRound(7);
            createReq.setTotalRounds(1);
            createReq.setStakeAmount(0L);

            // Opponent is host
            MultiplayerRoomDTO room = multiplayerService.createRoom(opponent.getPlayerId(), createReq);

            // Current player joins
            JoinRoomRequest joinReq = new JoinRoomRequest();
            joinReq.setRoomCode(room.getRoomCode());
            joinReq.setTeam("SOLO");
            multiplayerService.joinRoom(resolvedId, joinReq);

            // Record matched room for both players
            opponent.setMatchedRoomCode(room.getRoomCode());

            Map<String, Object> res = new HashMap<>();
            res.put("status", "MATCHED");
            res.put("roomCode", room.getRoomCode());
            res.put("message", "Opponent found! Starting match...");
            return res;
        }

        // No opponent yet, enqueue current player
        QueuedPlayer newEntry = new QueuedPlayer(resolvedId, player.getUsername());
        queueMap.put(resolvedId, newEntry);

        Map<String, Object> res = new HashMap<>();
        res.put("status", "SEARCHING");
        res.put("message", "Searching for an opponent...");
        res.put("waitTimeSeconds", 0);
        return res;
    }

    public synchronized Map<String, Object> checkStatus(Long playerId) {
        Player player = multiplayerService.resolvePlayer(playerId);
        Long resolvedId = player.getId();

        QueuedPlayer entry = queueMap.get(resolvedId);
        if (entry == null) {
            Map<String, Object> res = new HashMap<>();
            res.put("status", "IDLE");
            return res;
        }

        if (entry.getMatchedRoomCode() != null) {
            String code = entry.getMatchedRoomCode();
            queueMap.remove(resolvedId);
            Map<String, Object> res = new HashMap<>();
            res.put("status", "MATCHED");
            res.put("roomCode", code);
            res.put("message", "Opponent found! Starting match...");
            return res;
        }

        long elapsed = Instant.now().toEpochMilli() - entry.getEnqueuedAt();
        if (elapsed > QUEUE_TIMEOUT_MS) {
            queueMap.remove(resolvedId);
            Map<String, Object> res = new HashMap<>();
            res.put("status", "TIMEOUT");
            res.put("message", "No opponent found within 60 seconds. You can try searching again or create a private room.");
            return res;
        }

        Map<String, Object> res = new HashMap<>();
        res.put("status", "SEARCHING");
        res.put("message", "Searching for live opponent...");
        res.put("waitTimeSeconds", elapsed / 1000);
        return res;
    }

    public synchronized Map<String, Object> cancelQueue(Long playerId) {
        Player player = multiplayerService.resolvePlayer(playerId);
        Long resolvedId = player.getId();

        queueMap.remove(resolvedId);
        Map<String, Object> res = new HashMap<>();
        res.put("status", "CANCELLED");
        res.put("message", "Matchmaking search cancelled.");
        return res;
    }

    private void cleanExpiredEntries() {
        long now = Instant.now().toEpochMilli();
        queueMap.entrySet().removeIf(e -> (now - e.getValue().getEnqueuedAt()) > (QUEUE_TIMEOUT_MS * 2));
    }
}
