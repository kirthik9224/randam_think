package com.randomthinkinggame.dto;

public class CreateRoomRequest {
    private String matchType = "FRIENDS"; // FRIENDS, QUICK_MATCH, TEAM_BATTLE
    private String roomName;
    private long stakeAmount = 0L;
    private int maxPlayers = 4;
    private int minNumber = 1;
    private int maxNumber = 100;
    private int attemptsPerRound = 7;
    private int totalRounds = 10;
    private String team = "TEAM_RED"; // For team battle
    private String teamRedName = "Team Red";
    private String teamBlueName = "Team Blue";

    public CreateRoomRequest() {}

    public String getMatchType() {
        return matchType;
    }

    public void setMatchType(String matchType) {
        this.matchType = matchType;
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public long getStakeAmount() {
        return stakeAmount;
    }

    public void setStakeAmount(long stakeAmount) {
        this.stakeAmount = stakeAmount;
    }

    public int getMaxPlayers() {
        return maxPlayers;
    }

    public void setMaxPlayers(int maxPlayers) {
        this.maxPlayers = maxPlayers;
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

    public int getAttemptsPerRound() {
        return attemptsPerRound;
    }

    public void setAttemptsPerRound(int attemptsPerRound) {
        this.attemptsPerRound = attemptsPerRound;
    }

    public int getTotalRounds() {
        return totalRounds;
    }

    public void setTotalRounds(int totalRounds) {
        this.totalRounds = totalRounds;
    }

    public String getTeam() {
        return team;
    }

    public void setTeam(String team) {
        this.team = team;
    }

    public String getTeamRedName() {
        return teamRedName;
    }

    public void setTeamRedName(String teamRedName) {
        this.teamRedName = teamRedName;
    }

    public String getTeamBlueName() {
        return teamBlueName;
    }

    public void setTeamBlueName(String teamBlueName) {
        this.teamBlueName = teamBlueName;
    }
}
