import wordsEN from "./words-en.js";
import wordsES from "./words-es.js";

const jsConfetti = new JSConfetti();

const $paragraph = document.querySelector("p");
const $input = document.querySelector("input");
const $time = document.querySelector("time");
const $dialogScore = document.querySelector("dialog#score");
const $restartButtons = document.querySelectorAll("button#restart");

const INITIAL_TIME = 5;

const SPACE_KEY = " ";
const BACKSPACE_KEY = "Backspace";
const ACCENT_KEY = "Dead";

console.log(navigator.language);

const words = navigator.language === "en" ? wordsEN : wordsES;

let timeLeft = INITIAL_TIME;
let gameStart = false;
let keystrokes = [];

function initGame() {
  $paragraph.innerHTML = "";
  $input.value = "";
  $dialogScore.close();

  gameStart = false;
  timeLeft = INITIAL_TIME;
  keystrokes = [];

  const randomWords = words.toSorted(() => Math.random() - 0.5).slice(0, 300);

  randomWords.forEach((word, index) => {
    const $word = document.createElement("word");
    word.split("").forEach((letter) => {
      const $letter = document.createElement("letter");
      $letter.textContent = letter;
      $word.appendChild($letter);
    });

    if (index === 0) {
      $word.classList.add("current");
    }

    $paragraph.appendChild($word);

    const rect = $word.getBoundingClientRect();
    $word.setAttribute("top", rect.top);
  });

  $time.textContent = formatTime(timeLeft);
}

function startGame() {
  if (!gameStart) {
    gameStart = true;
    const countdownInterval = setInterval(() => {
      timeLeft--;
      $time.textContent = formatTime(timeLeft);
      $input.focus();

      // End the game when time reaches zero.
      if (timeLeft < 0) {
        clearInterval(countdownInterval);
        endGame();
      }
    }, 1000);
  }
}

function updateGame({ key, value }) {
  const $currentWord = document.querySelector("word.current");
  const $nextWord = $currentWord.nextElementSibling;
  const wordSuccessTyped = value.toLowerCase() === $currentWord.textContent.toLowerCase();

  // If key pressed is Space, change the current word.
  if (key === SPACE_KEY && value !== "") {
    // Update word's class based on correctness.
    $currentWord.classList.add(wordSuccessTyped ? "correct" : "incorrect");

    // Remove current highlight and apply it to the next word.
    $currentWord.classList.remove("current");
    $nextWord.classList.add("current");

    // If the currentWord top is lower that the nextWord top scroll word height.
    if ($currentWord.getAttribute("top") < $nextWord.getAttribute("top")) {
      $paragraph.scroll({
        top: $paragraph.scrollTop + $currentWord.clientHeight,
        behavior: "smooth",
      });
    }
  }

  // If key pressed is not space, backspace and accent key, save the keystroke letter.
  if (key !== SPACE_KEY && key !== BACKSPACE_KEY && key !== ACCENT_KEY) {
    const $letters = $currentWord.querySelectorAll("letter");
    const $currentLetter = $letters[value.split("").length];

    // Check if the key is the same as the last letter in the word.
    const letterSuccessTyped = key.toLowerCase() === $currentLetter.textContent.toLowerCase();

    if (letterSuccessTyped) {
      $currentLetter.classList.remove("incorrect");
    } else {
      $currentLetter.classList.add("incorrect");
    }

    keystrokes.push(letterSuccessTyped);
  }
}

function endGame() {
  const $wordsPerMinute = document.querySelector("#words-per-minute");
  const $correctWords = document.querySelector("#correct-words");
  const $incorrectWords = document.querySelector("#incorrect-words");
  const $totalKeystrokes = document.querySelector("#total-keystrokes");
  const $correctKeystrokes = document.querySelector("#correct-keystrokes");
  const $incorrectKeystrokes = document.querySelector("#incorrect-keystrokes");
  const $accuracy = document.querySelector("#accuracy");

  const totalIncorrectWords = document.querySelectorAll("word.incorrect").length;
  const totalCorrectWords = document.querySelectorAll("word.correct").length;
  const totalWordsPerMinute = (totalCorrectWords * 60) / INITIAL_TIME;

  $wordsPerMinute.textContent = Math.round(totalWordsPerMinute);
  $correctWords.textContent = totalCorrectWords;
  $incorrectWords.textContent = totalIncorrectWords;

  const totalKeystrokes = keystrokes.length;
  const correctKeystrokes = keystrokes.filter((keystroke) => keystroke).length;
  const incorrectKeystrokes = totalKeystrokes - correctKeystrokes;

  $totalKeystrokes.textContent = totalKeystrokes;
  $correctKeystrokes.textContent = correctKeystrokes;
  $incorrectKeystrokes.textContent = incorrectKeystrokes;

  const accuracy = (correctKeystrokes / totalKeystrokes) * 100;
  $accuracy.textContent = isNaN(accuracy) ? "0%" : `${accuracy.toFixed(2)}%`;

  jsConfetti.addConfetti();
  $dialogScore.showModal();
}

initGame();

// Add keydown event listener to the input.
$input.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.altKey || event.shiftKey) return;

  // If a key was pressed, start the game.
  startGame();

  // Update the game with the value word.
  const trimmedValue = $input.value.trim();
  updateGame({ key: event.key, value: trimmedValue });

  // if the spacebar is pressed clear the input value.
  if (event.key === SPACE_KEY) {
    $input.value = "";
  }
});

$restartButtons.forEach((button) => {
  button.addEventListener("click", () => {
    initGame();
  });
});

// keyboard shortcut to restart the game.

document.addEventListener("keydown", (event) => {
  if (event.altKey && event.key.toLowerCase() === "r") {
    event.preventDefault();
    initGame();
  }
});

// Settings logic

const $dialogSettings = document.querySelector("dialog#settings");
const $settingsButton = document.querySelector("button#settings");
const $closeDialogButton = document.querySelector("button#close-dialog");
const $timeInput = document.querySelector("input#time");
const $languageSelect = document.querySelector("select#page-language");

$timeInput.value = INITIAL_TIME;

$settingsButton.addEventListener("click", () => {
  $dialogSettings.showModal();
});

$closeDialogButton.addEventListener("click", () => {
  $dialogSettings.close();
});

function changeLanguage(language) {
  const $translatable = document.querySelectorAll("[data-en]");

  $translatable.forEach((element) => {
    element.textContent = element.getAttribute(`data-${language}`);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Get saved language preference, if exists.
  const savedLanguage = localStorage.getItem("selectedLanguage") || "en";

  $languageSelect.value = savedLanguage;
  changeLanguage(savedLanguage);

  $languageSelect.addEventListener("change", (event) => {
    const selectedLanguage = event.target.value;

    localStorage.setItem("selectedLanguage", selectedLanguage);
    changeLanguage(selectedLanguage);
  });
});

// Util function to format time.
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}
