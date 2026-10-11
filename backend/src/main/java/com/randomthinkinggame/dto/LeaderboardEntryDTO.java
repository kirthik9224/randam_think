package com.randomthinkinggame.dto;

import java.time.LocalDateTime;

public class LeaderboardEntryDTO {

    private int rank;
    private Long gameId;
    private Long playerId;
    private String username;
    private int score;
    private String difficulty;
    private int attemptsUsed;
    private int attemptsAllowed;
    private Long timeTakenSeconds;
    private LocalDateTime playedAt;

    public LeaderboardEntryDTO() {
    }

    public LeaderboardEntryDTO(int rank, Long gameId, Long playerId, String username,
                               int score, String difficulty, int attemptsUsed,
                               int attemptsAllowed, Long timeTakenSeconds, LocalDateTime playedAt) {
        this.rank = rank;
        this.gameId = gameId;
        this.playerId = playerId;
        this.username = username;
        this.score = score;
        this.difficulty = difficulty;
        this.attemptsUsed = attemptsUsed;
        this.attemptsAllowed = attemptsAllowed;
        this.timeTakenSeconds = timeTakenSeconds;
        this.playedAt = playedAt;
    }

    public int getRank() {
        return rank;
    }

    public void setRank(int rank) {
        this.rank = rank;
    }

    public Long getGameId() {
        return gameId;
    }

    public void setGameId(Long gameId) {
        this.gameId = gameId;
    }

    public Long getPlayerId() {
        return playerId;
    }

    public void setPlayerId(Long playerId) {
        this.playerId = playerId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
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

    public LocalDateTime getPlayedAt() {
        return playedAt;
    }

    public void setPlayedAt(LocalDateTime playedAt) {
        this.playedAt = playedAt;
    }
}
