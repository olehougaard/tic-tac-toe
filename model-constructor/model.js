function Model() {
    "use strict"

    this.board = [ new Array(3), new Array(3), new Array(3) ]
    this.inTurn = 'X'
}

Model.prototype = {
    tile(x, y) {
        return this.board[x][y]
    },
    
    hasRow(x, y, dx, dy, candidate) {
        let a = []
        for (let i = 0; i <= 2; i++) {
            if (this.board[x + i * dx][y + i * dy] !== candidate) {
                return undefined
            }
            a.push({ x: x + i * dx, y: y + i * dy})
        }
        return a
    },
    
    hasVertical(candidate) {
        for (let i = 0; i <= 2; i++) {
            const row = this.hasRow(0, i, 1, 0, candidate)
            if (row) return row
        }
    },
    
    hasHorizontal(candidate) {
        for (let i = 0; i <= 2; i++) {
            const row = this.hasRow(i, 0, 0, 1, candidate)
            if (row) return row
        }
    },

    hasDiagonal(candidate) {
        return this.hasRow(0, 0, 1, 1, candidate) || this.hasRow(0, 2, 1, -1, candidate)
    },
    
    isWinner(candidate) {
        return this.hasVertical(candidate) || this.hasHorizontal(candidate) || this.hasDiagonal(candidate)
    },
    
    getWinner(candidate) {
        const w = this.isWinner(candidate)
        if (w) return { winner: candidate, row : w }
    },
    
    winner() {
        return this.getWinner('X') || this.getWinner('O')
    },
    
    playerInTurn() { return this.inTurn },
    
    legalMove(x, y) {
        if (x < 0 || y < 0 || x > 2 || y > 2) return false
        if (this.board[x][y]) return false
        if (this.winner()) return false
        return true
    },
    
    makeMove(x, y) {
        if (!this.legalMove(x, y)) throw 'Illegal move'
        this.board[x][y] = this.inTurn
        this.inTurn = (this.inTurn === 'X') ? 'O' : 'X'
    },
    
     clear () {
        this.board = [ new Array(3), new Array(3), new Array(3) ]
        this.inTurn = 'X'
    }
}
