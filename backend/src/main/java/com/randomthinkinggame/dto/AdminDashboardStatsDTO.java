package com.randomthinkinggame.dto;

import java.util.List;
import java.util.Map;

public class AdminDashboardStatsDTO {

    private long totalPlayers;
    private long totalGames;
    private long totalWins;
    private long totalLosses;
    private long totalInProgress;
    private double overallWinRate;
    private Map<String, Long> gamesByDifficulty;
    private List<GameResponse> recentGames;

    public AdminDashboardStatsDTO() {
    }

    public long getTotalPlayers() {
        return totalPlayers;
    }

    public void setTotalPlayers(long totalPlayers) {
        this.totalPlayers = totalPlayers;
    }

    public long getTotalGames() {
        return totalGames;
    }

    public void setTotalGames(long totalGames) {
        this.totalGames = totalGames;
    }

    public long getTotalWins() {
        return totalWins;
    }

    public void setTotalWins(long totalWins) {
        this.totalWins = totalWins;
    }

    public long getTotalLosses() {
        return totalLosses;
    }

    public void setTotalLosses(long totalLosses) {
        this.totalLosses = totalLosses;
    }

    public long getTotalInProgress() {
        return totalInProgress;
    }

    public void setTotalInProgress(long totalInProgress) {
        this.totalInProgress = totalInProgress;
    }

    public double getOverallWinRate() {
        return overallWinRate;
    }

    public void setOverallWinRate(double overallWinRate) {
        this.overallWinRate = overallWinRate;
    }

    public Map<String, Long> getGamesByDifficulty() {
        return gamesByDifficulty;
    }

    public void setGamesByDifficulty(Map<String, Long> gamesByDifficulty) {
        this.gamesByDifficulty = gamesByDifficulty;
    }

    public List<GameResponse> getRecentGames() {
        return recentGames;
    }

    public void setRecentGames(List<GameResponse> recentGames) {
        this.recentGames = recentGames;
    }
}
