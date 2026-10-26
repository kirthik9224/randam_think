package com.randomthinkinggame.dto;

public class MultiplayerGuessRequest {
    private int guess;

    public MultiplayerGuessRequest() {}

    public MultiplayerGuessRequest(int guess) {
        this.guess = guess;
    }

    public int getGuess() {
        return guess;
    }

    public void setGuess(int guess) {
        this.guess = guess;
    }
}
