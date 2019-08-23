function reduce(state, action) {
    console.log(state)
    console.log(action)
    switch (action.type) {
        case 'move': {
            const { game } = state
            const {x, y} = action
            if (game.legalMove(x, y))
                return {game: game.makeMove(x, y) }
            else
                return {game}
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
