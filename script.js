const configForm = document.getElementById("config-form");
const gameBoard = document.getElementById("game-board");

let board = [];
let rows, cols, mineCount;
let isFirstClick = true;  // Variable para controlar si es el primer clic

// Configuración de niveles de dificultad
const difficultySettings = {
  easy: { rows: 8, cols: 8, mines: 10 },
  medium: { rows: 12, cols: 12, mines: 20 },
  hard: { rows: 15, cols: 15, mines: 40 },
  veryHard: { rows: 20, cols: 20, mines: 60 },
  legend: { rows: 25, cols: 25, mines: 80 }
};

configForm.addEventListener("submit", function(event) {
  event.preventDefault();
  const difficulty = document.getElementById("difficulty").value;
  
  // Configuración de la tabla según la dificultad
  rows = difficultySettings[difficulty].rows;
  cols = difficultySettings[difficulty].cols;
  mineCount = difficultySettings[difficulty].mines;

  isFirstClick = true;
  initBoard();
});

function initBoard() {
  // Inicialización de la estructura del tablero
  board = Array.from({ length: rows }, () => Array(cols).fill({ revealed: false, mine: false, adjacentMines: 0 }));
  
  // Limpiando el tablero en el DOM y ajustando la cuadrícula
  gameBoard.innerHTML = '';
  gameBoard.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  renderBoard();
}

function placeMines(excludeRow, excludeCol) {
  let placedMines = 0;
  while (placedMines < mineCount) {
    let row = Math.floor(Math.random() * rows);
    let col = Math.floor(Math.random() * cols);
    if (!board[row][col].mine && (row !== excludeRow || col !== excludeCol)) {
      board[row][col] = { ...board[row][col], mine: true };
      placedMines++;
    }
  }
}

function calculateAdjacentMines() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (board[row][col].mine) continue;

      let mines = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          let r = row + i;
          let c = col + j;
          if (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c].mine) {
            mines++;
          }
        }
      }
      board[row][col] = { ...board[row][col], adjacentMines: mines };
    }
  }
}

function renderBoard() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener("click", handleCellClick);
      cell.addEventListener("contextmenu", handleCellRightClick);
      gameBoard.appendChild(cell);
    }
  }
}

function handleCellClick(event) {
  const cell = event.target;
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);

  if (board[row][col].revealed || cell.classList.contains("flagged")) return;

  // En el primer clic, genera el tablero asegurando que no haya una mina en la primera celda
  if (isFirstClick) {
    placeMines(row, col);  // Excluir la celda del primer clic
    calculateAdjacentMines();
    isFirstClick = false;
  }

  if (board[row][col].mine) {
    cell.classList.add("mine");
    alert("¡Perdiste! Diste clic en una mina.");
    revealAllMines();
  } else {
    revealCell(row, col);
    checkWinCondition();
  }
}

function handleCellRightClick(event) {
  event.preventDefault();
  const cell = event.target;
  if (cell.classList.contains("revealed")) return;

  cell.classList.toggle("flagged");
}

function revealCell(row, col) {
  if (row < 0 || row >= rows || col < 0 || col >= cols || board[row][col].revealed) return;

  const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
  cell.classList.add("revealed");
  board[row][col].revealed = true;

  if (board[row][col].adjacentMines > 0) {
    cell.textContent = board[row][col].adjacentMines;
  } else {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        revealCell(row + i, col + j);
      }
    }
  }
}

function revealAllMines() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (board[row][col].mine) {
        const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
        cell.classList.add("mine");
      }
    }
  }
}

function checkWinCondition() {
  let allCellsRevealed = true;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!board[row][col].mine && !board[row][col].revealed) {
        allCellsRevealed = false;
        break;
      }
    }
  }
  if (allCellsRevealed) {
    alert("¡Ganaste! Has encontrado todas las minas.");
    revealAllMines();
  }
}