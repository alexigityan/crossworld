let crossword = [];
let data = {};

function tryAddWord(w) {
  w = Array.from(w);
  if(crossword.length===0) {
    crossword= [w];
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

        }
      }
    }
  }

}

function checkVertical (l, c, w, pos ) {
  if(crossword[l-1])
    if(crossword[l-1][c]!==undefined && crossword[l-1][c]!=="")
      return false;
  if(crossword[l+1])
    if(crossword[l+1][c]!==undefined && crossword[l+1][c]!=="")
      return false;
  let linesAddStart, linesAddEnd;
  if(l<pos) {
    linesAddStart = pos - l;
  }
  if(crossword.length-l < w.length-pos) {
    linesAddEnd = (w.length-pos) - (crossword.length-l)
  }
  for (let char=0; char<w.length; char++) {
    if(char<=pos && l-char>0) {
      let letter = crossword[l-char][c];
      if(letter!==undefined && letter!==""
        && letter!==w[char]) {
          console.log(letter, w[char]);
          return false;
          // return checkHorizontal (l,c,w,pos);
      }
    } else if (char>pos && l+parseInt(char)<crossword.length) {
      let letter = crossword[l+parseInt(char)][c];
      if(letter!==undefined && letter!==""
        && letter!==w[char]) {
          console.log(letter, w[char]);
          return false;
          // return checkHorizontal (l,c,w,pos);
      }
    }
  }
  if (typeof linesAddStart !== "undefined") {
    addLinesStart(linesAddStart);
    console.log("adding lines start:"+linesAddStart);
  }
  if (typeof linesAddEnd !== "undefined") {
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

function addLinesStart(num=1) {
  while (num>0) {
    crossword.unshift([]);
    num--;
  }
}

function addLinesEnd(num=1) {
  while (num>0) {
    crossword.push([]);
    num--;
  }
}

function addColumnsStart(num=1) {
  while (num>0) {
    for (let line in crossword) {
      crossword[line].unshift("");
      num--;
    }
  }
}

function addColumnsEnd(num=1) {
  while (num>0) {
    for (let line in crossword) {
      crossword[line].push("");
      num--;
    }
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
      else
        span.innerText = "-";
      div.appendChild(span);
    }
    root.appendChild(div);
  }
}