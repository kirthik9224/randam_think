package com.randomthinkinggame.config;

/**
 * Configuration data transfer object for a dynamically generated Solo Level.
 * Supports levels 1 through 5,000 with fair, progressive scaling.
 */
public class SoloLevelConfig {

    private int level;
    private String title;
    private String stage;
    private String stageName;
    private long minNumber;
    private long maxNumber;
    private int attemptsAllowed;
    private Integer timeLimitSeconds; // Optional timer (seconds)
    private int xpReward;
    private long coinReward;
    private boolean isMilestone;
    private String milestoneBadge;
    private String themeColor;
    private String difficulty;

    public SoloLevelConfig() {}

    public SoloLevelConfig(int level, String title, String stage, String stageName,
                           long minNumber, long maxNumber, int attemptsAllowed,
                           Integer timeLimitSeconds, int xpReward, long coinReward,
                           boolean isMilestone, String milestoneBadge,
                           String themeColor, String difficulty) {
        this.level = level;
        this.title = title;
        this.stage = stage;
        this.stageName = stageName;
        this.minNumber = minNumber;
        this.maxNumber = maxNumber;
        this.attemptsAllowed = attemptsAllowed;
        this.timeLimitSeconds = timeLimitSeconds;
        this.xpReward = xpReward;
        this.coinReward = coinReward;
        this.isMilestone = isMilestone;
        this.milestoneBadge = milestoneBadge;
        this.themeColor = themeColor;
        this.difficulty = difficulty;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getStage() {
        return stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public String getStageName() {
        return stageName;
    }

    public void setStageName(String stageName) {
        this.stageName = stageName;
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

    public int getAttemptsAllowed() {
        return attemptsAllowed;
    }

    public void setAttemptsAllowed(int attemptsAllowed) {
        this.attemptsAllowed = attemptsAllowed;
    }

    public Integer getTimeLimitSeconds() {
        return timeLimitSeconds;
    }

    public void setTimeLimitSeconds(Integer timeLimitSeconds) {
        this.timeLimitSeconds = timeLimitSeconds;
    }

    public int getXpReward() {
        return xpReward;
    }

    public void setXpReward(int xpReward) {
        this.xpReward = xpReward;
    }

    public long getCoinReward() {
        return coinReward;
    }

    public void setCoinReward(long coinReward) {
        this.coinReward = coinReward;
    }

    public boolean isMilestone() {
        return isMilestone;
    }

    public void setMilestone(boolean milestone) {
        isMilestone = milestone;
    }

    public String getMilestoneBadge() {
        return milestoneBadge;
    }

    public void setMilestoneBadge(String milestoneBadge) {
        this.milestoneBadge = milestoneBadge;
    }

    public String getThemeColor() {
        return themeColor;
    }

    public void setThemeColor(String themeColor) {
        this.themeColor = themeColor;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }
}
