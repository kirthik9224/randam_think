package com.randomthinkinggame.dto;

import jakarta.validation.constraints.NotBlank;

public class PurchaseRequest {

    @NotBlank(message = "Item ID is required")
    private String itemId;

    public PurchaseRequest() {
    }

    public PurchaseRequest(String itemId) {
        this.itemId = itemId;
    }

    public String getItemId() {
        return itemId;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }
}
