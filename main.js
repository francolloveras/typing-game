import Game from "./game.js";

const $board = document.querySelector("main");

const game = new Game({
  $board: $board,
  time: localStorage.getItem("gameTime") ?? 15,
  language: localStorage.getItem("wordsLanguage") ?? "en",
});

game.init();

// Settings logic

const $dialogSettings = document.querySelector("dialog#settings");
const $settingsButton = document.querySelector("button#settings");
const $closeDialogButton = document.querySelector("button#close-dialog");
const $gameTime = document.querySelector("select#game-time");
const $pageLanguage = document.querySelector("select#page-language");
const $wordsLanguage = document.querySelector("select#words-language");

$settingsButton.addEventListener("click", () => {
  $dialogSettings.showModal();
});

$closeDialogButton.addEventListener("click", () => {
  $dialogSettings.close();
});

$gameTime.addEventListener("change", (event) => {
  const selectedTime = event.target.value;

  localStorage.setItem("gameTime", selectedTime);
  game.init();
});

$wordsLanguage.addEventListener("change", (event) => {
  const selectedLanguage = event.target.value;

  localStorage.setItem("wordsLanguage", selectedLanguage);
  game.init();
});

function changePageLanguage(language) {
  const $translatable = document.querySelectorAll("[data-en]");

  $translatable.forEach((element) => {
    element.textContent = element.getAttribute(`data-${language}`);
  });
}

$pageLanguage.addEventListener("change", (event) => {
  const selectedLanguage = event.target.value;

  localStorage.setItem("selectedLanguage", selectedLanguage);
  changePageLanguage(selectedLanguage);
});

document.addEventListener("DOMContentLoaded", () => {
  // Get saved language preference, if exists.
  const gameTime = localStorage.getItem("gameTime") ?? 15;
  const pageLanguage = localStorage.getItem("pageLanguage") ?? "en";
  const wordsLanguage = localStorage.getItem("wordsLanguage") ?? "en";

  $gameTime.value = gameTime;
  $wordsLanguage.value = wordsLanguage;
  $pageLanguage.value = pageLanguage;
  changePageLanguage(pageLanguage);
});
