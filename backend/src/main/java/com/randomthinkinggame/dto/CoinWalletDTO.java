package com.randomthinkinggame.dto;

import com.randomthinkinggame.entity.CoinTransaction;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class CoinWalletDTO {
    private Long playerId;
    private String username;
    private long virtualCoins;
    private int consecutiveWins;
    private boolean dailyLoginClaimedToday;
    private boolean dailyChallengeClaimedToday;
    private Set<String> unlockedItems;
    private List<CoinTransaction> transactions = new ArrayList<>();
    private List<ShopItem> shopCatalog = new ArrayList<>();

    public CoinWalletDTO() {
    }

    public Long getPlayerId() {
        return playerId;
    }

    public void setPlayerId(Long playerId) {
        this.playerId = playerId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public long getVirtualCoins() {
        return virtualCoins;
    }

    public void setVirtualCoins(long virtualCoins) {
        this.virtualCoins = virtualCoins;
    }

    public int getConsecutiveWins() {
        return consecutiveWins;
    }

    public void setConsecutiveWins(int consecutiveWins) {
        this.consecutiveWins = consecutiveWins;
    }

    public boolean isDailyLoginClaimedToday() {
        return dailyLoginClaimedToday;
    }

    public void setDailyLoginClaimedToday(boolean dailyLoginClaimedToday) {
        this.dailyLoginClaimedToday = dailyLoginClaimedToday;
    }

    public boolean isDailyChallengeClaimedToday() {
        return dailyChallengeClaimedToday;
    }

    public void setDailyChallengeClaimedToday(boolean dailyChallengeClaimedToday) {
        this.dailyChallengeClaimedToday = dailyChallengeClaimedToday;
    }

    public Set<String> getUnlockedItems() {
        return unlockedItems;
    }

    public void setUnlockedItems(Set<String> unlockedItems) {
        this.unlockedItems = unlockedItems;
    }

    public List<CoinTransaction> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<CoinTransaction> transactions) {
        this.transactions = transactions;
    }

    public List<ShopItem> getShopCatalog() {
        return shopCatalog;
    }

    public void setShopCatalog(List<ShopItem> shopCatalog) {
        this.shopCatalog = shopCatalog;
    }
}
