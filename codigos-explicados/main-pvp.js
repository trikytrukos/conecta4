//primero se guarda el elemento tabla que es donde va el tablero
const board = document.getElementById('board');
const resetButton = document.getElementById('reset');
//para evitar numeros magicos por el codigo establecemos aqui el tamaño del tablero
const ROWS = 8;
const COLS = 8;
//inicializamos el jugador a rojo para que la primera ficha sea roja
//esto lo podemos cambiar si queremos meter imagenes o permitir que el primer jugador elija color
let currentPlayer = 'red';
//se inicializa gamewon a false por que se va a comprobar en cada casilla si se gana o sigue jugando
let gameWon = false;

//con esto creamos un array para el tablero e inicializamos todas sus casillas a null
//este array lo usaremos para los jugadores
//en este caso se utiliza map pq resultaba mas comodo que hacer 2 for anidados pero es basicamente lo mismo
const grid = new Array(ROWS).fill(null).map(() => new Array(COLS).fill(null));

//ya que nuestro tablero se crea en una tabla aqui si usamos for anidados
function createBoard() {
    for (let row = 0; row < ROWS; row++) {
        // con este primero damos 8 vueltas para que no cree 8 filas ya que la variable ROW=8
        const tr = document.createElement('tr');//al ser una tabla asi creamos la fila
        for (let col = 0; col < COLS; col++) {
            //ahora cada fila la recorremos 8 veces por el mismo motivo ya que COLS=8
            //creamos los elementos celda que son td por que estamos en una tabla
            const cell = document.createElement('td');
            //aqui le añadimos 2 atributos extra a cada celda para que en cada una queden reflejados la fila y la columna
            // estos dos atributos extra son data = numero de fila/columna y se añaden con el dataset
            cell.dataset.row = row;
            cell.dataset.col = col;
            // TODO AÑADIR AQUI LAS CLASES DEL FULL RESPONSIVE

            // aqui se introduce cada casilla a la fila que le toque
            tr.appendChild(cell);
        }
        //con esto seleccionamos de nustra tabla tablero el tbody con id cuerpo ya que es ahi donde organizamos el tablero
        // y con el apendchild simplemente vamos introduciendo las filas al tablero
        board.querySelector('tbody').appendChild(tr);
    }
}

// una vez se genera el tablero hay que introducir fichas para poder jugar
// en este caso lo hemos querido hacer con gravedad
// para ello primero identificamos la fila dispopnible que se encuentre mas abajo en el tablero
function findAvailableRow(col) {// aqui le pasamos la variable col por que mas adelante identificaremos la columna en la se que esta haciendo click
    for (let row = ROWS - 1; row >= 0; row--) {
        // ahora entra en juego el array que hemos creado anteriormente y hemos inicializado a valores nulos
        //ya que para identificar si hay o no introducida una ficha en el tablero vemos si la casilla tiene un valor o sigue siendo nula
        // esto nos devuelve la ultima fila o sea la de mas abajo con valor nulo
        if (!grid[row][col]) {
            return row;
        }
    }
    // y si no encuentra ninguna casilla vacia devuelve -1
    return -1;
}

// ahora pasamos a introducir las fichas
function dropToken(event) {
    //primero comprobamos si la partida ha sido ganada para que no permita seguir introduciendo fichas una vez se ha terminado
    // para esto inicializabamos la variable a false ya que si no no podriamos jugar
    // y mas adelante en esta funcion comprobaremos si se gana o no
    if (gameWon) {
        return;
    }

    // inicialmente identificamos la casilla en la que esta ocurriendo un evento con el event.target
    // y ahora es cunaod entra en juego el atributo extra que añadimos antes ya que nos ayuda a identificar la columna
    // en la que estamos y es precisamente el valor que vamos a guardar en la nueva variable col
    const col = event.target.dataset.col;
    // una vez tenemos la columna en la que se está intentando introducir una ficha utilizamos la funcion que creamos antes para identificar la fila en la que se puede introducir una ficha
    // para eso le pasamos a la funicon la columna que acabamos de identificar que es la que clicka el usuario
    const row = findAvailableRow(col);
    // ahora como la funcion devolvia la columna si habia una libre o -1 si estaba completa
    // ponemos que mientras haya espacios libres o sea que la fila sea distinta de -1 que haga cosas
    if (row !== -1) {
        // para empezar a ahcer cosas utilizamos un querry selector para capturar la celda en la que queremos introucir la ficha
        // lo hacemos de esta manera por que asi podemos controlar que el valor de los atributos extra que añadimos
        // anteriormente sean exactamente los que nosotros queremos que en este caso es la columna que se clicka y la fila libre
        const cell = document.querySelector(`td[data-row="${row}"][data-col="${col}"]`);
        // una vez tenemos la casilla  utilizamos una clase segun el color del jugador que lo que hace es cambbiar el color de fondo
        // le damos el color a la celda
        cell.classList.add(currentPlayer);
        // y aqui llenamos la casilla para que esta ya no esté disponible para siguientes comprobaciones
        grid[row][col] = currentPlayer;

        // ahora pasamos a comprobar la victoria que se hace con cada ficha que se coloca
        // la logica detallada la explicamos con la funcion de victoria
        if (checkForWin(row, col)) {
            // basicamente aqui entras si la funcion dice que has ganado
            // lo primero que hacemos es cambiar el valor de esta variable para que ya no se puedan seguir introduciendo fichas como se mencionaba antes
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

// ahora pasamos a comprobar las condiciones de victoria
// para ello le pasamos la fila y la columna en la que se introduce la ficha
function checkForWin(row, col) {
    // guardamos el valor de la malla en la posicion que le introducimos
    const player = grid[row][col];

    // Verificar en horizontal
    // para hacer la verificacion horizaontal se itera sobre las columnas
    // se seleccionan las 4 columnas que están cerca de la ficha que se acaba de introducir
    for (let c = 0; c <= COLS - 4; c++) {
        // ahora se comprueban las 4 casillas adyacentes para ver si tienen una ficha del mismo color
        // ya que en player hemos guardado el color de la ultima ficha que se introduce
        // y en el grid estan almacenados los colores de las ficas que se hayan ido introduciendo
        if (
            grid[row][c] === player &&
            grid[row][c + 1] === player &&
            grid[row][c + 2] === player &&
            grid[row][c + 3] === player
        ) {
            // si las 4 seguidas son del mismo color retornará true por lo que la partida se terminaría
            return true;
        }
    }

    // Verificar en vertical
    // la verificacion vertical es esecialmente lo mismo solo que en vez de iterar sobre las columnas lo hacemos con las filas
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

    // ahora para comprobar las diagonales lo hacemos de arriba a abajo y distinguimos entre derecha e izquierda
    // por que se trabaja de manera diferente con las columnas segun el caso


    // Verificar en diagonal hacia abajo a la derecha
    // en este primer caso vamos a sumar tanto en las filas como en las columnas
    // recorremos filas y columnas...
    for (let r = 0; r <= ROWS - 4; r++) {
        for (let c = 0; c <= COLS - 4; c++) {
            // y ahora para hayar las posiciones de las 4 siguiuentes casillas se le suma 1,2,3 a la fila para bajar
            // y 1,2,3.. a las columnas para movernos a la derecha
            if (
                grid[r][c] === player &&
                grid[r + 1][c + 1] === player &&
                grid[r + 2][c + 2] === player &&
                grid[r + 3][c + 3] === player
            ) {
                // y si los 4 coinciden se acaba el juego retornando true
                return true;
            }
        }
    }

    // Verificar en diagonal hacia abajo a la izquierda
    // para esta verificacion se hace lo mismo solo que nos movemos al reves con las columnas
    for (let r = 0; r <= ROWS - 4; r++) {
        for (let c = 3; c < COLS; c++) {
            if (
                // para bajar seguimos sumando pero para movernos restamos a las columnas y asi vamos hacia la izquierda
                grid[r][c] === player &&
                grid[r + 1][c - 1] === player &&
                grid[r + 2][c - 2] === player &&
                grid[r + 3][c - 3] === player
            ) {
                return true;
            }
        }
    }

    return false; // Si no se encontraron 4 en línea en ninguna dirección.
}


// para reiniciar el juego podemos usar el boton o esperar a ganar y que se reinicie automaticamente al aceptar el alert
function resetGame() {
    // para ello volvemos a llenar el grid con valores nulos de manera que qued igual que cuando se crea
    grid.forEach(row => row.fill(null));
    // le volvemos a dar el valor del jugador que queramos que empiece
    currentPlayer = 'red';
    // como gamewon se pone true cuando uno gana hay que devolverlo a false para que permita volver a introducir fichas
    gameWon = false;

    // se le quita a todas las casillas el color que tuvieran
    const cells = document.querySelectorAll('td');
    cells.forEach(cell => {
        cell.classList.remove('red', 'yellow');
    });
}

// aqui se llama a la funcion create board para que se visualice el tablero
createBoard();

// identificamos cuando se hace click en el tablero y llama a la funcion drop token
board.addEventListener('click', dropToken);
// y tambien se identifica cuando se hace click en el boton de reinicio y se llama a la funcion de reinicio
resetButton.addEventListener('click', resetGame);
