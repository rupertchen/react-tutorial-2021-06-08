import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  let className = 'square';

  if (props.isWinner) {
    className += ' square-winner'
  }

  return (
    <button
      className={className}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return <Square
      key={i}
      value={this.props.squares[i]}
      onClick={() => this.props.onClick(i)}
      isWinner={this.props.winningLine.includes(i)}
    />;
  }

  renderCols(row) {
    const items = [];
    for (let i = 0; i < 3; i++) {
      items.push(this.renderSquare(row * 3 + i));
    }
    return items;
  }

  renderRows() {
    const items = [];
    for (let row = 0; row < 3; row++) {
      items.push(<div key={row} className="board-row">{this.renderCols(row)}</div>);
    }
    return items;
  }

  render() {
    return (
      <div>{this.renderRows()}</div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        position: null,
      }],
      isMoveDesc: false,
      stepNumber: 0,
      xIsNext: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        position: i,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  toggleMoveSort() {
    this.setState({
      isMoveDesc: !this.state.isMoveDesc,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const col = step.position % 3;
      const row = Math.floor(step.position / 3);

      const desc = move ?
        'Go to move #' + move + ' (' + col + ', ' + row + ')' :
        'Go to game start';
      const className = this.state.stepNumber === move ? 'game-info-move-current' : 'game-info-move';
      return (
        <li key={move} className={className}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      )
    });

    let movesDescription;
    let sortedMoves;
    if (this.state.isMoveDesc) {
      movesDescription = 'Sort moves ascending';
      sortedMoves = moves.reverse();
    } else {
      movesDescription = 'Sort moves descending';
      sortedMoves = moves;
    }

    let status;
    if (winner) {
      status = 'Winner: ' + winner.winner;
    } else if (calculateDraw(current.squares)) {
      status = 'Game is a draw';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winningLine={(winner && winner.line) || []}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.toggleMoveSort()}>{movesDescription}</button>
          <ol>{sortedMoves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        line: lines[i],
      };
    }
  }
  return null;
}

function calculateDraw(squares) {
  return !squares.includes(null);
}