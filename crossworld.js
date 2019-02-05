let addWord = document.getElementById("addWord");
let word = document.getElementById("word");
let generate = document.getElementById("generate");
let removeWord = document.getElementById("remove-word");

removeWord.addEventListener("click",removeSelectedWord);
addWord.addEventListener("submit",(e)=>{
  e.preventDefault();
  appendWord(word.value);
  word.value="";
});

generate.addEventListener("click",()=>{
    crossword=[];    
    for(let id in words) {
      tryAddWord(words[id].word,id);
    };    
});
let crossword = [];
let words = {};


function appendWord(w) {
  let id = 0;
  while (words.hasOwnProperty(id))
    id++;
  words[id]={};
  words[id].word=w
  return makeWordHTML(w, id);
}

function makeWordHTML(w,id) {
  let span = document.createElement("span");
  span.classList.add("word");
  function selectWord(node) {
    let selectedWords = Array.from(document.getElementsByClassName("selected-word"));
    selectedWords.forEach((elem)=>elem.classList.remove("selected-word"));
    node.classList.add("selected-word");
  }
  selectWord(span);
  span.addEventListener("click",(e)=>{selectWord(e.target)});
  span.innerText = w;
  span.setAttribute("word-id",id);
  let wordsHTML = document.getElementById("words");
  wordsHTML.appendChild(span);
}

function removeSelectedWord() {
  let selectedWord = document.getElementsByClassName("selected-word")[0];
  if(selectedWord) {
    let id = selectedWord.getAttribute("word-id");
    delete words[id];
    let wordsHTML = document.getElementById("words");
    wordsHTML.removeChild(selectedWord);
  }
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
  words[id].vertical=true;
  return redraw(crossword);
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
  words[id].vertical=false;
  return redraw(crossword);
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
  let newCrossword = {};
  newCrossword.lines = crossword.length;
  newCrossword.columns = crossword[0].length;
  newCrossword.words = {};
  for (let line in crossword) {
    for (let column in crossword[line]) {
      let letter = crossword[line][column];
      if (letter.posH===0) {
        newCrossword.words[letter.wordH] = {};
        newCrossword.words[letter.wordH].line = parseInt(line);
        newCrossword.words[letter.wordH].column = parseInt(column);
        newCrossword.words[letter.wordH].vertical = false;
        newCrossword.words[letter.wordH].letters = words[letter.wordH].word.length;
      }
      if (letter.posV===0) {
        newCrossword.words[letter.wordV] = {};
        newCrossword.words[letter.wordV].line = parseInt(line);
        newCrossword.words[letter.wordV].column = parseInt(column);
        newCrossword.words[letter.wordV].vertical = true;
        newCrossword.words[letter.wordV].letters = words[letter.wordV].word.length;
      }
    }
  }
  return newCrossword;
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
  return result;
}

function redraw(crossword) { 
  let root = document.getElementById("root");
  root.innerHTML = "";
  for (let line in crossword) {
    let lineDiv = document.createElement("div");
    lineDiv.classList.add("line");
    lineDiv.style.width = (crossword[line].length * 54)+"px";
    for (let char in crossword[line]) {
      let letter = crossword[line][char];
      let letterDiv = document.createElement("div");
      letterDiv.classList.add("letter");
      if(!letter.empty) {
        letterDiv.innerText = letter.value;
        
        if(letter.wordH)
          letterDiv.classList.add("h-"+letter.wordH);
        
        if(letter.wordV)
          letterDiv.classList.add("v-"+letter.wordV);

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
              if(classList[cl] !== "letter" && classList[cl].indexOf("v-")===-1 && classList[cl] !== "clickable") {
                let letters = Array.from(document.getElementsByClassName(classList[cl]));
                letters.forEach((let)=>let.classList.add("active"));             
              }
            }
          });
        } else if (letter.posV===0 || letter.addListener) {
          letterDiv.classList.add("clickable");
          letterDiv.setAttribute("word-id",letter.wordV);
          letterDiv.addEventListener("click",(e)=>{
            let activeLetters = Array.from(document.getElementsByClassName("active"));
            activeLetters.forEach((elem)=>elem.classList.remove("active"));
            let classList = Array.from(e.target.classList);
            for (let cl in classList) {
              if(classList[cl] !== "letter" && classList[cl].indexOf("h-")===-1 && classList[cl] !== "clickable") {
                let letters = Array.from(document.getElementsByClassName(classList[cl]));
                letters.forEach((let)=>let.classList.add("active"));             
              }
            }
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