import model from './model.js'

function presenter(view, dispatcher) {
    "use strict";
    let theModel
    
    function showModel() {
        if (theModel.winner()) {
            view.showWinner(theModel.winner())
        } else if (theModel.stalemate()) {
            view.showStalemate()
        } else {
            view.showInTurn(theModel.playerInTurn())
        }
        view.updateBoard(theModel.tiles())
    }

    async function clickBoard(x, y) {
        const { moves } = await dispatcher.move(x, y, theModel.gameNumber)
        theModel = moves.reduce((md, { x, y }) => md.makeMove(x, y), theModel) 
        showModel()
    }

    async function clickReset() {
        const clean = await dispatcher.clean()
        theModel = model.fromJson(clean)
        showModel()
    }

    clickReset()

    return { clickBoard, clickReset }
}

export default presenter