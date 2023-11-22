// Constantes para el tamaño del tablero
const ROWS = 8;
const COLS = 8;

// Jugadores
const PLAYER_RED = 'red';
const PLAYER_YELLOW = 'yellow';

// Elementos del DOM
const board = document.getElementById('board');
const resetButton = document.getElementById('reset');

// Estado del juego
let currentPlayer = PLAYER_RED;
let gameWon = false;
let moves = 0; // Nueva variable para contar movimientos


// Matriz para el tablero
const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

// Función para crear el tablero
function createBoard() {
    for (let row = 0; row < ROWS; row++) {
        const tr = document.createElement('tr');
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement('td');
            cell.dataset.row = row;
            cell.dataset.col = col;
            tr.appendChild(cell);
        }
        board.querySelector('tbody').appendChild(tr);
    }
}

// Función para encontrar la fila disponible en una columna
function findAvailableRow(col) {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (!grid[row][col]) {
            return row;
        }
    }
    return -1;
}

// Función para dejar caer una ficha en el tablero
// Función para dejar caer una ficha en el tablero
function dropToken(event) {
    if (gameWon) {
        return;
    }

    const col = event.target.dataset.col;
    const row = findAvailableRow(col);

    if (row !== -1) {
        const cell = board.querySelector(`td[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add(currentPlayer);
        grid[row][col] = currentPlayer;
        moves++; // Incrementar el contador de movimientos

        if (checkForWin(row, col)) {
            gameWon = true;
            showWinMessage(currentPlayer);
        } else {
            if (moves === ROWS * COLS) {
                // Empate: todas las celdas están llenas y no hay un ganador
                showDrawMessage();
            } else {
                currentPlayer = currentPlayer === PLAYER_RED ? PLAYER_YELLOW : PLAYER_RED;
                if (currentPlayer === PLAYER_YELLOW) {
                    setTimeout(dropTokenAI, difficulty === 'dificil' ? 10 : 350);
                }
            }
        }
    }
}

// Función para mostrar el mensaje de victoria
function showWinMessage(player) {
    const playerColor = player === PLAYER_RED ? 'Rojo' : 'Amarillo';
    const messages = [
        `¡${playerColor} gana! ¡Felicidades!`,
        `¡${playerColor} ha demostrado ser el mejor en este juego!`,
        `¡Viva ${playerColor}! ¡Una victoria espectacular!`
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    Swal.fire({
        title: `${playerColor} gana.`,
        text: randomMessage,
        icon: 'success',
        showCancelButton: false,
        confirmButtonText: 'Reiniciar',
        customClass: {
            popup: 'futuristic-popup',
            confirmButton: 'futuristic-button'
        },
        buttonsStyling: false,
    }).then((result) => {
        if (result.isConfirmed) {
            resetGame();
        }
    });
}
// Función para mostrar el mensaje de empate
function showDrawMessage() {
    Swal.fire({
        title: '¡Empate!',
        text: 'El juego ha terminado en empate. ¿Quieres jugar de nuevo?',
        icon: 'info',
        confirmButtonText: 'Reiniciar',
        customClass: {
            popup: 'futuristic-popup',
            confirmButton: 'futuristic-button'
        },
        buttonsStyling: false,
    }).then((result) => {
        if (result.isConfirmed) {
            resetGame();
        }
    });
}

// función para comprobar si hay 4 en raya
function checkForWin(row, col) {
    // guardamos el valor de la malla en la posicion que le introducimos
    const player = grid[row][col];

    for (let c = 0; c <= COLS - 4; c++) {

        if (
            grid[row][c] === player &&
            grid[row][c + 1] === player &&
            grid[row][c + 2] === player &&
            grid[row][c + 3] === player
        ) {
            return true;
        }
    }

    for (let r = 0; r <= ROWS - 4; r++) {
        if (
            grid[r][col] === player &&
            grid[r + 1][col] === player &&
            grid[r + 2][col] === player &&
            grid[r + 3][col] === player
        ) {
            return true;
        }
    }

    for (let r = 0; r <= ROWS - 4; r++) {
        for (let c = 0; c <= COLS - 4; c++) {

            if (
                grid[r][c] === player &&
                grid[r + 1][c + 1] === player &&
                grid[r + 2][c + 2] === player &&
                grid[r + 3][c + 3] === player
            ) {
                return true;
            }
        }
    }

    for (let r = 0; r <= ROWS - 4; r++) {
        for (let c = 3; c < COLS; c++) {
            if (
                grid[r][c] === player &&
                grid[r + 1][c - 1] === player &&
                grid[r + 2][c - 2] === player &&
                grid[r + 3][c - 3] === player
            ) {
                return true;
            }
        }
    }

    return false;
}

// Función para reiniciar el juego
function resetGame() {
    grid.forEach(row => row.fill(null));
    currentPlayer = PLAYER_RED;
    gameWon = false;
    moves = 0; // Reiniciar el contador de movimientos

    const cells = document.querySelectorAll('td');
    cells.forEach(cell => {
        cell.classList.remove(PLAYER_RED, PLAYER_YELLOW);
    });
}

// Identificación del clic en el tablero y llamada a la función dropToken
board.addEventListener('click', dropToken);

// Identificación del clic en el botón de reinicio y llamada a la función de reinicio
resetButton.addEventListener('click', resetGame);

// Inicialización del tablero
createBoard();
