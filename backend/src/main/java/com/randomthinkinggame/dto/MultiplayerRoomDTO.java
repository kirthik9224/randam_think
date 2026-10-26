package com.randomthinkinggame.dto;

import com.randomthinkinggame.entity.MultiplayerGuess;
import com.randomthinkinggame.entity.MultiplayerRoom;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class MultiplayerRoomDTO {
    private Long id;
    private String roomCode;
    private String roomName;
    private Long hostPlayerId;
    private String hostUsername;
    private String matchType;
    private String status;
    private long minNumber;
    private long maxNumber;
    private int attemptsPerRound;
    private int maxPlayers;
    private Long currentTurnPlayerId;
    private String currentTurnUsername;
    private int currentTurnIndex;
    private int currentRoundNumber;
    private int totalRounds;
    private Long secretNumber; // Masked (null) during active play!
    private int turnTimeLimitSeconds;
    private LocalDateTime turnDeadline;
    private String difficultyLabel;
    private double rewardMultiplier;
    private Long secondsRemaining;
    private String roundStatus;
    private Long roundWinnerId;
    private String roundWinnerName;
    private String roundWinningTeam;
    private int teamRedScore;
    private int teamBlueScore;
    private String teamRedName;
    private String teamBlueName;
    private long stakeAmount;
    private long totalPrizePool;
    private Long matchWinnerId;
    private String matchWinnerName;
    private String matchWinningTeam;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<RoomPlayerDTO> players = new ArrayList<>();
    private List<MultiplayerGuess> recentGuesses = new ArrayList<>();

    public MultiplayerRoomDTO() {}

    public MultiplayerRoomDTO(MultiplayerRoom room, List<MultiplayerGuess> guesses) {
        this.id = room.getId();
        this.roomCode = room.getRoomCode();
        this.roomName = room.getRoomName();
        this.hostPlayerId = room.getHostPlayerId();
        this.hostUsername = room.getHostUsername();
        this.matchType = room.getMatchType();
        this.status = room.getStatus();
        this.minNumber = room.getMinNumber();
        this.maxNumber = room.getMaxNumber();
        this.attemptsPerRound = room.getAttemptsPerRound();
        this.maxPlayers = room.getMaxPlayers();
        this.currentTurnPlayerId = room.getCurrentTurnPlayerId();
        this.currentTurnUsername = room.getCurrentTurnUsername();
        this.currentTurnIndex = room.getCurrentTurnIndex();
        this.currentRoundNumber = room.getCurrentRoundNumber();
        this.totalRounds = room.getTotalRounds();
        this.turnTimeLimitSeconds = room.getTurnTimeLimitSeconds();
        this.turnDeadline = room.getTurnDeadline();
        this.difficultyLabel = room.getDifficultyLabel();
        this.rewardMultiplier = room.getRewardMultiplier();

        if (room.getTurnDeadline() != null) {
            long secs = java.time.Duration.between(LocalDateTime.now(), room.getTurnDeadline()).getSeconds();
            this.secondsRemaining = Math.max(0L, secs);
        } else {
            this.secondsRemaining = (long) room.getTurnTimeLimitSeconds();
        }
        
        // Security requirement: Only reveal secret number if round is ended or match is finished!
        if ("ROUND_WON".equals(room.getRoundStatus()) || "ROUND_DRAW".equals(room.getRoundStatus()) || "FINISHED".equals(room.getStatus())) {
            this.secretNumber = room.getSecretNumber();
        } else {
            this.secretNumber = null;
        }

        this.roundStatus = room.getRoundStatus();
        this.roundWinnerId = room.getRoundWinnerId();
        this.roundWinnerName = room.getRoundWinnerName();
        this.roundWinningTeam = room.getRoundWinningTeam();
        this.teamRedScore = room.getTeamRedScore();
        this.teamBlueScore = room.getTeamBlueScore();
        this.teamRedName = room.getTeamRedName();
        this.teamBlueName = room.getTeamBlueName();
        this.stakeAmount = room.getStakeAmount();
        this.totalPrizePool = room.getTotalPrizePool();
        this.matchWinnerId = room.getMatchWinnerId();
        this.matchWinnerName = room.getMatchWinnerName();
        this.matchWinningTeam = room.getMatchWinningTeam();
        this.createdAt = room.getCreatedAt();
        this.updatedAt = room.getUpdatedAt();

        if (room.getPlayers() != null) {
            this.players = room.getPlayers().stream()
                    .map(RoomPlayerDTO::new)
                    .collect(Collectors.toList());
        }
        if (guesses != null) {
            this.recentGuesses = guesses;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRoomCode() {
        return roomCode;
    }

    public void setRoomCode(String roomCode) {
        this.roomCode = roomCode;
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public Long getHostPlayerId() {
        return hostPlayerId;
    }

    public void setHostPlayerId(Long hostPlayerId) {
        this.hostPlayerId = hostPlayerId;
    }

    public String getHostUsername() {
        return hostUsername;
    }

    public void setHostUsername(String hostUsername) {
        this.hostUsername = hostUsername;
    }

    public String getMatchType() {
        return matchType;
    }

    public void setMatchType(String matchType) {
        this.matchType = matchType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public long getMinNumber() {
        return minNumber;
    }

    public void setMinNumber(long minNumber) {
        this.minNumber = minNumber;
    }

    public long getMaxNumber() {
        return maxNumber;
    }

    public void setMaxNumber(long maxNumber) {
        this.maxNumber = maxNumber;
    }

    public int getAttemptsPerRound() {
        return attemptsPerRound;
    }

    public void setAttemptsPerRound(int attemptsPerRound) {
        this.attemptsPerRound = attemptsPerRound;
    }

    public int getMaxPlayers() {
        return maxPlayers;
    }

    public void setMaxPlayers(int maxPlayers) {
        this.maxPlayers = maxPlayers;
    }

    public Long getCurrentTurnPlayerId() {
        return currentTurnPlayerId;
    }

    public void setCurrentTurnPlayerId(Long currentTurnPlayerId) {
        this.currentTurnPlayerId = currentTurnPlayerId;
    }

    public String getCurrentTurnUsername() {
        return currentTurnUsername;
    }

    public void setCurrentTurnUsername(String currentTurnUsername) {
        this.currentTurnUsername = currentTurnUsername;
    }

    public int getCurrentTurnIndex() {
        return currentTurnIndex;
    }

    public void setCurrentTurnIndex(int currentTurnIndex) {
        this.currentTurnIndex = currentTurnIndex;
    }

    public int getCurrentRoundNumber() {
        return currentRoundNumber;
    }

    public void setCurrentRoundNumber(int currentRoundNumber) {
        this.currentRoundNumber = currentRoundNumber;
    }

    public int getTotalRounds() {
        return totalRounds;
    }

    public void setTotalRounds(int totalRounds) {
        this.totalRounds = totalRounds;
    }

    public Long getSecretNumber() {
        return secretNumber;
    }

    public void setSecretNumber(Long secretNumber) {
        this.secretNumber = secretNumber;
    }

    public int getTurnTimeLimitSeconds() {
        return turnTimeLimitSeconds;
    }

    public void setTurnTimeLimitSeconds(int turnTimeLimitSeconds) {
        this.turnTimeLimitSeconds = turnTimeLimitSeconds;
    }

    public LocalDateTime getTurnDeadline() {
        return turnDeadline;
    }

    public void setTurnDeadline(LocalDateTime turnDeadline) {
        this.turnDeadline = turnDeadline;
    }

    public String getDifficultyLabel() {
        return difficultyLabel != null ? difficultyLabel : "STANDARD";
    }

    public void setDifficultyLabel(String difficultyLabel) {
        this.difficultyLabel = difficultyLabel;
    }

    public double getRewardMultiplier() {
        return rewardMultiplier;
    }

    public void setRewardMultiplier(double rewardMultiplier) {
        this.rewardMultiplier = rewardMultiplier;
    }

    public Long getSecondsRemaining() {
        return secondsRemaining;
    }

    public void setSecondsRemaining(Long secondsRemaining) {
        this.secondsRemaining = secondsRemaining;
    }

    public String getRoundStatus() {
        return roundStatus;
    }

    public void setRoundStatus(String roundStatus) {
        this.roundStatus = roundStatus;
    }

    public Long getRoundWinnerId() {
        return roundWinnerId;
    }

    public void setRoundWinnerId(Long roundWinnerId) {
        this.roundWinnerId = roundWinnerId;
    }

    public String getRoundWinnerName() {
        return roundWinnerName;
    }

    public void setRoundWinnerName(String roundWinnerName) {
        this.roundWinnerName = roundWinnerName;
    }

    public String getRoundWinningTeam() {
        return roundWinningTeam;
    }

    public void setRoundWinningTeam(String roundWinningTeam) {
        this.roundWinningTeam = roundWinningTeam;
    }

    public int getTeamRedScore() {
        return teamRedScore;
    }

    public void setTeamRedScore(int teamRedScore) {
        this.teamRedScore = teamRedScore;
    }

    public int getTeamBlueScore() {
        return teamBlueScore;
    }

    public void setTeamBlueScore(int teamBlueScore) {
        this.teamBlueScore = teamBlueScore;
    }

    public String getTeamRedName() {
        return teamRedName != null ? teamRedName : "Team Red";
    }

    public void setTeamRedName(String teamRedName) {
        this.teamRedName = teamRedName;
    }

    public String getTeamBlueName() {
        return teamBlueName != null ? teamBlueName : "Team Blue";
    }

    public void setTeamBlueName(String teamBlueName) {
        this.teamBlueName = teamBlueName;
    }

    public long getStakeAmount() {
        return stakeAmount;
    }

    public void setStakeAmount(long stakeAmount) {
        this.stakeAmount = stakeAmount;
    }

    public long getTotalPrizePool() {
        return totalPrizePool;
    }

    public void setTotalPrizePool(long totalPrizePool) {
        this.totalPrizePool = totalPrizePool;
    }

    public Long getMatchWinnerId() {
        return matchWinnerId;
    }

    public void setMatchWinnerId(Long matchWinnerId) {
        this.matchWinnerId = matchWinnerId;
    }

    public String getMatchWinnerName() {
        return matchWinnerName;
    }

    public void setMatchWinnerName(String matchWinnerName) {
        this.matchWinnerName = matchWinnerName;
    }

    public String getMatchWinningTeam() {
        return matchWinningTeam;
    }

    public void setMatchWinningTeam(String matchWinningTeam) {
        this.matchWinningTeam = matchWinningTeam;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<RoomPlayerDTO> getPlayers() {
        return players;
    }

    public void setPlayers(List<RoomPlayerDTO> players) {
        this.players = players;
    }

    public List<MultiplayerGuess> getRecentGuesses() {
        return recentGuesses;
    }

    public void setRecentGuesses(List<MultiplayerGuess> recentGuesses) {
        this.recentGuesses = recentGuesses;
    }
}
