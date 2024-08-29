const jsConfetti = new JSConfetti();
const rawWords = await fetch("./words-es.json");
const words = await rawWords.json();

const paragraphElement = document.querySelector("p");
const inputElement = document.querySelector("input");
const timeElement = document.querySelector("time");
const dialogElement = document.querySelector("dialog");
const restartButtonElement = document.querySelector("button");

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
    paragraphElement.innerHTML = "";

    words.forEach((word, index) => {
      const wordElement = document.createElement("word");
      word.split("").forEach((letter) => {
        const letterElement = document.createElement("letter");
        letterElement.textContent = letter;
        wordElement.appendChild(letterElement);
      });

      if (index === 0) {
        wordElement.classList.add("current");
      }

      paragraphElement.appendChild(wordElement);
    });

    timeElement.textContent = formatTime(INITIAL_TIME);
  };

  start = () => {
    if (!this.gameStart) {
      this.gameStart = true;
      const countdownInterval = setInterval(() => {
        this.timeLeft--;
        timeElement.textContent = formatTime(this.timeLeft);

        // End the game when time reaches zero.
        if (this.timeLeft < 0) {
          clearInterval(countdownInterval);
          this.end();
        }
      }, 1000);
    }
  };

  update = ({ key, value }) => {
    const currentWord = document.querySelector("word.current");
    const successTyped = value.toLowerCase() === currentWord.textContent.toLowerCase();

    // If key pressed is Space, change the current word.
    if (key === SPACE_KEY && value !== "") {
      // Update word's class based on correctness.
      currentWord.classList.add(successTyped ? "correct" : "incorrect");

      // Remove current highlight and apply it to the next word.
      currentWord.classList.remove("current");
      currentWord.nextElementSibling.classList.add("current");
    }

    // If key pressed is not space, save the keystroke letter.
    if (key !== SPACE_KEY && !successTyped) {
      this.score.keystrokes.push(true);
    }
  };

  setScore = () => {
    const wordsPerMinuteElement = document.getElementById("words-per-minute");
    const correctWordsElement = document.getElementById("correct-words");
    const incorrectWordsElement = document.getElementById("incorrect-words");
    const totalKeystrokesElement = document.getElementById("total-keystrokes");
    const correctKeystrokesElement = document.getElementById("correct-keystrokes");
    const incorrectKeystrokesElement = document.getElementById("incorrect-keystrokes");
    const accuracyElement = document.getElementById("accuracy");

    const totalIncorrectWords = document.querySelectorAll("word.incorrect").length;
    const totalCorrectWords = document.querySelectorAll("word.correct").length;
    const totalWordsPerMinute = (totalCorrectWords * 60) / this.time;

    wordsPerMinuteElement.textContent = Math.round(totalWordsPerMinute);
    correctWordsElement.textContent = totalCorrectWords;
    incorrectWordsElement.textContent = totalIncorrectWords;

    const totalKeystrokes = this.score.keystrokes.length;
    const correctKeystrokes = this.score.keystrokes.filter((keystroke) => keystroke).length;
    const incorrectKeystrokes = totalKeystrokes - correctKeystrokes;

    totalKeystrokesElement.textContent = totalKeystrokes;
    correctKeystrokesElement.textContent = correctKeystrokes;
    incorrectKeystrokesElement.textContent = incorrectKeystrokes;

    const accuracy = (correctKeystrokes / totalKeystrokes) * 100;
    accuracyElement.textContent = `${accuracy}%`;
  };

  end = () => {
    jsConfetti.addConfetti();
    this.setScore();
    dialogElement.showModal();
  };

  restart = () => {
    this.gameStart = false;
    this.timeLeft = this.time;
    this.score = {
      keystrokes: [],
    };
    this.init();
    dialogElement.close();
  };
}

const game = new TypingGame({ words, time: INITIAL_TIME });
game.init();

// Add keydown event listener to the input.
inputElement.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.altKey || event.shiftKey) return;

  // If a key was pressed, start the game.
  game.start();

  // Update the game with the value word.
  const trimmedValue = inputElement.value.trim();
  game.update({ key: event.key, value: trimmedValue });

  // if the spacebar is pressed clear the input value.
  if (event.key === SPACE_KEY) {
    inputElement.value = "";
  }
});

restartButtonElement.addEventListener("click", () => {
  game.restart();
});
