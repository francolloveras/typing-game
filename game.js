import { WORDS } from "./words.js";

const jsConfetti = new JSConfetti();

const SPACE_KEY = " ";
const BACKSPACE_KEY = "Backspace";
const ACCENT_KEY = "Dead";

export default class Game {
  constructor({ $board, time, language }) {
    this.$board = $board;
    this.time = time;
    this.language = language;

    this.gameStart = false;
    this.timeLeft = this.time;
    this.keystrokes = [];
    this.eventInitialized = false;

    this.$paragraph = this.$board.querySelector("p");
    this.$input = this.$board.querySelector("input");
    this.$time = this.$board.querySelector("time");
    this.$score = this.$board.querySelector("dialog#score");
    this.$restartButtons = this.$board.querySelectorAll("button#restart");

    this.initGlobalEvents();
  }

  init() {
    this.restart();

    const words = WORDS[this.language];
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

      this.$paragraph.appendChild($word);

      const rect = $word.getBoundingClientRect();
      $word.setAttribute("top", rect.top);
    });

    this.initEvents();
  }

  initGlobalEvents() {
    // keyboard shortcut to restart the game.
    document.addEventListener("keydown", (event) => {
      if (event.shiftKey && event.key.toLowerCase() === "r") {
        event.preventDefault();
        this.init();
      }
    });
  }

  initEvents() {
    if (!this.eventInitialized) {
      // Add keydown event listener to the input.
      this.$input.addEventListener("keydown", (event) => {
        if (event.ctrlKey || event.altKey || event.shiftKey) {
          return;
        }

        // If a key was pressed, start the game.
        this.start();

        // Update the game with the value word.
        const trimmedValue = this.$input.value.trim();
        this.update({ key: event.key, value: trimmedValue });

        // if the spacebar is pressed clear the input value.
        if (event.key === SPACE_KEY) {
          this.$input.value = "";
        }
      });

      this.$restartButtons.forEach((button) => {
        button.addEventListener("click", () => {
          this.init();
        });
      });

      this.inputInitialized = true;
    }
  }

  start() {
    if (!this.gameStart) {
      this.gameStart = true;
      const countdownInterval = setInterval(() => {
        this.timeLeft--;
        this.$time.textContent = formatTime(this.timeLeft);
        this.$input.focus();

        // End the game when time reaches zero.
        if (this.timeLeft < 0) {
          clearInterval(countdownInterval);
          this.end();
          return;
        }
      }, 1000);
    }
  }

  end() {
    const $wordsPerMinute = document.querySelector("#words-per-minute");
    const $correctWords = document.querySelector("#correct-words");
    const $incorrectWords = document.querySelector("#incorrect-words");

    const totalIncorrectWords = document.querySelectorAll("word.incorrect").length;
    const totalCorrectWords = document.querySelectorAll("word.correct").length;
    const totalWordsPerMinute = (totalCorrectWords * 60) / this.time;

    $wordsPerMinute.textContent = Math.round(totalWordsPerMinute);
    $correctWords.textContent = totalCorrectWords;
    $incorrectWords.textContent = totalIncorrectWords;

    const $totalKeystrokes = document.querySelector("#total-keystrokes");
    const $correctKeystrokes = document.querySelector("#correct-keystrokes");
    const $incorrectKeystrokes = document.querySelector("#incorrect-keystrokes");

    const totalKeystrokes = this.keystrokes.length;
    const correctKeystrokes = this.keystrokes.filter((keystroke) => keystroke).length;
    const incorrectKeystrokes = totalKeystrokes - correctKeystrokes;

    $totalKeystrokes.textContent = totalKeystrokes;
    $correctKeystrokes.textContent = correctKeystrokes;
    $incorrectKeystrokes.textContent = incorrectKeystrokes;

    const $accuracy = document.querySelector("#accuracy");

    const accuracy = (correctKeystrokes / totalKeystrokes) * 100;
    $accuracy.textContent = isNaN(accuracy) ? "0%" : `${accuracy.toFixed(2)}%`;

    jsConfetti.addConfetti();
    this.$score.showModal();
  }

  update({ key, value }) {
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
        this.$paragraph.scroll({
          top: this.$paragraph.scrollTop + $currentWord.clientHeight,
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

      this.keystrokes.push(letterSuccessTyped);
    }
  }

  restart() {
    this.time = localStorage.getItem("gameTime") ?? this.time;
    this.language = localStorage.getItem("wordsLanguage") ?? this.language;

    this.gameStart = false;
    this.timeLeft = this.time;
    this.keystrokes = [];

    this.$paragraph.innerHTML = "";
    this.$input.value = "";
    this.$score.close();
    this.$time.textContent = formatTime(this.time);
  }
}

// Util function to format time.
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}
