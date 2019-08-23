const call_server = (url, init) => 
  fetch(url, init)
  .then(res => res.ok ? res.json() : Promise.reject(res.status))


const wait_for = (url, condition) => {
  const loop = (resolve, reject) => {
    fetch(url)
    .then(res => res.ok && res.json())
    .then(json => {
      if (json && condition(json)) {
        resolve(json)
      } else {
        setTimeout(loop, 100, resolve, reject)
      }
    })
    .catch(reject)
  }
  return new Promise(loop)
}

const server_dispatch = (action, dispatch) => {
  switch(action.type) {
    case 'new':
      return call_server('http://localhost:8080/games', { method: 'POST' })
      .then(game => ({type: 'reset', player: 'X', game}))
      .then(dispatch)
      .then(({game}) => wait_for(`http://localhost:8080/games/${game.gameNumber}`, game => game.ongoing))
      .then(game => ({type: 'reset', player: 'X', game}))
      .then(dispatch)
      .catch(console.log)
    case 'join':
      return call_server(`http://localhost:8080/games/${action.gameNumber}`, { method: 'PATCH', body: JSON.stringify({ongoing: true})})
        .then(game => ({type: 'reset', player: 'O', game}))
        .then(dispatch)
    default:
      return null
  }
}

const create_dispatcher = store => {
  const dispatch = action => server_dispatch(action, dispatch) || Promise.resolve(store.onAction(action))
  return dispatch
}

export default create_dispatcher
