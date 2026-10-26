package com.randomthinkinggame.dto;

import java.time.LocalDateTime;

public class GuessResponse {

    private String result; // TOO_LOW, TOO_HIGH, CORRECT
    private String message;
    private int attemptsUsed;
    private int attemptsRemaining;
    private int score;
    private String status; // IN_PROGRESS, WON, LOST
    private Long gameId;
    private boolean gameOver;
    private long guessNumber;
    private int attemptNumber;
    private LocalDateTime createdAt;
    private String gameMode;
    private String proximity;
    private String extraClue;
    private Long distance;
    private Long coinsEarned;
    private Long virtualCoins;
    private Integer consecutiveWins;
    private String coinRewardMessage;
    private Integer level;
    private Integer highestUnlockedLevel;
    private boolean nextLevelUnlocked;
    private String milestoneBadgeEarned;
    private Integer xpEarned;
    private Long totalXp;

    public GuessResponse() {
    }

    public GuessResponse(String result, String message, int attemptsUsed, int attemptsRemaining,
                         int score, String status, Long gameId, boolean gameOver,
                         long guessNumber, int attemptNumber, LocalDateTime createdAt) {
        this(result, message, attemptsUsed, attemptsRemaining, score, status, gameId, gameOver,
                guessNumber, attemptNumber, createdAt, "CLASSIC", null, null, null);
    }

    public GuessResponse(String result, String message, int attemptsUsed, int attemptsRemaining,
                         int score, String status, Long gameId, boolean gameOver,
                         long guessNumber, int attemptNumber, LocalDateTime createdAt,
                         String gameMode, String proximity, String extraClue, Long distance) {
        this.result = result;
        this.message = message;
        this.attemptsUsed = attemptsUsed;
        this.attemptsRemaining = attemptsRemaining;
        this.score = score;
        this.status = status;
        this.gameId = gameId;
        this.gameOver = gameOver;
        this.guessNumber = guessNumber;
        this.attemptNumber = attemptNumber;
        this.createdAt = createdAt;
        this.gameMode = gameMode;
        this.proximity = proximity;
        this.extraClue = extraClue;
        this.distance = distance;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public int getAttemptsUsed() {
        return attemptsUsed;
    }

    public void setAttemptsUsed(int attemptsUsed) {
        this.attemptsUsed = attemptsUsed;
    }

    public int getAttemptsRemaining() {
        return attemptsRemaining;
    }

    public void setAttemptsRemaining(int attemptsRemaining) {
        this.attemptsRemaining = attemptsRemaining;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getGameId() {
        return gameId;
    }

    public void setGameId(Long gameId) {
        this.gameId = gameId;
    }

    public boolean isGameOver() {
        return gameOver;
    }

    public void setGameOver(boolean gameOver) {
        this.gameOver = gameOver;
    }

    public long getGuessNumber() {
        return guessNumber;
    }

    public void setGuessNumber(long guessNumber) {
        this.guessNumber = guessNumber;
    }

    public int getAttemptNumber() {
        return attemptNumber;
    }

    public void setAttemptNumber(int attemptNumber) {
        this.attemptNumber = attemptNumber;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getGameMode() {
        return gameMode;
    }

    public void setGameMode(String gameMode) {
        this.gameMode = gameMode;
    }

    public String getProximity() {
        return proximity;
    }

    public void setProximity(String proximity) {
        this.proximity = proximity;
    }

    public String getExtraClue() {
        return extraClue;
    }

    public void setExtraClue(String extraClue) {
        this.extraClue = extraClue;
    }

    public Long getDistance() {
        return distance;
    }

    public void setDistance(Long distance) {
        this.distance = distance;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public Integer getHighestUnlockedLevel() {
        return highestUnlockedLevel;
    }

    public void setHighestUnlockedLevel(Integer highestUnlockedLevel) {
        this.highestUnlockedLevel = highestUnlockedLevel;
    }

    public boolean isNextLevelUnlocked() {
        return nextLevelUnlocked;
    }

    public void setNextLevelUnlocked(boolean nextLevelUnlocked) {
        this.nextLevelUnlocked = nextLevelUnlocked;
    }

    public String getMilestoneBadgeEarned() {
        return milestoneBadgeEarned;
    }

    public void setMilestoneBadgeEarned(String milestoneBadgeEarned) {
        this.milestoneBadgeEarned = milestoneBadgeEarned;
    }

    public Integer getXpEarned() {
        return xpEarned;
    }

    public void setXpEarned(Integer xpEarned) {
        this.xpEarned = xpEarned;
    }

    public Long getTotalXp() {
        return totalXp;
    }

    public void setTotalXp(Long totalXp) {
        this.totalXp = totalXp;
    }

    public Long getCoinsEarned() {
        return coinsEarned;
    }

    public void setCoinsEarned(Long coinsEarned) {
        this.coinsEarned = coinsEarned;
    }

    public Long getVirtualCoins() {
        return virtualCoins;
    }

    public void setVirtualCoins(Long virtualCoins) {
        this.virtualCoins = virtualCoins;
    }

    public Integer getConsecutiveWins() {
        return consecutiveWins;
    }

    public void setConsecutiveWins(Integer consecutiveWins) {
        this.consecutiveWins = consecutiveWins;
    }

    public String getCoinRewardMessage() {
        return coinRewardMessage;
    }

    public void setCoinRewardMessage(String coinRewardMessage) {
        this.coinRewardMessage = coinRewardMessage;
    }
}
