import { ajax } from 'rxjs/ajax'
import { interval, of, merge} from 'rxjs'
import { pairwise, filter, map, concatMap, takeWhile, first, share } from 'rxjs/operators'

const poll_url = url => interval(100).pipe(concatMap(() => ajax.getJSON(url)))

const poll_moves = gameNumber => 
  poll_url(`http://localhost:8080/games/${gameNumber}/moves`)
  .pipe(
    pairwise(),
    filter(([original, changed]) => original.moves.length < changed.moves.length),
    map(([original, changed]) => ({ type: 'make-moves', ...changed, moves: changed.moves.slice(original.moves.length)})),
    takeWhile(({winner, stalemate}) => !winner && !stalemate, true))

const reset_action = player => game => ({type: 'reset', player, game})

export const server_dispatch_rx = action => {
  switch(action.type) {
    case 'new': {
      const start_game = ajax({ url: 'http://localhost:8080/games', method: 'POST' })
      .pipe(
        map(res => res.response),
        share())
      
      const opponent_joined = start_game
      .pipe(
        map(game => game.gameNumber),
        concatMap(gameNumber => poll_url(`http://localhost:8080/games/${gameNumber}`)),
        first(game => game.ongoing))
      
      const opponent_moves = opponent_joined
      .pipe(
        map(game => game.gameNumber),
        concatMap(poll_moves))
      
      return  merge(
        start_game.pipe(map(reset_action('X'))),
        opponent_joined.pipe(map(reset_action('X'))), 
        opponent_moves
        )
    }
    case 'join': {
      const game = ajax( { url: `http://localhost:8080/games/${action.gameNumber}`, method: 'PATCH', body: JSON.stringify({ongoing: true})})
      .pipe(
        map(res => res.response),
        share())

      const opponent_moves = game
      .pipe(
        map(game => game.gameNumber),
        concatMap(poll_moves))

      return merge(game.pipe(map(reset_action('O'))), opponent_moves)
    }
    case 'move': {
      const { x, y, player } = action
      return ajax({
        url: `http://localhost:8080/games/${action.gameNumber}/moves`, 
        method: 'POST', 
        body: JSON.stringify({x, y, inTurn: player})})
      .pipe(
        map(res => res.response),
        map(({ moves, inTurn, winner, stalemate }) => ({type: 'make-moves', moves, inTurn, winner, stalemate})))
    }
    case 'concede': {
      const winner  = action.player === 'X' ? 'O' : 'X'
      return ajax({url: `http://localhost:8080/games/${action.gameNumber}`, method: 'PATCH', body: JSON.stringify({winner})})
      .pipe(
        map(res => res.response),
        map(reset_action(action.player)))
    }
    default:
      return of(action)
  }
}

/*
Promises:
  fetch('http://...')
  .then(res => res.json)
  .then(json => ...)

RxJS:
  ajax('http://...')
  .pipe(map(res => res.response))
  .subscribe(json => ...)
*/