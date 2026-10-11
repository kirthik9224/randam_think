package com.randomthinkinggame.repository;

import com.randomthinkinggame.entity.Game;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {

    @Query("SELECT g FROM Game g LEFT JOIN FETCH g.player WHERE g.player.id = :playerId ORDER BY g.startedAt DESC")
    List<Game> findByPlayerIdOrderByStartedAtDesc(@Param("playerId") Long playerId);

    @Query("SELECT g FROM Game g LEFT JOIN FETCH g.player WHERE g.id = :gameId")
    Optional<Game> findByIdWithPlayer(@Param("gameId") Long gameId);

    List<Game> findByPlayerIdAndStatus(Long playerId, String status);

    List<Game> findByStatusOrderByScoreDesc(String status);

    @Query("SELECT g FROM Game g JOIN FETCH g.player WHERE g.status = 'WON' ORDER BY g.score DESC, g.attemptsUsed ASC")
    List<Game> findTopWonGames(Pageable pageable);

    @Query("SELECT g FROM Game g JOIN FETCH g.player WHERE g.status = 'WON' AND g.difficulty = :difficulty ORDER BY g.score DESC, g.attemptsUsed ASC")
    List<Game> findTopWonGamesByDifficulty(@Param("difficulty") String difficulty, Pageable pageable);

    @Query("SELECT g FROM Game g LEFT JOIN FETCH g.player ORDER BY g.startedAt DESC")
    List<Game> findAllGamesWithPlayer();

    long countByStatus(String status);

    long countByPlayerId(Long playerId);

    long countByPlayerIdAndStatus(Long playerId, String status);

    @Query("SELECT COALESCE(MAX(g.score), 0) FROM Game g WHERE g.player.id = :playerId AND g.status = 'WON'")
    int findHighestScoreByPlayerId(@Param("playerId") Long playerId);

    @Query("SELECT COALESCE(SUM(g.score), 0) FROM Game g WHERE g.player.id = :playerId AND g.status = 'WON'")
    long findTotalScoreByPlayerId(@Param("playerId") Long playerId);
}
