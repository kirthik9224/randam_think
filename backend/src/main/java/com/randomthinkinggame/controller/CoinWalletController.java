package com.randomthinkinggame.controller;

import com.randomthinkinggame.dto.CoinWalletDTO;
import com.randomthinkinggame.dto.PurchaseRequest;
import com.randomthinkinggame.service.CoinWalletService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
public class CoinWalletController {

    private final CoinWalletService coinWalletService;

    @Autowired
    public CoinWalletController(CoinWalletService coinWalletService) {
        this.coinWalletService = coinWalletService;
    }

    @GetMapping("/{playerId}")
    public ResponseEntity<CoinWalletDTO> getWallet(@PathVariable Long playerId) {
        return ResponseEntity.ok(coinWalletService.getWallet(playerId));
    }

    @PostMapping("/{playerId}/daily-login")
    public ResponseEntity<Map<String, Object>> claimDailyLogin(@PathVariable Long playerId) {
        return ResponseEntity.ok(coinWalletService.claimDailyLogin(playerId));
    }

    @PostMapping("/{playerId}/daily-challenge")
    public ResponseEntity<Map<String, Object>> claimDailyChallenge(@PathVariable Long playerId) {
        return ResponseEntity.ok(coinWalletService.claimDailyChallenge(playerId));
    }

    @PostMapping("/{playerId}/purchase")
    public ResponseEntity<Map<String, Object>> purchaseItem(
            @PathVariable Long playerId,
            @Valid @RequestBody PurchaseRequest request) {
        return ResponseEntity.ok(coinWalletService.purchaseItem(playerId, request.getItemId()));
    }
}
