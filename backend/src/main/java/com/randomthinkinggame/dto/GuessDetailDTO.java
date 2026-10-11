package com.randomthinkinggame.dto;

import java.time.LocalDateTime;

public class GuessDetailDTO {
    private Long id;
    private int guessNumber;
    private String result;
    private int attemptNumber;
    private LocalDateTime createdAt;

    public GuessDetailDTO() {
    }

    public GuessDetailDTO(Long id, int guessNumber, String result, int attemptNumber, LocalDateTime createdAt) {
        this.id = id;
        this.guessNumber = guessNumber;
        this.result = result;
        this.attemptNumber = attemptNumber;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getGuessNumber() {
        return guessNumber;
    }

    public void setGuessNumber(int guessNumber) {
        this.guessNumber = guessNumber;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public int getAttemptNumber() {
        return attemptNumber;
    }

    public void setAttemptNumber(int attemptNumber) {
        this.attemptNumber = attemptNumber;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
