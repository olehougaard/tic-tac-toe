function model() {
    "use strict"

    let board = [ new Array(3), new Array(3), new Array(3) ],
        inTurn = 'X'
        
    function tile(x, y) {
        return board[x][y]
    }
    
    function hasRow(x, y, dx, dy, candidate) {
        let a = []
        for (let i = 0; i <= 2; i++) {
            if (board[x + i * dx][y + i * dy] !== candidate) {
                return undefined
            }
            a.push({ x: x + i * dx, y: y + i * dy})
        }
        return a
    }
    
    function hasVertical(candidate) {
        for (let i = 0; i <= 2; i++) {
            const row = hasRow(0, i, 1, 0, candidate)
            if (row) return row
        }
    }
    
    function hasHorizontal(candidate) {
        for (let i = 0; i <= 2; i++) {
            const row = hasRow(i, 0, 0, 1, candidate)
            if (row) return row
        }
    }

    function hasDiagonal(candidate) {
        return hasRow(0, 0, 1, 1, candidate) || hasRow(0, 2, 1, -1, candidate)
    }
    
    function isWinner(candidate) {
        return hasVertical(candidate) || hasHorizontal(candidate) || hasDiagonal(candidate)
    }
    
    function getWinner(candidate) {
        let w = isWinner(candidate)
        if (w) return { winner: candidate, row : w }
    }
    
    function winner() {
        return getWinner('X') || getWinner('O')
    }
    
    function playerInTurn() { return inTurn }
    
    function legalMove(x, y) {
        if (x < 0 || y < 0 || x > 2 || y > 2) return false
        if (tile(x, y)) return false
        if (winner()) return false
        return true
    }
    
    function makeMove(x, y) {
        if (!legalMove(x, y)) throw 'Illegal move'
        board[x][y] = inTurn
        inTurn = (inTurn === 'X') ? 'O' : 'X'
    }
    
     function clear () {
        board = [ new Array(3), new Array(3), new Array(3) ]
        inTurn = 'X'
    }

    return { board: tile, winner, playerInTurn, legalMove, makeMove, clear }
}
