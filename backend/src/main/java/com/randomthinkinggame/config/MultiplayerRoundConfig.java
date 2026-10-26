package com.randomthinkinggame.config;

/**
 * Server-authoritative difficulty and risk configuration for exactly 10-round Multiplayer matches.
 *
 * Specific Configuration:
 * Round 1: range 1–20, 8 attempts, 45s timer, 1x virtual reward multiplier.
 * Round 2: range 1–50, 8 attempts, 45s timer, 1.1x multiplier.
 * Round 3: range 1–100, 7 attempts, 40s timer, 1.25x multiplier.
 * Round 4: range 1–250, 7 attempts, 40s timer, 1.5x multiplier.
 * Round 5: range 1–500, 6 attempts, 35s timer, 1.75x multiplier.
 * Round 6: range 1–1,000, 6 attempts, 35s timer, 2x multiplier.
 * Round 7: range 1–5,000, 5 attempts, 30s timer, 2.5x multiplier.
 * Round 8: range 1–10,000, 5 attempts, 25s timer, 3x multiplier.
 * Round 9: range 1–100,000, 4 attempts, 20s timer, 4x multiplier.
 * Round 10: range 1–1,000,000, 3 attempts, 15s timer, 5x multiplier.
 */
public final class MultiplayerRoundConfig {

    public static final int TOTAL_MATCH_ROUNDS = 10;

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
     * Resolves the round difficulty setting for each of the 10 multiplayer rounds.
     */
    public static RoundSetting getRoundSetting(int roundNumber) {
        switch (roundNumber) {
            case 10:
                return new RoundSetting(10, 1L, 1_000_000L, 3, 15, "FINAL BOSS", 5.0);
            case 9:
                return new RoundSetting(9, 1L, 100_000L, 4, 20, "NIGHTMARE", 4.0);
            case 8:
                return new RoundSetting(8, 1L, 10_000L, 5, 25, "MYTHIC", 3.0);
            case 7:
                return new RoundSetting(7, 1L, 5_000L, 5, 30, "HEROIC", 2.5);
            case 6:
                return new RoundSetting(6, 1L, 1_000L, 6, 35, "MASTER", 2.0);
            case 5:
                return new RoundSetting(5, 1L, 500L, 6, 35, "EXPERT", 1.75);
            case 4:
                return new RoundSetting(4, 1L, 250L, 7, 40, "CHALLENGING", 1.5);
            case 3:
                return new RoundSetting(3, 1L, 100L, 7, 40, "MODERATE", 1.25);
            case 2:
                return new RoundSetting(2, 1L, 50L, 8, 45, "STANDARD", 1.1);
            case 1:
            default:
                return new RoundSetting(1, 1L, 20L, 8, 45, "WARM UP", 1.0);
        }
    }
}
