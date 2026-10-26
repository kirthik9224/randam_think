package com.randomthinkinggame.config;

/**
 * Centralized, server-authoritative difficulty configuration for Multiplayer rounds.
 * Rounds 9 and 10 are designed to be significantly harder than previous rounds:
 * - Round 9 (Nightmare): Range 1-10,000,000, 3 attempts, 20s time limit, 4x reward multiplier.
 * - Round 10 (Final Boss): Range 1-1,000,000,000, 3 attempts, 15s time limit, 5x reward multiplier.
 */
public final class MultiplayerRoundConfig {

    private MultiplayerRoundConfig() {
        // Prevent instantiation
    }

    public static class RoundSetting {
        private final int roundNumber;
        private final long minNumber;
        private final long maxNumber;
        private final int attemptsPerPlayer;
        private final int timeLimitSeconds;
        private final String difficultyLabel;
        private final double rewardMultiplier;

        public RoundSetting(int roundNumber, long minNumber, long maxNumber, int attemptsPerPlayer,
                            int timeLimitSeconds, String difficultyLabel, double rewardMultiplier) {
            this.roundNumber = roundNumber;
            this.minNumber = minNumber;
            this.maxNumber = maxNumber;
            this.attemptsPerPlayer = attemptsPerPlayer;
            this.timeLimitSeconds = timeLimitSeconds;
            this.difficultyLabel = difficultyLabel;
            this.rewardMultiplier = rewardMultiplier;
        }

        public int getRoundNumber() {
            return roundNumber;
        }

        public long getMinNumber() {
            return minNumber;
        }

        public long getMaxNumber() {
            return maxNumber;
        }

        public int getAttemptsPerPlayer() {
            return attemptsPerPlayer;
        }

        public int getTimeLimitSeconds() {
            return timeLimitSeconds;
        }

        public String getDifficultyLabel() {
            return difficultyLabel;
        }

        public double getRewardMultiplier() {
            return rewardMultiplier;
        }
    }

    /**
     * Resolves the round difficulty setting based on the round number.
     * Rounds 1-8 scale progressively, while Rounds 9 & 10 represent extreme endgame challenges.
     */
    public static RoundSetting getRoundSetting(int roundNumber) {
        switch (roundNumber) {
            case 9:
                return new RoundSetting(9, 1L, 10_000_000L, 3, 20, "NIGHTMARE", 4.0);
            case 10:
                return new RoundSetting(10, 1L, 1_000_000_000L, 3, 15, "FINAL BOSS", 5.0);
            case 8:
                return new RoundSetting(8, 1L, 100_000L, 4, 25, "MYTHIC", 3.0);
            case 7:
                return new RoundSetting(7, 1L, 25_000L, 4, 30, "HEROIC", 3.0);
            case 6:
                return new RoundSetting(6, 1L, 5_000L, 5, 35, "MASTER", 2.0);
            case 5:
                return new RoundSetting(5, 1L, 1_000L, 5, 35, "EXPERT", 2.0);
            case 4:
                return new RoundSetting(4, 1L, 500L, 6, 40, "CHALLENGING", 1.5);
            case 3:
                return new RoundSetting(3, 1L, 250L, 6, 40, "MODERATE", 1.5);
            case 2:
                return new RoundSetting(2, 1L, 100L, 7, 45, "STANDARD", 1.0);
            case 1:
            default:
                return new RoundSetting(1, 1L, 50L, 7, 45, "WARM UP", 1.0);
        }
    }
}
