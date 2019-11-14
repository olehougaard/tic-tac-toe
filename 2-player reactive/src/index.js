import './index.css';
import { pre_game_state } from './model'
import { reduce } from './store'
import { server_dispatch_rx } from './dispatcher'
import { create_view } from './View'
import { Subject } from 'rxjs'
import { map, mergeMap, scan } from 'rxjs/operators'

import ReactDOM from 'react-dom';

fetch('http://localhost:8080/games')
.then(res => res.json())
.then(games => {
  const actions = new Subject()
  const dispatch = action => actions.next(action)
  const render = dom => ReactDOM.render(dom, document.getElementById('root'))
  const view = create_view(dispatch)
  const init_state = pre_game_state({games})

  render(view(init_state))

  actions
  .pipe(mergeMap(server_dispatch_rx))
  .pipe(scan(reduce, init_state))
  .pipe(map(view))
  .subscribe(render)
})
