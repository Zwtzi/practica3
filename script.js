const configForm = document.getElementById("config-form");
const gameBoard = document.getElementById("game-board");
const customSettings = document.getElementById("custom-settings");

let board = [];
let rows, cols, mineCount;
let isFirstClick = true;
let isGameOver = false;


const difficultySettings = {
    easy: { rows: 8, cols: 8, mines: 10 },
    medium: { rows: 12, cols: 12, mines: 20 },
    hard: { rows: 15, cols: 15, mines: 40 },
    veryHard: { rows: 20, cols: 20, mines: 60 },
    legend: { rows: 25, cols: 25, mines: 80 }
};


document.getElementById("difficulty").addEventListener("change", function() {
    customSettings.style.display = this.value === "custom" ? "block" : "none";
});

configForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const difficulty = document.getElementById("difficulty").value;
    

    if (difficulty === "custom") {
        rows = parseInt(document.getElementById("custom-rows").value);
        cols = parseInt(document.getElementById("custom-cols").value);
        mineCount = parseInt(document.getElementById("custom-mines").value);

        
        if (mineCount >= rows * cols) {
            alert("La cantidad de minas debe ser menor que el número de celdas.");
            return;
        }
    } else {
        rows = difficultySettings[difficulty].rows;
        cols = difficultySettings[difficulty].cols;
        mineCount = difficultySettings[difficulty].mines;
    }

    isFirstClick = true;
    isGameOver = false; 
    initBoard();
});

function initBoard() {
    board = Array.from({ length: rows }, () => Array(cols).fill({ revealed: false, mine: false, adjacentMines: 0 }));
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
    if (isGameOver) return; 

    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if (board[row][col].revealed || cell.classList.contains("flagged")) return;

    if (isFirstClick) {
        placeMines(row, col);
        calculateAdjacentMines();
        isFirstClick = false;
    }

    if (board[row][col].mine) {
        cell.classList.add("mine");
        alert("¡Perdiste! Diste clic en una mina.");
        revealAllMines();
        isGameOver = true; 
    } else {
        revealCell(row, col);
        checkWinCondition();
    }
}


function handleCellRightClick(event) {
    event.preventDefault();
    const cell = event.target;
    
    if (!isGameOver && !cell.classList.contains("revealed")) {
        cell.classList.toggle("flagged");
    }
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
    let unrevealedCells = 0;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (!board[row][col].revealed && !board[row][col].mine) {
                unrevealedCells++;
            }
        }
    }

    if (unrevealedCells === 0) {
        alert("¡Felicidades! Has ganado el juego.");
        isGameOver = true; 
    }
}

