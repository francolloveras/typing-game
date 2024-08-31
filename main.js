import { words } from "./words-es.js";

const jsConfetti = new JSConfetti();
const $paragraph = document.querySelector("p");
const $input = document.querySelector("input");
const $time = document.querySelector("time");
const $dialog = document.querySelector("dialog");
const $restartButton = document.querySelector("button");

const INITIAL_TIME = 15;
const SPACE_KEY = " ";

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

let timeLeft = INITIAL_TIME;
let gameStart = false;
// TODO DELETE THIS VARIABLE.
let score = {
  keystrokes: [],
};

const game = {
  init: () => {
    $paragraph.innerHTML = "";

    // Get randoms words sorted with Math.random() and slice based on average WPM record and the time.
    const randomWords = words.toSorted(() => Math.random() - 0.5).slice(0, (300 / 60) * INITIAL_TIME);

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

    console.log($paragraph.childElementCount);

    $time.textContent = formatTime(INITIAL_TIME);
  },
  start: () => {
    if (!gameStart) {
      gameStart = true;
      const countdownInterval = setInterval(() => {
        timeLeft--;
        $time.textContent = formatTime(timeLeft);

        // End the game when time reaches zero.
        if (timeLeft < 0) {
          clearInterval(countdownInterval);
          game.end();
        }
      }, 1000);
    }
  },
  update: ({ key, value }) => {
    const $currentWord = document.querySelector("word.current");
    const $nextWord = $currentWord.nextElementSibling;
    const successTyped = value.toLowerCase() === $currentWord.textContent.toLowerCase();

    // If key pressed is Space, change the current word.
    if (key === SPACE_KEY && value !== "") {
      // Update word's class based on correctness.
      $currentWord.classList.add(successTyped ? "correct" : "incorrect");

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

    // If key pressed is not space, save the keystroke letter.
    if (key !== SPACE_KEY && !successTyped) {
      score.keystrokes.push(true);
    }
  },
  end: () => {
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

    const totalKeystrokes = score.keystrokes.length;
    const correctKeystrokes = score.keystrokes.filter((keystroke) => keystroke).length;
    const incorrectKeystrokes = totalKeystrokes - correctKeystrokes;

    $totalKeystrokes.textContent = totalKeystrokes;
    $correctKeystrokes.textContent = correctKeystrokes;
    $incorrectKeystrokes.textContent = incorrectKeystrokes;

    const accuracy = (correctKeystrokes / totalKeystrokes) * 100;
    $accuracy.textContent = `${accuracy}%`;

    jsConfetti.addConfetti();
    $dialog.showModal();
  },
  restart: () => {
    gameStart = false;
    timeLeft = INITIAL_TIME;
    score = {
      keystrokes: [],
    };
    game.init();
    $dialog.close();
    $input.value = "";
  },
};

game.init();

// Add keydown event listener to the input.
$input.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.altKey || event.shiftKey) return;

  // If a key was pressed, start the game.
  game.start();

  // Update the game with the value word.
  const trimmedValue = $input.value.trim();
  game.update({ key: event.key, value: trimmedValue });

  // if the spacebar is pressed clear the input value.
  if (event.key === SPACE_KEY) {
    $input.value = "";
  }
});

$restartButton.addEventListener("click", () => {
  game.restart();
});
