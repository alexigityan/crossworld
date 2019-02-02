let button = document.getElementById("submit");
let word = document.getElementById("word");
button.addEventListener("click",()=>{tryAddWord(word.value);word.value="";});
let crossword = [];
let data = {};

function tryAddWord(w) {

  w = w.toLowerCase();
  w = Array.from(w);
  if(crossword.length===0) {
    crossword= [w];
    data.lines = 1;
    data.columns = w.length;
    return redraw();
  }
  console.time("Finding word position");
  let choices = {};
  let maxIntersections = 0;

  for (let line in crossword) {
    for (let column in crossword[line]) {
      if(crossword[line][column]) {
        let letter = crossword[line][column];
        if (w.indexOf(letter)!==-1) {
          checkVertical(parseInt(line), parseInt(column), w);            
          checkHorizontal(parseInt(line), parseInt(column), w);
        }
      }
    }
  }
  console.timeEnd("Finding word position");
  console.log(choices);
  if (maxIntersections>0) {
    let options = choices[maxIntersections];
    let rand = Math.floor(Math.random()*(options.length-1));
    let choice = options[rand];
    if(choice.vertical)
      return addVertWord(choice.line,choice.column,w,
        choice.position);
    else
      return addHorizWord(choice.line,choice.column,w,
        choice.position);
  }


  function checkVertical (l, c, w) {
    if(crossword[l-1])
      if(crossword[l-1][c])
        return false;
    if(crossword[l+1])
      if(crossword[l+1][c])
        return false;
    let positions = [];
    let ch = crossword[l][c];
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
        if(crossword[l-pos-1][c]) 
          continue;    
      }    
      if(crossword[l+(w.length-pos)]) {
        if(crossword[l+(w.length-pos)][c])
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
          if((letter && letter!==w[char]) || (!letter && (neighbor1 || neighbor2))) {
            check = false;  
            break;
          } else if (letter && letter===w[char])
            intersections++;
        } else if (char>pos && l+(char-pos)<crossword.length) {
          let neighbor1, neighbor2;
          let letter = crossword[l+(char-pos)][c];
          if(crossword[l+(char-pos)][c-1])
            neighbor1 = crossword[l+(char-pos)][c-1];
          if(crossword[l+(char-pos)][c+1])
            neighbor2 = crossword[l+(char-pos)][c+1];
          if((letter && letter!==w[char]) || (!letter && (neighbor1 || neighbor2))) {
            check = false;  
            break;
          } else if (letter && letter===w[char])
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
    if(crossword[l][c-1])
      if(crossword[l][c-1])
        return false;
    if(crossword[l][c+1])
      if(crossword[l][c+1])
        return false;
    let positions = [];
    let ch = crossword[l][c];
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
        if(crossword[l][c-pos-1])
          continue;  
      }      
      if(crossword[l][c+(w.length-pos)]) {
        if(crossword[l][c+(w.length-pos)])
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
          if((letter && letter!==w[char]) || (!letter && (neighbor1 || neighbor2))) {
            check = false;
            break;
          } else if (letter && letter===w[char])
            intersections++;
        } else if (char>pos && c+(char-pos)<crossword[l].length) {
          let neighbor1, neighbor2;
          let letter = crossword[l][c+(char-pos)];
          if (crossword[l-1])
            neighbor1 = crossword[l-1][c+(char-pos)];
          if (crossword[l+1])
            neighbor2 = crossword[l+1][c+(char-pos)];
          if((letter && letter!==w[char]) || (!letter && (neighbor1 || neighbor2))) {
            check = false;  
            break;
          } else if (letter && letter===w[char])
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



function addVertWord(l,c,w,pos) {
  if(l<pos) {
    addLinesStart(pos - l);
    l+=pos-l;
  }
  if(crossword.length-l < w.length-pos) {
    addLinesEnd( (w.length-pos) - (crossword.length-l) );
  }
  for (let char in w) {
    crossword[l-pos+parseInt(char)][c] = w[char];
  }
  return redraw();
}



function addHorizWord(l,c,w,pos) {
  if(c<pos) {
    addColumnsStart(pos - c);
    c+=pos-c;
  }
  if(crossword[l].length-c < w.length-pos) {
    addColumnsEnd( (w.length-pos) - (crossword[l].length-c) );
  }
  for (let char in w) {
    crossword[l][c-pos+parseInt(char)] = w[char];
  }
  return redraw();
}

function addLinesStart(num=1) {
  while (num>0) {
    crossword.unshift(Array(data.columns));
    data.lines++;
    num--;
  }
}

function addLinesEnd(num=1) {
  while (num>0) {
    crossword.push(Array(data.columns));
    data.lines++;
    num--;
  }
}

function addColumnsStart(num=1) {
  while (num>0) {
    for (let line in crossword) {
      crossword[line].unshift("");
    }
    data.columns++;
    num--;
  }
}

function addColumnsEnd(num=1) {
  while (num>0) {
    for (let line in crossword) {
      crossword[line].push("");
    }
    data.columns++;
    num--;
  }
}


function redraw() {
  let root = document.getElementById("root");
  root.innerHTML = "";
  for (let line in crossword) {
    let div = document.createElement("div");
    div.classList.add("line");
    for (let char of crossword[line]) {
      let letter = document.createElement("div");
      letter.classList.add("letter");
      if(char)
        letter.innerText = char;
      else {
        // letter.innerText = "-";
        letter.classList.add("empty");
      }
      div.appendChild(letter);
    }
    root.appendChild(div);
  }
}