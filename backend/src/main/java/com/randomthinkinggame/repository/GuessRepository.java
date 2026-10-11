package com.randomthinkinggame.repository;

import com.randomthinkinggame.entity.Guess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuessRepository extends JpaRepository<Guess, Long> {
    List<Guess> findByGameIdOrderByAttemptNumberAsc(Long gameId);
}
