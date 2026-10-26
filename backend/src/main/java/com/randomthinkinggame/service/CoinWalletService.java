package com.randomthinkinggame.service;

import com.randomthinkinggame.config.CoinRewardConstants;
import com.randomthinkinggame.dto.CoinWalletDTO;
import com.randomthinkinggame.dto.ShopItem;
import com.randomthinkinggame.entity.CoinTransaction;
import com.randomthinkinggame.entity.Player;
import com.randomthinkinggame.exception.BadRequestException;
import com.randomthinkinggame.exception.ResourceNotFoundException;
import com.randomthinkinggame.repository.CoinTransactionRepository;
import com.randomthinkinggame.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CoinWalletService {

    private final PlayerRepository playerRepository;
    private final CoinTransactionRepository coinTransactionRepository;

    private static final List<ShopItem> STATIC_CATALOG = List.of(
            // Themes
            new ShopItem("theme_cyberpunk", "Cyberpunk Neon", "THEME", 200L,
                    "Obsidian backdrop with glowing cyan & magenta neon accents", "bi-cpu-fill", "#06b6d4", false),
            new ShopItem("theme_casino", "Casino Royale", "THEME", 250L,
                    "Royal amber-gold trims with luxury casino glass lighting", "bi-gem", "#f59e0b", false),
            new ShopItem("theme_midnight", "Midnight Galaxy", "THEME", 300L,
                    "Cosmic deep space celestial nebula aesthetic", "bi-stars", "#6366f1", false),
            new ShopItem("theme_retro", "Retro Arcade 8-Bit", "THEME", 350L,
                    "Phosphor green vintage CRT terminal arcade style", "bi-joystick", "#10b981", false),
            new ShopItem("theme_emerald", "Emerald Forest", "THEME", 400L,
                    "Lush vibrant emerald nature theme with soft leaf accents", "bi-tree-fill", "#059669", false),

            // Avatars
            new ShopItem("avatar_ninja", "Shadow Ninja", "AVATAR", 150L,
                    "Swift silent ninja avatar badge", "🥷", "#10b981", false),
            new ShopItem("avatar_wizard", "Arcane Wizard", "AVATAR", 150L,
                    "Wise mystic wizard avatar badge", "🧙", "#8b5cf6", false),
            new ShopItem("avatar_robot", "Cyber Droid", "AVATAR", 150L,
                    "Futuristic AI robot companion badge", "🤖", "#06b6d4", false),
            new ShopItem("avatar_crown", "Royal Crown", "AVATAR", 250L,
                    "Prestigious sovereign gold crown badge", "👑", "#f59e0b", false),
            new ShopItem("avatar_alien", "Cosmic Alien", "AVATAR", 200L,
                    "Mysterious interstellar extraterrestrial badge", "👽", "#ec4899", false),
            new ShopItem("avatar_fox", "Cyber Fox", "AVATAR", 200L,
                    "Cunning stealth cyberpunk kitsune fox badge", "🦊", "#f97316", false),

            // Approved In-Game Power-Ups
            new ShopItem("powerup_oracle", "Oracle's Whisper Pack", "POWERUP", 100L,
                    "Pack of Oracle clues revealing number parity & divisibility", "🔮", "#06b6d4", false),
            new ShopItem("powerup_slice50", "50/50 Quantum Slicer Pack", "POWERUP", 100L,
                    "Pack of quantum slices eliminating 50% false candidates", "⚡", "#f59e0b", false),
            new ShopItem("powerup_shield", "Second Chance Shield Pack", "POWERUP", 120L,
                    "Pack of emergency shields providing +1 bonus attempt", "🛡️", "#10b981", false),
            new ShopItem("powerup_emp", "Turn Freeze EMP Pack", "POWERUP", 120L,
                    "Pack of turn disruptions forcing rival turns to forfeit", "⏸️", "#ef4444", false)
    );

    @Autowired
    public CoinWalletService(PlayerRepository playerRepository, CoinTransactionRepository coinTransactionRepository) {
        this.playerRepository = playerRepository;
        this.coinTransactionRepository = coinTransactionRepository;
    }

    public Player resolvePlayer(Long playerId) {
        if (playerId != null && playerId > 0 && playerId != 999999L) {
            Optional<Player> p = playerRepository.findById(playerId);
            if (p.isPresent()) {
                Player player = p.get();
                ensureStarterCoins(player);
                return player;
            }
        }

        String guestName = (playerId != null && playerId == 999999L) ? "Guest Explorer" : "Guest_" + playerId;
        return playerRepository.findByUsername(guestName)
                .or(() -> playerRepository.findByEmail("guest@randomthinkinggame.local"))
                .map(player -> {
                    ensureStarterCoins(player);
                    return player;
                })
                .orElseGet(() -> {
                    Player guest = new Player(
                            guestName,
                            "guest_" + System.currentTimeMillis() + "@randomthinkinggame.local",
                            "guest_pass",
                            "GUEST"
                    );
                    guest.setVirtualCoins(CoinRewardConstants.STARTER_COINS);
                    Player saved = playerRepository.save(guest);
                    ensureStarterCoins(saved);
                    return saved;
                });
    }

    private void ensureStarterCoins(Player player) {
        if (player.getVirtualCoins() <= 0L) {
            player.setVirtualCoins(CoinRewardConstants.STARTER_COINS);
            playerRepository.save(player);
            CoinTransaction tx = new CoinTransaction(
                    player.getId(),
                    player.getUsername(),
                    CoinRewardConstants.STARTER_COINS,
                    CoinRewardConstants.TX_WELCOME_BONUS,
                    null,
                    "Welcome starter pack of " + CoinRewardConstants.STARTER_COINS + " virtual coins",
                    CoinRewardConstants.STARTER_COINS
            );
            coinTransactionRepository.save(tx);
        }
    }

    @Transactional(readOnly = true)
    public CoinWalletDTO getWallet(Long playerId) {
        Player player = resolvePlayer(playerId);
        CoinWalletDTO dto = new CoinWalletDTO();
        dto.setPlayerId(player.getId());
        dto.setUsername(player.getUsername());
        dto.setVirtualCoins(player.getVirtualCoins());
        dto.setConsecutiveWins(player.getConsecutiveWins());

        LocalDate today = LocalDate.now();
        boolean dailyLoginClaimed = player.getLastDailyLoginDate() != null && player.getLastDailyLoginDate().isEqual(today);
        boolean dailyChallengeClaimed = player.getLastDailyChallengeDate() != null && player.getLastDailyChallengeDate().isEqual(today);

        dto.setDailyLoginClaimedToday(dailyLoginClaimed);
        dto.setDailyChallengeClaimedToday(dailyChallengeClaimed);

        Set<String> unlocked = parseUnlockedItems(player.getUnlockedItems());
        dto.setUnlockedItems(unlocked);

        List<CoinTransaction> txs = coinTransactionRepository.findByPlayerIdOrderByCreatedAtDesc(player.getId());
        dto.setTransactions(txs);

        List<ShopItem> catalog = STATIC_CATALOG.stream().map(item -> new ShopItem(
                item.getId(),
                item.getName(),
                item.getType(),
                item.getPrice(),
                item.getDescription(),
                item.getIcon(),
                item.getPreviewColor(),
                unlocked.contains(item.getId())
        )).collect(Collectors.toList());
        dto.setShopCatalog(catalog);

        return dto;
    }

    @Transactional
    public Map<String, Object> claimDailyLogin(Long playerId) {
        Player player = resolvePlayer(playerId);
        LocalDate today = LocalDate.now();

        if (player.getLastDailyLoginDate() != null && player.getLastDailyLoginDate().isEqual(today)) {
            throw new BadRequestException("Daily login reward already claimed today! Check back tomorrow.");
        }

        long reward = CoinRewardConstants.DAILY_LOGIN;
        long newBalance = player.getVirtualCoins() + reward;
        player.setVirtualCoins(newBalance);
        player.setLastDailyLoginDate(today);
        playerRepository.save(player);

        CoinTransaction tx = new CoinTransaction(
                player.getId(),
                player.getUsername(),
                reward,
                CoinRewardConstants.TX_DAILY_LOGIN,
                null,
                "Daily login bonus (+" + reward + " coins)",
                newBalance
        );
        coinTransactionRepository.save(tx);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("coinsEarned", reward);
        res.put("virtualCoins", newBalance);
        res.put("message", "Daily login reward claimed: +" + reward + " virtual coins!");
        return res;
    }

    @Transactional
    public Map<String, Object> claimDailyChallenge(Long playerId) {
        Player player = resolvePlayer(playerId);
        LocalDate today = LocalDate.now();

        if (player.getLastDailyChallengeDate() != null && player.getLastDailyChallengeDate().isEqual(today)) {
            throw new BadRequestException("Daily challenge reward already claimed today! Check back tomorrow.");
        }

        long reward = CoinRewardConstants.DAILY_CHALLENGE;
        long newBalance = player.getVirtualCoins() + reward;
        player.setVirtualCoins(newBalance);
        player.setLastDailyChallengeDate(today);
        playerRepository.save(player);

        CoinTransaction tx = new CoinTransaction(
                player.getId(),
                player.getUsername(),
                reward,
                CoinRewardConstants.TX_DAILY_CHALLENGE,
                null,
                "Daily mystery challenge completion reward (+" + reward + " coins)",
                newBalance
        );
        coinTransactionRepository.save(tx);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("coinsEarned", reward);
        res.put("virtualCoins", newBalance);
        res.put("message", "Daily mystery challenge reward claimed: +" + reward + " virtual coins!");
        return res;
    }

    @Transactional
    public Map<String, Object> recordGameResult(Long playerId, boolean won, boolean isLevelCompletion, String gameType, Long roomId) {
        Player player = resolvePlayer(playerId);
        Map<String, Object> res = new HashMap<>();

        if (!won) {
            player.setConsecutiveWins(0);
            playerRepository.save(player);
            res.put("won", false);
            res.put("coinsEarned", 0L);
            res.put("consecutiveWins", 0);
            res.put("virtualCoins", player.getVirtualCoins());
            return res;
        }

        int streak = player.getConsecutiveWins() + 1;
        player.setConsecutiveWins(streak);

        long totalEarned = 0L;
        List<String> messages = new ArrayList<>();

        // 1. Base Game Win Reward
        long baseReward;
        String baseTxType;
        String baseDesc;

        if ("QUICK_MATCH".equalsIgnoreCase(gameType)) {
            baseReward = CoinRewardConstants.QUICK_MATCH_WIN;
            baseTxType = CoinRewardConstants.TX_QUICK_MATCH_WIN;
            baseDesc = "Quick Match victory (+" + baseReward + " coins)";
        } else if ("TEAM_BATTLE".equalsIgnoreCase(gameType)) {
            baseReward = CoinRewardConstants.TEAM_BATTLE_WIN;
            baseTxType = CoinRewardConstants.TX_TEAM_BATTLE_WIN;
            baseDesc = "Team Battle victory (+" + baseReward + " coins)";
        } else {
            baseReward = CoinRewardConstants.SOLO_WIN;
            baseTxType = CoinRewardConstants.TX_SOLO_WIN;
            baseDesc = "Solo game victory (+" + baseReward + " coins)";
        }

        long currentBalance = player.getVirtualCoins() + baseReward;
        totalEarned += baseReward;
        messages.add("+" + baseReward + " coins (" + baseTxType + ")");

        CoinTransaction baseTx = new CoinTransaction(
                player.getId(),
                player.getUsername(),
                baseReward,
                baseTxType,
                roomId,
                baseDesc,
                currentBalance
        );
        coinTransactionRepository.save(baseTx);

        // 2. Level Completion Bonus
        if (isLevelCompletion) {
            long levelReward = CoinRewardConstants.LEVEL_COMPLETION;
            currentBalance += levelReward;
            totalEarned += levelReward;
            messages.add("+" + levelReward + " coins (LEVEL_COMPLETION)");

            CoinTransaction levelTx = new CoinTransaction(
                    player.getId(),
                    player.getUsername(),
                    levelReward,
                    CoinRewardConstants.TX_LEVEL_COMPLETION,
                    roomId,
                    "Level completion bonus (+" + levelReward + " coins)",
                    currentBalance
            );
            coinTransactionRepository.save(levelTx);
        }

        // 3. Consecutive Win Streak Bonus (Every 3 consecutive wins: 75 coins)
        boolean streakBonusAwarded = false;
        if (streak > 0 && streak % CoinRewardConstants.STREAK_INTERVAL == 0) {
            long streakReward = CoinRewardConstants.STREAK_BONUS;
            currentBalance += streakReward;
            totalEarned += streakReward;
            streakBonusAwarded = true;
            messages.add("+" + streakReward + " coins (3-WIN STREAK BONUS 🔥)");

            CoinTransaction streakTx = new CoinTransaction(
                    player.getId(),
                    player.getUsername(),
                    streakReward,
                    CoinRewardConstants.TX_STREAK_BONUS,
                    roomId,
                    streak + " Consecutive Wins Bonus! (+" + streakReward + " coins)",
                    currentBalance
            );
            coinTransactionRepository.save(streakTx);
        }

        player.setVirtualCoins(currentBalance);
        playerRepository.save(player);

        res.put("won", true);
        res.put("coinsEarned", totalEarned);
        res.put("virtualCoins", currentBalance);
        res.put("consecutiveWins", streak);
        res.put("streakBonusAwarded", streakBonusAwarded);
        res.put("message", String.join(", ", messages));
        return res;
    }

    @Transactional
    public void recordGameLoss(Long playerId) {
        Player player = resolvePlayer(playerId);
        if (player.getConsecutiveWins() > 0) {
            player.setConsecutiveWins(0);
            playerRepository.save(player);
        }
    }

    @Transactional
    public Map<String, Object> purchaseItem(Long playerId, String itemId) {
        Player player = resolvePlayer(playerId);

        ShopItem item = STATIC_CATALOG.stream()
                .filter(i -> i.getId().equalsIgnoreCase(itemId))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Shop item not found: " + itemId));

        Set<String> owned = parseUnlockedItems(player.getUnlockedItems());

        // Permanent items (themes & avatars) can only be unlocked once
        if (!"POWERUP".equalsIgnoreCase(item.getType()) && owned.contains(item.getId())) {
            throw new BadRequestException("You have already unlocked " + item.getName() + "!");
        }

        if (player.getVirtualCoins() < item.getPrice()) {
            throw new BadRequestException("Insufficient virtual coins. Required: " + item.getPrice()
                    + ", Available: " + player.getVirtualCoins());
        }

        long newBalance = player.getVirtualCoins() - item.getPrice();
        player.setVirtualCoins(newBalance);

        owned.add(item.getId());
        player.setUnlockedItems(String.join(",", owned));
        playerRepository.save(player);

        CoinTransaction tx = new CoinTransaction(
                player.getId(),
                player.getUsername(),
                -item.getPrice(),
                CoinRewardConstants.TX_SHOP_PURCHASE,
                null,
                "Unlocked " + item.getName() + " (" + item.getType() + ")",
                newBalance
        );
        coinTransactionRepository.save(tx);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("itemId", item.getId());
        res.put("itemName", item.getName());
        res.put("price", item.getPrice());
        res.put("virtualCoins", newBalance);
        res.put("unlockedItems", owned);
        res.put("message", "Successfully unlocked " + item.getName() + " for " + item.getPrice() + " coins!");
        return res;
    }

    private Set<String> parseUnlockedItems(String raw) {
        Set<String> set = new HashSet<>(Arrays.asList("theme_default", "avatar_default"));
        if (raw != null && !raw.trim().isEmpty()) {
            for (String token : raw.split(",")) {
                String trimmed = token.trim();
                if (!trimmed.isEmpty()) {
                    set.add(trimmed);
                }
            }
        }
        return set;
    }
}
