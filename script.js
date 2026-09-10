var game = document.querySelector(".game");

var guessnumber = document.getElementById("guessnumber");

var result = document.getElementById("result");

var score = document.getElementById("score");

var hint = document.getElementById("hint");

var levelMessage = document.getElementById("levelMessage");

var chances = document.getElementById("chances");

var attemptsDisplay = document.getElementById("attempts");

var levelDisplay = document.getElementById("level");

var bestLevelDisplay =
    document.getElementById("bestLevel");

var completedDisplay =
    document.getElementById("completed");

var progressBar =
    document.getElementById("progress-bar");

var progressText =
    document.getElementById("progress-text");


var level =
    Number(localStorage.getItem("gameLevel")) || 1;

var maxLevel = 500;

var bestLevel =
    Number(localStorage.getItem("bestLevel")) || 1;

var completedLevels =
    Number(localStorage.getItem("completedLevels")) || 0;

var minNumber = 1;

var maxNumber = 20;

var randomNumber;

var startingScore = 5;

var Score = Number(localStorage.getItem("gameScore")) || 5;

var streak =
    Number(localStorage.getItem("streak")) || 0;
var bestStreak =
    Number(localStorage.getItem("bestStreak")) || 0;

var streakDisplay =
    document.getElementById("streak");
var bestStreakDisplay =
    document.getElementById("bestStreak");    

var maxAttempts = 5;

var bonusChances = 0;

var attempts = 0;



var gameOver = false;


// Display saved values

completedDisplay.textContent =
    "Levels Completed: " + completedLevels;

streakDisplay.textContent =
    "🔥 Streak: " + streak;

bestLevelDisplay.textContent =
    "Best Level: " + bestLevel;
bestStreakDisplay.textContent =
    "🏆 Best Streak: " + bestStreak;    
function updateDifficulty() {

    minNumber = 1;

    if (level <= 10) {

        maxNumber = 20;
        maxAttempts = 5;

    }
    else if (level <= 25) {

        maxNumber = 50;
        maxAttempts = 4;

    }
    else if (level <= 50) {

        maxNumber = 100;
        maxAttempts = 3;

    }
    else if (level <= 100) {

        maxNumber = 250;
        maxAttempts = 3;

    }
    else if (level <= 200) {

        maxNumber = 500;
        maxAttempts = 3;

    }
    else if (level <= 300) {

        maxNumber = 1000;
        maxAttempts = 3;

    }
    else if (level <= 400) {

        maxNumber = 2500;
        maxAttempts = 3;

    }
    else {

        maxNumber = 5000;
        maxAttempts = 3;

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
    game.classList.remove("win");
    game.classList.remove("wrong");
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

   chances.textContent = "❤️ Chances Left: " + maxAttempts + " / 10";

    result.textContent =
        "🎯 Level " + level + " - Make your guess!";

    hint.textContent =
    "🎯 Range: " + minNumber + " - " + maxNumber;

    guessnumber.placeholder =
        "Enter " + minNumber + " - " + maxNumber;

    guessnumber.value = "";
}
startLevel(); 
function check() {
    fetch("http://localhost:8080/api/guess?number=" + guessnumber.value)
    .then(response => response.text())
    .then(data => {
        result.textContent = data;
    });
    if (gameOver) {
        result.textContent = "🎮 Game Over! Click Play Again.";
        return;
    }

    var enteredNumber = Number(guessnumber.value);
    if (guessnumber.value === "") {
        guessnumber.select();
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
    var remainingChances = maxAttempts - attempts;
    guessnumber.value = "";
    guessnumber.focus();
   attemptsDisplay.textContent = "Attempts: " + attempts;
   chances.textContent = "Chances Left: " + remainingChances;
    if (enteredNumber === randomNumber) {
        bonusChances = remainingChances;
        streak++;
        result.textContent = "🎉 Correct! 🔥 Streak: " + streak;
       streakDisplay.textContent =
    "🔥 Streak: " + streak;
    if (streak > bestStreak) {

    bestStreak = streak;

    localStorage.setItem(
        "bestStreak",
        bestStreak
    );

    bestStreakDisplay.textContent =
        "🏆 Best Streak: " + bestStreak;
}
    localStorage.setItem("streak", streak);

     localStorage.setItem("gameScore", Score);
      score.textContent =
        "Score: " + Score;
    
result.textContent =
    "🎉 Correct! 🔥 Streak: " + streak;

        game.classList.add("win");

        result.classList.remove("result-success");

void result.offsetWidth;

result.classList.add("result-success");

        var completedLevels =
            Number(localStorage.getItem("completedLevels")) || 0;
        completedLevels++;
        localStorage.setItem(
            "completedLevels",
            completedLevels
        );
        completedDisplay.textContent = "Levels Completed: " + completedLevels;
        result.textContent =
    "🎉 Level " + level + " Complete! +" +
    bonusChances + " bonus chances!";
        levelMessage.style.display = "block";
        if (level === maxLevel) {
            result.textContent = "🏆 AMAZING! You completed all 500 levels!";
            hint.textContent = "🎮 You are a Number Guessing Master!";
            gameOver = true;
            
            return;
        }
       hint.textContent = "🏆 Get ready for Level " + (level + 1) + "!";
        
        nextLevel();
        return;
    }
    Score = Math.max(0, Score - 1);
    localStorage.setItem("gameScore", Score);
    score.textContent =
        "Score: " + Score;
        game.classList.remove("wrong");

void game.offsetWidth;

game.classList.add("wrong");
    result.classList.remove("result-wrong");

void result.offsetWidth;

result.classList.add("result-wrong");
    if (enteredNumber > randomNumber) {
        result.textContent =
            "⬇️ Too High!";
    }
    else {
        result.textContent =
            "⬆️ Too Low!";
    }
   var difference = Math.abs(enteredNumber - randomNumber);

if (difference <= 1) {
    hint.textContent = "🔥🔥 Extremely Hot!";
}
else if (difference <= 3) {
    hint.textContent = "🔥 Very Hot!";
}
else if (difference <= 5) {
    hint.textContent = "🌡️ Hot!";
}
else if (difference <= 10) {
    hint.textContent = "🙂 Warm!";
}
else if (difference <= 20) {
    hint.textContent = "🥶 Cold!";
}
else {
    hint.textContent = "❄️ Very Cold!";
}
    if (attempts >= maxAttempts) {
      gameOver = true;
     
      streak = 0;

streakDisplay.textContent =
    "🔥 Streak: " + streak;
    localStorage.setItem("streak", streak);
     result.textContent = "💀 Game Over!";
     hint.textContent = "🎯 The number was " + randomNumber;
    }
}

function restartGame() {
    level = 1;
localStorage.setItem("gameLevel", level);

streak = 0;
localStorage.setItem("streak", streak);

bonusChances = 0;
    game.classList.remove("win");
    game.classList.remove("wrong");
    // Reset attempts and game state
    attempts = 0;
    gameOver = false;
  
    // Set difficulty according to current level
    updateDifficulty();
     Score = startingScore;
     localStorage.setItem("gameScore", Score);
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
    "❤️ Chances Left: " + maxAttempts + " / 10";

    // Update message
    result.textContent =
        "🎯 Level " + level + " - Try Again!";

    // Update hint
   hint.textContent = "🎯 Range: " + minNumber + " - " + maxNumber;
    // Update placeholder
    guessnumber.placeholder =
        "Enter " + minNumber + " - " + maxNumber;
    guessnumber.value = "";
    guessnumber.focus();
    guessnumber.select();
    levelMessage.style.display = "none";
}
function nextLevel() {
     game.classList.remove("win");
     game.classList.remove("wrong");
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
    updateDifficulty();


maxAttempts = Math.min(maxAttempts + bonusChances, 10);

attempts = 0;
bonusChances = 0;
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
   chances.textContent = "❤️ Chances Left: " + maxAttempts + " / 10";

    // Update result
    result.textContent =
    getDifficultyMessage() + " — Level " + level +
    " 🎯 1-" + maxNumber;

    // Update hint
   hint.textContent = "🎯 Range: " + minNumber + " - " + maxNumber;

    // Clear input
    guessnumber.value = "";

    // Update placeholder
    guessnumber.placeholder =
        "Enter " + minNumber + " - " + maxNumber;

    // Focus input
    guessnumber.focus();
}
function resetProgress() {
   if (!confirm("Are you sure you want to reset all progress?")) {
    return;
}
    // Clear saved progress
    localStorage.removeItem("gameLevel");
    localStorage.removeItem("bestLevel");
    localStorage.removeItem("gameScore");
    localStorage.removeItem("completedLevels");
    localStorage.removeItem("streak");
    localStorage.removeItem("bestStreak");
    // Reset variables
    level = 1;
    bestLevel = 1;
    Score = 5;
    streak = 0;
    bestStreak = 0;
    attempts = 0;
    bonusChances = 0;
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
    
     streakDisplay.textContent =
    "🔥 Streak: " + streak;

    bestStreakDisplay.textContent =
    "🏆 Best Streak: " + bestStreak;

    // Update Attempts
    attemptsDisplay.textContent =
        "Attempts: 0";

    // Update Chances
    chances.textContent =
    "❤️ Chances Left: " + maxAttempts + " / 10";

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
guessnumber.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        check();
    }
});

