function presenter(view, dispatcher) {
    "use strict";
    let model
    
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

    async function clickBoard(x, y) {
        const { moves, inTurn, winner, stalemate } = await dispatcher.move(x, y, model.gameNumber)
        for(let {x, y, player} of moves) model.board[x][y] = player
        Object.assign(model, { inTurn, winner, stalemate })
        showModel()
    }

    async function clickReset() {
        const clean = await dispatcher.clean()
        model = clean
        showModel()
    }

    clickReset()

    return { clickBoard, clickReset }
}

export default presenter