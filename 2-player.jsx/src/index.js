import './index.css';
import {pre_game_state} from './model'
import create_store from './store'
import create_dispatcher from './dispatcher'
import create_render from './View'

fetch('http://localhost:8080/games')
.then(res => res.json())
.then(games => {
  const store = create_store(pre_game_state({ games }))
  const dispatch = create_dispatcher(store)
  const render = create_render(dispatch)
  store.setRender(render)
  render(store.state())
})
