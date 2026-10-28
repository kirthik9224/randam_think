package com.randomthinkinggame.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "multiplayer_guesses")
public class MultiplayerGuess {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "round_number", nullable = false)
    private int roundNumber;

    @Column(name = "player_id", nullable = false)
    private Long playerId;

    @Column(nullable = false, length = 100)
    private String username;

    @Column(length = 30)
    private String team;

    @Column(name = "guess_number", nullable = false)
    private long guessNumber;

    @Column(nullable = false, length = 20)
    private String result; // TOO_LOW, TOO_HIGH, CORRECT

    @Column(length = 255)
    private String message;

    @Column(name = "extra_clue", length = 500)
    private String extraClue;

    @Column(name = "attempt_number", nullable = false)
    private int attemptNumber;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public MultiplayerGuess() {
    }

    public MultiplayerGuess(Long roomId, int roundNumber, Long playerId, String username, String team, long guessNumber, String result, String message, int attemptNumber) {
        this(roomId, roundNumber, playerId, username, team, guessNumber, result, message, attemptNumber, null);
    }

    public MultiplayerGuess(Long roomId, int roundNumber, Long playerId, String username, String team, long guessNumber, String result, String message, int attemptNumber, String extraClue) {
        this.roomId = roomId;
        this.roundNumber = roundNumber;
        this.playerId = playerId;
        this.username = username;
        this.team = team;
        this.guessNumber = guessNumber;
        this.result = result;
        this.message = message;
        this.attemptNumber = attemptNumber;
        this.extraClue = extraClue;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public int getRoundNumber() {
        return roundNumber;
    }

    public void setRoundNumber(int roundNumber) {
        this.roundNumber = roundNumber;
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

    public String getTeam() {
        return team;
    }

    public void setTeam(String team) {
        this.team = team;
    }

    public long getGuessNumber() {
        return guessNumber;
    }

    public void setGuessNumber(long guessNumber) {
        this.guessNumber = guessNumber;
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

    public int getAttemptNumber() {
        return attemptNumber;
    }

    public void setAttemptNumber(int attemptNumber) {
        this.attemptNumber = attemptNumber;
    }

    public String getExtraClue() {
        return extraClue;
    }

    public void setExtraClue(String extraClue) {
        this.extraClue = extraClue;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
