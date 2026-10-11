package com.randomthinkinggame.service;

import com.randomthinkinggame.dto.PlayerProfileDTO;
import com.randomthinkinggame.dto.UpdateProfileRequest;
import com.randomthinkinggame.entity.Game;
import com.randomthinkinggame.entity.Player;
import com.randomthinkinggame.exception.BadRequestException;
import com.randomthinkinggame.exception.ResourceNotFoundException;
import com.randomthinkinggame.repository.GameRepository;
import com.randomthinkinggame.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlayerService {

    private final PlayerRepository playerRepository;
    private final GameRepository gameRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public PlayerService(PlayerRepository playerRepository, GameRepository gameRepository) {
        this.playerRepository = playerRepository;
        this.gameRepository = gameRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @Transactional(readOnly = true)
    public PlayerProfileDTO getProfile(Long playerId) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with ID: " + playerId));

        List<Game> games = gameRepository.findByPlayerIdOrderByStartedAtDesc(playerId);

        long totalGames = games.size();
        long gamesWon = games.stream().filter(g -> "WON".equalsIgnoreCase(g.getStatus())).count();
        long gamesLost = games.stream().filter(g -> "LOST".equalsIgnoreCase(g.getStatus())).count();
        double winRate = totalGames > 0 ? Math.round(((double) gamesWon / totalGames) * 1000.0) / 10.0 : 0.0;

        int highestScore = games.stream()
                .filter(g -> "WON".equalsIgnoreCase(g.getStatus()))
                .mapToInt(Game::getScore)
                .max()
                .orElse(0);

        long totalScore = games.stream()
                .filter(g -> "WON".equalsIgnoreCase(g.getStatus()))
                .mapToLong(Game::getScore)
                .sum();

        // Calculate current streak
        int currentStreak = 0;
        for (Game g : games) {
            if ("WON".equalsIgnoreCase(g.getStatus())) {
                currentStreak++;
            } else if ("LOST".equalsIgnoreCase(g.getStatus())) {
                break;
            }
        }

        // Calculate historical best streak
        int bestStreak = 0;
        int runningStreak = 0;
        for (int i = games.size() - 1; i >= 0; i--) {
            Game g = games.get(i);
            if ("WON".equalsIgnoreCase(g.getStatus())) {
                runningStreak++;
                if (runningStreak > bestStreak) {
                    bestStreak = runningStreak;
                }
            } else if ("LOST".equalsIgnoreCase(g.getStatus())) {
                runningStreak = 0;
            }
        }

        PlayerProfileDTO dto = new PlayerProfileDTO();
        dto.setId(player.getId());
        dto.setUsername(player.getUsername());
        dto.setEmail(player.getEmail());
        dto.setRole(player.getRole());
        dto.setTotalGames(totalGames);
        dto.setGamesWon(gamesWon);
        dto.setGamesLost(gamesLost);
        dto.setWinRate(winRate);
        dto.setHighestScore(highestScore);
        dto.setTotalScore(totalScore);
        dto.setCurrentStreak(currentStreak);
        dto.setBestStreak(bestStreak);
        dto.setBestScore(highestScore);
        dto.setCreatedAt(player.getCreatedAt());

        return dto;
    }

    @Transactional
    public PlayerProfileDTO updateProfile(Long playerId, UpdateProfileRequest request) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with ID: " + playerId));

        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
            String newUsername = request.getUsername().trim();
            if (!newUsername.equalsIgnoreCase(player.getUsername()) && playerRepository.existsByUsername(newUsername)) {
                throw new BadRequestException("Username is already taken");
            }
            player.setUsername(newUsername);
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            String newEmail = request.getEmail().trim().toLowerCase();
            if (!newEmail.equalsIgnoreCase(player.getEmail()) && playerRepository.existsByEmail(newEmail)) {
                throw new BadRequestException("Email is already in use");
            }
            player.setEmail(newEmail);
        }

        if (request.getNewPassword() != null && !request.getNewPassword().trim().isEmpty()) {
            if (request.getCurrentPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), player.getPassword())) {
                throw new BadRequestException("Current password does not match");
            }
            player.setPassword(passwordEncoder.encode(request.getNewPassword().trim()));
        }

        playerRepository.save(player);
        return getProfile(playerId);
    }

    @Transactional(readOnly = true)
    public List<PlayerProfileDTO> getAllPlayers() {
        return playerRepository.findAll().stream()
                .map(p -> getProfile(p.getId()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletePlayer(Long playerId) {
        if (!playerRepository.existsById(playerId)) {
            throw new ResourceNotFoundException("Player not found with ID: " + playerId);
        }
        playerRepository.deleteById(playerId);
    }
}
