
//Adding event listeners to buttons and form submits

let loadCrosswordButton = document.getElementById("load-crossword");
loadCrosswordButton.addEventListener("click",loadCrossword);

let checkCrosswordButton = document.getElementById("check-crossword");
checkCrosswordButton.addEventListener("click",checkCrossword);

let cheatButton = document.getElementById("cheat-word");
cheatButton.addEventListener("click",solveWord);

let zoominButton = document.getElementById("zoom-in");
zoominButton.addEventListener("click",()=>changeCrosswordSize(1));

let zoomoutButton = document.getElementById("zoom-out");
zoomoutButton.addEventListener("click",()=>changeCrosswordSize(-1));

let wordInput = document.getElementById("word-input");
wordInput.addEventListener("input",()=>showWordPreview(wordInput.value));

let wordGuessForm = document.getElementById("word-guess");
wordGuessForm.addEventListener("submit", (e)=>{
  e.preventDefault();
  if(wordInput.value)
    submitWord(wordInput.value);
  wordInput.value = "";
});

// End adding listeners

// Setup dragging

let dragItem = document.getElementById("root");
let dragContainer = document.getElementById("view");

let drag = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

dragContainer.addEventListener("mousedown", startDrag, false);
dragContainer.addEventListener("mouseup", endDrag, false); 
dragContainer.addEventListener("mousemove", doDrag, false);

dragContainer.addEventListener("touchstart", startDrag, false);
dragContainer.addEventListener("touchend", endDrag, false); 
dragContainer.addEventListener("touchmove", doDrag, false);

function startDrag(e) {
  if (e.type === "touchstart") {
    initialX = e.touches[0].clientX - xOffset;
    initialY = e.touches[0].clientY - yOffset;
  } else {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
  }

  drag = true;
}

function doDrag(e) {
  if(drag) {
    e.preventDefault();

    if (e.type === "touchmove") {
      currentX = e.touches[0].clientX - initialX;
      currentY = e.touches[0].clientY - initialY;
    } else {
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
    }

    xOffset = currentX;
    yOffset = currentY;

    setTranslate(currentX, currentY, dragItem);
  }
}

function endDrag(e) {
  initialX = currentX;
  initialY = currentY;
  drag = false;
}

function setTranslate(x,y,item) {
  item.style.transform = "translate3d("+x+"px,"+y+"px, 0)";
}

// End setup dragging


let crossword = [];
let words = {};
let zoomLevel = 3;

//client-side
let newCrossword;
let activeWord;
let wordPreview;
let wrongAnswers = [];

function showHint(id) {
  let hintText = document.getElementById("hint-text");
  hintText.innerText = newCrossword.words[id].hint;
}

function setWordPreview(id) {
  let preview = "";
  let line = parseInt(newCrossword.words[id].line);
  let column = parseInt(newCrossword.words[id].column);
  for (let i=0; i<newCrossword.words[id].letters; i++) {
    let letter = "";
    if (newCrossword.words[id].vertical) {
      if (crossword[line+i][column].value === " ")
        letter = "_";
      else
        letter = crossword[line+i][column].value;
    } else {
      if (crossword[line][column+i].value === " ")
        letter = "_";
      else
        letter = crossword[line][column+i].value;
    }
    preview+=letter;
  }
  wordPreview = preview;
}

function showWordPreview(input) {
  let word = "";
  if(input) {
    word = input + wordPreview.substring(input.length);
  } else {
    word = wordPreview;
  }
  let wordPreviewHTML = document.getElementById("word-preview");
  wordPreviewHTML.innerHTML = "";

  for (let i=0; i<wordPreview.length; i++) {
    let span = document.createElement("span");
    span.classList.add("word-preview-letter");
    span.innerText = word[i];
    wordPreviewHTML.appendChild(span);
  }
}

function submitWord(word) {
  let id = activeWord;
  words[id]=word.substring(0,newCrossword.words[id].letters);
  let line = parseInt(newCrossword.words[id].line);
  let column = parseInt(newCrossword.words[id].column);
  for (let i=0; i<word.length; i++) {
    if(i<newCrossword.words[id].letters) {
      if(newCrossword.words[id].vertical) {
        crossword[line+i][column].value = word[i];
      } else {
        crossword[line][column+i].value = word[i];
      }
    }
  }
  return redraw(crossword);
}

function checkCrossword() {
  let xhr = new XMLHttpRequest();
  xhr.open("post","/check");
  xhr.onload = () => {
    console.log(xhr.response);
    if(xhr.response==="w")
      alert("crossword solved !");
    else {
      wrongAnswers = xhr.response;
      redraw(crossword);
      wrongAnswers = [];
    }
  };
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.send(JSON.stringify(words));
}

function solveWord() {
  let id = activeWord;
  let xhr = new XMLHttpRequest();

  xhr.open("post","/solveword");
  xhr.onload = () => {
    wordInput.value = xhr.response;
    showWordPreview(xhr.response);
  };
  xhr.setRequestHeader("Content-Type", "text/plain");

  xhr.send(id);

}

function loadCrossword() {
  let xhr = new XMLHttpRequest();
  xhr.onload = () => {
    newCrossword = JSON.parse(xhr.response);
    generateCrossword(newCrossword);
  };
  xhr.open("get","/load");
  xhr.send();
}

function generateCrossword(cw) {
  let result = [];
  while (cw.lines>0) {
    result.push([]);
    cw.lines--;
  }
  for (let line in result) {
    for (let i=0;i<cw.columns;i++) {
      let letter = {};
      letter.empty = true;
      result[line].push(letter);
    }    
  }
  for (let word in cw.words) {
    for (let pos=0; pos<cw.words[word].letters; pos++) {
      if(cw.words[word].vertical) {
        let letter = result[cw.words[word].line + pos][cw.words[word].column];
        letter.empty = false;
        letter.vertical = true;
        letter.posV = pos;
        letter.wordV = word;
        letter.value = " ";
      } else {
        let letter = result[cw.words[word].line][cw.words[word].column + pos];
        letter.empty = false;
        letter.horizontal = true;
        letter.posH = pos;
        letter.wordH = word;
        letter.value = " ";
      }
    }
  }
  crossword = result;
  for (let id in newCrossword.words) {
    words[id] = "";
  }
  return redraw(crossword);
}

function changeCrosswordSize(num) {
  if(zoomLevel+num>=1 && zoomLevel+num<=3) {
    let letters = Array.from(document.getElementsByClassName("letter"));
    for (let i in letters) {
      letters[i].classList.remove("size-"+zoomLevel);
      letters[i].classList.add("size-"+(zoomLevel+num));
    }
    zoomLevel+=num;
  }
}

function redraw(crossword) { 
  let root = document.getElementById("root");
  root.innerHTML = "";
  for (let line in crossword) {
    let lineDiv = document.createElement("div");
    lineDiv.classList.add("line");
    for (let char in crossword[line]) {
      let letter = crossword[line][char];
      let letterDiv = document.createElement("div");
      letterDiv.classList.add("letter");
      letterDiv.classList.add("size-"+zoomLevel);
      if(!letter.empty) {
        letterDiv.innerText = letter.value;
        
        if(letter.wordH) {
          letterDiv.classList.add("h-"+letter.wordH);
          letterDiv.setAttribute("word-id",letter.wordH);
        }
        if(letter.wordV) {
          letterDiv.classList.add("v-"+letter.wordV);
          letterDiv.setAttribute("word-id",letter.wordV);
        }
        if(activeWord && (letter.wordH === activeWord || letter.wordV === activeWord)) {
          letterDiv.classList.add("active");
        }
        if(wrongAnswers.indexOf(letter.wordH)!==-1 || wrongAnswers.indexOf(letter.wordV)!==-1) {
          letterDiv.classList.add("wrong");
        }
        if(letter.posH===0) {
          if(letter.posV===0) {
            crossword[parseInt(line)+1][char].addListener = true;
          }
          letterDiv.classList.add("clickable");
          letterDiv.setAttribute("word-id",letter.wordH);
          letterDiv.addEventListener("click",(e)=>{
            let activeLetters = Array.from(document.getElementsByClassName("active"));
            activeLetters.forEach((elem)=>elem.classList.remove("active"));
            let classList = Array.from(e.target.classList);
            for (let cl in classList) {
              if(classList[cl].indexOf("h-")!==-1) {
                let letters = Array.from(document.getElementsByClassName(classList[cl]));
                letters.forEach((let)=>let.classList.add("active"));             
              }
            }
            let id = e.target.getAttribute("word-id");
            showHint(id);
            setWordPreview(id);
            showWordPreview();
            activeWord = id;
            document.getElementById("word-controls").classList.remove("hidden"); 
          });
        } else if (letter.posV===0 || letter.addListener) {
          letterDiv.classList.add("clickable");
          letterDiv.setAttribute("word-id",letter.wordV);
          letterDiv.addEventListener("click",(e)=>{
            let activeLetters = Array.from(document.getElementsByClassName("active"));
            activeLetters.forEach((elem)=>elem.classList.remove("active"));
            let classList = Array.from(e.target.classList);
            for (let cl in classList) {
              if(classList[cl].indexOf("v-")!==-1) {
                let letters = Array.from(document.getElementsByClassName(classList[cl]));
                letters.forEach((let)=>let.classList.add("active"));             
              }
            }
            let id = e.target.getAttribute("word-id");
            showHint(id);
            setWordPreview(id);
            showWordPreview();
            activeWord = id; 
            document.getElementById("word-controls").classList.remove("hidden"); 
          });
        }
      } else {
        letterDiv.classList.add("empty");
      }
      lineDiv.appendChild(letterDiv);
    }
    root.appendChild(lineDiv);
  }
}