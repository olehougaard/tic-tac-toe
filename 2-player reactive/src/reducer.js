import { game_state, apply_move, pre_game_state } from './model'

export function reduce(state, action) {
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
        case 'view-front-page':
            console.log(action)
            return pre_game_state(action)
        default:
            return state
    }
}
