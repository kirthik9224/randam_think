package com.randomthinkinggame.service;

import com.randomthinkinggame.dto.AuthResponse;
import com.randomthinkinggame.dto.LoginRequest;
import com.randomthinkinggame.dto.RegisterRequest;
import com.randomthinkinggame.entity.Player;
import com.randomthinkinggame.exception.BadRequestException;
import com.randomthinkinggame.exception.ResourceNotFoundException;
import com.randomthinkinggame.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final PlayerRepository playerRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AuthService(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        if (playerRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new BadRequestException("Email is already registered");
        }

        if (playerRepository.existsByUsername(request.getUsername().trim())) {
            throw new BadRequestException("Username is already taken");
        }

        String role = "USER";
        String lowerUsername = request.getUsername().toLowerCase();
        if (lowerUsername.contains("admin") || 
            request.getEmail().equalsIgnoreCase("admin@randomthinkinggame.com") ||
            request.getEmail().equalsIgnoreCase("kirthikprasath@gmail.com")) {
            role = "ADMIN";
        }

        Player player = new Player(
                request.getUsername().trim(),
                request.getEmail().trim().toLowerCase(),
                passwordEncoder.encode(request.getPassword()),
                role
        );

        Player saved = playerRepository.save(player);
        return new AuthResponse(saved.getId(), saved.getUsername(), saved.getEmail(), saved.getRole(), "Registration successful");
    }

    public AuthResponse login(LoginRequest request) {
        String identifier = request.getEmail() != null ? request.getEmail().trim() : "";
        if (identifier.isEmpty()) {
            throw new BadRequestException("Email or username is required");
        }

        Player player = playerRepository.findByEmail(identifier.toLowerCase())
                .or(() -> playerRepository.findByUsername(identifier))
                .orElseThrow(() -> new ResourceNotFoundException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), player.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        return new AuthResponse(player.getId(), player.getUsername(), player.getEmail(), player.getRole(), "Login successful");
    }

    public Player findById(Long playerId) {
        return playerRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with ID: " + playerId));
    }
}
