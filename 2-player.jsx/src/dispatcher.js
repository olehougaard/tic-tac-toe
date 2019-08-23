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

const wait_for_moves = async (gameNumber, dispatch) => {
  const res = await call_server(`http://localhost:8080/games/${gameNumber}/moves`, { method: 'GET' })
  console.log(res)
  const { moves: original_moves } = res
  const moves = await wait_for(`http://localhost:8080/games/${gameNumber}/moves`, 
                              ({ moves }) => moves.length > original_moves.length)
  console.log(moves)
  return await dispatch(Object.assign({type: 'make-moves'}, moves))
}

const server_dispatch = async (action, dispatch) => {
  switch(action.type) {
    case 'new': {
      const game = await call_server('http://localhost:8080/games', { method: 'POST' })
      const { game:{gameNumber}, player } = await dispatch({type: 'reset', player: 'X', game})
      const ongoing_game = await wait_for(`http://localhost:8080/games/${gameNumber}`, game => game.ongoing)
      return await dispatch({type: 'reset', player, game: ongoing_game})
    }
    case 'join': {
      const game = await call_server(`http://localhost:8080/games/${action.gameNumber}`, { method: 'PATCH', body: JSON.stringify({ongoing: true})})
      const { game: {gameNumber} } = await dispatch({type: 'reset', player: 'O', game})
      return wait_for_moves(gameNumber, dispatch)
    }
    case 'move': {
      const { x, y, player } = action
      const { moves, inTurn, winner, stalemate } = await call_server(
        `http://localhost:8080/games/${action.gameNumber}/moves`, 
        { method: 'POST', body: JSON.stringify({x, y, inTurn: player})})
        const { game: {gameNumber} } = await dispatch({type: 'make-moves', moves, inTurn, winner, stalemate})
        return wait_for_moves(gameNumber, dispatch)
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
