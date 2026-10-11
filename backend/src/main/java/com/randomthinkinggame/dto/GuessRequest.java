package com.randomthinkinggame.dto;

import jakarta.validation.constraints.NotNull;

public class GuessRequest {

    @NotNull(message = "Guess number is required")
    private Integer guess;

    public GuessRequest() {
    }

    public GuessRequest(Integer guess) {
        this.guess = guess;
    }

    public Integer getGuess() {
        return guess;
    }

    public void setGuess(Integer guess) {
        this.guess = guess;
    }
}
