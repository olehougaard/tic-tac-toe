import { ajax } from 'rxjs/ajax'
import { interval, of, merge} from 'rxjs'
import { filter, map, concatMap, share, mergeScan } from 'rxjs/operators'

const poll_url = url => 
interval(500)
.pipe(concatMap(() => ajax.getJSON(url)))

const log = x => { console.log(x); return x}

const maybeGetNewer = (url, g) => 
  ajax.getJSON(url + '?baseline=' + g.version)
  .pipe(filter(maybeNewer => Boolean(maybeNewer)))

const poll_changed = (url, first) => 
  interval(500)
  .pipe(mergeScan((g, _) => maybeGetNewer(url, g), first))

const poll_game = game =>
  poll_changed(`http://localhost:8080/games/${game.gameNumber}`, game)

const reset_action = player => game => ({type: 'reset', player, game})

const start_game = (httpCall, player) => {
  const game = ajax(httpCall)
  .pipe(map(res => res.response))
  .pipe(share())

  const opponent_moves = game.pipe(concatMap(poll_game))

  return merge(game, opponent_moves).pipe(map(reset_action(player)))
}

export const server_dispatch_rx = action => {
  switch(action.type) {
    case 'front-page': {
      return ajax.getJSON('http://localhost:8080/games')
      .pipe(map(games => ({type: 'view-front-page', games})))
    }
    case 'new': {
      return start_game({url: 'http://localhost:8080/games', method: 'POST' }, 'X')
    }
    case 'join': {
      return start_game({url: `http://localhost:8080/games/${action.gameNumber}`, method: 'PATCH', body: JSON.stringify({ongoing: true})}, 'O')
    }
    case 'move': {
      const { x, y, player, gameNumber } = action
      return ajax({
        url: `http://localhost:8080/games/${gameNumber}/moves`, 
        method: 'POST', 
        body: JSON.stringify({x, y, inTurn: player})})
      .pipe(map(res => res.response))
      .pipe(map(reset_action(player)))
    }
    case 'concede': {
      const winner  = action.player === 'X' ? 'O' : 'X'
      return ajax({url: `http://localhost:8080/games/${action.gameNumber}`, method: 'PATCH', body: JSON.stringify({winner})})
      .pipe(map(res => res.response))
      .pipe(map(reset_action(action.player)))
    }
    default:
      return of(action)
  }
}
