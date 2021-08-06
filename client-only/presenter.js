function presenter(view, model) {
    "use strict";
    
    function showModel() {
        const w = model.winner()
        if (w) {
            view.showMessage(w.winner + ' won!')
        } else if (model.stalemate()) {
            view.showMessage('Stalemate')
        } else {
            view.showMessage('Your turn, ' + model.playerInTurn())
        }
        view.updateBoard(model.piece)
    }

    function clickBoard(x, y) {
        if (model.legalMove(x, y)) {
            model.makeMove(x, y)
            showModel()
        }
    }
    
    function clickReset() {
        model.clear()
        showModel()
    }

    showModel()

    return { clickBoard, clickReset }
}
