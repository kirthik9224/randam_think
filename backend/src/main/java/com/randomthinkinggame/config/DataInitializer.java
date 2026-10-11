package com.randomthinkinggame.config;

import com.randomthinkinggame.entity.Game;
import com.randomthinkinggame.entity.Player;
import com.randomthinkinggame.repository.GameRepository;
import com.randomthinkinggame.repository.PlayerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(PlayerRepository playerRepository, GameRepository gameRepository) {
        return args -> {
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

            if (!playerRepository.existsByEmail("admin@randomthinkinggame.com")) {
                Player admin = new Player(
                        "admin",
                        "admin@randomthinkinggame.com",
                        encoder.encode("admin123"),
                        "ADMIN"
                );
                playerRepository.save(admin);
            }

            if (!playerRepository.existsByEmail("player1@example.com")) {
                Player player = new Player(
                        "NumberMaster",
                        "player1@example.com",
                        encoder.encode("password123"),
                        "USER"
                );
                Player saved = playerRepository.save(player);

                // Add sample game history for leaderboard demonstration
                Game sampleGame1 = new Game(saved, "MEDIUM", 1, 100, 42, 7);
                sampleGame1.setAttemptsUsed(3);
                sampleGame1.setScore(2180);
                sampleGame1.setStatus("WON");
                sampleGame1.setStartedAt(LocalDateTime.now().minusHours(2));
                sampleGame1.setCompletedAt(LocalDateTime.now().minusHours(2).plusSeconds(28));
                gameRepository.save(sampleGame1);

                Game sampleGame2 = new Game(saved, "HARD", 1, 500, 312, 5);
                sampleGame2.setAttemptsUsed(4);
                sampleGame2.setScore(3950);
                sampleGame2.setStatus("WON");
                sampleGame2.setStartedAt(LocalDateTime.now().minusHours(1));
                sampleGame2.setCompletedAt(LocalDateTime.now().minusHours(1).plusSeconds(45));
                gameRepository.save(sampleGame2);
            }
        };
    }
}
