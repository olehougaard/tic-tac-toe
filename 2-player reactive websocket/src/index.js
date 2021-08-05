import './index.css';
import { pre_game_state } from './model'
import { reduce } from './store'
import { server_dispatch, create_action } from './dispatcher'
import { create_view } from './View'
import { Subject, merge } from 'rxjs'
import { webSocket } from "rxjs/webSocket";
import { map, scan } from 'rxjs/operators'

import ReactDOM from 'react-dom';

const ws = webSocket("ws://localhost:9090/tic-tac-toe")

const actions = new Subject()
const dispatch = action => actions.next(action)
const render = dom => ReactDOM.render(dom, document.getElementById('root'))
const view = create_view(dispatch)

actions
.pipe(map(server_dispatch(ws)))
.subscribe(command => ws.next(command))

const log = x => { console.log(x); return x }

merge(actions, ws.pipe(map(create_action)))
.pipe(scan(reduce, pre_game_state({games: []})))
.pipe(map(view))
.subscribe(render)
