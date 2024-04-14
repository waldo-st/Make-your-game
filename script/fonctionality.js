import { bagPieces } from "./patternTetro.js";
import { CreateField, FieldNext, FieldScore } from "./fieldsGame.js";
import {
  circle,
  NumberCounter,
  reloadTimer,
  stopTimer,
  time,
} from "./timer.js";

let tetromino,
  randomPiece,
  random,
  color,
  tetros;

let pieces = [...bagPieces];
let score = 0;
let level = 1;
let blockKey = false;
const field = CreateField();
const fieldNext = FieldNext();
let coteRight = "Right";
let coteLeft = "Left";
FieldScore();
let Px = field[0].length / 2 - 2;
let rotation = 0;
let Py = 0;
let fullBagTetro = 0;

const play = document.getElementById("Play");
const pause = document.getElementById("Pause");
const replay = document.getElementById("Replay");
const Continue = document.getElementById("Continue");
const restart = document.getElementById("Restart");
const retry = document.getElementById("Retry");
const tetris = document.getElementById("tetris");

const gameOverPlay = document.querySelector(".overPlay");
const gameOverPause = document.querySelector(".overPause");
const gameOverRetry = document.querySelector(".overRetry");
const gameOverGame = document.querySelector(".overGame");

gameOverPause.style.visibility = "hidden";
gameOverRetry.style.visibility = "hidden";
gameOverGame.style.visibility = "hidden";

const divscore = document.querySelector(".score");
const divlevel = document.querySelector(".level");

function handelScoreLevel(score, level) {
  divscore.textContent = score.toString();
  divlevel.textContent = level.toString();
}

let calculLevel = 100;
let runGame = false;

function start() {
  let startTime;
  const game = (stamp) => {
    requestAnimationFrame(game);
    if (!startTime) {
      startTime = stamp;
    }
    const elapsed = stamp - startTime;
    if (elapsed >= 500 && runGame) {
      const value = time.textContent;
      if (!tetromino) {
        randomPiece = Math.floor(Math.random() * pieces.length);
        tetromino = pieces[randomPiece].tetros[rotation];
        color = pieces[randomPiece].color;
        tetros = pieces[randomPiece].tetros;
      }
      const fullLine = LineFieldIsFull(field);
      if (fullLine.ok) {
        clearLine(field, fullLine);
        score += 10;
      }
      if (score / calculLevel >= 1) {
        calculLevel += 100;
        level++;
        reloadTimer();
      }
      handelScoreLevel(score, level);
      if (fullBagTetro === 0) {
        pieces.splice(randomPiece, 1);
        if (pieces.length === 0) {
          pieces = [...bagPieces];
        }
        random = Math.floor(Math.random() * pieces.length);
        draw_nextField(random);
      }
      fullBagTetro++;
      gameOver(field, value);
      draw_tetromino(tetromino, Px, Py, color);
      if (IsValid_mouveTetro(tetromino, Px, Py)) {
        Py++;
      } else {
        put_tetro(tetromino, Px, Py);
        rotation = 0;
        Px = field[0].length / 2 - 2;
        Py = 0;
        fullBagTetro = 0;
        randomPiece = random;
        tetromino = pieces[randomPiece].tetros[rotation];
        tetros = pieces[randomPiece].tetros;
        color = pieces[randomPiece].color;
      }
      startTime = stamp;
    }
  };
  requestAnimationFrame(game);
}

window.addEventListener("load", () => {
  requestAnimationFrame(start);
});

function coord_cell(piece, X, Y) {
  const coordinates = [];
  piece.forEach((row, j) => {
    row.forEach((cell, i) => {
      const x = X + i;
      const y = Y + j;
      if (x < 10 && y < 20 && cell > 0) {
        coordinates.push({ x, y });
      }
    });
  });
  return coordinates;
}

let traceColor = "";
function draw_tetromino(piece, X, Y, color) {
  if (piece) {
    field.forEach((row) => {
      row.forEach((cell) => {
        const element = cell.element;
        if (cell.value === 0 && element.classList.contains(traceColor)) {
          element.classList.remove(traceColor);
        }
      });
    });

    const data = coord_cell(piece, X, Y);
    data.forEach((dat) => {
      const element = field[dat.y][dat.x].element;
      if (!element.classList.contains(color)) {
        element.classList.add(color);
      }
    });
    traceColor = color;
  }
}

function draw_nextField(ramd) {
  fieldNext.forEach((row) => {
    row.forEach((cell) => {
      const element = cell.element;
      if (cell.value === 0) {
        element.className = "vide";
      }
    });
  });
  const tetro = pieces[ramd].tetros[0];
  const couleur = pieces[ramd].color;
  tetro.forEach((row, j) => {
    row.forEach((cell, i) => {
      if (tetro.length === 4 && j === 3) {
        return;
      }
      const element = fieldNext[j][i].element;
      if (cell > 0) {
        element.classList.add(couleur);
      }
    });
  });
}

// cette fonction verifie si le deplacement vers le bas d'un tetromino est possible
function IsValid_mouveTetro(piece, X, Y) {
  const isCollision = piece.some((row, rowIdx) =>
    row.some((cell, colIdx) => {
      if (cell > 0) {
        const coord_X = X + colIdx;
        const coord_Y = Y + 1 + rowIdx;
        const fieldHeight = field.length;
        return coord_Y >= fieldHeight || field[coord_Y][coord_X].value > 0;
      }
    })
  );
  return !isCollision;
}

// Gestion de l'événement de redimensionnement
window.addEventListener("keydown", (e) => {
  if (blockKey === false) {
    let X = 0;
    if (e.key === " ") {
      while (IsValid_mouveTetro(tetromino, Px, Py)) Py++;
      score += 4;
    }
    if (e.key === "ArrowRight" && collision_Detecte(tetromino, Px, Py, e.key)) {
      Px++;
    }
    if (e.key === "ArrowLeft" && collision_Detecte(tetromino, Px, Py, e.key)) {
      Px--;
    }
    if (
      e.key === "ArrowDown" && IsValid_mouveTetro(tetromino, Px, Py) &&
      fullBagTetro > 0
    ) Py++;
    if (e.key === "ArrowUp" && IsValid_mouveTetro(tetromino, Px, Py)) {
      X = Px;
      // coordonnee axe de rotation du tetrominos
      const coordAxe = coordAxeRotation(tetromino, X, Py);
      if (isNaN(coordAxe.x)) {
        return;
      }
      // verifier si le paroi gauche du tetromino est en collision avant de faire une rotation
      if (collisionAxeRotation(tetromino, coordAxe.x, coordAxe.y, coteLeft)) {
        X = coordAxe.x;
        coordAxe.x++;
      }

      // verifier si le paroi droite du tetromino est en collision avant de faire une rotation
      if (collisionAxeRotation(tetromino, coordAxe.x, coordAxe.y, coteRight)) {
        X = coordAxe.x - 2;
        coordAxe.x--;
        if (!IsValid_rotation(tetromino, coordAxe.x, coordAxe.y)) {
          X -= 1;
          coordAxe.x--;
        }
      }

      // verifier si une rotation de tetromino est possible
      if (IsValid_rotation(tetromino, coordAxe.x, coordAxe.y)) {
        Px = X;
        rotation++;
        if (rotation === tetros.length) {
          rotation = 0;
        }
        tetromino = tetros[rotation];
      }
    }

    draw_tetromino(tetromino, Px, Py, color);
  }
});

// poser le tetrominos s'il a une collision avec le bas
function put_tetro(piece, X, Y) {
  piece.forEach((row, rowIdx) => {
    row.forEach((cell, colIdx) => {
      if (cell > 0) {
        const coord_X = X + colIdx;
        const coord_Y = Y + rowIdx;
        const cellField = field[coord_Y][coord_X];
        cellField.value = cell;
      }
    });
  });
}

// verifier si le tetromino a un collision sur ces parois s'il se deplace lateralement
function collision_Detecte(piece, X, Y, paroi) {
  let x = 0;
  paroi === "ArrowRight" ? x = 1 : x = -1;
  const isCollision = piece.some((row, rowIdx) =>
    row.some((cell, colIdx) => {
      const coord_X = X + colIdx;
      const coord_Y = Y + rowIdx;
      return cell > 0 &&
        (field[coord_Y][coord_X + x] === undefined ||
          field[coord_Y][coord_X + x].value > 0);
    })
  );
  return !isCollision;
}

// cette fonction renvoit la coordonnee de l'axe de rotation du tetromino
function coordAxeRotation(piece, X, Y) {
  let result = {};
  piece.forEach((row, rowIdx) => {
    row.forEach((cell, colIdx) => {
      if (cell === 2) {
        const x = X + colIdx;
        const y = Y + rowIdx;
        result = { x, y };
      }
      return result;
    });
  });
  return result;
}

/*
cette fonction de verification est utilise pour voir
si le tetromino a une collision cote droite avant de faire une rotation

cette fonction de verification est utilise pour voir
si le tetromino a une collision cote gauche avant de faire une rotation
*/
function collisionAxeRotation(piece, X, Y, cote) {
  let x = 0;
  cote === "Right" ? x = 1 : x = -1;

  if (field[Y][X + x] === undefined || field[Y][X + x].value > 0) {
    return true;
  }
  if (
    piece.length === 4 && cote === "Right" &&
    (field[Y][X + 2] === undefined || field[Y][X + 2].value > 0)
  ) {
    return true;
  }
  return false;
}

// cette fonction verifie si une rotation d'un tetromino est possible
function IsValid_rotation(piece, x, y) {
  for (let j = y - 1; j < y - 1 + piece.length; j++) {
    for (let i = x - 1; i < x - 1 + piece[0].length; i++) {
      if (field[j][i] === undefined || field[j][i].value > 0) {
        return false;
      }
    }
  }
  return true;
}

function LineFieldIsFull(board) {
  function rowFull(row) {
    return row.every((cell) => cell.value > 0);
  }
  for (let y = board.length - 1; y > 0; y--) {
    if (rowFull(board[y]) === true) {
      const ok = rowFull(board[y]);
      const row = board[y];
      const line = y;
      return { ok, row, line };
    }
  }
  return {};
}

function clearLine(board, full) {
  full.row.forEach((cell) => {
    const element = cell.element;
    const classe = element.classList[1];
    cell.value = 0;
    element.classList.remove(classe);
  });

  for (let y = full.line; y > 0; y--) {
    board[y].forEach((cell, i) => {
      let swapValu = 0;
      const cellField = board[y - 1][i];
      swapValu = cellField.value;
      cellField.value = cell.value;
      cell.value = swapValu;

      const element = cellField.element;
      const classe = element.classList[1];
      if (classe !== undefined) {
        element.classList.remove(classe);
        cell.element.classList.add(classe);
      }
    });
  }
}
let valStroke = 0;

function gameOver(board, timer) {
  if (timer <= 0) {
    valStroke += 147;
    circle.style.strokeDashoffset = valStroke;
    circle.style.transition = "stroke-dashoffset 0.5s linear";
    pause.style.visibility = "hidden";
    blockKey = true;

    if (valStroke === 441) {
      gameOverGame.style.visibility = "visible";
    }

    if (valStroke != 441) {
      tetris.textContent = "Time-out";
      gameOverRetry.style.visibility = "visible";
    }

    runGame = false;
    cancelAnimationFrame(stopTimer);
    return;
  }
  const outblock = board[0].some((cell) => cell.value > 0);
  if (outblock) {
    valStroke += 147;
    circle.style.strokeDashoffset = valStroke;
    circle.style.transition = "stroke-dashoffset 0.5s linear";
    pause.style.visibility = "hidden";

    if (valStroke === 441) {
      gameOverGame.style.visibility = "visible";
    }

    if (valStroke != 441) {
      tetris.textContent = "Block-out";
      gameOverRetry.style.visibility = "visible";
    }

    runGame = false;
    cancelAnimationFrame(stopTimer);
    return;
  }
}

function refresh() {
  field.forEach((row) => {
    row.forEach((cell) => {
      const element = cell.element;
      cell.value = 0;
      element.className = "vide";
    });
  });
  fieldNext.forEach((row) => {
    row.forEach((cell) => {
      const element = cell.element;
      element.className = "vide";
    });
  });
  reloadTimer(valStroke);
  pieces = [...bagPieces];
  rotation = 0;
  Px = field[0].length / 2 - 2;
  Py = 0;
  fullBagTetro = 0;
  tetromino = null;
}

play.addEventListener("click", () => {
  gameOverPlay.style.visibility = "hidden";
  pause.style.visibility = "visible";
  runGame = true;

  requestAnimationFrame(NumberCounter);
});

pause.addEventListener("click", () => {
  gameOverPause.style.visibility = "visible";
  pause.style.visibility = "hidden";
  blockKey = true;
  runGame = false;

  cancelAnimationFrame(stopTimer);
});

Continue.addEventListener("click", () => {
  gameOverPause.style.visibility = "hidden";
  pause.style.visibility = "visible";
  blockKey = false;
  runGame = true;

  requestAnimationFrame(NumberCounter);
});

retry.addEventListener("click", () => {
  gameOverRetry.style.visibility = "hidden";
  pause.style.visibility = "visible";
  refresh();
  blockKey = false;
  runGame = true;

  requestAnimationFrame(NumberCounter);
});

replay.addEventListener("click", () => {
  gameOverPause.style.visibility = "hidden";
  pause.style.visibility = "visible";
  blockKey = false;
  score = 0;
  level = 1;
  valStroke = 0;
  refresh();
  blockKey = false;
  runGame = true;

  requestAnimationFrame(NumberCounter);
});

restart.addEventListener("click", () => {
  gameOverGame.style.visibility = "hidden";
  pause.style.visibility = "visible";
  blockKey = false;
  score = 0;
  level = 1;
  valStroke = 0;
  refresh();
  blockKey = false;
  runGame = true;

  requestAnimationFrame(NumberCounter);
});
const up = document.getElementById("up");
const down = document.getElementById("down");
const left = document.getElementById("left");
const right = document.getElementById("right");

const upp = document.getElementById("upp");
const downn = document.getElementById("downn");
const leftt = document.getElementById("leftt");
const rightt = document.getElementById("rightt");

// Gestion de l'événement pour phone
window.addEventListener("click", (e) => {
  const paroieR = "ArrowRight";
  const paroieL = "ArrowLeft";
  if (blockKey === false) {
    let X = 0;
    if (e.target === down || e.target === downn) {
      while (IsValid_mouveTetro(tetromino, Px, Py)) Py++;
      score += 4;
    }
    if (
      (e.target === right || e.target === rightt) &&
      collision_Detecte(tetromino, Px, Py, paroieR)
    ) {
      Px++;
    }
    if (
      (e.target === left || e.target === leftt) &&
      collision_Detecte(tetromino, Px, Py, paroieL)
    ) {
      Px--;
    }

    if (
      (e.target === up || e.target === upp) &&
      IsValid_mouveTetro(tetromino, Px, Py)
    ) {
      X = Px;
      // coordonnee axe de rotation du tetrominos
      const coordAxe = coordAxeRotation(tetromino, X, Py);
      if (isNaN(coordAxe.x)) {
        return;
      }
      // verifier si le paroi gauche du tetromino est en collision avant de faire une rotation
      if (collisionAxeRotation(tetromino, coordAxe.x, coordAxe.y, coteLeft)) {
        X = coordAxe.x;
        coordAxe.x++;
      }

      // verifier si le paroi droite du tetromino est en collision avant de faire une rotation
      if (collisionAxeRotation(tetromino, coordAxe.x, coordAxe.y, coteRight)) {
        X = coordAxe.x - 2;
        coordAxe.x--;
        if (!IsValid_rotation(tetromino, coordAxe.x, coordAxe.y)) {
          X -= 1;
          coordAxe.x--;
        }
      }

      // verifier si une rotation de tetromino est possible
      if (IsValid_rotation(tetromino, coordAxe.x, coordAxe.y)) {
        Px = X;
        rotation++;
        if (rotation === tetros.length) {
          rotation = 0;
        }
        tetromino = tetros[rotation];
      }
    }

    draw_tetromino(tetromino, Px, Py, color);
  }
});
