package com.randomthinkinggame.dto;

import java.time.LocalDateTime;

public class GameResultResponse {

    private Long gameId;
    private String status; // WON, LOST
    private String difficulty;
    private String gameMode = "CLASSIC";
    private String playerMode = "SOLO";
    private int score;
    private int attemptsUsed;
    private int attemptsAllowed;
    private Long timeTakenSeconds;
    private String message;
    private LocalDateTime completedAt;

    public GameResultResponse() {
    }

    public GameResultResponse(Long gameId, String status, String difficulty, int score,
                              int attemptsUsed, int attemptsAllowed, Long timeTakenSeconds,
                              String message, LocalDateTime completedAt) {
        this(gameId, status, difficulty, "CLASSIC", "SOLO", score, attemptsUsed, attemptsAllowed, timeTakenSeconds, message, completedAt);
    }

    public GameResultResponse(Long gameId, String status, String difficulty, String gameMode, int score,
                              int attemptsUsed, int attemptsAllowed, Long timeTakenSeconds,
                              String message, LocalDateTime completedAt) {
        this(gameId, status, difficulty, gameMode, "SOLO", score, attemptsUsed, attemptsAllowed, timeTakenSeconds, message, completedAt);
    }

    public GameResultResponse(Long gameId, String status, String difficulty, String gameMode, String playerMode, int score,
                              int attemptsUsed, int attemptsAllowed, Long timeTakenSeconds,
                              String message, LocalDateTime completedAt) {
        this.gameId = gameId;
        this.status = status;
        this.difficulty = difficulty;
        this.gameMode = gameMode != null ? gameMode : "CLASSIC";
        this.playerMode = playerMode != null ? playerMode : "SOLO";
        this.score = score;
        this.attemptsUsed = attemptsUsed;
        this.attemptsAllowed = attemptsAllowed;
        this.timeTakenSeconds = timeTakenSeconds;
        this.message = message;
        this.completedAt = completedAt;
    }

    public Long getGameId() {
        return gameId;
    }

    public void setGameId(Long gameId) {
        this.gameId = gameId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public int getAttemptsUsed() {
        return attemptsUsed;
    }

    public void setAttemptsUsed(int attemptsUsed) {
        this.attemptsUsed = attemptsUsed;
    }

    public int getAttemptsAllowed() {
        return attemptsAllowed;
    }

    public void setAttemptsAllowed(int attemptsAllowed) {
        this.attemptsAllowed = attemptsAllowed;
    }

    public Long getTimeTakenSeconds() {
        return timeTakenSeconds;
    }

    public void setTimeTakenSeconds(Long timeTakenSeconds) {
        this.timeTakenSeconds = timeTakenSeconds;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
