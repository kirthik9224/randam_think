package com.randomthinkinggame.service;

import com.randomthinkinggame.config.SoloLevelConfig;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Reusable, dynamic level-generation service supporting exactly 5,000 solo levels.
 * Divided into 7 stages:
 * - Levels 1–100: Beginner (up to 100)
 * - Levels 101–500: Intermediate (up to 1,000)
 * - Levels 501–1,000: Advanced (up to 10,000)
 * - Levels 1,001–2,000: Expert (up to 100,000)
 * - Levels 2,001–3,000: Master (up to 1,000,000)
 * - Levels 3,001–4,000: Grandmaster (up to 10,000,000)
 * - Levels 4,001–5,000: Legend (up to 1,000,000,000)
 *
 * Scales difficulty gradually and mathematically without hardcoding 5,000 rows.
 */
@Service
public class SoloLevelConfigService {

    public static final int MAX_LEVEL = 5000;

    public SoloLevelConfig getLevelConfig(int level) {
        int safeLevel = Math.max(1, Math.min(level, MAX_LEVEL));

        String stage;
        String stageName;
        String themeColor;
        String difficulty;
        long stageMinRange;
        long stageMaxRange;
        int stageStart;
        int stageEnd;
        int stageIndex;

        if (safeLevel <= 100) {
            stage = "BEGINNER";
            stageName = "Beginner";
            themeColor = "#10b981"; // Emerald
            difficulty = safeLevel <= 30 ? "EASY" : "MEDIUM";
            stageMinRange = 10L;
            stageMaxRange = 100L;
            stageStart = 1;
            stageEnd = 100;
            stageIndex = 1;
        } else if (safeLevel <= 500) {
            stage = "INTERMEDIATE";
            stageName = "Intermediate";
            themeColor = "#06b6d4"; // Cyan
            difficulty = "MEDIUM";
            stageMinRange = 100L;
            stageMaxRange = 1_000L;
            stageStart = 101;
            stageEnd = 500;
            stageIndex = 2;
        } else if (safeLevel <= 1000) {
            stage = "ADVANCED";
            stageName = "Advanced";
            themeColor = "#3b82f6"; // Blue
            difficulty = "HARD";
            stageMinRange = 1_000L;
            stageMaxRange = 10_000L;
            stageStart = 501;
            stageEnd = 1000;
            stageIndex = 3;
        } else if (safeLevel <= 2000) {
            stage = "EXPERT";
            stageName = "Expert";
            themeColor = "#8b5cf6"; // Purple
            difficulty = "EXPERT";
            stageMinRange = 10_000L;
            stageMaxRange = 100_000L;
            stageStart = 1001;
            stageEnd = 2000;
            stageIndex = 4;
        } else if (safeLevel <= 3000) {
            stage = "MASTER";
            stageName = "Master";
            themeColor = "#ec4899"; // Pink
            difficulty = "MASTER";
            stageMinRange = 100_000L;
            stageMaxRange = 1_000_000L;
            stageStart = 2001;
            stageEnd = 3000;
            stageIndex = 5;
        } else if (safeLevel <= 4000) {
            stage = "GRANDMASTER";
            stageName = "Grandmaster";
            themeColor = "#f97316"; // Orange
            difficulty = "NIGHTMARE";
            stageMinRange = 1_000_000L;
            stageMaxRange = 10_000_000L;
            stageStart = 3001;
            stageEnd = 4000;
            stageIndex = 6;
        } else {
            stage = "LEGEND";
            stageName = "Legend";
            themeColor = "#ef4444"; // Crimson Red
            difficulty = "FINAL BOSS";
            stageMinRange = 10_000_000L;
            stageMaxRange = 1_000_000_000L;
            stageStart = 4001;
            stageEnd = 5000;
            stageIndex = 7;
        }

        // Fractional position inside stage [0.0, 1.0]
        double fraction = (stageEnd == stageStart)
                ? 1.0
                : (double) (safeLevel - stageStart) / (double) (stageEnd - stageStart);

        // Smooth logarithmic interpolation for range
        double logMin = Math.log10(stageMinRange);
        double logMax = Math.log10(stageMaxRange);
        double currentLog = logMin + fraction * (logMax - logMin);
        long maxNumber = Math.round(Math.pow(10, currentLog));

        // Ensure bounds
        if (safeLevel == stageStart) maxNumber = stageMinRange;
        if (safeLevel == stageEnd) maxNumber = stageMaxRange;
        if (maxNumber < 10) maxNumber = 10;

        // Binary search optimal attempts calculation: ceil(log2(maxNumber))
        int optimalAttempts = (int) Math.ceil(Math.log(maxNumber) / Math.log(2));

        // Determine milestone
        boolean isMilestone = (safeLevel % 50 == 0) || safeLevel == 1 || safeLevel == MAX_LEVEL;
        String milestoneBadge = null;

        if (safeLevel == 100) milestoneBadge = "Beginner Graduate";
        else if (safeLevel == 500) milestoneBadge = "Intermediate Tactician";
        else if (safeLevel == 1000) milestoneBadge = "Advanced Solver";
        else if (safeLevel == 2000) milestoneBadge = "Expert Analyst";
        else if (safeLevel == 3000) milestoneBadge = "Master Mind";
        else if (safeLevel == 4000) milestoneBadge = "Grandmaster Oracle";
        else if (safeLevel == 5000) milestoneBadge = "The Living Legend";
        else if (safeLevel % 250 == 0) milestoneBadge = "Stage Milestone " + safeLevel;

        // Attempts adjustment: slightly generous in early levels, tightening at higher levels
        int attemptsAllowed;
        if (safeLevel <= 10) {
            attemptsAllowed = Math.max(5, optimalAttempts + 2);
        } else if (safeLevel <= 100) {
            attemptsAllowed = Math.max(6, optimalAttempts + 1);
        } else if (safeLevel <= 1000) {
            attemptsAllowed = Math.max(7, optimalAttempts + (isMilestone ? 0 : 1));
        } else if (safeLevel <= 3000) {
            attemptsAllowed = Math.max(8, optimalAttempts);
        } else {
            attemptsAllowed = Math.max(8, optimalAttempts - (isMilestone ? 1 : 0));
        }

        // Optional timer for milestone & endgame challenges
        Integer timeLimitSeconds = null;
        if (safeLevel >= 1001 && isMilestone) {
            timeLimitSeconds = safeLevel >= 4001 ? 30 : safeLevel >= 2001 ? 45 : 60;
        }

        // Rewards calculation
        int xpReward = safeLevel * 10;
        long coinReward = 50L + (stageIndex * 25L) + (isMilestone ? 100L : 0L);

        String title = stageName + " " + safeLevel;
        if (isMilestone) {
            title += " ★ Milestone";
        }

        return new SoloLevelConfig(
                safeLevel,
                title,
                stage,
                stageName,
                1L,
                maxNumber,
                attemptsAllowed,
                timeLimitSeconds,
                xpReward,
                coinReward,
                isMilestone,
                milestoneBadge,
                themeColor,
                difficulty
        );
    }

    /**
     * Returns a paginated slice of levels (e.g. 50 levels per page) for map rendering.
     */
    public List<SoloLevelConfig> getLevelRange(int startLevel, int count) {
        int start = Math.max(1, startLevel);
        int end = Math.min(MAX_LEVEL, start + count - 1);
        List<SoloLevelConfig> list = new ArrayList<>(end - start + 1);
        for (int i = start; i <= end; i++) {
            list.add(getLevelConfig(i));
        }
        return list;
    }
}
