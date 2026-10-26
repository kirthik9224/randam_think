package com.randomthinkinggame.repository;

import com.randomthinkinggame.entity.RoomPlayer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomPlayerRepository extends JpaRepository<RoomPlayer, Long> {
    Optional<RoomPlayer> findByRoomIdAndPlayerId(Long roomId, Long playerId);
    List<RoomPlayer> findByRoomIdOrderByTurnOrderAsc(Long roomId);
    void deleteByRoomId(Long roomId);
    List<RoomPlayer> findByPlayerId(Long playerId);
}
