function presenter(view, model) {
    "use strict";
    
    function showModel() {
        if (model.winner) {
            view.showWinner(model.winner)
        } else if (model.stalemate) {
            view.showStalemate()
        } else {
            view.showInTurn(model.inTurn)
        }
        view.updateBoard(model.board)
    }

    function clickBoard(x, y) {
        const { gameNumber } = model
        fetch('http://localhost:8080/move', { method: 'POST', body: JSON.stringify({ x, y, gameNumber }) })
        .then(res => res.json())
        .then(json => {
            const { moves, inTurn, winner, stalemate } = json
            moves.forEach(({x, y, player}) => model.board[x][y] = player)
            Object.assign(model, { inTurn, winner, stalemate })
            showModel()
        })
        .catch(console.error)
    }

    function clickReset() {
        fetch('http://localhost:8080/clean', { method: 'POST' })
        .then(res => res.json())
        .then(json => {
            model = json
            showModel()
        })
        .catch(console.error)
    }

    showModel()

    return { clickBoard, clickReset }
}

export default presenter