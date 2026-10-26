package com.randomthinkinggame.repository;

import com.randomthinkinggame.entity.MultiplayerGuess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MultiplayerGuessRepository extends JpaRepository<MultiplayerGuess, Long> {
    List<MultiplayerGuess> findByRoomIdAndRoundNumberOrderByAttemptNumberAsc(Long roomId, int roundNumber);
    List<MultiplayerGuess> findByRoomIdOrderByCreatedAtAsc(Long roomId);
}
