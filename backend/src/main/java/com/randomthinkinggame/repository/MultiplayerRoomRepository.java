package com.randomthinkinggame.repository;

import com.randomthinkinggame.entity.MultiplayerRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MultiplayerRoomRepository extends JpaRepository<MultiplayerRoom, Long> {
    Optional<MultiplayerRoom> findByRoomCode(String roomCode);
    boolean existsByRoomCode(String roomCode);
    List<MultiplayerRoom> findByStatusOrderByCreatedAtDesc(String status);
    List<MultiplayerRoom> findByMatchTypeAndStatusOrderByCreatedAtAsc(String matchType, String status);
}
