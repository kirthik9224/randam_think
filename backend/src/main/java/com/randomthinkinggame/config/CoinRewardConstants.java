package com.randomthinkinggame.config;

/**
 * Centralized, configurable reward constants for the Virtual Coin economy.
 * All rewards are verified and awarded strictly on the server-side.
 */
public final class CoinRewardConstants {

    private CoinRewardConstants() {
        // Prevent instantiation
    }

    // Configurable reward amounts
    public static final long DAILY_LOGIN = 50L;
    public static final long SOLO_WIN = 20L;
    public static final long LEVEL_COMPLETION = 50L;
    public static final long QUICK_MATCH_WIN = 100L;
    public static final long TEAM_BATTLE_WIN = 150L;
    public static final long STREAK_BONUS = 75L; // Bonus awarded every 3 consecutive wins
    public static final long DAILY_CHALLENGE = 100L;

    // Welcome pack for new & guest players
    public static final long STARTER_COINS = 1000L;

    // Consecutive win threshold for bonus
    public static final int STREAK_INTERVAL = 3;

    // Transaction Type Identifiers
    public static final String TX_DAILY_LOGIN = "DAILY_LOGIN";
    public static final String TX_SOLO_WIN = "SOLO_WIN";
    public static final String TX_LEVEL_COMPLETION = "LEVEL_COMPLETION";
    public static final String TX_QUICK_MATCH_WIN = "QUICK_MATCH_WIN";
    public static final String TX_TEAM_BATTLE_WIN = "TEAM_BATTLE_WIN";
    public static final String TX_STREAK_BONUS = "STREAK_BONUS";
    public static final String TX_DAILY_CHALLENGE = "DAILY_CHALLENGE";
    public static final String TX_SHOP_PURCHASE = "SHOP_PURCHASE";
    public static final String TX_MATCH_STAKE = "MATCH_STAKE";
    public static final String TX_MATCH_WIN = "MATCH_WIN";
    public static final String TX_MATCH_REFUND = "MATCH_REFUND";
    public static final String TX_WELCOME_BONUS = "WELCOME_BONUS";
}
