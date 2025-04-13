import React, { useEffect, useState } from "react";
import { useSelectedGame } from "../../gameContexts/SelectedGameContext";
import { useDataChannel } from "../../contexts/DataChannelContext";
import { useGameOver } from "../../gameContexts/GameOverContext";

const SIZE = 3; // Tic-Tac-Toe board size

type Player = "X" | "O" | null;
type Board = Player[][];

interface GameMessage {
  type: "move" | "reset";
  game: { game: "tictactoe"; playsFirst: boolean };
  board?: string[][];
  playerTurn?: boolean;
}

const TicTacToe: React.FC = () => {
  const { selectedGame, setSelectedGame } = useSelectedGame();
  const { gameStates, sendMessage, isChannelReady, setGameStates } =
    useDataChannel();
  const [isMyTurn, setIsMyTurn] = useState<boolean | null>(null);
  const { setGameOver } = useGameOver();
  const mySymbol: Player = selectedGame?.playsFirst ? "X" : "O";

  // Convert gameState.board (string[][]) to Board (Player[][])

  const board: Board = Array.isArray(gameStates.tictactoe?.board)
    ? gameStates.tictactoe!.board.map((row) =>
        row.map((cell) => (cell === "X" || cell === "O" ? cell : null))
      )
    : Array.from({ length: SIZE }, () => Array(SIZE).fill(null)); // Default empty board
  // Default empty board

  // Handle opponent moves
  useEffect(() => {
    const check = checkWinner(board);
    if (isMyTurn == null && selectedGame) {
      setIsMyTurn(selectedGame.playsFirst as boolean);
    } else {
      setIsMyTurn(gameStates.tictactoe?.playerTurn as boolean);
    }
    if (check) {
      setTimeout(() => {
        setSelectedGame(null);
        setGameOver(true); // Mark game as over
        const message: GameMessage = {
          type: "reset",
          game: {
            game: "tictactoe",
            playsFirst: selectedGame?.playsFirst ?? true,
          },
          board: Array.from({ length: 3 }, () => Array(3).fill("")),
          playerTurn: true,
        };
        sendMessage(message);
        setGameStates((prev) => ({
          ...prev,
          tictactoe: {
            board: Array.from({ length: 3 }, () => Array(3).fill("")),
            playerTurn: false,
          },
        }));
      }, 5000);
    }
  }, [gameStates]);

  // Handle move
  const makeMove = (row: number, col: number): void => {
    if (
      !isMyTurn ||
      !isChannelReady ||
      board[row][col] !== null ||
      checkWinner(board)
    )
      return; // ⬅️ Prevent move if game is over

    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = mySymbol;

    sendGameMessage(newBoard);
    updateGameState(newBoard);
  };

  // Send move to opponent
  const sendGameMessage = (newBoard: Board): void => {
    const message: GameMessage = {
      type: "move",
      game: { game: "tictactoe", playsFirst: selectedGame?.playsFirst ?? true },
      board: newBoard.map((row) => row.map((cell) => cell || "")),
      playerTurn: true,
    };
    sendMessage(message);
  };

  // Update global game state
  const updateGameState = (newBoard: Board): void => {
    setGameStates((prev) => ({
      ...prev,
      tictactoe: {
        board: newBoard.map((row) => row.map((cell) => (cell ? cell : ""))),
        playerTurn: false,
      },
    }));
  };

  // Check winner
  // Check winner or draw
  const checkWinner = (board: Board): Player | "draw" | null => {
    const lines = [
      // Rows
      ...board,
      // Columns
      ...board[0].map((_, i) => board.map((row) => row[i])),
      // Diagonals
      board.map((_, i) => board[i][i]),
      board.map((_, i) => board[i][SIZE - 1 - i]),
    ];

    for (const line of lines) {
      if (line.every((cell) => cell === "X")) return "X";
      if (line.every((cell) => cell === "O")) return "O";
    }

    // Check for a draw (if all cells are filled and no winner)
    if (board.every((row) => row.every((cell) => cell !== null))) {
      return "draw";
    }

    return null;
  };

  return (
    <div className="tictactoe-container">
      <h2 className="game-status">
        {checkWinner(board) === "draw"
          ? "It's a Draw!"
          : checkWinner(board)
          ? `${checkWinner(board) === mySymbol ? "You Won!!" : "You Lose!!"}`
          : isMyTurn
          ? "Your Turn"
          : "Opponent's Turn"}
      </h2>

      <div className="game-board">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`cell ${
                cell === "X" ? "x-cell" : cell === "O" ? "o-cell" : ""
              }`}
              onClick={() => makeMove(rowIndex, colIndex)}
            >
              {cell}
            </div>
          ))
        )}
      </div>

      <style>{`
      .tictactoe-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 30px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: white;
  background: #000; /* Pure black background */
}

.game-status {
  font-size: 20px;
  margin-bottom: 10px;
  margin-top: 0px;
}

.game-board {
  display: grid;
  grid-template-columns: repeat(${SIZE}, 1fr);
  grid-template-rows: repeat(${SIZE}, 1fr);
  width: 100%;
  height: 100%;
  max-width: 400px;
  max-height: 400px;

  aspect-ratio: 1 / 1;
   background: radial-gradient(circle at center,rgb(242, 35, 246),rgb(176, 101, 238));
  border-radius: 20px;
  box-shadow: 0 0 25px #00ffff80;
  overflow: hidden;
  gap: 8px;
  padding: 12px;
}

.cell {
  background:rgb(255, 255, 255); /* ⬅️ Visible on black */
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.3s;
  box-shadow: inset 0 0 6px #000000aa;
}

.cell:hover {
  transform: scale(1.05);
 
   background:rgb(222, 179, 241);
}

.x-cell {
  background:rgb(222, 179, 241); /* Slight red base */
  color:rgb(247, 62, 62);
  text-shadow: 0 0 18px #ff4d4d;
  font-size: 4rem;
}

.o-cell {
   background:rgb(222, 179, 241); /* Slight blue base */
  color: #4d94ff;
  text-shadow: 0 0 18px #4d94ff;
  font-size: 4rem;
}

      `}</style>
    </div>
  );
};

export default TicTacToe;
