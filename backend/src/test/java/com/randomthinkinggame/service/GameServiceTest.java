package com.randomthinkinggame.service;

import com.randomthinkinggame.dto.GameResponse;
import com.randomthinkinggame.dto.GameStartRequest;
import com.randomthinkinggame.dto.GuessRequest;
import com.randomthinkinggame.dto.GuessResponse;
import com.randomthinkinggame.entity.Game;
import com.randomthinkinggame.entity.Player;
import com.randomthinkinggame.exception.BadRequestException;
import com.randomthinkinggame.repository.GameRepository;
import com.randomthinkinggame.repository.PlayerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class GameServiceTest {

    @Autowired
    private GameService gameService;

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private PlayerRepository playerRepository;

    private Player testPlayer;

    @BeforeEach
    void setUp() {
        testPlayer = playerRepository.findByUsername("TestPlayer")
                .or(() -> playerRepository.findByEmail("test_player@example.com"))
                .orElseGet(() -> playerRepository.save(new Player(
                        "TestPlayer",
                        "test_player@example.com",
                        "password123",
                        "USER"
                )));
    }

    @Test
    @DisplayName("Starting a game initializes correct number ranges and secret number")
    void testStartGameInitializesCorrectRange() {
        GameStartRequest req = new GameStartRequest(testPlayer.getId(), "MEDIUM", "CLASSIC", "SOLO");
        GameResponse resp = gameService.startGame(req);

        assertNotNull(resp);
        assertNotNull(resp.getGameId());
        assertEquals(1, resp.getMinNumber());
        assertEquals(100, resp.getMaxNumber());
        assertEquals(7, resp.getAttemptsAllowed());
        assertEquals(0, resp.getAttemptsUsed());
        assertEquals(7, resp.getAttemptsRemaining());
        assertEquals("IN_PROGRESS", resp.getStatus());
    }

    @Test
    @DisplayName("Guest player starting a game is smoothly handled without 404")
    void testStartGameGuestPlayerFallback() {
        GameStartRequest req = new GameStartRequest(999999L, "EASY", "CLASSIC", "SOLO");
        GameResponse resp = gameService.startGame(req);

        assertNotNull(resp);
        assertNotNull(resp.getGameId());
        assertEquals(1, resp.getMinNumber());
        assertEquals(20, resp.getMaxNumber());
        assertEquals(10, resp.getAttemptsAllowed());
    }

    @Test
    @DisplayName("Submitting guess out of range throws BadRequestException")
    void testGuessOutOfBoundsThrowsBadRequest() {
        GameStartRequest startReq = new GameStartRequest(testPlayer.getId(), "MEDIUM", "CLASSIC", "SOLO");
        GameResponse gameResp = gameService.startGame(startReq);

        // Under min
        assertThrows(BadRequestException.class, () -> {
            gameService.makeGuess(gameResp.getGameId(), new GuessRequest(0));
        });

        // Over max
        assertThrows(BadRequestException.class, () -> {
            gameService.makeGuess(gameResp.getGameId(), new GuessRequest(101));
        });
    }

    @Test
    @DisplayName("Submitting duplicate guess in same game throws BadRequestException")
    void testDuplicateGuessThrowsBadRequest() {
        GameStartRequest startReq = new GameStartRequest(testPlayer.getId(), "MEDIUM", "CLASSIC", "SOLO");
        GameResponse gameResp = gameService.startGame(startReq);

        // Find a wrong guess first
        Game game = gameRepository.findById(gameResp.getGameId()).orElseThrow();
        int wrongGuess = game.getSecretNumber() == 50 ? 49 : 50;

        GuessResponse firstGuess = gameService.makeGuess(gameResp.getGameId(), new GuessRequest(wrongGuess));
        assertNotNull(firstGuess);
        assertEquals(1, firstGuess.getAttemptsUsed());

        // Guess the exact same number again
        assertThrows(BadRequestException.class, () -> {
            gameService.makeGuess(gameResp.getGameId(), new GuessRequest(wrongGuess));
        });
    }

    @Test
    @DisplayName("Guessing the correct secret number sets status WON and awards non-negative score")
    void testCorrectGuessWinsGame() {
        GameStartRequest startReq = new GameStartRequest(testPlayer.getId(), "MEDIUM", "CLASSIC", "SOLO");
        GameResponse gameResp = gameService.startGame(startReq);

        Game game = gameRepository.findById(gameResp.getGameId()).orElseThrow();
        int secret = game.getSecretNumber();

        GuessResponse guessResp = gameService.makeGuess(gameResp.getGameId(), new GuessRequest(secret));

        assertEquals("CORRECT", guessResp.getResult());
        assertEquals("WON", guessResp.getStatus());
        assertTrue(guessResp.isGameOver());
        assertTrue(guessResp.getScore() > 0);
    }

    @Test
    @DisplayName("Power-ups enforce single-use per game and prevent infinite exploit")
    void testPowerUpSingleUseEnforcement() {
        GameStartRequest startReq = new GameStartRequest(testPlayer.getId(), "MEDIUM", "CLASSIC", "SOLO");
        GameResponse gameResp = gameService.startGame(startReq);

        // First use of shield succeeds
        Map<String, Object> shieldResult = gameService.usePowerUp(gameResp.getGameId(), "shield", 1, 100);
        assertNotNull(shieldResult);
        assertEquals(8, shieldResult.get("attemptsAllowed"));

        // Second use of shield in same game must throw BadRequestException
        assertThrows(BadRequestException.class, () -> {
            gameService.usePowerUp(gameResp.getGameId(), "shield", 1, 100);
        });

        // First use of slice50 succeeds
        Map<String, Object> sliceResult = gameService.usePowerUp(gameResp.getGameId(), "slice50", 1, 100);
        assertNotNull(sliceResult);

        // Second use of slice50 in same game must throw BadRequestException
        assertThrows(BadRequestException.class, () -> {
            gameService.usePowerUp(gameResp.getGameId(), "slice50", 1, 100);
        });
    }

    @Test
    @DisplayName("Completed game rejects further guesses")
    void testCompletedGameRejectsGuesses() {
        GameStartRequest startReq = new GameStartRequest(testPlayer.getId(), "MEDIUM", "CLASSIC", "SOLO");
        GameResponse gameResp = gameService.startGame(startReq);

        Game game = gameRepository.findById(gameResp.getGameId()).orElseThrow();
        int secret = game.getSecretNumber();

        // Win the game
        gameService.makeGuess(gameResp.getGameId(), new GuessRequest(secret));

        // Attempting to guess again on completed game must fail
        assertThrows(BadRequestException.class, () -> {
            gameService.makeGuess(gameResp.getGameId(), new GuessRequest(secret));
        });
    }
}
