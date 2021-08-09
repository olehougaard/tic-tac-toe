function range(size) {
    return Array.apply(null, new Array(size)).map((_, i) => i)
}

function immutableArray(length, filler) {
    function create(array) {
        const get = i => array[i]
        const set = (i, v) => create(array.map((e, j) => (i === j) ? v : e))
        const map = f => create(array.map(f))
        const every = array.every.bind(array)

        return { 
            get, 
            set, 
            length, 
            map,
            every
        }
    }

    return create(range(length).map(filler || (_ => undefined)))
}

function squareArray(size) {
    function create(array) {
        const get = (i, j) => array.get(i).get(j)
        const set = (i, j, v) => create(array.set(i, array.get(i).set(j, v)))
        const map = f => create(array.map((a, i) => a.map((e, j) => f(e, i, j, array))))
        const every = p => array.every(a => a.every(p))

        return {
            get,
            set,
            size,
            map,
            every
        }
    }
    return create(immutableArray(size, _ => immutableArray(size)))
}

function board(size) {
    function createBoard(pieces) {
        const piece = (x, y) => pieces.get(x, y)
        const tile = (x, y) => ({x, y, piece: piece(x, y)})
        const isClear = (x, y) => !piece(x, y)
        const isDefined = (x, y) => x >= 0 && x < pieces.size && y >= 0 && y < pieces.size
        
        const place = (x, y, piece) => {
            if (!piece) return createBoard(pieces)
            if (!isDefined(x, y)) throw new Exception("Out of bounds")
            if (!isClear(x, y)) throw new Exception("Occupied")
            return createBoard(pieces.set(x, y, piece))
        }
        
        const isFull = pieces.every(x => x !== undefined)

        const indices = range(pieces.size)
        const rows = indices.map(x => indices.map(y => tile(x, y)))
        const columns = indices.map(x => indices.map(y => tile(y, x)))
        const diagonals = [ 
            indices.map(x => tile(x, x)), 
            indices.map(x => tile(x, pieces.size - x - 1)) 
        ]

        return {
            isDefined,
            piece,
            isClear,
            place,
            isFull,
            rows,
            columns,
            diagonals
        }
    }

    return createBoard(squareArray(size))
}

board.fromJson = jsArray => jsArray.reduce((b, row, x) => row.reduce((b, p, y) => b.place(x, y, p), b), board(jsArray.length))

function createModel(theBoard, inTurn, gameNumber) {
    const piece = (x, y) => theBoard.piece(x, y)

    const allRows = theBoard.rows.concat(theBoard.columns).concat(theBoard.diagonals)
    
    const hasWon = (theRow, candidate) =>  theRow.every(({x, y}) => piece(x, y) === candidate)
    const winningRow = (candidate) => allRows.find(x => hasWon(x, candidate))
    const getWinner = (candidate) => {
        const row = winningRow(candidate)
        return row && { winner: candidate, row }
    }
    const winner = () => getWinner('X') || getWinner('O')
    const stalemate = () => theBoard.isFull && !winner()
    
    const playerInTurn = () => inTurn
    
    const legalMove = (x, y) => theBoard.isDefined(x, y) && theBoard.isClear(x, y) && !winner()
    
    const makeMove = (x, y) => {
        if (!legalMove(x, y)) throw 'Illegal move'
        return createModel(theBoard.place(x, y, inTurn), (inTurn === 'X') ? 'O' : 'X', gameNumber)
    }
    
    const clear = () => createModel(board(3), 'X', gameNumber)

    const tiles = () => range(3).map(x => range(3).map(y => piece(x, y)))

    const json = () => JSON.stringify({board: range(3).map(x => range(3).map(y => piece(x, y))), inTurn, winner: winner(), stalemate: stalemate(), gameNumber})

    return { 
        piece, 
        winner, 
        stalemate,
        playerInTurn, 
        legalMove, 
        makeMove, 
        clear, 
        tiles,
        gameNumber,
        json
    }
}

const model = gameNumber => createModel(board(3), 'X', gameNumber)

model.fromJson = ({board: jsonBoard, inTurn, gameNumber}) => createModel(board.fromJson(jsonBoard), inTurn, gameNumber)

export default model