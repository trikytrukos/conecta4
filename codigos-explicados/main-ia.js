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

// Hasta aquí ha sido todo igual que en el archivo de PvP
// pero ahora se empieza a complicar la cosa por que es donde entra la IA
function dropTokenAI() {
    if (gameWon) {
        return;
    }

    // aqui inicializamos unas variables que necesitaremos mas adelante
    let bestMove = -1;
    let bestScore = -Infinity;

    // esto se entenderá mejor cuando lleguemos a la función minimax
    // de momento para que se entienda mas o menos, es la cantidad de turnos que va a intentar predecir
    const depthScale = difficulty === 'facil' ? 1 : (difficulty === 'dificil' ? 3 : 2);
    const initialDepth = 0;
    const maxDepth = depthScale * 2;

    // aqui obtenemos las columnas disponibles
    const availableColumns = getAvailableColumns();

    // con este bucle se va a determina cual es la mejor jugada posible para la ia en funcion de los parametros que veremos mas adelante
    // de momento para que se entienda lo que hace es colocar una ficha, comprobar la puntuacion que obtendira con esa ficha y compararla con la mejor puntuacion que ha obtenido hasta el momento
    // y esto lo hace para todas sus jugadas disponibles
    for (const currentCol of availableColumns) {
        const row = findAvailableRow(currentCol);
        if (row !== -1) {
            // coloca la ficha
            grid[row][currentCol] = 'yellow';
            // calcula la puntuacion
            const score = minimax(initialDepth + 1, false, maxDepth);
            // y elimina esa ficha para que no se quede en el tablero
            grid[row][currentCol] = null;

            // se compara la puntuacion que obtiene esa ficha con la mejor puntuacion y si esta ficha obtiene mejor puntuacion es la que se quedará
            if (score > bestScore) {
                // una vez se encuentra la mejor jugada se guarda su puntuacion
                bestScore = score;
                // y la columna en la que deberia ir
                bestMove = currentCol;
            }
        }
    }

    //una vez determinada cual es la mejor jugada, se utiliza la columna en la qu etiene que caer
    const row = findAvailableRow(bestMove);
    // y se inicia el proceso de introducir la ficha que es igual que en el droptoken anterior
    // ahora la unica diferencia que hay aqui es que se muestran 2 mensajes de alerta y tienen un pequeño retraso para que se muestren bn
    if (row !== -1) {
        const cell = document.querySelector(`td[data-row="${row}"][data-col="${bestMove}"]`);
        cell.classList.add('yellow');
        grid[row][bestMove] = 'yellow';

        // Retrasar la visualización de "Bender gana"
        setTimeout(() => {
            // Verificar la victoria después del retraso
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
                }, 1000); // Puedes ajustar el tiempo de espera según sea necesario
            } else {
                currentPlayer = 'red';
            }
        }, 500); // Puedes ajustar el tiempo de espera según sea necesario
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

// Función para obtener las columnas disponibles
// esta es la funcion con la que se determina las columnas que hay libres en el tablero
function getAvailableColumns() {
    // las guardamos en un array por que va a haber mas de una columna disponible
    const availableColumns = [];

    // se recorre la primera fila del tablero y se comprueba si hay alguna ficha en esa columna
    for (let col = 0; col < COLS; col++) {
        if (!grid[0][col]) {
            // si no hay ficha se añade al array de columnas disponibles
            availableColumns.push(col);
        }
    }
    // se retorna el array de columnas disponibles
    return availableColumns;
}

// esta funcion es importante por un tema de rendimiento para limitar a la funcion minimax
// ya que es la encargada de asignar una puntuacion al estado del tablero cuando la funcion minimax
// alcanza el limite al que puede llegar segun la dificultad
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

        // Bloquea jugadas del oponente si está a punto de ganar
        for (let col = 0; col < COLS; col++) {
            const row = findAvailableRow(col);
            if (row !== -1) {
                grid[row][col] = opponent;
                if (checkForWin(row, col)) {
                    finalScore -= 1; // Penaliza bloquear la victoria del oponente
                }
                grid[row][col] = null;
            }
        }

        // Busca oportunidades ofensivas
        for (let col = 0; col < COLS; col++) {
            const row = findAvailableRow(col);
            if (row !== -1) {
                grid[row][col] = player;
                if (checkForWin(row, col)) {
                    finalScore += 4; // Recompensa formar una jugada ganadora
                }
                grid[row][col] = null;
            }
        }
    }else if (difficulty === 'normal') {
        // Dificultad normal: Pondera menos las fichas consecutivas de longitud 4 y 3
        finalScore += countConsecutive(player, 4) * 30;
        finalScore += countConsecutive(player, 3) * 10;
        finalScore -= countConsecutive(opponent, 4) * 30;
        finalScore -= countConsecutive(opponent, 3) * 10;

        // Introduce una componente aleatoria para movimientos menos predecibles
        finalScore += Math.random() * 10;

        // Bloquea jugadas del oponente si está a punto de ganar
        for (let col = 0; col < COLS; col++) {
            const row = findAvailableRow(col);
            if (row !== -1) {
                grid[row][col] = opponent;
                if (checkForWin(row, col)) {
                    finalScore -= 5; // Penaliza bloquear la victoria del oponente
                }
                grid[row][col] = null;
            }
        }

        // Busca oportunidades ofensivas
        for (let col = 0; col < COLS; col++) {
            const row = findAvailableRow(col);
            if (row !== -1) {
                grid[row][col] = player;
                if (checkForWin(row, col)) {
                    finalScore += 15; // Recompensa formar una jugada ganadora
                }
                grid[row][col] = null;
            }
        }
    } else if (difficulty === 'dificil') {
        // Dificultad difícil: Pondera principalmente las fichas consecutivas de longitud 3 y 4
        // TODO ESTO AÑADIRLO SI DA TIEMPO...
    }

    return finalScore;
}

// Función para contar fichas consecutivas en una dirección
// se clasulan cuantas fichas consecutivas tienes y en funcion de ello en la funcion de evaluateBoard se les asigna unas puntiuaciones
// la logica que se utiliza en esta funcion es practicamente igual que la que se usa en la funcion check win del pvp
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
// ya que tenemos contadas cuantas fichas seguiddas tiene cada jugador en cada direccion
// comprobamos si en algun momento retornase 4 que es lo que nos indicaria que el juego se ha ganado
// por eso se llama conecta 4 xd
function checkForWin(row, col) {
    const player = grid[row][col];

    // si hay 4 fichas consecutivas en cualquier direccion se retorna true lo que indica que el juego se ha acabado
    if (countConsecutive(player, 4) > 0) {
        return true;
    }

    return false;
}


// Función minimax, un algoritmo de búsqueda para juegos de dos jugadores
// que evalúa todas las posibles jugadas y selecciona la mejor.
// esta funcion es necesario limitarla ya que si no la limitamos se puede tirar horas y horas calculando
function minimax(depth, maximizingPlayer, maxDepth) {
    // para ello se hace uso de la profuncidad como se mencionaba anteriormente
    // si se alcanza la profundidad maxima o se gana el juego se retorna la puntuacion del estado actual del tablero
    if (depth === maxDepth || gameWon) {
        // Evaluar y retornar la puntuación del estado actual del tablero.
        return evaluateBoard(currentPlayer);
    }

    // Obtener las columnas disponibles para la jugada en curso.
    const availableColumns = getAvailableColumns();

    // Si es el turno de maximizar (IA - jugador amarillo)
    if (maximizingPlayer) {
        // Inicializar la mejor puntuación con un valor negativo infinito.
        let bestScore = -Infinity;

        // Iterar sobre las columnas disponibles para evaluar las posibles jugadas.
        for (const currentCol of availableColumns) {
            const row = findAvailableRow(currentCol);

            // Verificar si hay espacio en la columna actual.
            if (row !== -1) {
                // Colocar temporalmente una ficha amarilla en el tablero.
                grid[row][currentCol] = 'yellow';

                // Llamar recursivamente a minimax para evaluar el siguiente nivel (turno del oponente).
                const score = minimax(depth + 1, false, maxDepth);

                // Deshacer la jugada simulada para no afectar el estado actual del tablero.
                grid[row][currentCol] = null;

                // Actualizar la mejor puntuación tomando el máximo entre la puntuación actual y la mejor.
                bestScore = Math.max(score, bestScore);
            }
        }

        // Retornar la mejor puntuación obtenida para el turno de la IA.
        return bestScore;
    } else {
        // Si es el turno de minimizar (jugador rojo)
        // Similar al caso anterior, pero minimizando la puntuación.
        let bestScore = Infinity;

        for (const currentCol of availableColumns) {
            const row = findAvailableRow(currentCol);

            if (row !== -1) {
                grid[row][currentCol] = 'red';
                const score = minimax(depth + 1, true, maxDepth);
                grid[row][currentCol] = null;
                bestScore = Math.min(score, bestScore);
            }
        }

        return bestScore;
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
