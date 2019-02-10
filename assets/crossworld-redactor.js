
//Adding event listeners to buttons and form submits

let generateButton = document.getElementById("generate");
generateButton.addEventListener("click",generate);

let saveButton = document.getElementById("save-crossword");
saveButton.addEventListener("click",saveCrossword);

let removeWordButton = document.getElementById("remove-word");
removeWordButton.addEventListener("click",removeSelectedWord);

let zoominButton = document.getElementById("zoom-in");
zoominButton.addEventListener("click",()=>changeCrosswordSize(1));

let zoomoutButton = document.getElementById("zoom-out");
zoomoutButton.addEventListener("click",()=>changeCrosswordSize(-1));

let addHint = document.getElementById("add-hint");
let addWord = document.getElementById("add-word");

addWord.addEventListener("submit",(e)=>{
  e.preventDefault();
  let word = document.getElementById("word");
  if(word.value)
    appendWord(word.value);
  word.value="";
});

addHint.addEventListener("submit",(e)=>{
  e.preventDefault();
  let hintText = document.getElementById("hint-edit");
  let selectedWord = document.getElementsByClassName("selected-word")[0];
  if(selectedWord) {
    let id = selectedWord.getAttribute("word-id");
    words[id].hint = hintText.value;  
  }
  markWords();

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



function generate() {
  crossword=[];
  for (let id in words) {
    words[id].added = false;
  }
  for (let i=0; i<3; i++) {    
    for(let id in words) {
      if(!words[id].added)
        tryAddWord(words[id].word,id);
    };
  }
  markWords();
  redraw(crossword); 
}

function markWords() {
  let wordList = Array.from(document.getElementsByClassName("word"));
  for (let i in wordList) {
    let id = wordList[i].getAttribute("word-id");
    if (!words[id].added) {
      wordList[i].classList.add("leftover");
    } else {
      wordList[i].classList.remove("leftover");
    }
    if (words[id].hint !== "") {
      wordList[i].classList.add("has-hint");
    } else {
      wordList[i].classList.remove("has-hint");
    }
  }
}

function appendWord(w) {
  let id = 0;
  while (words.hasOwnProperty(id))
    id++;
  words[id]={};
  words[id].word=w;
  words[id].hint="";

  let span = document.createElement("span");
  span.classList.add("word");
    function selectWord(node) {
      let selectedWords = Array.from(document.getElementsByClassName("selected-word"));
      selectedWords.forEach((elem)=>elem.classList.remove("selected-word"));
      node.classList.add("selected-word");
      let hintText = document.getElementById("hint-edit");
      hintText.value = words[id].hint;
      document.getElementById("word-controls").classList.add("visible");
    }
  selectWord(span);
  span.addEventListener("click",(e)=>{selectWord(e.target)});
  span.innerText = w;
  span.setAttribute("word-id",id);
  let wordContainer = document.getElementById("word-container");
  wordContainer.appendChild(span);
  return generate();
}

function removeSelectedWord() {
  let selectedWord = document.getElementsByClassName("selected-word")[0];
  if(selectedWord) {
    let id = selectedWord.getAttribute("word-id");
    delete words[id];
    let wordContainer = document.getElementById("word-container");
    wordContainer.removeChild(selectedWord);
    document.getElementById("word-controls").classList.remove("visible");
  }
  return generate();
}

function showHint(id) {
  let target = document.getElementById("hint-text");
  target.innerText = words[id].hint;
}


function tryAddWord(w, id) {
  w = w.toLowerCase();
  w = Array.from(w);
  if(crossword.length===0) {
    addLinesStart(1,w.length);
    return addHorizWord(0,0,w,0,id);
  }
  let choices = {};
  let maxIntersections = 0;

  for (let line in crossword) {
    for (let column in crossword[line]) {
      if(!crossword[line][column].empty) {
        let letter = crossword[line][column];
        if (w.indexOf(letter.value)!==-1) {
          if (!letter.vertical)
            checkVertical(parseInt(line), parseInt(column), w);
          if (!letter.horizontal)            
            checkHorizontal(parseInt(line), parseInt(column), w);
        }
      }
    }
  }
  if (maxIntersections>0) {
    let options = choices[maxIntersections];
    let rand = Math.round(Math.random()*(options.length-1));
    let choice = options[rand];
    if(choice.vertical)
      return addVertWord(choice.line,choice.column,w,
        choice.position, id);
    else
      return addHorizWord(choice.line,choice.column,w,
        choice.position, id);
  }


  function checkVertical (l, c, w) {
    let positions = [];
    let ch = crossword[l][c].value;
    function findPositions(word,char,index) {
      let position = word.indexOf(char,index);
      if (position!==-1) {
        positions.push(position);
        return findPositions(word,char,position+1);
      }
    }
    findPositions(w,ch,0);
  
    for (let p in positions) {
      let pos = positions[p];
      if(crossword[l-pos-1]) {
        if(!crossword[l-pos-1][c].empty) 
          continue;    
      }    
      if(crossword[l+(w.length-pos)]) {
        if(!crossword[l+(w.length-pos)][c].empty)
          continue;
      }
      let check = true;
      let intersections = 1;
      for (let char=0; char<w.length; char++) {
        if(char<pos && l-(pos-char)>=0) {
          let neighbor1, neighbor2;
          let letter = crossword[l-(pos-char)][c];
          if(crossword[l-(pos-char)][c-1])
            neighbor1 = crossword[l-(pos-char)][c-1];
          if(crossword[l-(pos-char)][c+1])
            neighbor2 = crossword[l-(pos-char)][c+1];
          if((!letter.empty && letter.value!==w[char]) || 
              (letter.empty && (neighbor1 && !neighbor1.empty || neighbor2 && !neighbor2.empty))) {
            check = false;  
            break;
          } else if (!letter.empty && letter.value===w[char])
            intersections++;
        } else if (char>pos && l+(char-pos)<crossword.length) {
          let neighbor1, neighbor2;
          let letter = crossword[l+(char-pos)][c];
          if(crossword[l+(char-pos)][c-1])
            neighbor1 = crossword[l+(char-pos)][c-1];
          if(crossword[l+(char-pos)][c+1])
            neighbor2 = crossword[l+(char-pos)][c+1];
          if((!letter.empty && letter.value!==w[char]) || 
              (letter.empty && (neighbor1 && !neighbor1.empty || neighbor2 && !neighbor2.empty))) {
            check = false;  
            break;
          } else if (!letter.empty && letter.value===w[char])
            intersections++;
        }
      }
      if(check) {
        if(intersections>maxIntersections)
          maxIntersections = intersections;
        if(!choices[intersections])
          choices[intersections]=[];
        let choice = {};
        choice.vertical = true;
        choice.position = pos;
        choice.line = l;
        choice.column = c;
        choices[intersections].push(choice);
      }
    }
  }

  function checkHorizontal (l, c, w) {
    let positions = [];
    let ch = crossword[l][c].value;
    function findPositions(word,char,index) {
      let position = word.indexOf(char,index);
      if (position!==-1) {
        positions.push(position);
        return findPositions(word,char,position+1);
      }
    }
    findPositions(w,ch,0);
  
    for (let p in positions) {
      let pos = positions[p];
      if(crossword[l][c-pos-1]) {
        if(!crossword[l][c-pos-1].empty)
          continue;  
      }      
      if(crossword[l][c+(w.length-pos)]) {
        if(!crossword[l][c+(w.length-pos)].empty)
          continue;   
      }
      let check = true;
      let intersections = 1;  
      for (let char=0; char<w.length; char++) {
        if(char<pos && c-(pos-char)>=0) {
          let neighbor1, neighbor2;
          let letter = crossword[l][c-(pos-char)];
          if (crossword[l-1])
            neighbor1 = crossword[l-1][c-(pos-char)];
          if (crossword[l+1])
            neighbor2 = crossword[l+1][c-(pos-char)];
          if((!letter.empty && letter.value!==w[char]) || 
              (letter.empty && (neighbor1 && !neighbor1.empty || neighbor2 && !neighbor2.empty))) {
            check = false;
            break;
          } else if (!letter.empty && letter.value===w[char])
            intersections++;
        } else if (char>pos && c+(char-pos)<crossword[l].length) {
          let neighbor1, neighbor2;
          let letter = crossword[l][c+(char-pos)];
          if (crossword[l-1])
            neighbor1 = crossword[l-1][c+(char-pos)];
          if (crossword[l+1])
            neighbor2 = crossword[l+1][c+(char-pos)];
          if((!letter.empty && letter.value!==w[char]) || 
              (letter.empty && (neighbor1 && !neighbor1.empty || neighbor2 && !neighbor2.empty))) {
            check = false;  
            break;
          } else if (!letter.empty && letter.value===w[char])
            intersections++;
        }
      }
      if(check) {
        if(intersections>maxIntersections)
          maxIntersections = intersections;
        if(!choices[intersections])
          choices[intersections]=[];
        let choice = {};
        choice.vertical = false;
        choice.position = pos;
        choice.line = l;
        choice.column = c;
        choices[intersections].push(choice);
      }
    }
  }
}



function addVertWord(l,c,w,pos,id) {
  if(l<pos) {
    addLinesStart(pos - l);
    l+=pos-l;
  }
  if(crossword.length-l < w.length-pos) {
    addLinesEnd( (w.length-pos) - (crossword.length-l) );
  }
  for (let char in w) {
    let letter = crossword[l-pos+parseInt(char)][c];
    letter.empty = false;
    letter.vertical = true;
    letter.value = w[char];

    letter.wordV = id;
    letter.posV = parseInt(char);
  }
  words[id].added=true;
}



function addHorizWord(l,c,w,pos,id) {
  if(c<pos) {
    addColumnsStart(pos - c);
    c+=pos-c;
  }
  if(crossword[l].length-c < w.length-pos) {
    addColumnsEnd( (w.length-pos) - (crossword[l].length-c) );
  }
  for (let char in w) {
    let letter = crossword[l][c-pos+parseInt(char)];
    letter.empty = false;
    letter.horizontal = true;
    letter.value = w[char];

    letter.wordH = id;
    letter.posH = parseInt(char);
  }
  words[id].added=true;
}

function addLinesStart(num, length=crossword[0].length) {
  while (num>0) {
    let line = [];
    for (let i=0;i<length;i++) {
      let letter = {};
      letter.empty = true;
      line.push(letter);
    }
    crossword.unshift(line);
    num--;
  }
}

function addLinesEnd(num, length=crossword[0].length) {
  while (num>0) {
    let line = [];
    for (let i=0;i<length;i++) {
      let letter = {};
      letter.empty = true;
      line.push(letter);
    }
    crossword.push(line);
    num--;
  }
}

function addColumnsStart(num) {
  while (num>0) {
    for (let line in crossword) {
      let letter = {};
      letter.empty = true;
      crossword[line].unshift(letter);
    }
    num--;
  }
}

function addColumnsEnd(num=1) {
  while (num>0) {
    for (let line in crossword) {
      let letter = {};
      letter.empty = true;
      crossword[line].push(letter);
    }
    num--;
  }
}

function saveCrossword() {
  for (let id in words) {
    if (words[id].hint==="") {
      alert("NOT SO FAST, not all words have hints");
      return false;
    }
  }
  let newCrossword = {};
  newCrossword.data = {};
  newCrossword.data.lines = crossword.length;
  newCrossword.data.columns = crossword[0].length;
  newCrossword.data.words = {};
  for (let line in crossword) {
    for (let column in crossword[line]) {
      let letter = crossword[line][column];
      if (letter.posH===0) {
        newCrossword.data.words[letter.wordH] = {};
        newCrossword.data.words[letter.wordH].line = parseInt(line);
        newCrossword.data.words[letter.wordH].column = parseInt(column);
        newCrossword.data.words[letter.wordH].vertical = false;
        newCrossword.data.words[letter.wordH].letters = words[letter.wordH].word.length;
        newCrossword.data.words[letter.wordH].hint = words[letter.wordH].hint;        
      }
      if (letter.posV===0) {
        newCrossword.data.words[letter.wordV] = {};
        newCrossword.data.words[letter.wordV].line = parseInt(line);
        newCrossword.data.words[letter.wordV].column = parseInt(column);
        newCrossword.data.words[letter.wordV].vertical = true;
        newCrossword.data.words[letter.wordV].letters = words[letter.wordV].word.length;
        newCrossword.data.words[letter.wordV].hint = words[letter.wordV].hint;

      }
    }
  }

  newCrossword.solutions = {};
  for (let i in words) {
    newCrossword.solutions[i] = words[i].word;
  }

  let xhr = new XMLHttpRequest();
  xhr.open("post","/save");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = () => alert("crossword saved !");
  xhr.send(JSON.stringify(newCrossword));


}

  let solutions = {};
  for (let i in words) {
    solutions[i] = words[i].word;
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
      } else {
        letterDiv.classList.add("empty");
      }
      lineDiv.appendChild(letterDiv);
    }
    root.appendChild(lineDiv);
  }
}