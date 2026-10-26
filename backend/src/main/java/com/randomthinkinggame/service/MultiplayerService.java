package com.randomthinkinggame.service;

import com.randomthinkinggame.config.MultiplayerRoundConfig;
import com.randomthinkinggame.dto.CreateRoomRequest;
import com.randomthinkinggame.dto.JoinRoomRequest;
import com.randomthinkinggame.dto.MultiplayerRoomDTO;
import com.randomthinkinggame.entity.CoinTransaction;
import com.randomthinkinggame.entity.MultiplayerGuess;
import com.randomthinkinggame.entity.MultiplayerRoom;
import com.randomthinkinggame.entity.Player;
import com.randomthinkinggame.entity.RoomPlayer;
import com.randomthinkinggame.exception.BadRequestException;
import com.randomthinkinggame.exception.ResourceNotFoundException;
import com.randomthinkinggame.repository.CoinTransactionRepository;
import com.randomthinkinggame.repository.MultiplayerGuessRepository;
import com.randomthinkinggame.repository.MultiplayerRoomRepository;
import com.randomthinkinggame.repository.PlayerRepository;
import com.randomthinkinggame.repository.RoomPlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MultiplayerService {

    private final MultiplayerRoomRepository roomRepository;
    private final RoomPlayerRepository roomPlayerRepository;
    private final MultiplayerGuessRepository guessRepository;
    private final PlayerRepository playerRepository;
    private final CoinTransactionRepository coinTransactionRepository;
    private final CoinWalletService coinWalletService;
    private final SimpMessagingTemplate messagingTemplate;

    private final SecureRandom secureRandom = new SecureRandom();
    private static final String ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final String[] AVATAR_COLORS = {"#38bdf8", "#f43f5e", "#a855f7", "#22c55e", "#eab308", "#ec4899", "#06b6d4"};

    @Autowired
    public MultiplayerService(
            MultiplayerRoomRepository roomRepository,
            RoomPlayerRepository roomPlayerRepository,
            MultiplayerGuessRepository guessRepository,
            PlayerRepository playerRepository,
            CoinTransactionRepository coinTransactionRepository,
            CoinWalletService coinWalletService,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.roomRepository = roomRepository;
        this.roomPlayerRepository = roomPlayerRepository;
        this.guessRepository = guessRepository;
        this.playerRepository = playerRepository;
        this.coinTransactionRepository = coinTransactionRepository;
        this.coinWalletService = coinWalletService;
        this.messagingTemplate = messagingTemplate;
    }

    private String generateUniqueRoomCode() {
        for (int attempts = 0; attempts < 50; attempts++) {
            StringBuilder sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                int index = secureRandom.nextInt(ROOM_CODE_CHARS.length());
                sb.append(ROOM_CODE_CHARS.charAt(index));
            }
            String code = sb.toString();
            if (!roomRepository.existsByRoomCode(code)) {
                return code;
            }
        }
        return UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    private long generateSecretNumber(long min, long max) {
        if (min >= max) return min;
        long range = max - min + 1;
        long secret = min + (long)(secureRandom.nextDouble() * range);
        if (secret > max) secret = max;
        if (secret < min) secret = min;
        return secret;
    }

    private void broadcastRoomUpdate(MultiplayerRoom room) {
        try {
            List<MultiplayerGuess> guesses = guessRepository.findByRoomIdOrderByCreatedAtAsc(room.getId());
            MultiplayerRoomDTO dto = new MultiplayerRoomDTO(room, guesses);
            messagingTemplate.convertAndSend("/topic/room/" + room.getRoomCode(), dto);
        } catch (Exception e) {
            // Log without failing transaction
            System.err.println("Failed to broadcast room update: " + e.getMessage());
        }
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
                    guest.setVirtualCoins(1000L);
                    Player saved = playerRepository.save(guest);
                    ensureStarterCoins(saved);
                    return saved;
                });
    }

    private void ensureStarterCoins(Player player) {
        if (player.getVirtualCoins() <= 0L) {
            player.setVirtualCoins(1000L);
            playerRepository.save(player);
            CoinTransaction tx = new CoinTransaction(
                    player.getId(),
                    player.getUsername(),
                    1000L,
                    "WELCOME_BONUS",
                    null,
                    "Welcome starter pack of 1,000 virtual coins",
                    1000L
            );
            coinTransactionRepository.save(tx);
        }
    }

    @Transactional
    public MultiplayerRoomDTO createRoom(Long playerId, CreateRoomRequest req) {
        Player player = resolvePlayer(playerId);

        ensureStarterCoins(player);

        long stake = req.getStakeAmount() > 0 ? req.getStakeAmount() : 0L;
        if (stake > 0 && player.getVirtualCoins() < stake) {
            throw new BadRequestException("Insufficient virtual coins for stake of " + stake + ". Current balance: " + player.getVirtualCoins());
        }

        MultiplayerRoom room = new MultiplayerRoom();
        room.setRoomCode(generateUniqueRoomCode());
        room.setRoomName(req.getRoomName() != null && !req.getRoomName().isBlank() ? req.getRoomName().trim() : player.getUsername() + "'s Room");
        room.setHostPlayerId(player.getId());
        room.setHostUsername(player.getUsername());
        room.setMatchType(req.getMatchType() != null ? req.getMatchType().toUpperCase() : "FRIENDS");
        room.setStatus("WAITING");
        room.setMinNumber(req.getMinNumber() > 0 ? req.getMinNumber() : 1);
        room.setMaxNumber(req.getMaxNumber() > room.getMinNumber() ? req.getMaxNumber() : 100);
        room.setAttemptsPerRound(req.getAttemptsPerRound() > 0 ? req.getAttemptsPerRound() : 7);
        room.setStakeAmount(stake);

        if ("TEAM_BATTLE".equalsIgnoreCase(room.getMatchType())) {
            room.setTotalRounds(req.getTotalRounds() > 0 ? req.getTotalRounds() : 3);
            room.setMaxPlayers(req.getMaxPlayers() >= 2 ? req.getMaxPlayers() : 4);
            if (req.getTeamRedName() != null && !req.getTeamRedName().isBlank()) {
                room.setTeamRedName(req.getTeamRedName().trim());
            }
            if (req.getTeamBlueName() != null && !req.getTeamBlueName().isBlank()) {
                room.setTeamBlueName(req.getTeamBlueName().trim());
            }
        } else {
            room.setTotalRounds(req.getTotalRounds() > 0 ? req.getTotalRounds() : 1);
            room.setMaxPlayers(req.getMaxPlayers() >= 2 ? req.getMaxPlayers() : 4);
        }

        // Host player setup
        String initialTeam = "SOLO";
        if ("TEAM_BATTLE".equalsIgnoreCase(room.getMatchType())) {
            initialTeam = (req.getTeam() != null && req.getTeam().equalsIgnoreCase("TEAM_BLUE")) ? "TEAM_BLUE" : "TEAM_RED";
        }

        RoomPlayer hostPlayer = new RoomPlayer(
                room,
                player.getId(),
                player.getUsername(),
                true,
                initialTeam,
                AVATAR_COLORS[0]
        );
        hostPlayer.setReady(true);
        hostPlayer.setTurnOrder(0);
        hostPlayer.setAttemptsRemaining(room.getAttemptsPerRound());

        room.getPlayers().add(hostPlayer);
        MultiplayerRoom savedRoom = roomRepository.save(room);

        return new MultiplayerRoomDTO(savedRoom, Collections.emptyList());
    }

    @Transactional
    public MultiplayerRoomDTO joinRoom(Long playerId, JoinRoomRequest req) {
        if (req.getRoomCode() == null || req.getRoomCode().trim().isEmpty()) {
            throw new BadRequestException("Room code is required");
        }

        String code = req.getRoomCode().trim().toUpperCase();
        MultiplayerRoom room = roomRepository.findByRoomCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with code: " + code));

        Player player = resolvePlayer(playerId);

        // Check if player is already inside room
        Optional<RoomPlayer> existingMember = room.getPlayers().stream()
                .filter(p -> p.getPlayerId().equals(playerId))
                .findFirst();

        if (existingMember.isPresent()) {
            RoomPlayer rp = existingMember.get();
            rp.setConnectionStatus("CONNECTED");
            roomPlayerRepository.save(rp);
            broadcastRoomUpdate(room);
            List<MultiplayerGuess> guesses = guessRepository.findByRoomIdOrderByCreatedAtAsc(room.getId());
            return new MultiplayerRoomDTO(room, guesses);
        }

        if (!"WAITING".equalsIgnoreCase(room.getStatus())) {
            throw new BadRequestException("Cannot join match: Match is already " + room.getStatus().toLowerCase());
        }

        if (room.getPlayers().size() >= room.getMaxPlayers()) {
            throw new BadRequestException("Room is full (max " + room.getMaxPlayers() + " players)");
        }

        if (room.getStakeAmount() > 0 && player.getVirtualCoins() < room.getStakeAmount()) {
            throw new BadRequestException("Insufficient virtual coins. Required: " + room.getStakeAmount() + ", Available: " + player.getVirtualCoins());
        }

        String assignedTeam = "SOLO";
        if ("TEAM_BATTLE".equalsIgnoreCase(room.getMatchType())) {
            if (req.getTeam() != null && (req.getTeam().equalsIgnoreCase("TEAM_RED") || req.getTeam().equalsIgnoreCase("TEAM_BLUE"))) {
                assignedTeam = req.getTeam().toUpperCase();
            } else {
                long redCount = room.getPlayers().stream().filter(p -> "TEAM_RED".equalsIgnoreCase(p.getTeam())).count();
                long blueCount = room.getPlayers().stream().filter(p -> "TEAM_BLUE".equalsIgnoreCase(p.getTeam())).count();
                assignedTeam = redCount <= blueCount ? "TEAM_RED" : "TEAM_BLUE";
            }
        }

        int colorIdx = room.getPlayers().size() % AVATAR_COLORS.length;
        RoomPlayer newPlayer = new RoomPlayer(
                room,
                player.getId(),
                player.getUsername(),
                false,
                assignedTeam,
                AVATAR_COLORS[colorIdx]
        );
        newPlayer.setReady(false);
        newPlayer.setTurnOrder(room.getPlayers().size());
        newPlayer.setAttemptsRemaining(room.getAttemptsPerRound());

        room.getPlayers().add(newPlayer);
        room.setUpdatedAt(LocalDateTime.now());
        MultiplayerRoom savedRoom = roomRepository.save(room);

        broadcastRoomUpdate(savedRoom);
        List<MultiplayerGuess> guesses = guessRepository.findByRoomIdOrderByCreatedAtAsc(savedRoom.getId());
        return new MultiplayerRoomDTO(savedRoom, guesses);
    }

    @Transactional
    public MultiplayerRoomDTO quickMatch(Long playerId) {
        Player player = resolvePlayer(playerId);

        // Look for open QUICK_MATCH rooms in WAITING status
        List<MultiplayerRoom> openRooms = roomRepository.findByMatchTypeAndStatusOrderByCreatedAtAsc("QUICK_MATCH", "WAITING");
        for (MultiplayerRoom r : openRooms) {
            if (r.getPlayers().size() < r.getMaxPlayers() && r.getPlayers().stream().noneMatch(p -> p.getPlayerId().equals(playerId))) {
                JoinRoomRequest joinReq = new JoinRoomRequest();
                joinReq.setRoomCode(r.getRoomCode());
                joinReq.setTeam("SOLO");
                return joinRoom(playerId, joinReq);
            }
        }

        // If no open room, create a new QUICK_MATCH room
        CreateRoomRequest createReq = new CreateRoomRequest();
        createReq.setMatchType("QUICK_MATCH");
        createReq.setRoomName("Quick Match #" + (secureRandom.nextInt(900) + 100));
        createReq.setMaxPlayers(2);
        createReq.setMinNumber(1);
        createReq.setMaxNumber(100);
        createReq.setAttemptsPerRound(7);
        createReq.setTotalRounds(1);
        createReq.setStakeAmount(0L);
        return createRoom(playerId, createReq);
    }

    @Transactional(readOnly = true)
    public MultiplayerRoomDTO getRoomByCode(String roomCode) {
        MultiplayerRoom room = roomRepository.findByRoomCode(roomCode.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + roomCode));
        List<MultiplayerGuess> guesses = guessRepository.findByRoomIdOrderByCreatedAtAsc(room.getId());
        return new MultiplayerRoomDTO(room, guesses);
    }

    @Transactional
    public MultiplayerRoomDTO toggleReady(String roomCode, Long playerId) {
        MultiplayerRoom room = roomRepository.findByRoomCode(roomCode.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + roomCode));

        RoomPlayer player = room.getPlayers().stream()
                .filter(p -> p.getPlayerId().equals(playerId))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Player is not in this room"));

        if (!player.isHost()) {
            player.setReady(!player.isReady());
            roomPlayerRepository.save(player);
        }

        room.setUpdatedAt(LocalDateTime.now());
        MultiplayerRoom saved = roomRepository.save(room);
        broadcastRoomUpdate(saved);
        List<MultiplayerGuess> guesses = guessRepository.findByRoomIdOrderByCreatedAtAsc(saved.getId());
        return new MultiplayerRoomDTO(saved, guesses);
    }

    @Transactional
    public MultiplayerRoomDTO switchTeam(String roomCode, Long playerId, String newTeam) {
        MultiplayerRoom room = roomRepository.findByRoomCode(roomCode.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + roomCode));

        if (!"WAITING".equalsIgnoreCase(room.getStatus())) {
            throw new BadRequestException("Cannot change team once match has started");
        }

        RoomPlayer player = room.getPlayers().stream()
                .filter(p -> p.getPlayerId().equals(playerId))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Player is not in this room"));

        if (!"TEAM_RED".equalsIgnoreCase(newTeam) && !"TEAM_BLUE".equalsIgnoreCase(newTeam)) {
            throw new BadRequestException("Invalid team: " + newTeam + ". Must be TEAM_RED or TEAM_BLUE.");
        }

        player.setTeam(newTeam.toUpperCase());
        roomPlayerRepository.save(player);

        room.setUpdatedAt(LocalDateTime.now());
        MultiplayerRoom saved = roomRepository.save(room);
        broadcastRoomUpdate(saved);
        List<MultiplayerGuess> guesses = guessRepository.findByRoomIdOrderByCreatedAtAsc(saved.getId());
        return new MultiplayerRoomDTO(saved, guesses);
    }

    @Transactional
    public MultiplayerRoomDTO startMatch(String roomCode, Long playerId) {
        MultiplayerRoom room = roomRepository.findByRoomCode(roomCode.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + roomCode));

        if (!room.getHostPlayerId().equals(playerId)) {
            throw new BadRequestException("Only the room host can start the match");
        }

        if (!"WAITING".equalsIgnoreCase(room.getStatus())) {
            throw new BadRequestException("Match is already started or finished");
        }

        if (room.getPlayers().size() < 2) {
            throw new BadRequestException("At least 2 players are required to start a match");
        }

        boolean allReady = room.getPlayers().stream().allMatch(p -> p.isHost() || p.isReady());
        if (!allReady) {
            throw new BadRequestException("All players must be ready before starting the match");
        }

        if ("TEAM_BATTLE".equalsIgnoreCase(room.getMatchType())) {
            boolean hasRed = room.getPlayers().stream().anyMatch(p -> "TEAM_RED".equalsIgnoreCase(p.getTeam()));
            boolean hasBlue = room.getPlayers().stream().anyMatch(p -> "TEAM_BLUE".equalsIgnoreCase(p.getTeam()));
            if (!hasRed || !hasBlue) {
                throw new BadRequestException("Both Team Red and Team Blue must have at least one player to start");
            }
        }

        // Deduct virtual coin stakes if configured
        if (room.getStakeAmount() > 0) {
            long stake = room.getStakeAmount();
            for (RoomPlayer rp : room.getPlayers()) {
                Player p = playerRepository.findById(rp.getPlayerId())
                        .orElseThrow(() -> new ResourceNotFoundException("Player not found: " + rp.getPlayerId()));
                if (p.getVirtualCoins() < stake) {
                    throw new BadRequestException("Player " + p.getUsername() + " has insufficient virtual coins (" + p.getVirtualCoins() + " < " + stake + ")");
                }
            }

            for (RoomPlayer rp : room.getPlayers()) {
                Player p = playerRepository.findById(rp.getPlayerId()).get();
                long newBalance = p.getVirtualCoins() - stake;
                p.setVirtualCoins(newBalance);
                playerRepository.save(p);

                CoinTransaction tx = new CoinTransaction(
                        p.getId(),
                        p.getUsername(),
                        -stake,
                        "MATCH_STAKE",
                        room.getId(),
                        "Stake for " + room.getMatchType() + " match " + room.getRoomCode(),
                        newBalance
                );
                coinTransactionRepository.save(tx);
            }
            room.setTotalPrizePool(stake * room.getPlayers().size());
        }

        // Initialize round 1 with difficulty config
        room.setStatus("IN_PROGRESS");
        room.setCurrentRoundNumber(1);
        room.setRoundStatus("IN_PROGRESS");
        room.setRoundWinnerId(null);
        room.setRoundWinnerName(null);
        room.setRoundWinningTeam(null);
        room.setTeamRedScore(0);
        room.setTeamBlueScore(0);

        MultiplayerRoundConfig.RoundSetting setting = MultiplayerRoundConfig.getRoundSetting(1);
        if (room.getTotalRounds() >= 9) {
            room.setMinNumber(setting.getMinNumber());
            room.setMaxNumber(setting.getMaxNumber());
        }
        room.setAttemptsPerRound(setting.getAttemptsPerPlayer());
        room.setTurnTimeLimitSeconds(setting.getTimeLimitSeconds());
        room.setDifficultyLabel(setting.getDifficultyLabel());
        room.setRewardMultiplier(setting.getRewardMultiplier());
        room.setTurnDeadline(LocalDateTime.now().plusSeconds(setting.getTimeLimitSeconds()));

        long secret = generateSecretNumber(room.getMinNumber(), room.getMaxNumber());
        room.setSecretNumber(secret);

        // Setup turn order
        List<RoomPlayer> orderedPlayers = new ArrayList<>();
        if ("TEAM_BATTLE".equalsIgnoreCase(room.getMatchType())) {
            List<RoomPlayer> redList = room.getPlayers().stream()
                    .filter(p -> "TEAM_RED".equalsIgnoreCase(p.getTeam()))
                    .collect(Collectors.toList());
            List<RoomPlayer> blueList = room.getPlayers().stream()
                    .filter(p -> "TEAM_BLUE".equalsIgnoreCase(p.getTeam()))
                    .collect(Collectors.toList());

            int maxTeamSize = Math.max(redList.size(), blueList.size());
            for (int i = 0; i < maxTeamSize; i++) {
                if (i < redList.size()) orderedPlayers.add(redList.get(i));
                if (i < blueList.size()) orderedPlayers.add(blueList.get(i));
            }
        } else {
            orderedPlayers.addAll(room.getPlayers());
        }

        for (int i = 0; i < orderedPlayers.size(); i++) {
            RoomPlayer p = orderedPlayers.get(i);
            p.setTurnOrder(i);
            p.setAttemptsRemaining(room.getAttemptsPerRound());
            roomPlayerRepository.save(p);
        }

        RoomPlayer firstPlayer = orderedPlayers.get(0);
        room.setCurrentTurnIndex(0);
        room.setCurrentTurnPlayerId(firstPlayer.getPlayerId());
        room.setCurrentTurnUsername(firstPlayer.getUsername());
        room.setUpdatedAt(LocalDateTime.now());

        MultiplayerRoom saved = roomRepository.save(room);
        broadcastRoomUpdate(saved);

        List<MultiplayerGuess> guesses = guessRepository.findByRoomIdOrderByCreatedAtAsc(saved.getId());
        return new MultiplayerRoomDTO(saved, guesses);
    }

    @Transactional
    public MultiplayerRoomDTO submitGuess(String roomCode, Long playerId, long guessNumber) {
        MultiplayerRoom room = roomRepository.findByRoomCode(roomCode.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + roomCode));

        if (!"IN_PROGRESS".equalsIgnoreCase(room.getStatus())) {
            throw new BadRequestException("Match is not in progress (Current status: " + room.getStatus() + ")");
        }

        if (!"IN_PROGRESS".equalsIgnoreCase(room.getRoundStatus())) {
            throw new BadRequestException("Round has ended. Waiting for next round or match completion.");
        }

        if (room.getCurrentTurnPlayerId() == null || !room.getCurrentTurnPlayerId().equals(playerId)) {
            throw new BadRequestException("It is not your turn! Current turn: " + room.getCurrentTurnUsername());
        }

        RoomPlayer player = room.getPlayers().stream()
                .filter(p -> p.getPlayerId().equals(playerId))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Player not found in room"));

        if (player.getAttemptsRemaining() <= 0) {
            throw new BadRequestException("You have no attempts remaining in this round");
        }

        // Server-enforced turn time limit
        if (room.getTurnDeadline() != null && LocalDateTime.now().isAfter(room.getTurnDeadline().plusSeconds(2))) {
            player.setAttemptsRemaining(Math.max(0, player.getAttemptsRemaining() - 1));
            roomPlayerRepository.save(player);

            boolean anyAttemptsLeft = room.getPlayers().stream().anyMatch(p -> p.getAttemptsRemaining() > 0);
            if (!anyAttemptsLeft) {
                room.setRoundStatus("ROUND_DRAW");
                room.setRoundWinnerId(null);
                room.setRoundWinnerName("No one (Draw)");
                room.setRoundWinningTeam("DRAW");
                checkMatchCompletion(room);
            } else {
                advanceTurn(room);
                room.setTurnDeadline(LocalDateTime.now().plusSeconds(room.getTurnTimeLimitSeconds()));
            }

            room.setUpdatedAt(LocalDateTime.now());
            MultiplayerRoom saved = roomRepository.save(room);
            broadcastRoomUpdate(saved);
            throw new BadRequestException("Turn time limit expired (" + room.getTurnTimeLimitSeconds() + "s)! Attempt deducted and turn passed.");
        }

        if (guessNumber < room.getMinNumber() || guessNumber > room.getMaxNumber()) {
            throw new BadRequestException("Guess must be between " + room.getMinNumber() + " and " + room.getMaxNumber());
        }

        // Check duplicate guesses in this round
        List<MultiplayerGuess> roundGuesses = guessRepository.findByRoomIdAndRoundNumberOrderByAttemptNumberAsc(room.getId(), room.getCurrentRoundNumber());
        boolean alreadyGuessed = roundGuesses.stream().anyMatch(g -> g.getGuessNumber() == guessNumber);
        if (alreadyGuessed) {
            throw new BadRequestException("The number " + guessNumber + " has already been guessed in this round! Please choose another number.");
        }

        // Decrement attempt
        player.setAttemptsRemaining(player.getAttemptsRemaining() - 1);
        roomPlayerRepository.save(player);

        long secret = room.getSecretNumber();
        String result;
        String message;

        if (guessNumber < secret) {
            result = "TOO_LOW";
            message = "Too Low! Secret number is higher than " + guessNumber + ".";
        } else if (guessNumber > secret) {
            result = "TOO_HIGH";
            message = "Too High! Secret number is lower than " + guessNumber + ".";
        } else {
            result = "CORRECT";
            message = "Correct! " + player.getUsername() + " guessed the secret number " + secret + "!";
        }

        int attemptNumber = roundGuesses.size() + 1;
        MultiplayerGuess guess = new MultiplayerGuess(
                room.getId(),
                room.getCurrentRoundNumber(),
                player.getPlayerId(),
                player.getUsername(),
                player.getTeam(),
                guessNumber,
                result,
                message,
                attemptNumber
        );
        guessRepository.save(guess);

        if ("CORRECT".equals(result)) {
            // Round won by this player / team
            room.setRoundStatus("ROUND_WON");
            room.setRoundWinnerId(player.getPlayerId());
            room.setRoundWinnerName(player.getUsername());
            room.setRoundWinningTeam(player.getTeam());

            int baseRoundPoints = 100 + (player.getAttemptsRemaining() * 10);
            int roundPoints = (int) Math.round(baseRoundPoints * Math.max(1.0, room.getRewardMultiplier()));
            player.setScore(player.getScore() + roundPoints);
            player.setRoundsWon(player.getRoundsWon() + 1);
            roomPlayerRepository.save(player);

            if ("TEAM_BATTLE".equalsIgnoreCase(room.getMatchType())) {
                if ("TEAM_RED".equalsIgnoreCase(player.getTeam())) {
                    room.setTeamRedScore(room.getTeamRedScore() + 1);
                } else if ("TEAM_BLUE".equalsIgnoreCase(player.getTeam())) {
                    room.setTeamBlueScore(room.getTeamBlueScore() + 1);
                }
            }

            checkMatchCompletion(room);

        } else {
            // Check if all players have 0 attempts remaining
            boolean anyAttemptsLeft = room.getPlayers().stream().anyMatch(p -> p.getAttemptsRemaining() > 0);
            if (!anyAttemptsLeft) {
                // Round Draw
                room.setRoundStatus("ROUND_DRAW");
                room.setRoundWinnerId(null);
                room.setRoundWinnerName("No one (Draw)");
                room.setRoundWinningTeam("DRAW");
                checkMatchCompletion(room);
            } else {
                // Advance turn to next player with attempts remaining
                advanceTurn(room);
                room.setTurnDeadline(LocalDateTime.now().plusSeconds(room.getTurnTimeLimitSeconds()));
            }
        }

        room.setUpdatedAt(LocalDateTime.now());
        MultiplayerRoom saved = roomRepository.save(room);
        broadcastRoomUpdate(saved);

        List<MultiplayerGuess> updatedGuesses = guessRepository.findByRoomIdOrderByCreatedAtAsc(saved.getId());
        return new MultiplayerRoomDTO(saved, updatedGuesses);
    }

    @Transactional
    public MultiplayerRoomDTO handleTurnTimeout(String roomCode, Long playerId) {
        MultiplayerRoom room = roomRepository.findByRoomCode(roomCode.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + roomCode));

        if (!"IN_PROGRESS".equalsIgnoreCase(room.getStatus()) || !"IN_PROGRESS".equalsIgnoreCase(room.getRoundStatus())) {
            List<MultiplayerGuess> guesses = guessRepository.findByRoomIdOrderByCreatedAtAsc(room.getId());
            return new MultiplayerRoomDTO(room, guesses);
        }

        if (room.getTurnDeadline() != null && LocalDateTime.now().isAfter(room.getTurnDeadline())) {
            Long currentTurnId = room.getCurrentTurnPlayerId();
            if (currentTurnId != null) {
                RoomPlayer player = room.getPlayers().stream()
                        .filter(p -> p.getPlayerId().equals(currentTurnId))
                        .findFirst()
                        .orElse(null);

                if (player != null && player.getAttemptsRemaining() > 0) {
                    player.setAttemptsRemaining(player.getAttemptsRemaining() - 1);
                    roomPlayerRepository.save(player);
                }

                boolean anyAttemptsLeft = room.getPlayers().stream().anyMatch(p -> p.getAttemptsRemaining() > 0);
                if (!anyAttemptsLeft) {
                    room.setRoundStatus("ROUND_DRAW");
                    room.setRoundWinnerId(null);
                    room.setRoundWinnerName("No one (Draw)");
                    room.setRoundWinningTeam("DRAW");
                    checkMatchCompletion(room);
                } else {
                    advanceTurn(room);
                    room.setTurnDeadline(LocalDateTime.now().plusSeconds(room.getTurnTimeLimitSeconds()));
                }

                room.setUpdatedAt(LocalDateTime.now());
                MultiplayerRoom saved = roomRepository.save(room);
                broadcastRoomUpdate(saved);
                List<MultiplayerGuess> updatedGuesses = guessRepository.findByRoomIdOrderByCreatedAtAsc(saved.getId());
                return new MultiplayerRoomDTO(saved, updatedGuesses);
            }
        }

        List<MultiplayerGuess> guesses = guessRepository.findByRoomIdOrderByCreatedAtAsc(room.getId());
        return new MultiplayerRoomDTO(room, guesses);
    }

    private void advanceTurn(MultiplayerRoom room) {
        List<RoomPlayer> players = room.getPlayers().stream()
                .sorted(Comparator.comparingInt(RoomPlayer::getTurnOrder))
                .collect(Collectors.toList());

        if (players.isEmpty()) return;

        int currentIndex = room.getCurrentTurnIndex();
        int totalPlayers = players.size();

        for (int i = 1; i <= totalPlayers; i++) {
            int nextIndex = (currentIndex + i) % totalPlayers;
            RoomPlayer candidate = players.get(nextIndex);
            if (candidate.getAttemptsRemaining() > 0 && !"DISCONNECTED".equalsIgnoreCase(candidate.getConnectionStatus())) {
                room.setCurrentTurnIndex(nextIndex);
                room.setCurrentTurnPlayerId(candidate.getPlayerId());
                room.setCurrentTurnUsername(candidate.getUsername());
                return;
            }
        }
    }

    private void checkMatchCompletion(MultiplayerRoom room) {
        int roundsNeededToWin = (room.getTotalRounds() / 2) + 1;

        if ("TEAM_BATTLE".equalsIgnoreCase(room.getMatchType())) {
            // For gauntlets (9+ rounds), play all rounds so nightmare & boss rounds are experienced
            boolean redClinched = room.getTotalRounds() < 9 && room.getTeamRedScore() >= roundsNeededToWin;
            boolean blueClinched = room.getTotalRounds() < 9 && room.getTeamBlueScore() >= roundsNeededToWin;
            boolean allRoundsPlayed = room.getCurrentRoundNumber() >= room.getTotalRounds();

            if (redClinched || blueClinched || allRoundsPlayed) {
                room.setStatus("FINISHED");
                if (room.getTeamRedScore() > room.getTeamBlueScore()) {
                    room.setMatchWinningTeam("TEAM_RED");
                    room.setMatchWinnerName("Team Red");
                    distributePrizes(room, "TEAM_RED");
                } else if (room.getTeamBlueScore() > room.getTeamRedScore()) {
                    room.setMatchWinningTeam("TEAM_BLUE");
                    room.setMatchWinnerName("Team Blue");
                    distributePrizes(room, "TEAM_BLUE");
                } else {
                    room.setMatchWinningTeam("DRAW");
                    room.setMatchWinnerName("Match Draw");
                    refundPrizePool(room);
                }
            }
        } else {
            // SOLO or QUICK_MATCH
            boolean allRoundsPlayed = room.getCurrentRoundNumber() >= room.getTotalRounds();
            if (allRoundsPlayed) {
                room.setStatus("FINISHED");
                RoomPlayer winner = room.getPlayers().stream()
                        .max(Comparator.comparingInt(RoomPlayer::getRoundsWon).thenComparingInt(RoomPlayer::getScore))
                        .orElse(null);

                if (winner != null && (winner.getRoundsWon() > 0 || winner.getScore() > 0)) {
                    room.setMatchWinnerId(winner.getPlayerId());
                    room.setMatchWinnerName(winner.getUsername());
                    distributePrizes(room, winner);
                } else {
                    room.setMatchWinnerName("Match Draw");
                    refundPrizePool(room);
                }
            }
        }
    }

    private void distributePrizes(MultiplayerRoom room, String winningTeam) {
        List<RoomPlayer> winners = room.getPlayers().stream()
                .filter(p -> winningTeam.equalsIgnoreCase(p.getTeam()))
                .collect(Collectors.toList());

        List<RoomPlayer> losers = room.getPlayers().stream()
                .filter(p -> !winningTeam.equalsIgnoreCase(p.getTeam()))
                .collect(Collectors.toList());

        for (RoomPlayer lp : losers) {
            coinWalletService.recordGameLoss(lp.getPlayerId());
        }

        if (winners.isEmpty()) {
            refundPrizePool(room);
            return;
        }

        long share = (room.getTotalPrizePool() > 0) ? (room.getTotalPrizePool() / winners.size()) : 0;
        for (RoomPlayer wp : winners) {
            // Award base Team Battle win reward (150 coins + streak check)
            coinWalletService.recordGameResult(wp.getPlayerId(), true, false, "TEAM_BATTLE", room.getId());

            // Multiplier bonus for high-difficulty rounds
            if (room.getRewardMultiplier() > 1.0) {
                long bonusCoins = (long) Math.round(150 * (room.getRewardMultiplier() - 1.0));
                Player p = playerRepository.findById(wp.getPlayerId()).orElse(null);
                if (p != null) {
                    long newBalance = p.getVirtualCoins() + bonusCoins;
                    p.setVirtualCoins(newBalance);
                    playerRepository.save(p);

                    CoinTransaction tx = new CoinTransaction(
                            p.getId(),
                            p.getUsername(),
                            bonusCoins,
                            "DIFFICULTY_BONUS",
                            room.getId(),
                            room.getDifficultyLabel() + " Round Victory Multiplier Bonus (" + room.getRewardMultiplier() + "x)",
                            newBalance
                    );
                    coinTransactionRepository.save(tx);
                }
            }

            // If there was a stake pool, award the player's share
            if (share > 0) {
                Player p = playerRepository.findById(wp.getPlayerId()).orElse(null);
                if (p != null) {
                    long newBalance = p.getVirtualCoins() + share;
                    p.setVirtualCoins(newBalance);
                    playerRepository.save(p);

                    CoinTransaction tx = new CoinTransaction(
                            p.getId(),
                            p.getUsername(),
                            share,
                            "MATCH_WIN",
                            room.getId(),
                            "Stake prize pool share for winning match " + room.getRoomCode() + " with " + winningTeam,
                            newBalance
                    );
                    coinTransactionRepository.save(tx);
                }
            }
        }
    }

    private void distributePrizes(MultiplayerRoom room, RoomPlayer winner) {
        if (winner == null) {
            refundPrizePool(room);
            return;
        }

        // Reset streak for losers
        for (RoomPlayer rp : room.getPlayers()) {
            if (!rp.getPlayerId().equals(winner.getPlayerId())) {
                coinWalletService.recordGameLoss(rp.getPlayerId());
            }
        }

        // Award base Quick Match win reward (100 coins + streak check)
        coinWalletService.recordGameResult(winner.getPlayerId(), true, false, "QUICK_MATCH", room.getId());

        // Multiplier bonus for high-difficulty rounds
        if (room.getRewardMultiplier() > 1.0) {
            long bonusCoins = (long) Math.round(100 * (room.getRewardMultiplier() - 1.0));
            Player p = playerRepository.findById(winner.getPlayerId()).orElse(null);
            if (p != null) {
                long newBalance = p.getVirtualCoins() + bonusCoins;
                p.setVirtualCoins(newBalance);
                playerRepository.save(p);

                CoinTransaction tx = new CoinTransaction(
                        p.getId(),
                        p.getUsername(),
                        bonusCoins,
                        "DIFFICULTY_BONUS",
                        room.getId(),
                        room.getDifficultyLabel() + " Round Victory Multiplier Bonus (" + room.getRewardMultiplier() + "x)",
                        newBalance
                );
                coinTransactionRepository.save(tx);
            }
        }

        // If there was a stake pool, award the total prize pool
        if (room.getTotalPrizePool() > 0) {
            Player p = playerRepository.findById(winner.getPlayerId()).orElse(null);
            if (p != null) {
                long newBalance = p.getVirtualCoins() + room.getTotalPrizePool();
                p.setVirtualCoins(newBalance);
                playerRepository.save(p);

                CoinTransaction tx = new CoinTransaction(
                        p.getId(),
                        p.getUsername(),
                        room.getTotalPrizePool(),
                        "MATCH_WIN",
                        room.getId(),
                        "Stake prize pool for winning match " + room.getRoomCode(),
                        newBalance
                );
                coinTransactionRepository.save(tx);
            }
        }
    }

    private void refundPrizePool(MultiplayerRoom room) {
        if (room.getStakeAmount() <= 0) return;

        long stake = room.getStakeAmount();
        for (RoomPlayer rp : room.getPlayers()) {
            Player p = playerRepository.findById(rp.getPlayerId()).orElse(null);
            if (p != null) {
                long newBalance = p.getVirtualCoins() + stake;
                p.setVirtualCoins(newBalance);
                playerRepository.save(p);

                CoinTransaction tx = new CoinTransaction(
                        p.getId(),
                        p.getUsername(),
                        stake,
                        "MATCH_REFUND",
                        room.getId(),
                        "Stake refund for draw/cancelled match " + room.getRoomCode(),
                        newBalance
                );
                coinTransactionRepository.save(tx);
            }
        }
    }

    @Transactional
    public MultiplayerRoomDTO nextRound(String roomCode, Long playerId) {
        MultiplayerRoom room = roomRepository.findByRoomCode(roomCode.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + roomCode));

        if (!room.getHostPlayerId().equals(playerId)) {
            throw new BadRequestException("Only the room host can start the next round");
        }

        if (!"IN_PROGRESS".equalsIgnoreCase(room.getStatus())) {
            throw new BadRequestException("Match is not in progress");
        }

        if ("IN_PROGRESS".equalsIgnoreCase(room.getRoundStatus())) {
            throw new BadRequestException("Current round is still ongoing");
        }

        if (room.getCurrentRoundNumber() >= room.getTotalRounds()) {
            throw new BadRequestException("All rounds for this match have been played");
        }

        int newRoundNumber = room.getCurrentRoundNumber() + 1;
        room.setCurrentRoundNumber(newRoundNumber);
        room.setRoundStatus("IN_PROGRESS");
        room.setRoundWinnerId(null);
        room.setRoundWinnerName(null);
        room.setRoundWinningTeam(null);

        MultiplayerRoundConfig.RoundSetting setting = MultiplayerRoundConfig.getRoundSetting(newRoundNumber);
        if (newRoundNumber >= 9 || room.getTotalRounds() >= 9) {
            room.setMinNumber(setting.getMinNumber());
            room.setMaxNumber(setting.getMaxNumber());
        }
        room.setAttemptsPerRound(setting.getAttemptsPerPlayer());
        room.setTurnTimeLimitSeconds(setting.getTimeLimitSeconds());
        room.setDifficultyLabel(setting.getDifficultyLabel());
        room.setRewardMultiplier(setting.getRewardMultiplier());
        room.setTurnDeadline(LocalDateTime.now().plusSeconds(setting.getTimeLimitSeconds()));

        long secret = generateSecretNumber(room.getMinNumber(), room.getMaxNumber());
        room.setSecretNumber(secret);

        for (RoomPlayer p : room.getPlayers()) {
            p.setAttemptsRemaining(room.getAttemptsPerRound());
            roomPlayerRepository.save(p);
        }

        // Start round with first player in turn order
        List<RoomPlayer> orderedPlayers = room.getPlayers().stream()
                .sorted(Comparator.comparingInt(RoomPlayer::getTurnOrder))
                .collect(Collectors.toList());

        if (!orderedPlayers.isEmpty()) {
            RoomPlayer first = orderedPlayers.get(0);
            room.setCurrentTurnIndex(0);
            room.setCurrentTurnPlayerId(first.getPlayerId());
            room.setCurrentTurnUsername(first.getUsername());
        }

        room.setUpdatedAt(LocalDateTime.now());
        MultiplayerRoom saved = roomRepository.save(room);
        broadcastRoomUpdate(saved);

        List<MultiplayerGuess> guesses = guessRepository.findByRoomIdOrderByCreatedAtAsc(saved.getId());
        return new MultiplayerRoomDTO(saved, guesses);
    }

    @Transactional
    public MultiplayerRoomDTO leaveRoom(String roomCode, Long playerId) {
        MultiplayerRoom room = roomRepository.findByRoomCode(roomCode.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + roomCode));

        RoomPlayer player = room.getPlayers().stream()
                .filter(p -> p.getPlayerId().equals(playerId))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Player not in room"));

        if ("WAITING".equalsIgnoreCase(room.getStatus())) {
            room.getPlayers().remove(player);
            roomPlayerRepository.delete(player);

            if (room.getPlayers().isEmpty()) {
                room.setStatus("CANCELLED");
                roomRepository.save(room);
                return new MultiplayerRoomDTO(room, Collections.emptyList());
            }

            // Transfer host if host left
            if (player.isHost()) {
                RoomPlayer newHost = room.getPlayers().get(0);
                newHost.setHost(true);
                newHost.setReady(true);
                room.setHostPlayerId(newHost.getPlayerId());
                room.setHostUsername(newHost.getUsername());
                roomPlayerRepository.save(newHost);
            }
        } else if ("IN_PROGRESS".equalsIgnoreCase(room.getStatus())) {
            player.setConnectionStatus("DISCONNECTED");
            roomPlayerRepository.save(player);

            if (playerId.equals(room.getCurrentTurnPlayerId())) {
                advanceTurn(room);
            }

            // Check if only 1 player remains connected
            long connectedCount = room.getPlayers().stream()
                    .filter(p -> !"DISCONNECTED".equalsIgnoreCase(p.getConnectionStatus()))
                    .count();

            if (connectedCount <= 1) {
                // Match ends by forfeit
                room.setStatus("FINISHED");
                RoomPlayer remaining = room.getPlayers().stream()
                        .filter(p -> !"DISCONNECTED".equalsIgnoreCase(p.getConnectionStatus()))
                        .findFirst()
                        .orElse(null);

                if (remaining != null) {
                    room.setMatchWinnerId(remaining.getPlayerId());
                    room.setMatchWinnerName(remaining.getUsername() + " (Opponent Left)");
                    room.setMatchWinningTeam(remaining.getTeam());
                    if ("TEAM_BATTLE".equalsIgnoreCase(room.getMatchType())) {
                        distributePrizes(room, remaining.getTeam());
                    } else {
                        distributePrizes(room, remaining);
                    }
                } else {
                    refundPrizePool(room);
                }
            }
        }

        room.setUpdatedAt(LocalDateTime.now());
        MultiplayerRoom saved = roomRepository.save(room);
        broadcastRoomUpdate(saved);

        List<MultiplayerGuess> guesses = guessRepository.findByRoomIdOrderByCreatedAtAsc(saved.getId());
        return new MultiplayerRoomDTO(saved, guesses);
    }

    @Transactional
    public Map<String, Object> getPlayerCoins(Long playerId) {
        Player player = resolvePlayer(playerId);
        List<CoinTransaction> txs = coinTransactionRepository.findByPlayerIdOrderByCreatedAtDesc(player.getId());

        Map<String, Object> res = new HashMap<>();
        res.put("playerId", player.getId());
        res.put("username", player.getUsername());
        res.put("virtualCoins", player.getVirtualCoins());
        res.put("consecutiveWins", player.getConsecutiveWins());
        res.put("transactions", txs);
        return res;
    }

    @Transactional
    public Map<String, Object> claimDailyBonus(Long playerId) {
        return coinWalletService.claimDailyLogin(playerId);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMultiplayerLeaderboard() {
        List<Player> topPlayers = playerRepository.findAll().stream()
                .sorted(Comparator.comparingLong(Player::getVirtualCoins).reversed())
                .limit(20)
                .collect(Collectors.toList());

        List<Map<String, Object>> result = new ArrayList<>();
        int rank = 1;
        for (Player p : topPlayers) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("rank", rank++);
            entry.put("playerId", p.getId());
            entry.put("username", p.getUsername());
            entry.put("virtualCoins", p.getVirtualCoins());
            result.add(entry);
        }
        return result;
    }
}
