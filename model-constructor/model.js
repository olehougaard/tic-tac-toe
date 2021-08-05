function Board(size) {
    "use strict"

    this.size = size
    this.pieces = new Array(size)
    for(let x = 0; x < size; x++) {
        this.pieces[x] = new Array(size)
        this.pieces[x].fill(undefined)
    }
}

Object.assign(Board.prototype, {
    piece(x, y) {
        return this.pieces[x][y]
    },
    tile(x, y) {
        return {x, y, piece: this.piece(x, y)}
    },
    isClear(x, y) {
        return !this.piece(x, y)
    },
    place(x, y, piece) {
        if (!this.isDefined(x, y)) throw new Exception("Out of bounds")
        if (!this.isClear(x, y)) throw new Exception("Occupied")
        this.pieces[x][y] = piece
    },
    clearAll() {
        for (let row of this.pieces) row.fill(undefined)
    },   
    isDefined(x, y) {
        return x >= 0 && x < this.size && y >= 0 && y < this.size
    },
    isFull() {
        return this.pieces.every(t => t.every(x => x !== undefined))
    },
    rows() {
        let rows = new Array(this.size)
        for(let i = 0; i < this.size; i++) {
            rows[i] = new Array(this.size)
            for(let j = 0; j < this.size; j++) {
                rows[i][j] = this.tile(i, j)
            }
        }
        return rows
    },
    columns() {
        let columns = new Array(this.size)
        for(let i = 0; i < this.size; i++) {
            columns[i] = new Array(this.size)
            for(let j = 0; j < this.size; j++) {
                columns[i][j] = this.tile(j, i)
            }
        }
        return columns
    },
    diagonals() {
        let diagonals = [new Array(this.size), new Array(this.size)]
        for(let i = 0; i < this.size; i++) {
            diagonals[0][i] = this.tile(i, i)
            diagonals[1][i] = this.tile(i, this.size - i - 1)
        }
        return diagonals
    }
})

function Model() {
    "use strict"

    this.board = new Board(3)
    this.inTurn = 'X'
}

Object.assign(Model.prototype, {
    piece(x, y) {
        return this.board.piece(x, y)
    },
    winner() {
        const self = this
        function winningRow(candidate) {
            const lines = self.board.rows().concat(self.board.columns()).concat(self.board.diagonals())
            const row = lines.find(l => l.every(t => t.piece === candidate))
            return row && { row, winner: candidate }
        }
        return winningRow('X') || winningRow('O')
    },
    stalemate() { return this.board.isFull() && !this.winner() },
    playerInTurn() { return this.inTurn },
    legalMove(x, y) {
        return this.board.isDefined(x, y) &&
            this.board.isClear(x, y) &&
            !this.winner()
    },
    
    makeMove(x, y) {
        if (!this.legalMove(x, y)) throw 'Illegal move'
        this.board.place(x, y, this.inTurn)
        this.inTurn = (this.inTurn === 'X') ? 'O' : 'X'
    },
    
     clear() {
        this.board = new Board(3)
        this.inTurn = 'X'
    }
})
