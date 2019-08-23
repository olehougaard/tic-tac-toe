import React from 'react';
import ReactDOM from 'react-dom';
import './View.css';

const Message = ({status: {winner, inTurn, stalemate, ongoing}, player}) => {
  if (!ongoing || player !== inTurn) {
    return <p>Waiting for player...</p>
  } if (winner)
      return <p>{winner.winner} won!</p>
  else if (stalemate)
      return <p>Stalemate!</p>
  else    
      return <p>Your turn, {inTurn}</p>
}        

const Board = ({ board, dispatch }) =>
  <table>
      <tbody>
          {board.map((row, i) =>
          <tr key={i}>{row.map ( (tile, j) => 
              <td key={i+''+j}
                  className={tile || 'blank'}
                  onClick= {() => dispatch({type:'move', x: i, y: j})}/>)
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
  console.log(state)
  if (state.game) {
    return <div> 
      <h1>Tic-tac-toe</h1>
        <Message status = {state.game} player = {state.player} />
        {
          (state.game.ongoing)?
            <Board board={state.game.board} dispatch = {dispatch}/>
            : <div></div>
        }
      <button id = 'concede' onClick = {() => dispatch({type: "concede"})}>Concede</button>
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
