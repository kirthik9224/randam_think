package com.randomthinkinggame.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "room_players")
public class RoomPlayer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    @JsonBackReference
    private MultiplayerRoom room;

    @Column(name = "player_id", nullable = false)
    private Long playerId;

    @Column(nullable = false, length = 100)
    private String username;

    @Column(name = "is_host", nullable = false)
    private boolean isHost = false;

    @Column(name = "is_ready", nullable = false)
    private boolean isReady = false;

    @Column(nullable = false, length = 30)
    private String team = "SOLO"; // SOLO, TEAM_RED, TEAM_BLUE

    @Column(name = "avatar_color", length = 30)
    private String avatarColor = "#38bdf8";

    @Column(nullable = false)
    private int score = 0;

    @Column(name = "rounds_won", nullable = false)
    private int roundsWon = 0;

    @Column(name = "attempts_remaining", nullable = false)
    private int attemptsRemaining = 7;

    @Column(name = "connection_status", nullable = false, length = 20)
    private String connectionStatus = "CONNECTED"; // CONNECTED, DISCONNECTED

    @Column(name = "turn_order", nullable = false)
    private int turnOrder = 0;

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt = LocalDateTime.now();

    public RoomPlayer() {
    }

    public RoomPlayer(MultiplayerRoom room, Long playerId, String username, boolean isHost, String team, String avatarColor) {
        this.room = room;
        this.playerId = playerId;
        this.username = username;
        this.isHost = isHost;
        this.isReady = isHost; // Host is ready by default
        this.team = team != null ? team : "SOLO";
        this.avatarColor = avatarColor != null ? avatarColor : "#38bdf8";
        this.joinedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public MultiplayerRoom getRoom() {
        return room;
    }

    public void setRoom(MultiplayerRoom room) {
        this.room = room;
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
