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

  for (let line in crossword) {
    for (let column in crossword[line]) {
      if(crossword[line][column]) {
        let letter = crossword[line][column];
        if (w.includes(letter)) {
          let position = w.indexOf(letter);
          if(checkVertical(parseInt(line), parseInt(column), w, position))
            return (line<position) ? addVertWord(0,column,w) : addVertWord(line-position,column,w);
          else if(checkHorizontal(parseInt(line), parseInt(column), w, position))
            return (column<position) ? addHorizWord(line,0,w) : addHorizWord(line,column-position,w);
          else
            continue;
        }
      }
    }
  }

}

function checkVertical (l, c, w, pos ) {
  if(crossword[l-1])
    if(crossword[l-1][c])
      return false;
  if(crossword[l+1])
    if(crossword[l+1][c])
      return false;
  if(crossword[l-pos-1]) {
      if(crossword[l-pos-1][c]) 
        return false;      
  }    
  if(crossword[l+(w.length-pos)])
    if(crossword[l+(w.length-pos)][c])
      return false;
  let linesAddStart, linesAddEnd;
  if(l<pos) {
    linesAddStart = pos - l;
  }
  if(crossword.length-l < w.length-pos) {
    linesAddEnd = (w.length-pos) - (crossword.length-l)
  }
  for (let char=0; char<w.length; char++) {
    if(char<pos && l-(pos-char)>=0) {
      let neighbor1, neighbor2;
      let letter = crossword[l-(pos-char)][c];
      if(crossword[l-(pos-char)][c-1])
        neighbor1 = crossword[l-(pos-char)][c-1];
      if(crossword[l-(pos-char)][c+1])
        neighbor2 = crossword[l-(pos-char)][c+1];
      if(letter && letter!==w[char] || (neighbor1 || neighbor2)) 
          return false;
      
    } else if (char>pos && l+char<crossword.length) {
      let neighbor1, neighbor2;
      let letter = crossword[l+char][c];
      if(crossword[l+char][c-1])
        neighbor1 = crossword[l+char][c-1];
      if(crossword[l+char][c+1])
        neighbor2 = crossword[l+char][c+1];
      if(letter && letter!==w[char] || (neighbor1 || neighbor2))
          return false;
    }
  }
  if (linesAddStart) {
    addLinesStart(linesAddStart);
    console.log("adding lines start:"+linesAddStart);
  }
  if (linesAddEnd) {
    addLinesEnd(linesAddEnd);
    console.log("adding lines end:"+linesAddEnd);
  }
  return true;
}

function addVertWord(l,c,w) {
  for (let char in w) {
    crossword[l+parseInt(char)][c] = w[char];
  }
  return redraw();
}

function checkHorizontal (l, c, w, pos ) {
  if(crossword[l][c-1])
    if(crossword[l][c-1])
      return false;
  if(crossword[l][c+1])
    if(crossword[l][c+1])
      return false;
  if(crossword[l][c-pos-1])
      if(crossword[l][c-pos-1])
        return false;        
  if(crossword[l][c+(w.length-pos)])
    if(crossword[l][c+(w.length-pos)])
      return false;    
  let columnsAddStart, columnsAddEnd;
  if(c<pos) {
    columnsAddStart = pos - c;
  }
  if(crossword[l].length-c < w.length-pos) {
    columnsAddEnd = (w.length-pos) - (crossword[l].length-c);
  }
  for (let char=0; char<w.length; char++) {
    if(char<pos && c-(pos-char)>=0) {
      let neighbor1, neighbor2;
      let letter = crossword[l][c-(pos-char)];
      if (crossword[l-1])
        neighbor1 = crossword[l-1][c-(pos-char)];
      if (crossword[l+1])
        neighbor2 = crossword[l+1][c-(pos-char)];
      if(letter && letter!==w[char] || (neighbor1 || neighbor2)) {
          return false;
      }
    } else if (char>pos && c+char<crossword[l].length) {
      let neighbor1, neighbor2;
      let letter = crossword[l][c+char];
      if (crossword[l-1])
        neighbor1 = crossword[l-1][c+char];
      if (crossword[l+1])
        neighbor2 = crossword[l+1][c+char];
      if(letter && letter!==w[char] || (neighbor1 || neighbor2)) {
          return false;
      }
    }
  }
  if (typeof columnsAddStart !== "undefined") {
    addColumnsStart(columnsAddStart);
    console.log("adding columns start:"+columnsAddStart);
  }
  if (typeof columnsAddEnd !== "undefined") {
    addColumnsEnd(columnsAddEnd);
    console.log("adding columns end:"+columnsAddEnd);
  }
  return true;
}

function addHorizWord(l,c,w) {
  for (let char in w) {
    crossword[l][c+parseInt(char)] = w[char];
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
      let span = document.createElement("span");
      span.classList.add("letter");
      if(char)
        span.innerText = char;
      else {
        span.innerText = "-";
        span.classList.add("empty");
      }
      div.appendChild(span);
    }
    root.appendChild(div);
  }
}