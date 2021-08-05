function createBoard(size) {
    "use strict"

    const pieces = new Array(size)
    for(let x = 0; x < size; x++) {
        pieces[x] = new Array(size)
        pieces[x].fill(undefined)
    }

    function piece(x, y) {
        return pieces[x][y]
    }

    function tile(x, y) {
        return {x, y, piece: piece(x, y)}
    }

    function isClear(x, y) {
        return !piece(x, y)
    }

    function place(x, y, piece) {
        if (!isDefined(x, y)) throw new Exception("Out of bounds")
        if (!isClear(x, y)) throw new Exception("Occupied")
        pieces[x][y] = piece
    }

    function clearAll() {
        for (let row of pieces) row.fill(undefined)
    }

    function isDefined(x, y) {
        return x >= 0 && x < size && y >= 0 && y < size
    }

    function isFull() {
        return pieces.every(t => t.every(x => x !== undefined))
    }

    function rows() {
        let rows = new Array(size)
        for(let i = 0; i < size; i++) {
            rows[i] = new Array(size)
            for(let j = 0; j < size; j++) {
                rows[i][j] = tile(i, j)
            }
        }
        return rows
    }

    function columns() {
        let columns = new Array(size)
        for(let i = 0; i < size; i++) {
            columns[i] = new Array(size)
            for(let j = 0; j < size; j++) {
                columns[i][j] = tile(j, i)
            }
        }
        return columns
    }

    function diagonals() {
        let diagonals = [new Array(size), new Array(size)]
        for(let i = 0; i < size; i++) {
            diagonals[0][i] = tile(i, i)
            diagonals[1][i] = tile(i, size - i - 1)
        }
        return diagonals
    }

    return { 
        piece, 
        place, 
        clear, 
        clearAll, 
        isDefined, 
        isClear, 
        isFull, 
        rows, 
        columns, 
        diagonals }
}

function model() {
    "use strict"

    let board = createBoard(3),
        inTurn = 'X'
        
    function piece(x, y) {
        return board.piece(x, y)
    }
    
    function winningRow(candidate) {
        const lines = board.rows().concat(board.columns()).concat(board.diagonals())
        const row = lines.find(l => l.every(t => t.piece === candidate))
        return row && { row, winner: candidate }
    }
    
    function winner() {
        return winningRow('X') || winningRow('O')
    }

    function stalemate() {
        return board.isFull() && !winner()
    }
    
    function playerInTurn() { return inTurn }
    
    function legalMove(x, y) {
        return board.isDefined(x, y) && board.isClear(x, y) && !winner()
    }
    
    function makeMove(x, y) {
        if (!legalMove(x, y)) throw 'Illegal move'
        board.place(x, y, inTurn)
        inTurn = (inTurn === 'X') ? 'O' : 'X'
    }
    
     function clear () {
        board.clearAll()
        inTurn = 'X'
    }

    return { piece, winner, stalemate, playerInTurn, legalMove, makeMove, clear }
}
