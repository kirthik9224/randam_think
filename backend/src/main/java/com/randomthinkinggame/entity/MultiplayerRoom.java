package com.randomthinkinggame.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "multiplayer_rooms")
public class MultiplayerRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_code", nullable = false, unique = true, length = 12)
    private String roomCode;

    @Column(name = "room_name", length = 100)
    private String roomName;

    @Column(name = "host_player_id", nullable = false)
    private Long hostPlayerId;

    @Column(name = "host_username", nullable = false, length = 100)
    private String hostUsername;

    @Column(name = "match_type", nullable = false, length = 30)
    private String matchType = "FRIENDS"; // FRIENDS, QUICK_MATCH, TEAM_BATTLE

    @Column(nullable = false, length = 30)
    private String status = "WAITING"; // WAITING, IN_PROGRESS, FINISHED, CANCELLED

    @Column(name = "min_number", nullable = false)
    private long minNumber = 1L;

    @Column(name = "max_number", nullable = false)
    private long maxNumber = 100L;

    @Column(name = "attempts_per_round", nullable = false)
    private int attemptsPerRound = 7;

    @Column(name = "max_players", nullable = false)
    private int maxPlayers = 4;

    @Column(name = "current_turn_player_id")
    private Long currentTurnPlayerId;

    @Column(name = "current_turn_username", length = 100)
    private String currentTurnUsername;

    @Column(name = "current_turn_index", nullable = false)
    private int currentTurnIndex = 0;

    @Column(name = "current_round_number", nullable = false)
    private int currentRoundNumber = 1;

    @Column(name = "total_rounds", nullable = false)
    private int totalRounds = 3;

    @Column(name = "secret_number", nullable = false)
    private long secretNumber;

    @Column(name = "turn_time_limit_seconds", nullable = false)
    private int turnTimeLimitSeconds = 45;

    @Column(name = "turn_deadline")
    private LocalDateTime turnDeadline;

    @Column(name = "difficulty_label", length = 50)
    private String difficultyLabel = "WARM UP";

    @Column(name = "reward_multiplier", nullable = false)
    private double rewardMultiplier = 1.0;

    @Column(name = "round_status", nullable = false, length = 30)
    private String roundStatus = "IN_PROGRESS"; // IN_PROGRESS, ROUND_WON, ROUND_DRAW

    @Column(name = "round_winner_id")
    private Long roundWinnerId;

    @Column(name = "round_winner_name", length = 100)
    private String roundWinnerName;

    @Column(name = "round_winning_team", length = 30)
    private String roundWinningTeam;

    @Column(name = "team_red_score", nullable = false)
    private int teamRedScore = 0;

    @Column(name = "team_blue_score", nullable = false)
    private int teamBlueScore = 0;

    @Column(name = "team_red_name", length = 50)
    private String teamRedName = "Team Red";

    @Column(name = "team_blue_name", length = 50)
    private String teamBlueName = "Team Blue";

    @Column(name = "stake_amount", nullable = false)
    private long stakeAmount = 0L;

    @Column(name = "total_prize_pool", nullable = false)
    private long totalPrizePool = 0L;

    @Column(name = "match_winner_id")
    private Long matchWinnerId;

    @Column(name = "match_winner_name", length = 100)
    private String matchWinnerName;

    @Column(name = "match_winning_team", length = 30)
    private String matchWinningTeam;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<RoomPlayer> players = new ArrayList<>();

    public MultiplayerRoom() {
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

    public long getSecretNumber() {
        return secretNumber;
    }

    public void setSecretNumber(long secretNumber) {
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

    public List<RoomPlayer> getPlayers() {
        return players;
    }

    public void setPlayers(List<RoomPlayer> players) {
        this.players = players;
    }
}
