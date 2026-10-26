package com.randomthinkinggame.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class GameStartRequest {

    @NotNull(message = "Player ID is required")
    private Long playerId;

    @NotBlank(message = "Difficulty is required")
    private String difficulty; // EASY, MEDIUM, HARD, EXPERT

    private String gameMode = "CLASSIC"; // CLASSIC, HOT_COLD, TIME_ATTACK, DETECTIVE, HARDCORE
    private String playerMode = "SOLO"; // SOLO, 1_VS_CPU, 1P_VS_1P, 2P_VS_2CPU, 2P_VS_2P, 3P_VS_1CPU, 4P_FFA, 4P_VS_4P

    private Long minNumber;
    private Long maxNumber;
    private Integer attemptsAllowed;
    private Integer level;

    public GameStartRequest() {
    }

    public GameStartRequest(Long playerId, String difficulty) {
        this.playerId = playerId;
        this.difficulty = difficulty;
        this.gameMode = "CLASSIC";
        this.playerMode = "SOLO";
    }

    public GameStartRequest(Long playerId, String difficulty, String gameMode) {
        this.playerId = playerId;
        this.difficulty = difficulty;
        this.gameMode = gameMode != null ? gameMode : "CLASSIC";
        this.playerMode = "SOLO";
    }

    public GameStartRequest(Long playerId, String difficulty, String gameMode, String playerMode) {
        this.playerId = playerId;
        this.difficulty = difficulty;
        this.gameMode = gameMode != null ? gameMode : "CLASSIC";
        this.playerMode = playerMode != null ? playerMode : "SOLO";
    }

    public Long getPlayerId() {
        return playerId;
    }

    public void setPlayerId(Long playerId) {
        this.playerId = playerId;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getGameMode() {
        return gameMode;
    }

    public void setGameMode(String gameMode) {
        this.gameMode = gameMode;
    }

    public String getPlayerMode() {
        return playerMode;
    }

    public void setPlayerMode(String playerMode) {
        this.playerMode = playerMode;
    }

    public Long getMinNumber() {
        return minNumber;
    }

    public void setMinNumber(Long minNumber) {
        this.minNumber = minNumber;
    }

    public Long getMaxNumber() {
        return maxNumber;
    }

    public void setMaxNumber(Long maxNumber) {
        this.maxNumber = maxNumber;
    }

    public Integer getAttemptsAllowed() {
        return attemptsAllowed;
    }

    public void setAttemptsAllowed(Integer attemptsAllowed) {
        this.attemptsAllowed = attemptsAllowed;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }
}
