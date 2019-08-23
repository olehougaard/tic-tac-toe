import React from 'react';
import ReactDOM from 'react-dom';
import './View.css';

const Message = ({status: {winner, inTurn, stalemate, ongoing}, player}) => {
  if (winner)
    return <p>{winner.winner} won!</p>
  else if (stalemate)
    return <p>Stalemate!</p>
  else if (!ongoing || player !== inTurn) 
    return <p>Waiting for player...</p>
  else    
    return <p>Your turn, {inTurn}</p>
}        

const Board = ({ game: { board, gameNumber }, dispatch, player }) =>
  <table>
      <tbody>
          {board.map((row, x) =>
          <tr key={x}>{row.map ( (tile, y) => 
              <td key={x+''+y}
                  className={tile || 'blank'}
                  onClick= {() => dispatch({type:'move', x, y, player, gameNumber })}/>)
              }</tr>
          )}
      </tbody>
  </table>

const GamesList = ({ games, dispatch }) => (
  <div>
    {games.map(({gameNumber}) => 
      <div 
        key={gameNumber}
        onClick={() => dispatch({type: 'join', gameNumber})}>
          Game {gameNumber}
      </div>)}
  </div>
)

const View = ({ state, dispatch }) => {
  if (state.game) {
    return <div> 
      <h1>Tic-tac-toe</h1>
        <Message status = {state.game} player = {state.player} />
        {
          (state.game.ongoing)?
            <Board game={state.game} dispatch = {dispatch} player = {state.player} />
            : <div></div>
        }
      <button id = 'concede' 
              onClick = {() => 
                dispatch({
                  type: "concede", 
                  player: state.player, 
                  gameNumber: state.game.gameNumber})}>
                    Concede
      </button>
    </div>
  } else {
    return <div>
      <h1>Choose game</h1>
      <GamesList games={state.games} dispatch = {dispatch} />
      <button id = 'new' onClick = { () => dispatch({type: "new"})}>New game</button>
    </div>
  }
}

const render = dispatch => state => ReactDOM.render(<View state={ state } dispatch = {dispatch} />, document.getElementById('root'));

export default render;
