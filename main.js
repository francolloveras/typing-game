const jsConfetti = new JSConfetti();
const rawWords = await fetch("./words-es.json");
const words = await rawWords.json();

const $paragraph = document.querySelector("p");
const $input = document.querySelector("input");
const $time = document.querySelector("time");
const $dialog = document.querySelector("dialog");
const $restartButton = document.querySelector("button");

// Defining utils constants variables.
const INITIAL_TIME = 5;
const SPACE_KEY = " ";

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

class TypingGame {
  constructor({ words, time }) {
    this.words = words;
    this.time = time;
    this.timeLeft = time;
    this.gameStart = false;
    this.score = {
      keystrokes: [],
    };
  }

  init = () => {
    $paragraph.innerHTML = "";

    words.forEach((word, index) => {
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
    });

    $time.textContent = formatTime(INITIAL_TIME);
  };

  start = () => {
    if (!this.gameStart) {
      this.gameStart = true;
      const countdownInterval = setInterval(() => {
        this.timeLeft--;
        $time.textContent = formatTime(this.timeLeft);

        // End the game when time reaches zero.
        if (this.timeLeft < 0) {
          clearInterval(countdownInterval);
          this.end();
        }
      }, 1000);
    }
  };

  update = ({ key, value }) => {
    const $currentWord = document.querySelector("word.current");
    const successTyped = value.toLowerCase() === $currentWord.textContent.toLowerCase();

    // If key pressed is Space, change the current word.
    if (key === SPACE_KEY && value !== "") {
      // Update word's class based on correctness.
      $currentWord.classList.add(successTyped ? "correct" : "incorrect");

      // Remove current highlight and apply it to the next word.
      $currentWord.classList.remove("current");
      $currentWord.nextElementSibling.classList.add("current");
    }

    // If key pressed is not space, save the keystroke letter.
    if (key !== SPACE_KEY && !successTyped) {
      this.score.keystrokes.push(true);
    }
  };

  setScore = () => {
    const $wordsPerMinute = document.querySelector("#words-per-minute");
    const $correctWords = document.querySelector("#correct-words");
    const $incorrectWords = document.querySelector("#incorrect-words");
    const $totalKeystrokes = document.querySelector("#total-keystrokes");
    const $correctKeystrokes = document.querySelector("#correct-keystrokes");
    const $incorrectKeystrokes = document.querySelector("#incorrect-keystrokes");
    const $accuracy = document.querySelector("#accuracy");

    const totalIncorrectWords = document.querySelectorAll("word.incorrect").length;
    const totalCorrectWords = document.querySelectorAll("word.correct").length;
    const totalWordsPerMinute = (totalCorrectWords * 60) / this.time;

    $wordsPerMinute.textContent = Math.round(totalWordsPerMinute);
    $correctWords.textContent = totalCorrectWords;
    $incorrectWords.textContent = totalIncorrectWords;

    const totalKeystrokes = this.score.keystrokes.length;
    const correctKeystrokes = this.score.keystrokes.filter((keystroke) => keystroke).length;
    const incorrectKeystrokes = totalKeystrokes - correctKeystrokes;

    $totalKeystrokes.textContent = totalKeystrokes;
    $correctKeystrokes.textContent = correctKeystrokes;
    $incorrectKeystrokes.textContent = incorrectKeystrokes;

    const accuracy = (correctKeystrokes / totalKeystrokes) * 100;
    $accuracy.textContent = `${accuracy}%`;
  };

  end = () => {
    jsConfetti.addConfetti();
    this.setScore();
    $dialog.showModal();
  };

  restart = () => {
    this.gameStart = false;
    this.timeLeft = this.time;
    this.score = {
      keystrokes: [],
    };
    this.init();
    $dialog.close();
  };
}

const game = new TypingGame({ words, time: INITIAL_TIME });
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
