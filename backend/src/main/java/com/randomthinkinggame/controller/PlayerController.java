package com.randomthinkinggame.controller;

import com.randomthinkinggame.dto.ApiResponse;
import com.randomthinkinggame.dto.PlayerProfileDTO;
import com.randomthinkinggame.dto.UpdateProfileRequest;
import com.randomthinkinggame.service.PlayerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerService playerService;

    @Autowired
    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlayerProfileDTO> getPlayer(@PathVariable Long id) {
        PlayerProfileDTO profile = playerService.getProfile(id);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PlayerProfileDTO>> updatePlayer(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProfileRequest request) {
        PlayerProfileDTO updated = playerService.updateProfile(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }
}
