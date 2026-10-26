package com.randomthinkinggame.dto;

public class MultiplayerGuessRequest {
    private long guess;

    public MultiplayerGuessRequest() {}

    public MultiplayerGuessRequest(long guess) {
        this.guess = guess;
    }

    public long getGuess() {
        return guess;
    }

    public void setGuess(long guess) {
        this.guess = guess;
    }
}
