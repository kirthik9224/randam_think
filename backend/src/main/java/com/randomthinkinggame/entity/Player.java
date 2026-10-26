package com.randomthinkinggame.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "players")
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 20)
    private String role = "USER";

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "virtual_coins", nullable = false)
    private long virtualCoins = 1000L;

    @Column(name = "consecutive_wins", nullable = false)
    private int consecutiveWins = 0;

    @Column(name = "last_daily_login_date")
    private LocalDate lastDailyLoginDate;

    @Column(name = "last_daily_challenge_date")
    private LocalDate lastDailyChallengeDate;

    @Column(name = "unlocked_items", length = 1000)
    private String unlockedItems = "theme_default,avatar_default";

    @Column(name = "highest_unlocked_level", nullable = false)
    private int highestUnlockedLevel = 1;

    @Column(name = "current_solo_level", nullable = false)
    private int currentSoloLevel = 1;

    @Column(name = "solo_xp", nullable = false)
    private long soloXp = 0L;

    @Column(name = "solo_stars", nullable = false)
    private int soloStars = 0;

    @Column(name = "milestone_badges", length = 2000)
    private String milestoneBadges = "BEGINNER_INITIATE";

    @OneToMany(mappedBy = "player", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Game> games = new ArrayList<>();

    public Player() {
    }

    public Player(String username, String email, String password, String role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role != null ? role : "USER";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public long getVirtualCoins() {
        return virtualCoins;
    }

    public void setVirtualCoins(long virtualCoins) {
        this.virtualCoins = virtualCoins;
    }

    public List<Game> getGames() {
        return games;
    }

    public void setGames(List<Game> games) {
        this.games = games;
    }

    public int getConsecutiveWins() {
        return consecutiveWins;
    }

    public void setConsecutiveWins(int consecutiveWins) {
        this.consecutiveWins = consecutiveWins;
    }

    public LocalDate getLastDailyLoginDate() {
        return lastDailyLoginDate;
    }

    public void setLastDailyLoginDate(LocalDate lastDailyLoginDate) {
        this.lastDailyLoginDate = lastDailyLoginDate;
    }

    public LocalDate getLastDailyChallengeDate() {
        return lastDailyChallengeDate;
    }

    public void setLastDailyChallengeDate(LocalDate lastDailyChallengeDate) {
        this.lastDailyChallengeDate = lastDailyChallengeDate;
    }

    public String getUnlockedItems() {
        return unlockedItems;
    }

    public void setUnlockedItems(String unlockedItems) {
        this.unlockedItems = unlockedItems;
    }

    public int getHighestUnlockedLevel() {
        return Math.max(1, highestUnlockedLevel);
    }

    public void setHighestUnlockedLevel(int highestUnlockedLevel) {
        this.highestUnlockedLevel = highestUnlockedLevel;
    }

    public int getCurrentSoloLevel() {
        return Math.max(1, currentSoloLevel);
    }

    public void setCurrentSoloLevel(int currentSoloLevel) {
        this.currentSoloLevel = currentSoloLevel;
    }

    public long getSoloXp() {
        return soloXp;
    }

    public void setSoloXp(long soloXp) {
        this.soloXp = soloXp;
    }

    public int getSoloStars() {
        return soloStars;
    }

    public void setSoloStars(int soloStars) {
        this.soloStars = soloStars;
    }

    public String getMilestoneBadges() {
        return milestoneBadges != null ? milestoneBadges : "BEGINNER_INITIATE";
    }

    public void setMilestoneBadges(String milestoneBadges) {
        this.milestoneBadges = milestoneBadges;
    }
}
