package com.randomthinkinggame.service;

import com.randomthinkinggame.dto.LeaderboardEntryDTO;
import com.randomthinkinggame.entity.Game;
import com.randomthinkinggame.repository.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
public class LeaderboardService {

    private final GameRepository gameRepository;

    @Autowired
    public LeaderboardService(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    public List<LeaderboardEntryDTO> getLeaderboard(String difficulty, int limit) {
        if (limit <= 0) limit = 20;

        List<Game> games;
        if (difficulty != null && !difficulty.trim().isEmpty() && !"ALL".equalsIgnoreCase(difficulty.trim())) {
            games = gameRepository.findTopWonGamesByDifficulty(difficulty.toUpperCase().trim(), PageRequest.of(0, limit));
        } else {
            games = gameRepository.findTopWonGames(PageRequest.of(0, limit));
        }

        List<LeaderboardEntryDTO> entries = new ArrayList<>();
        int rank = 1;
        for (Game g : games) {
            long timeTaken = 0;
            if (g.getCompletedAt() != null && g.getStartedAt() != null) {
                timeTaken = Duration.between(g.getStartedAt(), g.getCompletedAt()).getSeconds();
            }

            LeaderboardEntryDTO dto = new LeaderboardEntryDTO(
                    rank++,
                    g.getId(),
                    g.getPlayer() != null ? g.getPlayer().getId() : null,
                    g.getPlayer() != null ? g.getPlayer().getUsername() : "Anonymous",
                    g.getScore(),
                    g.getDifficulty(),
                    g.getAttemptsUsed(),
                    g.getAttemptsAllowed(),
                    timeTaken,
                    g.getCompletedAt() != null ? g.getCompletedAt() : g.getStartedAt()
            );
            entries.add(dto);
        }

        return entries;
    }

    public List<LeaderboardEntryDTO> getTopLeaderboard() {
        return getLeaderboard(null, 10);
    }
}
