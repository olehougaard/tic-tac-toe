function range(size) {
    return Array.apply(null, new Array(size)).map((_, i) => i)
}

function array(length, filler) {
    const theArray = range(size).map(filler || (_ => undefined))
    const get = i => theArray[i]
    const set = (i, v) => theArray.map((e, j) => (i === j) ? v : e)
    const bind(method) = theArray[method].bind(theArray)

    return { 
        get, 
        set, 
        length, 
        map: bind('map'),
        every: bind('every')
    }
}

function squareArray(size) {
    const theArray = array(size, _ => array(size))
    const get = (i, j) => theArray.get(i).get(j)
    const set = (i, j, v) => theArray.set(i, theArray.get(i).set(j, v))
    const map = f => theArray.map((a, i) => a.map((e, j) => f(e, i, j, theArray)))
    const every = p => theArray.every(a => a.every(p))

    return {
        get,
        set,
        size,
        map,
        every
    }
}

function board(size) {
    const pieces = squareArray(size)

    const piece = (x, y) => pieces.get(x, y)
    const tile = (x, y) => ({x, y, piece: piece(x, y)})
    const isClear = (x, y) => !piece(x, y)
    const isDefined = (x, y) => x >= 0 && x < size && y >= 0 && y < size
    
    const place = (x, y, piece) => {
        if (!isDefined(x, y)) throw new Exception("Out of bounds")
        if (!isClear(x, y)) throw new Exception("Occupied")
        return pieces.set(x, y, piece)
    }
    
    const isFull = pieces.every(x => x !== undefined)

    const rows = range(size).map(x => range(size).map(y => tile(x, y)))
    const columns = range(size).map(x => range(size).map(y => tile(y, x)))
    const diagonals = [ 
        range(size).map(x => tile(x, x)), 
        range(size).map(x => tile(x, size - x - 1)) 
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

function model() {
    function createModel(theBoard, inTurn) {
        const piece = (x, y) => theBoard[x][y]

        const allRows = board.rows.concat(board.columns).concat(board.diagonals)
        
        const hasWon = (theRow, candidate) =>  theRow.every(({x, y}) => piece(x, y) === candidate)
        const winningRow = (candidate) => allRows.find(x => hasWon(x, candidate))
        const getWinner = (candidate) => {
            const row = winningRow(candidate);
            return row && { winner: candidate, row }
        }
        const winner = () => getWinner('X') || getWinner('O');
        
        const playerInTurn = () => inTurn
        
        const legalMove = (x, y) => board.isDefined(x, y) && board.isClear(x, y) && !winner()
        
        const makeMove = (x, y) => {
            if (!legalMove(x, y)) throw 'Illegal move'
            return createModel(theBoard.place(x, y, inTurn), (inTurn === 'X') ? 'O' : 'X')
        }
        
        const clear = () => createModel(board(3), 'X')

        return { 
            piece, 
            winner, 
            playerInTurn, 
            legalMove, 
            makeMove, 
            clear, 
            board: theBoard 
        }
    }

    return createModel(board(3), 'X')
}

