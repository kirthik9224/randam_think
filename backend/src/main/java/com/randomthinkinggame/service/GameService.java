package com.randomthinkinggame.service;

import com.randomthinkinggame.dto.*;
import com.randomthinkinggame.entity.Game;
import com.randomthinkinggame.entity.Guess;
import com.randomthinkinggame.entity.Player;
import com.randomthinkinggame.exception.BadRequestException;
import com.randomthinkinggame.exception.ResourceNotFoundException;
import com.randomthinkinggame.repository.GameRepository;
import com.randomthinkinggame.repository.GuessRepository;
import com.randomthinkinggame.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GameService {

    private final GameRepository gameRepository;
    private final GuessRepository guessRepository;
    private final PlayerRepository playerRepository;
    private final SecureRandom random = new SecureRandom();

    @Autowired
    public GameService(GameRepository gameRepository, GuessRepository guessRepository, PlayerRepository playerRepository) {
        this.gameRepository = gameRepository;
        this.guessRepository = guessRepository;
        this.playerRepository = playerRepository;
    }

    @Transactional
    public GameResponse startGame(GameStartRequest request) {
        Player player = null;
        if (request.getPlayerId() != null && request.getPlayerId() > 0 && request.getPlayerId() != 999999L) {
            player = playerRepository.findById(request.getPlayerId()).orElse(null);
        }
        if (player == null) {
            player = playerRepository.findByEmail("guest@randomthinkinggame.local")
                    .or(() -> playerRepository.findByUsername("Guest Explorer"))
                    .orElseGet(() -> playerRepository.save(new Player(
                            "Guest Explorer",
                            "guest@randomthinkinggame.local",
                            "guest-no-password",
                            "GUEST"
                    )));
        }

        String diff = request.getDifficulty() != null ? request.getDifficulty().toUpperCase().trim() : "MEDIUM";
        String mode = request.getGameMode() != null ? request.getGameMode().toUpperCase().trim() : "CLASSIC";
        if (!List.of("CLASSIC", "HOT_COLD", "TIME_ATTACK", "DETECTIVE", "HARDCORE").contains(mode)) {
            mode = "CLASSIC";
        }

        String playerMode = request.getPlayerMode() != null ? request.getPlayerMode().toUpperCase().trim() : "SOLO";
        List<String> validPlayerModes = List.of(
            "SOLO", "1_VS_CPU", "1P_VS_1P", "2P_VS_2CPU", "2P_VS_2P", "3P_VS_1CPU", "4P_FFA", "4P_VS_4P"
        );
        if (!validPlayerModes.contains(playerMode)) {
            playerMode = "SOLO";
        }

        int minNumber = request.getMinNumber() != null ? request.getMinNumber() : 1;
        int maxNumber;
        int attemptsAllowed;

        if (request.getMaxNumber() != null && request.getMaxNumber() > minNumber) {
            maxNumber = request.getMaxNumber();
            attemptsAllowed = request.getAttemptsAllowed() != null ? request.getAttemptsAllowed() : 7;
        } else {
            switch (diff) {
                case "EASY":
                    maxNumber = 20;
                    attemptsAllowed = 10;
                    break;
                case "HARD":
                    maxNumber = 500;
                    attemptsAllowed = 5;
                    break;
                case "EXPERT":
                    maxNumber = 1000;
                    attemptsAllowed = 3;
                    break;
                case "MEDIUM":
                default:
                    diff = "MEDIUM";
                    maxNumber = 100;
                    attemptsAllowed = 7;
                    break;
            }
        }

        // Scale attempts for team and multiplayer matches so all players have ample turns
        switch (playerMode) {
            case "2P_VS_2CPU":
            case "2P_VS_2P":
            case "3P_VS_1CPU":
            case "4P_FFA":
                attemptsAllowed = attemptsAllowed * 2;
                break;
            case "4P_VS_4P":
                attemptsAllowed = attemptsAllowed * 3;
                break;
            default:
                break;
        }

        int secretNumber = random.nextInt(maxNumber - minNumber + 1) + minNumber;

        Game game = new Game(player, diff, mode, playerMode, minNumber, maxNumber, secretNumber, attemptsAllowed);
        Game saved = gameRepository.save(game);

        return mapToGameResponse(saved);
    }

    @Transactional
    public GuessResponse makeGuess(Long gameId, GuessRequest request) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found with ID: " + gameId));

        if (!"IN_PROGRESS".equals(game.getStatus())) {
            throw new BadRequestException("Game is already finished with status: " + game.getStatus());
        }

        int guessNum = request.getGuess();
        if (guessNum < game.getMinNumber() || guessNum > game.getMaxNumber()) {
            throw new BadRequestException("Guess must be between " + game.getMinNumber() + " and " + game.getMaxNumber() + ".");
        }

        boolean alreadyGuessed = guessRepository.findByGameIdOrderByAttemptNumberAsc(gameId).stream()
                .anyMatch(g -> g.getGuessNumber() == guessNum);
        if (alreadyGuessed) {
            throw new BadRequestException("You have already guessed number " + guessNum + " in this game session.");
        }

        int attemptsUsed = game.getAttemptsUsed() + 1;
        game.setAttemptsUsed(attemptsUsed);

        int secret = game.getSecretNumber();
        String mode = game.getGameMode() != null ? game.getGameMode() : "CLASSIC";
        int totalRange = Math.max(1, game.getMaxNumber() - game.getMinNumber());
        int distance = Math.abs(guessNum - secret);
        double ratio = (double) distance / totalRange;

        String proximity;
        if (distance == 0) {
            proximity = "CORRECT";
        } else if (distance <= Math.max(3, (int) Math.round(totalRange * 0.04))) {
            proximity = "BOILING_HOT";
        } else if (ratio <= 0.12) {
            proximity = "HOT";
        } else if (ratio <= 0.25) {
            proximity = "WARM";
        } else if (ratio <= 0.50) {
            proximity = "COLD";
        } else {
            proximity = "FREEZING";
        }

        String extraClue = null;
        if ("DETECTIVE".equals(mode) && guessNum != secret) {
            extraClue = generateDetectiveClue(secret, attemptsUsed, game.getMinNumber(), game.getMaxNumber());
        }

        String result;
        String message;
        boolean gameOver = false;

        if (guessNum == secret) {
            result = "CORRECT";
            message = "Correct — you win!";
            game.setStatus("WON");
            game.setCompletedAt(LocalDateTime.now());
            int calculatedScore = calculateScore(game);
            game.setScore(calculatedScore);
            gameOver = true;
        } else if (guessNum < secret) {
            result = "TOO_LOW";
            if (attemptsUsed >= game.getAttemptsAllowed()) {
                message = "Game Over! Better luck next time. Maximum attempts reached.";
                game.setStatus("LOST");
                game.setScore(0);
                game.setCompletedAt(LocalDateTime.now());
                gameOver = true;
            } else {
                if ("HOT_COLD".equals(mode)) {
                    message = formatHotColdMessage(proximity, true);
                } else if ("HARDCORE".equals(mode)) {
                    message = "💀 DANGER: Too Low! Aim higher (" + (game.getAttemptsAllowed() - attemptsUsed) + " shot(s) left)";
                } else if ("TIME_ATTACK".equals(mode)) {
                    message = "⚡ TOO LOW! Aim higher and keep moving fast!";
                } else {
                    message = "Too Low — try a bigger number.";
                }
            }
        } else {
            result = "TOO_HIGH";
            if (attemptsUsed >= game.getAttemptsAllowed()) {
                message = "Game Over! Better luck next time. Maximum attempts reached.";
                game.setStatus("LOST");
                game.setScore(0);
                game.setCompletedAt(LocalDateTime.now());
                gameOver = true;
            } else {
                if ("HOT_COLD".equals(mode)) {
                    message = formatHotColdMessage(proximity, false);
                } else if ("HARDCORE".equals(mode)) {
                    message = "💀 DANGER: Too High! Aim lower (" + (game.getAttemptsAllowed() - attemptsUsed) + " shot(s) left)";
                } else if ("TIME_ATTACK".equals(mode)) {
                    message = "⚡ TOO HIGH! Aim lower and keep moving fast!";
                } else {
                    message = "Too High — try a smaller number.";
                }
            }
        }

        Guess guessEntity = new Guess(game, guessNum, result, attemptsUsed);
        guessRepository.save(guessEntity);
        gameRepository.save(game);

        int remaining = Math.max(0, game.getAttemptsAllowed() - attemptsUsed);

        return new GuessResponse(
                result,
                message,
                attemptsUsed,
                remaining,
                game.getScore(),
                game.getStatus(),
                game.getId(),
                gameOver,
                guessNum,
                attemptsUsed,
                guessEntity.getCreatedAt(),
                mode,
                proximity,
                extraClue,
                distance
        );
    }

    private String formatHotColdMessage(String proximity, boolean aimHigher) {
        String dir = aimHigher ? "Aim slightly higher" : "Aim slightly lower";
        String dirFar = aimHigher ? "Aim much higher" : "Aim much lower";
        switch (proximity) {
            case "BOILING_HOT":
                return "🌋 BOILING HOT! You are right next to it! (" + dir + ")";
            case "HOT":
                return "🔥 HOT! Very close! (" + dir + ")";
            case "WARM":
                return "🌤️ WARM! In the right zone! (" + dir + ")";
            case "COLD":
                return "❄️ CHILLY! Quite far! (" + dirFar + ")";
            case "FREEZING":
            default:
                return "🧊 FREEZING COLD! Way off! (" + dirFar + ")";
        }
    }

    private String generateDetectiveClue(int secret, int attempt, int min, int max) {
        switch (attempt) {
            case 1:
                return "🕵️ Clue #1: The secret number is " + (secret % 2 == 0 ? "EVEN." : "ODD.");
            case 2:
                if (secret % 10 == 0) return "🕵️ Clue #2: The secret number is a multiple of 10.";
                if (secret % 5 == 0) return "🕵️ Clue #2: The secret number is divisible by 5.";
                if (secret % 3 == 0) return "🕵️ Clue #2: The secret number is divisible by 3.";
                if (secret % 7 == 0) return "🕵️ Clue #2: The secret number is divisible by 7.";
                if (isPrime(secret)) return "🕵️ Clue #2: The secret number is a PRIME number!";
                return "🕵️ Clue #2: The secret number is NOT divisible by 3 or 5.";
            case 3:
                int sum = 0, temp = secret;
                while (temp > 0) {
                    sum += temp % 10;
                    temp /= 10;
                }
                return "🕵️ Clue #3: The sum of digits of the secret number is " + sum + ".";
            case 4:
                return "🕵️ Clue #4: The secret number ends with the digit " + (secret % 10) + ".";
            default:
                int lowerTens = (secret / 10) * 10;
                int upperTens = lowerTens + 9;
                return "🕵️ Clue #" + attempt + ": The secret number lies between " + Math.max(min, lowerTens) + " and " + Math.min(max, upperTens) + ".";
        }
    }

    private boolean isPrime(int n) {
        if (n <= 1) return false;
        if (n <= 3) return true;
        if (n % 2 == 0 || n % 3 == 0) return false;
        for (int i = 5; i * i <= n; i += 6) {
            if (n % i == 0 || n % (i + 2) == 0) return false;
        }
        return true;
    }

    @Transactional(readOnly = true)
    public GameResponse getGame(Long gameId) {
        Game game = gameRepository.findByIdWithPlayer(gameId)
                .or(() -> gameRepository.findById(gameId))
                .orElseThrow(() -> new ResourceNotFoundException("Game not found with ID: " + gameId));
        return mapToGameResponse(game);
    }

    @Transactional
    public GameResponse restartGame(Long gameId) {
        Game previousGame = gameRepository.findById(gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found with ID: " + gameId));

        GameStartRequest startRequest = new GameStartRequest(
                previousGame.getPlayer().getId(),
                previousGame.getDifficulty(),
                previousGame.getGameMode(),
                previousGame.getPlayerMode()
        );
        return startGame(startRequest);
    }

    @Transactional(readOnly = true)
    public List<GameResponse> getPlayerHistory(Long playerId) {
        if (playerId == null || !playerRepository.existsById(playerId)) {
            // Gracefully return empty list for guests / new players instead of 404
            return List.of();
        }
        List<Game> games = gameRepository.findByPlayerIdOrderByStartedAtDesc(playerId);
        return games.stream().map(this::mapToGameResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GameResultResponse getGameResult(Long gameId) {
        Game game = gameRepository.findByIdWithPlayer(gameId)
                .or(() -> gameRepository.findById(gameId))
                .orElseThrow(() -> new ResourceNotFoundException("Game not found with ID: " + gameId));

        long timeTakenSeconds = 0;
        if (game.getCompletedAt() != null && game.getStartedAt() != null) {
            timeTakenSeconds = Duration.between(game.getStartedAt(), game.getCompletedAt()).getSeconds();
        }

        String msg = "WON".equalsIgnoreCase(game.getStatus()) ?
                "Congratulations! You won with a score of " + game.getScore() :
                "Game Over! Better luck next time.";

        return new GameResultResponse(
                game.getId(),
                game.getStatus(),
                game.getDifficulty(),
                game.getGameMode() != null ? game.getGameMode() : "CLASSIC",
                game.getPlayerMode() != null ? game.getPlayerMode() : "SOLO",
                game.getScore(),
                game.getAttemptsUsed(),
                game.getAttemptsAllowed(),
                timeTakenSeconds,
                msg,
                game.getCompletedAt()
        );
    }

    private int calculateScore(Game game) {
        int baseScore;
        int multiplier;
        switch (game.getDifficulty()) {
            case "EASY":
                baseScore = 1000;
                multiplier = 1;
                break;
            case "HARD":
                baseScore = 5000;
                multiplier = 4;
                break;
            case "EXPERT":
                baseScore = 10000;
                multiplier = 8;
                break;
            case "MEDIUM":
            default:
                baseScore = 2500;
                multiplier = 2;
                break;
        }

        // Attempt deduction
        double penaltyPerExtraAttempt = (double) baseScore / (game.getAttemptsAllowed() * 1.5);
        double attemptPenalty = (game.getAttemptsUsed() - 1) * penaltyPerExtraAttempt;

        // Time deduction
        long secondsElapsed = 0;
        if (game.getCompletedAt() != null && game.getStartedAt() != null) {
            secondsElapsed = Math.max(0, Duration.between(game.getStartedAt(), game.getCompletedAt()).getSeconds());
        }
        double timePenalty = secondsElapsed * 3.0 * multiplier;

        // Mode multiplier
        double modeMultiplier = 1.0;
        String mode = game.getGameMode() != null ? game.getGameMode() : "CLASSIC";
        if ("HARDCORE".equals(mode)) {
            modeMultiplier = 3.0; // 3x multiplier for Sudden Death
        } else if ("DETECTIVE".equals(mode)) {
            modeMultiplier = 1.3; // 30% bonus for Detective Clue mode
        } else if ("TIME_ATTACK".equals(mode)) {
            modeMultiplier = 1.5; // 50% bonus for Blitz Time Attack
        }

        int finalScore = (int) Math.round((baseScore - attemptPenalty - timePenalty) * modeMultiplier);
        int minimumScore = (int) Math.round(200 * multiplier * modeMultiplier);

        return Math.max(minimumScore, finalScore);
    }

    @Transactional
    public Map<String, Object> usePowerUp(Long gameId, String type, int currentMin, int currentMax) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found with ID: " + gameId));

        if (!"IN_PROGRESS".equals(game.getStatus())) {
            throw new BadRequestException("Game is not in progress.");
        }

        int secret = game.getSecretNumber();
        Map<String, Object> result = new HashMap<>();
        result.put("powerUpType", type);

        switch (type.toLowerCase()) {
            case "slice50":
                if (game.isSlice50Used()) {
                    throw new BadRequestException("Quantum Slice power-up has already been used in this game.");
                }
                game.setSlice50Used(true);
                int min = Math.max(game.getMinNumber(), currentMin);
                int max = Math.min(game.getMaxNumber(), currentMax);
                int lowerFalseSpan = Math.max(0, secret - min);
                int upperFalseSpan = Math.max(0, max - secret);

                int newMin = min;
                int newMax = max;
                String slicedDirection;
                int slicedCount;

                if (upperFalseSpan >= lowerFalseSpan && upperFalseSpan > 1) {
                    slicedDirection = "UPPER";
                    int cut = upperFalseSpan / 2;
                    newMax = max - cut;
                    slicedCount = cut;
                } else if (lowerFalseSpan > 1) {
                    slicedDirection = "LOWER";
                    int cut = lowerFalseSpan / 2;
                    newMin = min + cut;
                    slicedCount = cut;
                } else {
                    slicedDirection = "NONE";
                    slicedCount = 0;
                }

                gameRepository.save(game);
                result.put("newMin", newMin);
                result.put("newMax", newMax);
                result.put("slicedDirection", slicedDirection);
                result.put("slicedCount", slicedCount);
                result.put("message", "Quantum Cleaver vaporized " + slicedCount + " false candidate numbers!");
                break;

            case "oracle":
                if (game.isOracleUsed()) {
                    throw new BadRequestException("Oracle Clue power-up has already been used in this game.");
                }
                game.setOracleUsed(true);
                gameRepository.save(game);

                String clue;
                if (secret % 2 == 0) {
                    clue = "The secret number is EVEN.";
                } else {
                    clue = "The secret number is ODD.";
                }

                if (secret % 10 == 0) {
                    clue += " It is also a multiple of 10.";
                } else if (secret % 5 == 0) {
                    clue += " It is also divisible by 5.";
                } else if (secret % 3 == 0) {
                    clue += " It is also divisible by 3.";
                } else if (isPrime(secret)) {
                    clue += " It is a PRIME number!";
                }

                int sum = 0, temp = secret;
                while (temp > 0) {
                    sum += temp % 10;
                    temp /= 10;
                }
                clue += " (Sum of digits = " + sum + ")";

                result.put("clue", clue);
                result.put("message", "Oracle revealed: " + clue);
                break;

            case "shield":
                if (game.isShieldUsed()) {
                    throw new BadRequestException("Second Chance Shield power-up has already been used in this game.");
                }
                game.setShieldUsed(true);
                game.setAttemptsAllowed(game.getAttemptsAllowed() + 1);
                gameRepository.save(game);
                result.put("attemptsAllowed", game.getAttemptsAllowed());
                result.put("attemptsRemaining", Math.max(0, game.getAttemptsAllowed() - game.getAttemptsUsed()));
                result.put("message", "Second Chance Shield granted +1 bonus attempt!");
                break;

            case "empfreeze":
                if (game.isEmpFreezeUsed()) {
                    throw new BadRequestException("Turn Freeze power-up has already been used in this game.");
                }
                game.setEmpFreezeUsed(true);
                gameRepository.save(game);
                result.put("message", "Turn Freeze activated! Opponent's next turn has been skipped!");
                break;

            default:
                throw new BadRequestException("Unknown power-up type: " + type);
        }

        return result;
    }

    public GameResponse mapToGameResponse(Game game) {
        GameResponse resp = new GameResponse();
        resp.setGameId(game.getId());
        if (game.getPlayer() != null) {
            resp.setPlayerId(game.getPlayer().getId());
            try {
                resp.setUsername(game.getPlayer().getUsername());
            } catch (Exception e) {
                resp.setUsername("Player");
            }
        }
        resp.setDifficulty(game.getDifficulty());
        resp.setGameMode(game.getGameMode() != null ? game.getGameMode() : "CLASSIC");
        resp.setPlayerMode(game.getPlayerMode() != null ? game.getPlayerMode() : "SOLO");
        resp.setMinNumber(game.getMinNumber());
        resp.setMaxNumber(game.getMaxNumber());
        resp.setAttemptsAllowed(game.getAttemptsAllowed());
        resp.setAttemptsUsed(game.getAttemptsUsed());
        resp.setAttemptsRemaining(Math.max(0, game.getAttemptsAllowed() - game.getAttemptsUsed()));
        resp.setScore(game.getScore());
        resp.setStatus(game.getStatus());
        resp.setStartedAt(game.getStartedAt());
        resp.setCompletedAt(game.getCompletedAt());

        if (game.getCompletedAt() != null && game.getStartedAt() != null) {
            resp.setTimeTakenSeconds(Duration.between(game.getStartedAt(), game.getCompletedAt()).getSeconds());
        } else if (game.getStartedAt() != null) {
            resp.setTimeTakenSeconds(Duration.between(game.getStartedAt(), LocalDateTime.now()).getSeconds());
        }

        List<Guess> guesses = guessRepository.findByGameIdOrderByAttemptNumberAsc(game.getId());
        List<GuessDetailDTO> guessDTOs = guesses.stream()
                .map(g -> new GuessDetailDTO(g.getId(), g.getGuessNumber(), g.getResult(), g.getAttemptNumber(), g.getCreatedAt()))
                .collect(Collectors.toList());
        resp.setGuesses(guessDTOs);

        return resp;
    }
}
