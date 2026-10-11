package com.randomthinkinggame.repository;

import com.randomthinkinggame.entity.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {
    Optional<Player> findByEmail(String email);
    Optional<Player> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}
