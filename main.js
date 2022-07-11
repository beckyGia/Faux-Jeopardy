//INITIALIZE THE GAME BOARD ON PAGE LOAD
initCatRow();
initBoard();

document.querySelector("button").addEventListener("click", buildCategories);

document.querySelector("form").addEventListener("submit", handleFormSubmit);

//CREATE CATEGORY ROW

function initCatRow() {
  let catRow = document.getElementById("category-row");

  for (let i = 0; i < 6; i++) {
    let box = document.createElement("div");
    box.className = "clue-box category-box";
    catRow.appendChild(box);
  }
}

//CREATE CLUE BOARD

function initBoard() {
  let board = document.getElementById("clue-board");

  //GENERATE 5 ROWS, THEN PLACE 6 BOXES IN EACH ROW

  for (let i = 0; i < 5; i++) {
    let row = document.createElement("div");
    let boxValue = 200 * (i + 1);
    row.className = "clue-row";

    for (let j = 0; j < 6; j++) {
      let box = document.createElement("div");
      box.className = "clue-box";
      box.textContent = "$" + boxValue;
      box.addEventListener("click", getClue, false);
      row.appendChild(box);
    }
    board.appendChild(row);
  }
}

//CALL API

function randInt() {
  return Math.floor(Math.random() * 18418 + 1);
}

let catArray = [];

//build out the category row
function buildCategories() {
  if (!(document.getElementById("category-row").firstChild.innerText == "")) {
    resetBoard();
  }

  const fetchReq1 = fetch(
    `https://jservice.io/api/category?&id=${randInt()}`
  ).then((res) => res.json());

  const fetchReq2 = fetch(
    `https://jservice.io/api/category?&id=${randInt()}`
  ).then((res) => res.json());

  const fetchReq3 = fetch(
    `https://jservice.io/api/category?&id=${randInt()}`
  ).then((res) => res.json());

  const fetchReq4 = fetch(
    `https://jservice.io/api/category?&id=${randInt()}`
  ).then((res) => res.json());

  const fetchReq5 = fetch(
    `https://jservice.io/api/category?&id=${randInt()}`
  ).then((res) => res.json());

  const fetchReq6 = fetch(
    `https://jservice.io/api/category?&id=${randInt()}`
  ).then((res) => res.json());

  //Creates a Promise that is resolved with an array of results when all of the provided Promises resolve, or rejected when any Promise is rejected.
  const allData = Promise.all([
    fetchReq1,
    fetchReq2,
    fetchReq3,
    fetchReq4,
    fetchReq5,
    fetchReq6,
  ]);

  allData.then((res) => {
    console.log(res);
    catArray = res;
    console.log(catArray);
    setCategories(catArray);
  });
}

//RESET BOARD AND $$ AMOUNT IF NEEDED
function resetBoard() {
  let clueParent = document.getElementById("clue-board");
  while (clueParent.firstChild) {
    clueParent.removeChild(clueParent.firstChild);
  }
  let catParent = document.getElementById("category-row");
  while (catParent.firstChild) {
    catParent.removeChild(catParent.firstChild);
  }
  document.querySelector(".score-count").innerText = 0;
  initBoard();
  initCatRow();
}

//LOAD CATEGORIES TO THE BOARD

function setCategories(catArray) {
  let element = document.getElementById("category-row");

  //children are the boxes of the row
  let children = element.children;

  //looping through the children to add the title from the catArray that corresponds to the index and putting it into the DOM
  for (let i = 0; i < children.length; i++) {
    children[i].innerHTML = catArray[i].title;
  }
}

//FIGURE OUT WHICH ITEM WAS CLICKED

function getClue(event) {
  let child = event.currentTarget;
  let boxValue = child.innerHTML.slice(1);

  //Trying to find the index of the child in relation to its parent (clue-row)
  let parent = child.parentNode;
  let index = Array.prototype.findIndex.call(
    parent.children,
    (c) => c === child
  );

  //We know which category was clicked and then we can now return all the clues in that category
  let cluesList = catArray[index].clues;

  //find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, find immediately returns that element value. Otherwise, find returns undefined.

  //trying to find the first clue that has the same value amount as boxValue (if you click on 200, you are looking for a clue with a value of 200)
  let clue = cluesList.find((obj) => {
    return obj.value == boxValue;
  });

  console.log(clue);
  showQuestion(clue, child, boxValue, event);
}

//SHOW QUESTION TO USER AND GET THEIR ANSWER!

function showQuestion(clue, target, boxValue, event) {
  let child = event.currentTarget;

  //Mark this button as used
  child.classList.add("used");

  let inputElement = document.querySelector("input[name=user-answer]");
  let promptElement = document.querySelector(".prompt");
  let clueTextElement = document.querySelector(".clue-text");
  let resultTextElement = document.querySelector(".result_correct-answer-text");
  let valueAmountText = document.querySelector(".value-amount");
  target.removeEventListener("click", getClue, false);
  let possiblePoints = +boxValue;
  console.log(possiblePoints);

  //Clear out the input field
  inputElement.value = "";

  //Update the text
  clueTextElement.textContent = clue.question;
  resultTextElement.textContent = clue.answer;
  valueAmountText.textContent = clue.value;
  console.log(valueAmountText);

  //Hide the result
  promptElement.classList.remove("showing-result");

  //Show the modal
  promptElement.classList.add("visible");
  inputElement.focus();
}

function handleFormSubmit(event) {
  event.preventDefault();
  let inputElement = document.querySelector("input[name=user-answer]");
  // console.log(inputElement);
  let userAnswer = inputElement.value;
  console.log(userAnswer);
  evaluateAnswer(userAnswer);
}

function evaluateAnswer(userAnswer) {
  let resultTextElement = document.querySelector(".result_correct-answer-text");

  let currentClue = resultTextElement.textContent;
  let isCorrect = cleanseAnswer(userAnswer) === cleanseAnswer(currentClue);

  //Show Answer
  revealAnswer(isCorrect);
  awardPoints(isCorrect);
}

// Standardize an answer string so we can compare and accept variations
function cleanseAnswer(input = "") {
  let friendlyAnswer = input.toLowerCase();

  //remove any i tags
  friendlyAnswer = friendlyAnswer.replace("<i>", "");
  friendlyAnswer = friendlyAnswer.replace("</i>", "");

  // remove any space
  friendlyAnswer = friendlyAnswer.replace(/ /g, "");

  //remove a
  friendlyAnswer = friendlyAnswer.replace(/^a/, "");

  //remove an
  friendlyAnswer = friendlyAnswer.replace(/^an/, "");

  //trim out any whitespace
  return friendlyAnswer.trim();
}

function revealAnswer(isCorrect) {
  let promptElement = document.querySelector(".prompt");
  let successTextElement = document.querySelector(".result_success");
  let failTextElement = document.querySelector(".result_fail");

  //Show the individual success/fail case
  successTextElement.style.display = isCorrect ? "block" : "none";

  failTextElement.style.display = !isCorrect ? "block" : "none";

  //Show the whole result container
  promptElement.classList.add("showing-result");

  //Disappear after a short bit
  setTimeout(() => {
    promptElement.classList.remove("visible");
  }, 3000);
}

//AWARD POINTS

function awardPoints(isCorrect) {
  let valueResultText = document.querySelector(".value-amount");
  let amount = +valueResultText.textContent;
  if (isCorrect) {
    let target = document.querySelector(".score-count");
    let currentScore = +target.innerText;
    currentScore += amount;
    target.innerText = currentScore;
  }
}
