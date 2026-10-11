package com.randomthinkinggame.controller;

import com.randomthinkinggame.dto.AdminDashboardStatsDTO;
import com.randomthinkinggame.dto.ApiResponse;
import com.randomthinkinggame.dto.GameResponse;
import com.randomthinkinggame.dto.PlayerProfileDTO;
import com.randomthinkinggame.entity.Game;
import com.randomthinkinggame.repository.GameRepository;
import com.randomthinkinggame.repository.PlayerRepository;
import com.randomthinkinggame.service.GameService;
import com.randomthinkinggame.service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final PlayerRepository playerRepository;
    private final GameRepository gameRepository;
    private final PlayerService playerService;
    private final GameService gameService;

    @Autowired
    public AdminController(PlayerRepository playerRepository,
                           GameRepository gameRepository,
                           PlayerService playerService,
                           GameService gameService) {
        this.playerRepository = playerRepository;
        this.gameRepository = gameRepository;
        this.playerService = playerService;
        this.gameService = gameService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardStatsDTO> getDashboardStats() {
        AdminDashboardStatsDTO stats = new AdminDashboardStatsDTO();

        long totalPlayers = playerRepository.count();
        long totalGames = gameRepository.count();
        long totalWins = gameRepository.countByStatus("WON");
        long totalLosses = gameRepository.countByStatus("LOST");
        long totalInProgress = gameRepository.countByStatus("IN_PROGRESS");

        double winRate = totalGames > 0 ? Math.round(((double) totalWins / totalGames) * 1000.0) / 10.0 : 0.0;

        List<Game> allGames = gameRepository.findAllGamesWithPlayer();

        Map<String, Long> diffMap = new HashMap<>();
        diffMap.put("EASY", allGames.stream().filter(g -> "EASY".equalsIgnoreCase(g.getDifficulty())).count());
        diffMap.put("MEDIUM", allGames.stream().filter(g -> "MEDIUM".equalsIgnoreCase(g.getDifficulty())).count());
        diffMap.put("HARD", allGames.stream().filter(g -> "HARD".equalsIgnoreCase(g.getDifficulty())).count());
        diffMap.put("EXPERT", allGames.stream().filter(g -> "EXPERT".equalsIgnoreCase(g.getDifficulty())).count());

        List<GameResponse> recent = allGames.stream()
                .limit(15)
                .map(gameService::mapToGameResponse)
                .collect(Collectors.toList());

        stats.setTotalPlayers(totalPlayers);
        stats.setTotalGames(totalGames);
        stats.setTotalWins(totalWins);
        stats.setTotalLosses(totalLosses);
        stats.setTotalInProgress(totalInProgress);
        stats.setOverallWinRate(winRate);
        stats.setGamesByDifficulty(diffMap);
        stats.setRecentGames(recent);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/players")
    public ResponseEntity<List<PlayerProfileDTO>> getAllPlayers() {
        List<PlayerProfileDTO> players = playerService.getAllPlayers();
        return ResponseEntity.ok(players);
    }

    @GetMapping("/games")
    public ResponseEntity<List<GameResponse>> getAllGames() {
        List<Game> games = gameRepository.findAllGamesWithPlayer();
        List<GameResponse> responses = games.stream()
                .map(gameService::mapToGameResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/players/{id}")
    public ResponseEntity<ApiResponse<String>> deletePlayer(@PathVariable Long id) {
        playerService.deletePlayer(id);
        return ResponseEntity.ok(ApiResponse.ok("Player deleted successfully", null));
    }

    @DeleteMapping("/games/{id}")
    public ResponseEntity<ApiResponse<String>> deleteGame(@PathVariable Long id) {
        gameRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Game record deleted successfully", null));
    }
}
