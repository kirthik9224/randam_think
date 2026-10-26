package com.randomthinkinggame.controller;

import com.randomthinkinggame.dto.CreateRoomRequest;
import com.randomthinkinggame.dto.JoinRoomRequest;
import com.randomthinkinggame.dto.MultiplayerGuessRequest;
import com.randomthinkinggame.dto.MultiplayerRoomDTO;
import com.randomthinkinggame.service.MultiplayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/multiplayer")
public class MultiplayerController {

    private final MultiplayerService multiplayerService;
    private final com.randomthinkinggame.service.MatchmakingService matchmakingService;

    @Autowired
    public MultiplayerController(MultiplayerService multiplayerService, com.randomthinkinggame.service.MatchmakingService matchmakingService) {
        this.multiplayerService = multiplayerService;
        this.matchmakingService = matchmakingService;
    }

    @PostMapping("/matchmaking/join")
    public ResponseEntity<Map<String, Object>> joinMatchmakingQueue(
            @RequestParam(required = false, defaultValue = "999999") Long playerId) {
        Map<String, Object> result = matchmakingService.joinQueue(playerId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/matchmaking/status")
    public ResponseEntity<Map<String, Object>> getMatchmakingStatus(
            @RequestParam(required = false, defaultValue = "999999") Long playerId) {
        Map<String, Object> result = matchmakingService.checkStatus(playerId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/matchmaking/cancel")
    public ResponseEntity<Map<String, Object>> cancelMatchmaking(
            @RequestParam(required = false, defaultValue = "999999") Long playerId) {
        Map<String, Object> result = matchmakingService.cancelQueue(playerId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/rooms/create")
    public ResponseEntity<MultiplayerRoomDTO> createRoom(
            @RequestParam(required = false, defaultValue = "999999") Long playerId,
            @RequestBody(required = false) CreateRoomRequest request) {
        if (request == null) {
            request = new CreateRoomRequest();
        }
        MultiplayerRoomDTO room = multiplayerService.createRoom(playerId, request);
        return ResponseEntity.ok(room);
    }

    @PostMapping("/rooms/join")
    public ResponseEntity<MultiplayerRoomDTO> joinRoom(
            @RequestParam(required = false, defaultValue = "999999") Long playerId,
            @RequestBody JoinRoomRequest request) {
        MultiplayerRoomDTO room = multiplayerService.joinRoom(playerId, request);
        return ResponseEntity.ok(room);
    }

    @PostMapping("/rooms/quick-match")
    public ResponseEntity<MultiplayerRoomDTO> quickMatch(@RequestParam(required = false, defaultValue = "999999") Long playerId) {
        MultiplayerRoomDTO room = multiplayerService.quickMatch(playerId);
        return ResponseEntity.ok(room);
    }

    @GetMapping("/rooms/{roomCode}")
    public ResponseEntity<MultiplayerRoomDTO> getRoom(@PathVariable String roomCode) {
        MultiplayerRoomDTO room = multiplayerService.getRoomByCode(roomCode);
        return ResponseEntity.ok(room);
    }

    @PostMapping("/rooms/{roomCode}/ready")
    public ResponseEntity<MultiplayerRoomDTO> toggleReady(
            @PathVariable String roomCode,
            @RequestParam(required = false, defaultValue = "999999") Long playerId) {
        MultiplayerRoomDTO room = multiplayerService.toggleReady(roomCode, playerId);
        return ResponseEntity.ok(room);
    }

    @PostMapping("/rooms/{roomCode}/team")
    public ResponseEntity<MultiplayerRoomDTO> switchTeam(
            @PathVariable String roomCode,
            @RequestParam(required = false, defaultValue = "999999") Long playerId,
            @RequestParam String team) {
        MultiplayerRoomDTO room = multiplayerService.switchTeam(roomCode, playerId, team);
        return ResponseEntity.ok(room);
    }

    @PostMapping("/rooms/{roomCode}/start")
    public ResponseEntity<MultiplayerRoomDTO> startMatch(
            @PathVariable String roomCode,
            @RequestParam(required = false, defaultValue = "999999") Long playerId) {
        MultiplayerRoomDTO room = multiplayerService.startMatch(roomCode, playerId);
        return ResponseEntity.ok(room);
    }

    @PostMapping("/rooms/{roomCode}/guess")
    public ResponseEntity<MultiplayerRoomDTO> submitGuess(
            @PathVariable String roomCode,
            @RequestParam(required = false, defaultValue = "999999") Long playerId,
            @RequestBody MultiplayerGuessRequest request) {
        MultiplayerRoomDTO room = multiplayerService.submitGuess(roomCode, playerId, request.getGuess());
        return ResponseEntity.ok(room);
    }

    @PostMapping("/rooms/{roomCode}/next-round")
    public ResponseEntity<MultiplayerRoomDTO> nextRound(
            @PathVariable String roomCode,
            @RequestParam(required = false, defaultValue = "999999") Long playerId) {
        MultiplayerRoomDTO room = multiplayerService.nextRound(roomCode, playerId);
        return ResponseEntity.ok(room);
    }

    @PostMapping("/rooms/{roomCode}/timeout")
    public ResponseEntity<MultiplayerRoomDTO> handleTimeout(
            @PathVariable String roomCode,
            @RequestParam(required = false, defaultValue = "999999") Long playerId) {
        MultiplayerRoomDTO room = multiplayerService.handleTurnTimeout(roomCode, playerId);
        return ResponseEntity.ok(room);
    }

    @GetMapping("/round-config/{roundNumber}")
    public ResponseEntity<com.randomthinkinggame.config.MultiplayerRoundConfig.RoundSetting> getRoundConfig(
            @PathVariable int roundNumber) {
        return ResponseEntity.ok(com.randomthinkinggame.config.MultiplayerRoundConfig.getRoundSetting(roundNumber));
    }

    @PostMapping("/rooms/{roomCode}/leave")
    public ResponseEntity<MultiplayerRoomDTO> leaveRoom(
            @PathVariable String roomCode,
            @RequestParam(required = false, defaultValue = "999999") Long playerId) {
        MultiplayerRoomDTO room = multiplayerService.leaveRoom(roomCode, playerId);
        return ResponseEntity.ok(room);
    }

    @GetMapping("/coins/{playerId}")
    public ResponseEntity<Map<String, Object>> getCoins(@PathVariable Long playerId) {
        return ResponseEntity.ok(multiplayerService.getPlayerCoins(playerId));
    }

    @PostMapping("/coins/{playerId}/claim-bonus")
    public ResponseEntity<Map<String, Object>> claimDailyBonus(@PathVariable Long playerId) {
        return ResponseEntity.ok(multiplayerService.claimDailyBonus(playerId));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<Map<String, Object>>> getLeaderboard() {
        return ResponseEntity.ok(multiplayerService.getMultiplayerLeaderboard());
    }
}
