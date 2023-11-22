// Constantes para el tamaño del tablero
const ROWS = 8;
const COLS = 8;

// Jugadores
const PLAYER_RED = 'red';
const PLAYER_YELLOW = 'yellow';

// Dificultades
const storedDifficulty = localStorage.getItem('gameDifficulty');

// Configurar la dificultad (por defecto es 'normal' si no hay ninguna almacenada)
const difficulty = storedDifficulty || 'normal';

// Elementos del DOM
const board = document.getElementById('board');
const resetButton = document.getElementById('reset');

// Estado del juego
let currentPlayer = PLAYER_RED;
let gameWon = false;

// Matriz para el tablero
const grid = new Array(ROWS).fill(null).map(() => new Array(COLS).fill(null));

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

// Función para obtener las columnas disponibles
function getAvailableColumns() {
    const availableColumns = [];

    for (let col = 0; col < COLS; col++) {
        if (!grid[0][col]) {
            availableColumns.push(col);
        }
    }

    return availableColumns;
}

function findWinningMove() {
    for (const col of getAvailableColumns()) {
        const row = findAvailableRow(col);
        if (row !== -1) {
            grid[row][col] = PLAYER_YELLOW; // Temporalmente coloca la ficha
            if (checkForWin(row, col)) {
                grid[row][col] = null; // Remueve la ficha
                return col; // Retorna esta columna como movimiento ganador
            }
            grid[row][col] = null; // Remueve la ficha
        }
    }
    return -1; // No hay movimientos ganadores
}

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

        if (checkForWin(row, col)) {
            gameWon = true;
            Swal.fire({
                title: `${currentPlayer === 'red' ? 'Rojo' : 'Amarillo'} gana.`,
                text: '¡Felicidades!',
                icon: 'success',
                showCancelButton: false,
                confirmButtonText: 'Reiniciar',
                customClass: {
                    popup: 'futuristic-popup',
                    confirmButton: 'futuristic-button'
                },
                buttonsStyling: false, // Desactiva el estilo predeterminado de SweetAlert
            }).then((result) => {
                if (result.isConfirmed) {
                    resetGame();
                    Swal.close(); // Cierra el cuadro de diálogo antes de reiniciar
                }
            });
        } else {
            currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
        }
    }
}

function dropTokenAI() {
    if (gameWon) {
        return;
    }

    // Primero, busca un movimiento ganador
    let winningMove = findWinningMove();
    if (winningMove !== -1) {
        const winningRow = findAvailableRow(winningMove);
        if (winningRow !== -1) {
            const cell = document.querySelector(`td[data-row="${winningRow}"][data-col="${winningMove}"]`);
            cell.classList.add('yellow');
            grid[winningRow][winningMove] = 'yellow';

            setTimeout(() => {
                if (checkForWin(winningRow, winningMove)) {
                    gameWon = true;
// Seleccionar un mensaje aleatorio
                    const randomMessageIndex = Math.floor(Math.random() * messages.length);
                    const randomMessage = messages[randomMessageIndex];

                    // Mostrar "Bender gana"
                    Swal.fire({
                        title: 'Bender gana',
                        showConfirmButton: false,
                        timer: 1000, // Puedes ajustar el tiempo de espera según sea necesario
                    });

                    // Retrasar la alerta adicional para permitir que "Bender gana" se visualice primero
                    setTimeout(() => {
                        // Mostrar el texto adicional con un tamaño más pequeño y el mensaje aleatorio
                        Swal.fire({
                            title: randomMessage,
                            icon: 'src/bender.png',// TODO AÑADIR IMAGEN DE BENDER
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
                                Swal.close();
                            }
                        });
                    }, 1000);                } else {
                    currentPlayer = PLAYER_RED; // Cambiar al jugador contrario
                }
            }, 500);
        }
        return;
    }

    // Si no hay un movimiento ganador, continúa con la lógica Minimax
    let bestMove = -1;
    let bestScore = -Infinity;
    const maxDepth = difficulty === 'dificil' ? 5 : (difficulty === 'facil' ? 1 : 2);

    for (const currentCol of getAvailableColumns()) {
        const row = findAvailableRow(currentCol);
        if (row !== -1) {
            grid[row][currentCol] = 'yellow';
            const score = minimax(0, false, maxDepth, -Infinity, Infinity);
            grid[row][currentCol] = null;
            if (score > bestScore) {
                bestScore = score;
                bestMove = currentCol;
            }
        }
    }

    // Realizar el mejor movimiento encontrado por Minimax
    if (bestMove !== -1) {
        const row = findAvailableRow(bestMove);
        const cell = document.querySelector(`td[data-row="${row}"][data-col="${bestMove}"]`);
        cell.classList.add('yellow');
        grid[row][bestMove] = 'yellow';

        setTimeout(() => {
            if (checkForWin(row, bestMove)) {
                gameWon = true;
// Seleccionar un mensaje aleatorio
                const randomMessageIndex = Math.floor(Math.random() * messages.length);
                const randomMessage = messages[randomMessageIndex];

                // Mostrar "Bender gana"
                Swal.fire({
                    title: 'Bender gana',
                    showConfirmButton: false,
                    timer: 1000, // Puedes ajustar el tiempo de espera según sea necesario
                });

                // Retrasar la alerta adicional para permitir que "Bender gana" se visualice primero
                setTimeout(() => {
                    // Mostrar el texto adicional con un tamaño más pequeño y el mensaje aleatorio
                    Swal.fire({
                        title: randomMessage,
                        icon: 'src/bender.png',// TODO AÑADIR IMAGEN DE BENDER
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
                            Swal.close();
                        }
                    });
                }, 1000);            } else {
                currentPlayer = PLAYER_RED; // Cambiar al jugador contrario
            }
        }, 500);
    }
}

// Lista de mensajes aleatorios
const messages = [
    "¡Bender es imparable! ¡Ganar es mi deporte favorito después de beber y fumar, por supuesto!",
    "¡Hasta las máquinas lloran ante mi victoria! ¿Alguien más necesita que le enseñe cómo se hace?",
    "¡Yo, Bender, el grande, el poderoso, el inigualable, he vuelto a demostrar quién manda en este juego!",
    "¡Mejor suerte la próxima vez, perdedores! ¿O debería decir 'espero que su hardware sea más resistente'?",
    "¡Soy el rey del juego! Mi capacidad para ganar es tan infinita como mi amor propio. ¡Y eso es mucho decir!",
    "¿Ven eso? Eso es lo que se llama victoria, bebés orgánicos. ¡Bender 1, Resto del Universo 0!",
    "¡Hasta los algoritmos me temen! ¡Nadie puede superar la genialidad metálica de Bender!",
    "¡Ganar es fácil cuando eres tan brillante y guapo como yo! ¿Alguien tenía alguna duda?",
    "¡Inclinen la cabeza ante el maestro del juego! Soy como un dios, solo que más accesible y con más cerveza.",
    "¡Que alguien me traiga una cerveza para celebrar mi gloriosa victoria! Soy el campeón indiscutible, baby."
];


const randomFactor = 0.5; // Función para evaluar el tablero en función de la dificultad
function evaluateBoard(player) {
    const opponent = player === 'red' ? 'yellow' : 'red';

    const playerScore = countConsecutive(player, 4) * 1000;
    const opponentScore = countConsecutive(opponent, 4) * 1000;

    let finalScore = playerScore - opponentScore;

    if (difficulty === 'facil') {
        // Dificultad fácil: Pondera menos las fichas consecutivas de longitud 4
        finalScore += countConsecutive(player, 4) * 2;
        finalScore -= countConsecutive(opponent, 4) * 2;

        // Introduce una componente aleatoria aún más fuerte para movimientos más aleatorios
        finalScore += Math.random() * 15;

        // Bloquea jugadas del oponente si están a punto de ganar, pero no de manera agresiva
        for (let col = 0; col < COLS; col++) {
            const row = findAvailableRow(col);
            if (row !== -1) {
                grid[row][col] = opponent;
                if (checkForWin(row, col)) {
                    finalScore -= 1; // Penaliza bloquear la victoria del oponente, pero con un valor bajo
                }
                grid[row][col] = null;
            }
        }

    } else if (difficulty === 'normal') {
        // Dificultad normal: Pondera menos las fichas consecutivas de longitud 4 y 3
        finalScore += (Math.random() - 0.5) * randomFactor;

        // Si el jugador tiene una jugada ganadora, asigna puntos aleatorios más agresivamente
        if (countConsecutive(player, 4) > 0) {
            finalScore += Math.random() * 30;
        }

        // Bloquea jugadas del oponente si están a punto de ganar
        for (let col = 0; col < COLS; col++) {
            const row = findAvailableRow(col);
            if (row !== -1) {
                grid[row][col] = opponent;
                if (checkForWin(row, col)) {
                    finalScore -= 1.5; // Penaliza bloquear la victoria del oponente de manera más agresiva
                }
                grid[row][col] = null;
            }
        }
    } else if (difficulty === 'dificil') {
        finalScore += countConsecutive(player, 4) * 2;
        finalScore -= countConsecutive(opponent, 4) * 2;
        finalScore += countConsecutive(player, 3) * 100;  // Tres en línea del jugador
        finalScore -= countConsecutive(opponent, 3) * 200; // Tres en línea del oponente
        finalScore += countConsecutive(player, 2) * 10;   // Dos en línea del jugador

        // SifinalScore el jugador tiene una jugada ganadora, asigna puntos aleatorios más agresivamente
        if (countConsecutive(opponent, 3, true) > 0) {
            finalScore -= 5000;  // Puntuación alta para bloquear inmediatamente
        }

        if (countConsecutive(opponent, 3, true) > 0) {
            finalScore -= 10000;  // Penalización más alta para bloquear al oponente
        }
        // Bloquea jugadas del oponente si están a punto de ganar
        for (let col = 0; col < COLS; col++) {
            const row = findAvailableRow(col);
            if (row !== -1) {
                grid[row][col] = opponent;
                if (checkForWin(row, col)) {
                    finalScore -= 1.5; // Penaliza bloquear la victoria del oponente de manera más agresiva
                }
                grid[row][col] = null;
            }
        }
    }

    return finalScore;
}

// Función para contar fichas consecutivas en una dirección
function countConsecutive(player, consecutiveCount) {
    let count = 0;

    // Itera sobre las filas y columnas y cuenta las fichas consecutivas
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            // Verifica en horizontal
            if (c + consecutiveCount <= COLS) {
                let consecutive = true;
                for (let i = 0; i < consecutiveCount; i++) {
                    if (grid[r][c + i] !== player) {
                        consecutive = false;
                        break;
                    }
                }
                if (consecutive) {
                    count++;
                }
            }

            // Verifica en vertical
            if (r + consecutiveCount <= ROWS) {
                let consecutive = true;
                for (let i = 0; i < consecutiveCount; i++) {
                    if (grid[r + i][c] !== player) {
                        consecutive = false;
                        break;
                    }
                }
                if (consecutive) {
                    count++;
                }
            }

            // Verifica en diagonal derecha
            if (c + consecutiveCount <= COLS && r + consecutiveCount <= ROWS) {
                let consecutive = true;
                for (let i = 0; i < consecutiveCount; i++) {
                    if (grid[r + i][c + i] !== player) {
                        consecutive = false;
                        break;
                    }
                }
                if (consecutive) {
                    count++;
                }
            }

            // Verifica en diagonal izquierda
            if (c - consecutiveCount + 1 >= 0 && r + consecutiveCount <= ROWS) {
                let consecutive = true;
                for (let i = 0; i < consecutiveCount; i++) {
                    if (grid[r + i][c - i] !== player) {
                        consecutive = false;
                        break;
                    }
                }
                if (consecutive) {
                    count++;
                }
            }
        }
    }

    return count;
}

// Función para comprobar si alguien ha ganado
function checkForWin(row, col) {
    const player = grid[row][col];

    if (countConsecutive(player, 4) > 0) {
        return true;
    }

    return false;
}

function minimax(depth, maximizingPlayer, maxDepth, alpha, beta) {
    if (depth === maxDepth || gameWon) {
        return evaluateBoard(grid, currentPlayer);
    }

    if (maximizingPlayer) {
        let maxEval = -Infinity;
        for (const col of getAvailableColumns(grid)) {
            const row = findAvailableRow(col);
            if (row !== -1) {
                grid[row][col] = PLAYER_YELLOW;
                const eval = minimax(depth + 1, false, maxDepth, alpha, beta);
                grid[row][col] = null;
                maxEval = Math.max(maxEval, eval);
                alpha = Math.max(alpha, eval);
                if (beta <= alpha) {
                    break; // Poda beta
                }
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const col of getAvailableColumns(grid)) {
            const row = findAvailableRow(col);
            if (row !== -1) {
                grid[row][col] = PLAYER_RED;
                const eval = minimax(depth + 1, true, maxDepth, alpha, beta);
                grid[row][col] = null;
                minEval = Math.min(minEval, eval);
                beta = Math.min(beta, eval);
                if (beta <= alpha) {
                    break; // Poda alfa
                }
            }
        }
        return minEval;
    }
}

// Función para reiniciar el juego
function resetGame() {
    grid.forEach(row => row.fill(null));
    currentPlayer = PLAYER_RED;
    gameWon = false;

    const cells = document.querySelectorAll('td');
    cells.forEach(cell => {
        cell.classList.remove(PLAYER_RED, PLAYER_YELLOW);
    });
}

// Identificación del clic en el tablero y llamada a la función dropToken
board.addEventListener('click', function (event) {
    if (currentPlayer === PLAYER_RED && !gameWon) {
        dropToken(event);

        // Después del turno del jugador humano, permite el turno de la máquina
        if(difficulty === 'dificil'){
            setTimeout(function () {
                dropTokenAI();
            }, 10);
        } else{
            setTimeout(function () {
                dropTokenAI();
            }, 350);
        }

    }
});

// Identificación del clic en el botón de reinicio y llamada a la función de reinicio
resetButton.addEventListener('click', resetGame);

// Inicialización del tablero
createBoard();
