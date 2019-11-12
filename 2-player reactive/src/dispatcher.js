import { ajax } from 'rxjs/ajax'
import { interval } from 'rxjs'
import { pairwise, filter, map, concatMap, takeWhile } from 'rxjs/operators'

const call_server = (url, init) => 
  fetch(url, init)
  .then(res => res.ok ? res.json() : Promise.reject(res.status))


const wait_for = (url, condition) => {
  const loop = async (resolve, reject) => {
    try {
      const res = await fetch(url)
      const json = await res.json()
      if (res.ok && condition(json))
        resolve(json)
      else  
        setTimeout(loop, 100, resolve, reject)
    } catch (error) {  
      reject(error)
    }  
  }  
  return new Promise(loop)
}  

const poll_server = (gameNumber, dispatch) => {
  interval(100)
    .pipe(concatMap(() => ajax.getJSON(`http://localhost:8080/games/${gameNumber}/moves`)))
    .pipe(pairwise())
    .pipe(filter(([original, changed]) => original.moves.length < changed.moves.length))
    .pipe(map(([original, changed]) => ({ type: 'make-moves', ...changed, moves: changed.moves.slice(original.moves.length)})))
    .pipe(takeWhile(({winner, stalemate}) => !winner && !stalemate, true))
    .subscribe(dispatch)
}

const server_dispatch = async (action, dispatch) => {
  switch(action.type) {
    case 'new': {
      const game = await call_server('http://localhost:8080/games', { method: 'POST' })
      const { game:{gameNumber}, player } = await dispatch({type: 'reset', player: 'X', game})
      const ongoing_game = await wait_for(`http://localhost:8080/games/${gameNumber}`, game => game.ongoing)
      poll_server(gameNumber, dispatch)
      //run_moves_updater(gameNumber, dispatch)
      return await dispatch({type: 'reset', player, game: ongoing_game})
    }
    case 'join': {
      const game = await call_server(`http://localhost:8080/games/${action.gameNumber}`, { method: 'PATCH', body: JSON.stringify({ongoing: true})})
      const state = await dispatch({type: 'reset', player: 'O', game})
      poll_server(state.game.gameNumber, dispatch)
      //run_moves_updater(state.game.gameNumber, dispatch)
      return state
    }
    case 'move': {
      const { x, y, player } = action
      const { moves, inTurn, winner, stalemate } = await call_server(
        `http://localhost:8080/games/${action.gameNumber}/moves`, 
        { method: 'POST', body: JSON.stringify({x, y, inTurn: player})})
        return await dispatch({type: 'make-moves', moves, inTurn, winner, stalemate})
    }
    case 'concede': {
      const winner  = action.player === 'X' ? 'O' : 'X'
      const game = await call_server(`http://localhost:8080/games/${action.gameNumber}`, { method: 'PATCH', body: JSON.stringify({winner})})
      return await dispatch({type: 'reset', player: action.player, game})
    }
    default:
      return null
  }
}

const create_dispatcher = store => {
  const dispatch = async action => {
    const res = await server_dispatch(action, dispatch)
    return res || store.onAction(action)
  }
  return dispatch
}

export default create_dispatcher
