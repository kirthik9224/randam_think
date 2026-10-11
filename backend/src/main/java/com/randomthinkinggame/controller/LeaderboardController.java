package com.randomthinkinggame.controller;

import com.randomthinkinggame.dto.LeaderboardEntryDTO;
import com.randomthinkinggame.service.LeaderboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @Autowired
    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping
    public ResponseEntity<List<LeaderboardEntryDTO>> getLeaderboard(
            @RequestParam(required = false) String difficulty,
            @RequestParam(defaultValue = "50") int limit) {
        List<LeaderboardEntryDTO> leaderboard = leaderboardService.getLeaderboard(difficulty, limit);
        return ResponseEntity.ok(leaderboard);
    }

    @GetMapping("/top")
    public ResponseEntity<List<LeaderboardEntryDTO>> getTopLeaderboard() {
        List<LeaderboardEntryDTO> top = leaderboardService.getTopLeaderboard();
        return ResponseEntity.ok(top);
    }
}
