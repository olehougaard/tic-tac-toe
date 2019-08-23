function reduce(state, action) {
    console.log(state)
    console.log(action)
    switch (action.type) {
        case 'make-moves': {
            const {moves, inTurn, winner, stalemate} = action
            console.log(moves)
            const { game, player } = state
            const board = game.board.map(row => [...row])
            moves.forEach(({x, y, player}) => board[x][y] = player)
            return { 
                game:{board, inTurn, winner, stalemate, ongoing: game.ongoing, gameNumber: game.gameNumber }, 
                player}
        }
        case 'reset':
            const { game, player } = action
            return { game, player }
        default:
            return {}
    }
}

function create_store(init_state) {
    let state = init_state
    let render

    function onAction(action) {
        state = reduce(state, action)
        if (render) render(state)
        return state
    }

    function setRender(_render) {
        render = _render
    }

    return { onAction, state: () => state, setRender }
}

export default create_store
