package com.randomthinkinggame.controller;

import com.randomthinkinggame.dto.*;
import com.randomthinkinggame.service.GameService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/games")
public class GameController {

    private final GameService gameService;

    @Autowired
    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @PostMapping("/start")
    public ResponseEntity<GameResponse> startGame(@Valid @RequestBody GameStartRequest request) {
        GameResponse response = gameService.startGame(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{gameId}/guess")
    public ResponseEntity<GuessResponse> makeGuess(@PathVariable Long gameId, @Valid @RequestBody GuessRequest request) {
        GuessResponse response = gameService.makeGuess(gameId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{gameId}")
    public ResponseEntity<GameResponse> getGame(@PathVariable Long gameId) {
        GameResponse response = gameService.getGame(gameId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{gameId}/restart")
    public ResponseEntity<GameResponse> restartGame(@PathVariable Long gameId) {
        GameResponse response = gameService.restartGame(gameId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/player/{playerId}")
    public ResponseEntity<List<GameResponse>> getPlayerHistory(@PathVariable Long playerId) {
        List<GameResponse> response = gameService.getPlayerHistory(playerId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{gameId}/result")
    public ResponseEntity<GameResultResponse> getGameResult(@PathVariable Long gameId) {
        GameResultResponse response = gameService.getGameResult(gameId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{gameId}/powerup/{type}")
    public ResponseEntity<Map<String, Object>> usePowerUp(
            @PathVariable Long gameId,
            @PathVariable String type,
            @RequestParam(defaultValue = "1") long currentMin,
            @RequestParam(defaultValue = "1000") long currentMax) {
        Map<String, Object> response = gameService.usePowerUp(gameId, type, currentMin, currentMax);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{gameId}/clues")
    public ResponseEntity<Map<String, Object>> getGameClues(
            @PathVariable Long gameId,
            @RequestParam(defaultValue = "1") long currentMin,
            @RequestParam(defaultValue = "1000") long currentMax) {
        return ResponseEntity.ok(gameService.getGameClues(gameId, currentMin, currentMax));
    }

    @PostMapping("/{gameId}/clue/{clueType}")
    public ResponseEntity<Map<String, Object>> unlockClue(
            @PathVariable Long gameId,
            @PathVariable String clueType,
            @RequestParam(defaultValue = "1") long currentMin,
            @RequestParam(defaultValue = "1000") long currentMax) {
        return ResponseEntity.ok(gameService.unlockClue(gameId, clueType, currentMin, currentMax));
    }

    @GetMapping("/levels/{levelNumber}")
    public ResponseEntity<com.randomthinkinggame.config.SoloLevelConfig> getLevelConfig(@PathVariable int levelNumber) {
        return ResponseEntity.ok(gameService.getLevelConfig(levelNumber));
    }

    @GetMapping("/levels/range")
    public ResponseEntity<List<com.randomthinkinggame.config.SoloLevelConfig>> getLevelRange(
            @RequestParam(defaultValue = "1") int start,
            @RequestParam(defaultValue = "50") int count) {
        return ResponseEntity.ok(gameService.getLevelRange(start, count));
    }

    @GetMapping("/levels/progress/{playerId}")
    public ResponseEntity<Map<String, Object>> getLevelProgress(@PathVariable Long playerId) {
        return ResponseEntity.ok(gameService.getPlayerLevelProgress(playerId));
    }

    @PostMapping("/levels/sync")
    public ResponseEntity<Map<String, Object>> syncOfflineProgress(
            @RequestParam(defaultValue = "999999") Long playerId,
            @RequestParam(defaultValue = "1") int offlineUnlockedLevel,
            @RequestParam(defaultValue = "0") int offlineStars,
            @RequestParam(defaultValue = "0") long offlineXp) {
        return ResponseEntity.ok(gameService.syncOfflineProgress(playerId, offlineUnlockedLevel, offlineStars, offlineXp));
    }
}
