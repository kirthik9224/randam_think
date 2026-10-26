package com.randomthinkinggame.repository;

import com.randomthinkinggame.entity.CoinTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CoinTransactionRepository extends JpaRepository<CoinTransaction, Long> {
    List<CoinTransaction> findByPlayerIdOrderByCreatedAtDesc(Long playerId);
}
