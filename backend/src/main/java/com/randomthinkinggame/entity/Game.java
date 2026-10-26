package com.randomthinkinggame.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "games")
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @Column(nullable = false, length = 20)
    private String difficulty; // EASY, MEDIUM, HARD, EXPERT

    @Column(name = "game_mode", length = 30)
    private String gameMode = "CLASSIC"; // CLASSIC, HOT_COLD, TIME_ATTACK, DETECTIVE, HARDCORE

    @Column(name = "player_mode", length = 40)
    private String playerMode = "SOLO"; // SOLO, 1_VS_CPU, 1P_VS_1P, 2P_VS_2CPU, 2P_VS_2P, 3P_VS_1CPU, 4P_FFA, 4P_VS_4P

    @Column(name = "min_number", nullable = false)
    private int minNumber;

    @Column(name = "max_number", nullable = false)
    private int maxNumber;

    @Column(name = "secret_number", nullable = false)
    private int secretNumber;

    @Column(name = "attempts_allowed", nullable = false)
    private int attemptsAllowed;

    @Column(name = "attempts_used", nullable = false)
    private int attemptsUsed = 0;

    @Column(nullable = false)
    private int score = 0;

    @Column(name = "level")
    private Integer level;

    @Column(nullable = false, length = 20)
    private String status = "IN_PROGRESS"; // IN_PROGRESS, WON, LOST

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "slice50_used", nullable = false)
    private boolean slice50Used = false;

    @Column(name = "oracle_used", nullable = false)
    private boolean oracleUsed = false;

    @Column(name = "shield_used", nullable = false)
    private boolean shieldUsed = false;

    @Column(name = "emp_freeze_used", nullable = false)
    private boolean empFreezeUsed = false;

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Guess> guesses = new ArrayList<>();

    public Game() {
    }

    public Game(Player player, String difficulty, int minNumber, int maxNumber, int secretNumber, int attemptsAllowed) {
        this(player, difficulty, "CLASSIC", "SOLO", minNumber, maxNumber, secretNumber, attemptsAllowed);
    }

    public Game(Player player, String difficulty, String gameMode, int minNumber, int maxNumber, int secretNumber, int attemptsAllowed) {
        this(player, difficulty, gameMode, "SOLO", minNumber, maxNumber, secretNumber, attemptsAllowed);
    }

    public Game(Player player, String difficulty, String gameMode, String playerMode, int minNumber, int maxNumber, int secretNumber, int attemptsAllowed) {
        this.player = player;
        this.difficulty = difficulty;
        this.gameMode = gameMode != null ? gameMode : "CLASSIC";
        this.playerMode = playerMode != null ? playerMode : "SOLO";
        this.minNumber = minNumber;
        this.maxNumber = maxNumber;
        this.secretNumber = secretNumber;
        this.attemptsAllowed = attemptsAllowed;
        this.attemptsUsed = 0;
        this.score = 0;
        this.status = "IN_PROGRESS";
        this.startedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Player getPlayer() {
        return player;
    }

    public void setPlayer(Player player) {
        this.player = player;
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

    public int getMinNumber() {
        return minNumber;
    }

    public void setMinNumber(int minNumber) {
        this.minNumber = minNumber;
    }

    public int getMaxNumber() {
        return maxNumber;
    }

    public void setMaxNumber(int maxNumber) {
        this.maxNumber = maxNumber;
    }

    public int getSecretNumber() {
        return secretNumber;
    }

    public void setSecretNumber(int secretNumber) {
        this.secretNumber = secretNumber;
    }

    public int getAttemptsAllowed() {
        return attemptsAllowed;
    }

    public void setAttemptsAllowed(int attemptsAllowed) {
        this.attemptsAllowed = attemptsAllowed;
    }

    public int getAttemptsUsed() {
        return attemptsUsed;
    }

    public void setAttemptsUsed(int attemptsUsed) {
        this.attemptsUsed = attemptsUsed;
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

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public List<Guess> getGuesses() {
        return guesses;
    }

    public void setGuesses(List<Guess> guesses) {
        this.guesses = guesses;
    }

    public boolean isSlice50Used() {
        return slice50Used;
    }

    public void setSlice50Used(boolean slice50Used) {
        this.slice50Used = slice50Used;
    }

    public boolean isOracleUsed() {
        return oracleUsed;
    }

    public void setOracleUsed(boolean oracleUsed) {
        this.oracleUsed = oracleUsed;
    }

    public boolean isShieldUsed() {
        return shieldUsed;
    }

    public void setShieldUsed(boolean shieldUsed) {
        this.shieldUsed = shieldUsed;
    }

    public boolean isEmpFreezeUsed() {
        return empFreezeUsed;
    }

    public void setEmpFreezeUsed(boolean empFreezeUsed) {
        this.empFreezeUsed = empFreezeUsed;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }
}
