import { game_state, apply_move } from './model'

function reduce(state, action) {
    switch (action.type) {
        case 'make-moves': {
            const {moves, inTurn, winner, stalemate} = action
            const { game, player } = state
            return game_state({ 
                game: Object.assign(moves.reduce(apply_move, game), 
                                    {inTurn, winner, stalemate}), 
                player })
        }
        case 'reset':
            return game_state(action)
        default:
            return state
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
