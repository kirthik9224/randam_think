package com.randomthinkinggame.controller;

import com.randomthinkinggame.dto.MultiplayerGuessRequest;
import com.randomthinkinggame.service.MultiplayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class MultiplayerWsController {

    private final MultiplayerService multiplayerService;

    @Autowired
    public MultiplayerWsController(MultiplayerService multiplayerService) {
        this.multiplayerService = multiplayerService;
    }

    @MessageMapping("/room/{roomCode}/guess")
    public void submitGuess(
            @DestinationVariable String roomCode,
            @Payload Map<String, Object> payload) {
        if (payload != null && payload.containsKey("playerId") && payload.containsKey("guess")) {
            Long playerId = Long.valueOf(payload.get("playerId").toString());
            int guess = Integer.parseInt(payload.get("guess").toString());
            multiplayerService.submitGuess(roomCode, playerId, guess);
        }
    }

    @MessageMapping("/room/{roomCode}/ready")
    public void toggleReady(
            @DestinationVariable String roomCode,
            @Payload Map<String, Object> payload) {
        if (payload != null && payload.containsKey("playerId")) {
            Long playerId = Long.valueOf(payload.get("playerId").toString());
            multiplayerService.toggleReady(roomCode, playerId);
        }
    }

    @MessageMapping("/room/{roomCode}/team")
    public void switchTeam(
            @DestinationVariable String roomCode,
            @Payload Map<String, Object> payload) {
        if (payload != null && payload.containsKey("playerId") && payload.containsKey("team")) {
            Long playerId = Long.valueOf(payload.get("playerId").toString());
            String team = payload.get("team").toString();
            multiplayerService.switchTeam(roomCode, playerId, team);
        }
    }

    @MessageMapping("/room/{roomCode}/start")
    public void startMatch(
            @DestinationVariable String roomCode,
            @Payload Map<String, Object> payload) {
        if (payload != null && payload.containsKey("playerId")) {
            Long playerId = Long.valueOf(payload.get("playerId").toString());
            multiplayerService.startMatch(roomCode, playerId);
        }
    }
}
