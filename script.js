
var guessnumber = document.getElementById("guessnumber");
var result = document.getElementById("result");
var score = document.getElementById("score");
var hint = document.getElementById("hint");
var chances = document.getElementById("chances");
var attemptsDisplay = document.getElementById("attempts");
var levelDisplay = document.getElementById("level");
var bestLevelDisplay = document.getElementById("bestLevel");
var bestLevel = Number(localStorage.getItem("bestLevel")) || 1;
var completedDisplay = document.getElementById("completed");
var completedLevels =
    Number(localStorage.getItem("completedLevels")) || 0;
completedDisplay.textContent =
    "Levels Completed: " + completedLevels;
var progressBar = document.getElementById("progress-bar");
var progressText = document.getElementById("progress-text");
var level = Number(localStorage.getItem("gameLevel")) || 1;
var maxLevel = 500;
var bestLevel =
    Number(localStorage.getItem("bestLevel")) || 1;
var minNumber = 1;
var maxNumber = 20;
var randomNumber;
var Score =
    Number(localStorage.getItem("gameScore")) || 5;
var streakDisplay =
    document.getElementById("streak");   
streakDisplay.textContent =
    "🔥 Streak: " + streak;     
var maxAttempts = 5;
var attempts = 0;
var gameOver = false;
var streak =
    Number(localStorage.getItem("streak")) || 0;
function updateDifficulty() {
    minNumber = 1;
    if (level <= 10) {
        maxNumber = 20;
        maxAttempts = 5;
        Score = 5;
    }
    else if (level <= 25) {
        maxNumber = 50;
        maxAttempts = 4;
        Score = 4;
    }
    else if (level <= 50) {
        maxNumber = 100;
        maxAttempts = 3;
        Score = 3;
    }
    else if (level <= 100) {
        maxNumber = 250;
        maxAttempts = 3;
        Score = 3;
    }
    else if (level <= 200) {
        maxNumber = 500;
        maxAttempts = 3;
        Score = 3;
    }
    else if (level <= 300) {
        maxNumber = 1000;
        maxAttempts = 3;
        Score = 3;
    }
    else if (level <= 400) {
        maxNumber = 2500;
        maxAttempts = 3;
        Score = 3;
    }
    else {
        maxNumber = 5000;
        maxAttempts = 3;
        Score = 3;
    }
}
function getDifficultyMessage() {

    if (level <= 10) {
        return "🌱 Beginner Zone";
    }
    else if (level <= 25) {
        return "🔥 Getting Harder!";
    }
    else if (level <= 50) {
        return "⚡ Challenge Zone";
    }
    else if (level <= 100) {
        return "🚀 Advanced Zone";
    }
    else if (level <= 200) {
        return "💪 Expert Zone";
    }
    else if (level <= 300) {
        return "🧠 Master Zone";
    }
    else if (level <= 400) {
        return "👑 Legendary Zone";
    }
    else {
        return "🏆 Ultimate Zone";
    }
}
function startLevel() {
    updateDifficulty();
    randomNumber = Math.floor(
        Math.random() * (maxNumber - minNumber + 1)
    ) + minNumber;
       attempts = 0;
    gameOver = false;
    levelDisplay.textContent =
        "Level: " + level;
    bestLevelDisplay.textContent =
    "Best Level: " + bestLevel;
    progressBar.style.width =
        (level / maxLevel * 100) + "%";

    progressText.textContent =
        "Progress: " + level + " / " + maxLevel;

    score.textContent =
        "Score: " + Score;

    attemptsDisplay.textContent =
        "Attempts: 0";

    chances.textContent =
        "Chances Left: " + maxAttempts;

    result.textContent =
        "🎯 Level " + level + " - Make your guess!";

    hint.textContent =
        "💡 Guess a number between " +
        minNumber + " and " + maxNumber;

    guessnumber.placeholder =
        "Enter " + minNumber + " - " + maxNumber;

    guessnumber.value = "";
}
startLevel(); 
function check() {
    if (gameOver) {
        result.textContent = "🎮 Game Over! Click Play Again.";
        return;
    }

    var enteredNumber = Number(guessnumber.value);
    if (guessnumber.value === "") {
        result.textContent = "⚠️ Please enter a number!";
        return;
    }

    if (
        enteredNumber < minNumber ||
        enteredNumber > maxNumber
    ) {

        result.textContent = "⚠️ Enter a number between " + minNumber + " and " + maxNumber;
        return;
    }
    attempts++;
   attemptsDisplay.textContent = "Attempts: " + attempts;
   chances.textContent = "Chances Left: " + (maxAttempts - attempts);
    if (enteredNumber === randomNumber) {
        streak++;
       streakDisplay.textContent =
    "🔥 Streak: " + streak;
    localStorage.setItem("streak", streak);
        Score += 5;
        localStorage.setItem("gameScore", Score);
        var completedLevels =
            Number(localStorage.getItem("completedLevels")) || 0;
        completedLevels++;
        localStorage.setItem(
            "completedLevels",
            completedLevels
        );
        completedDisplay.textContent = "Levels Completed: " + completedLevels;
        result.textContent = "🎉 Correct! Level " + level + " Complete!";
        levelMessage.style.display = "block";
        if (level === maxLevel) {
            result.textContent = "🏆 AMAZING! You completed all 500 levels!";
            hint.textContent = "🎮 You are a Number Guessing Master!";
            gameOver = true;
            return;
        }
       hint.textContent = "🏆 Get ready for Level " + (level + 1) + "!";
        alert(
            "🎉 Level " +
            level +
            " Complete!"
        );
        nextLevel();
        return;
    }
    Score--;
    score.textContent =
        "Score: " + Score;
    if (enteredNumber > randomNumber) {
        result.textContent =
            "⬇️ Too High!";
    }
    else {
        result.textContent =
            "⬆️ Too Low!";
    }
    var difference =
        Math.abs(enteredNumber - randomNumber);
    if (difference <= 2) {
           hint.textContent = "🔥 Very close!";
    }
    else if (difference <= 5) {
     hint.textContent = "👍 You're close!";
    }
    else if (difference <= 10) {
     hint.textContent = "🙂 Getting closer!";
    }
    else {
     hint.textContent = "💡 You're far away. Try again!";
    }
    if (
        attempts >= maxAttempts ||
        Score <= 0
    ) {
      gameOver = true;
      streak = 0;

streakDisplay.textContent =
    "🔥 Streak: " + streak;
     result.textContent = "💀 Game Over!";
     hint.textContent = "🎯 The number was " + randomNumber;
    }
}
function restartGame() {

    // Reset attempts and game state
    attempts = 0;
    gameOver = false;

    // Set difficulty according to current level
    updateDifficulty();

    // Generate a new random number
    randomNumber = Math.floor(
        Math.random() * (maxNumber - minNumber + 1)
    ) + minNumber;

    // Update level
    levelDisplay.textContent =
        "Level: " + level;

    // Update progress bar
    progressBar.style.width =
        (level / maxLevel * 100) + "%";

    progressText.textContent =
        "Progress: " + level + " / " + maxLevel;

    // Update score
    score.textContent =
        "Score: " + Score;

    // Update attempts
    attemptsDisplay.textContent =
        "Attempts: 0";

    // Update chances
    chances.textContent =
        "Chances Left: " + maxAttempts;

    // Update message
    result.textContent =
        "🎯 Level " + level + " - Try Again!";

    // Update hint
    hint.textContent =
        "💡 Guess a number between " +
        minNumber + " and " + maxNumber;

    // Update placeholder
    guessnumber.placeholder =
        "Enter " + minNumber + " - " + maxNumber;
    guessnumber.value = "";
    guessnumber.focus();
}
function nextLevel() {

    // Move to next level
    level++;

    // Update best level
    if (level > bestLevel) {
        bestLevel = level;
        localStorage.setItem("bestLevel", bestLevel);
    }

    // Check Level 500
    if (level > maxLevel) {

        level = maxLevel;

        result.textContent =
            "🏆 Congratulations! You completed all 500 levels!";

        hint.textContent =
            "🎮 You are a Number Guessing Master!";

        gameOver = true;

        return;
    }

    // Save current level
    localStorage.setItem("gameLevel", level);

    // Update difficulty
    updateDifficulty();

    // Reset attempts
    attempts = 0;

    // Reset game state
    gameOver = false;
    levelMessage.style.display = "none";
    // Generate new random number
    randomNumber = Math.floor(
        Math.random() * (maxNumber - minNumber + 1)
    ) + minNumber;

    // Update level display
    levelDisplay.textContent =
        "Level: " + level;
    bestLevelDisplay.textContent =
    "Best Level: " + bestLevel;
    // Update progress bar
    progressBar.style.width =
        (level / maxLevel * 100) + "%";

    // Update progress text
    progressText.textContent =
        "Progress: " + level + " / " + maxLevel;

    // Update score
    score.textContent =
        "Score: " + Score;

    // Update attempts
    attemptsDisplay.textContent =
        "Attempts: 0";

    // Update chances
    chances.textContent =
        "Chances Left: " + maxAttempts;

    // Update result
    result.textContent =
        getDifficultyMessage() + " — Level " + level;

    // Update hint
    hint.textContent =
        "💡 Guess a number between " +
        minNumber + " and " + maxNumber;

    // Clear input
    guessnumber.value = "";

    // Update placeholder
    guessnumber.placeholder =
        "Enter " + minNumber + " - " + maxNumber;

    // Focus input
    guessnumber.focus();
}
function resetProgress() {

    // Clear saved progress
    localStorage.removeItem("gameLevel");
    localStorage.removeItem("bestLevel");
    localStorage.removeItem("gameScore");
    localStorage.removeItem("completedLevels");
    localStorage.removeItem("streak");

    // Reset variables
    level = 1;
    bestLevel = 1;
    Score = 5;
    streak = 0;
    attempts = 0;
    gameOver = false;

    // Set Level 1 difficulty
    updateDifficulty();

    // Generate new number
    randomNumber = Math.floor(
        Math.random() * (maxNumber - minNumber + 1)
    ) + minNumber;

    // Update Level
    levelDisplay.textContent =
        "Level: " + level;

    // Update Best Level
    bestLevelDisplay.textContent =
        "Best Level: " + bestLevel;

    // Update Completed Levels
    completedDisplay.textContent =
        "Levels Completed: 0";

    // Update Score
    score.textContent =
        "Score: " + Score;

    // Update Attempts
    attemptsDisplay.textContent =
        "Attempts: 0";

    // Update Chances
    chances.textContent =
        "Chances Left: " + maxAttempts;

    // Update Progress
    progressBar.style.width =
        (level / maxLevel * 100) + "%";

    progressText.textContent =
        "Progress: " + level + " / " + maxLevel;

    // Update message
    result.textContent =
        "🎯 Game restarted from Level 1!";

    hint.textContent =
        "💡 Guess a number between " +
        minNumber + " and " + maxNumber;

    // Reset input
    guessnumber.value = "";

    guessnumber.placeholder =
        "Enter " + minNumber + " - " + maxNumber;

    guessnumber.focus();

    // Hide level complete message
    levelMessage.style.display = "none";
}