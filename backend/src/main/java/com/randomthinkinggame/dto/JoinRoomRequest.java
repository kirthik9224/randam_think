package com.randomthinkinggame.dto;

public class JoinRoomRequest {
    private String roomCode;
    private String team = "SOLO"; // SOLO, TEAM_RED, TEAM_BLUE

    public JoinRoomRequest() {}

    public String getRoomCode() {
        return roomCode;
    }

    public void setRoomCode(String roomCode) {
        this.roomCode = roomCode;
    }

    public String getTeam() {
        return team;
    }

    public void setTeam(String team) {
        this.team = team;
    }
}
