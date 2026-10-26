package com.randomthinkinggame.dto;

import com.randomthinkinggame.entity.RoomPlayer;
import java.time.LocalDateTime;

public class RoomPlayerDTO {
    private Long id;
    private Long playerId;
    private String username;
    private boolean isHost;
    private boolean isReady;
    private String team;
    private String avatarColor;
    private int score;
    private int roundsWon;
    private int attemptsRemaining;
    private String connectionStatus;
    private int turnOrder;
    private LocalDateTime joinedAt;

    public RoomPlayerDTO() {}

    public RoomPlayerDTO(RoomPlayer player) {
        this.id = player.getId();
        this.playerId = player.getPlayerId();
        this.username = player.getUsername();
        this.isHost = player.isHost();
        this.isReady = player.isReady();
        this.team = player.getTeam();
        this.avatarColor = player.getAvatarColor();
        this.score = player.getScore();
        this.roundsWon = player.getRoundsWon();
        this.attemptsRemaining = player.getAttemptsRemaining();
        this.connectionStatus = player.getConnectionStatus();
        this.turnOrder = player.getTurnOrder();
        this.joinedAt = player.getJoinedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public boolean isHost() {
        return isHost;
    }

    public void setHost(boolean host) {
        isHost = host;
    }

    public boolean isReady() {
        return isReady;
    }

    public void setReady(boolean ready) {
        isReady = ready;
    }

    public String getTeam() {
        return team;
    }

    public void setTeam(String team) {
        this.team = team;
    }

    public String getAvatarColor() {
        return avatarColor;
    }

    public void setAvatarColor(String avatarColor) {
        this.avatarColor = avatarColor;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public int getRoundsWon() {
        return roundsWon;
    }

    public void setRoundsWon(int roundsWon) {
        this.roundsWon = roundsWon;
    }

    public int getAttemptsRemaining() {
        return attemptsRemaining;
    }

    public void setAttemptsRemaining(int attemptsRemaining) {
        this.attemptsRemaining = attemptsRemaining;
    }

    public String getConnectionStatus() {
        return connectionStatus;
    }

    public void setConnectionStatus(String connectionStatus) {
        this.connectionStatus = connectionStatus;
    }

    public int getTurnOrder() {
        return turnOrder;
    }

    public void setTurnOrder(int turnOrder) {
        this.turnOrder = turnOrder;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }
}
