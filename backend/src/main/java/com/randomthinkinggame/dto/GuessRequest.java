package com.randomthinkinggame.dto;

import jakarta.validation.constraints.NotNull;

public class GuessRequest {

    @NotNull(message = "Guess number is required")
    private Long guess;

    public GuessRequest() {
    }

    public GuessRequest(Long guess) {
        this.guess = guess;
    }

    public Long getGuess() {
        return guess;
    }

    public void setGuess(Long guess) {
        this.guess = guess;
    }
}
