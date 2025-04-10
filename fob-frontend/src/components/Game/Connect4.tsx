import React, { useEffect, useState } from "react";
import { useSelectedGame } from "../../gameContexts/SelectedGameContext";
import { useDataChannel } from "../../contexts/DataChannelContext";
import { useGameOver } from "../../gameContexts/GameOverContext";

const ROWS = 6;
const COLS = 7;

type Player = "red" | "yellow" | null;
type Board = Player[][];
type Coordinate = [number, number];

interface SelectedGameType {
  selectedGame: string | null;
  playsFirst: boolean;
}

interface GameMessage {
  type: "move" | "reset";
  game?: { game: "connect4"; playsFirst: boolean };
  board?: string[][];
  playerTurn?: boolean;
}

const Connect4: React.FC = () => {
  const { selectedGame, setSelectedGame } = useSelectedGame() as {
    selectedGame: SelectedGameType | null;
    setSelectedGame: React.Dispatch<
      React.SetStateAction<SelectedGameType | null>
    >;
  };
  const { gameStates, sendMessage, isChannelReady, setGameStates } =
    useDataChannel();
  const { setGameOver } = useGameOver();
  const [myColor, setMyColor] = useState<Player>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [isMyTurn, setIsMyTurn] = useState<boolean | null>(null);
  const [winningCoords, setWinningCoords] = useState<Coordinate[]>([]);

  const board: Board = Array.isArray(gameStates.connect4?.board)
    ? gameStates.connect4!.board.map((row) =>
        row.map((cell) => (cell === "red" || cell === "yellow" ? cell : null))
      )
    : Array.from({ length: ROWS }, () => Array(COLS).fill(null)); // Default empty board

  useEffect(() => {
    if (!selectedGame || selectedGame.selectedGame !== "connect4") return;
    setMyColor(selectedGame.playsFirst ? "red" : "yellow");
  }, [selectedGame]);

  useEffect(() => {
    const tempBoard: Board | null = Array.isArray(gameStates.connect4?.board)
      ? gameStates.connect4!.board.map((row) =>
          row.map((cell) => (cell === "red" || cell === "yellow" ? cell : null))
        )
      : null;

    if (tempBoard) {
      checkWinner(tempBoard);
    }
    if (selectedGame && isMyTurn == null) {
      setIsMyTurn(selectedGame.playsFirst as boolean);
    } else {
      setIsMyTurn(gameStates.connect4?.playerTurn as boolean);
    }
  }, [gameStates]);

  const dropPiece = (col: number): void => {
    if (!isMyTurn || !isChannelReady || winner) return;

    const newBoard = board.map((row) => [...row]);
    const row = findAvailableRow(newBoard, col);
    if (row === -1) return;

    newBoard[row][col] = myColor;
    sendGameMessage(newBoard);

    setGameStates((prev) => ({
      ...prev,
      connect4: {
        board: newBoard.map((row) => row.map((cell) => (cell ? cell : ""))),
        playerTurn: false,
      },
    }));

    setIsMyTurn(false);
    checkWinner(newBoard);
  };

  const findAvailableRow = (board: Board, col: number): number => {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (!board[row][col]) return row;
    }
    return -1;
  };

  const sendGameMessage = (newBoard: Board): void => {
    const message: GameMessage = {
      type: "move",
      game: { game: "connect4", playsFirst: selectedGame?.playsFirst ?? true },
      board: newBoard.map((row) => row.map((cell) => cell || "")),
      playerTurn: true,
    };
    sendMessage(message);
  };

  const checkWinner = (board: Board): void => {
    const directions: [number, number][] = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // diagonal down-right
      [1, -1], // diagonal down-left
    ];

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const player = board[r][c];
        if (!player) continue;
        for (const [dr, dc] of directions) {
          const winningLine = checkDirection(board, r, c, dr, dc, player);
          if (winningLine.length === 4) {
            setWinner(player);
            setWinningCoords(winningLine);
            setTimeout(() => {
              setGameOver(true); // Mark game as over
              setSelectedGame(null); // Reset game selection
              const message: GameMessage = {
                type: "reset",
                game: {
                  game: "connect4",
                  playsFirst: selectedGame?.playsFirst ?? true,
                },
                board: Array.from({ length: 6 }, () => Array(7).fill("")),
                playerTurn: true,
              };
              sendMessage(message);
              setGameStates((prev) => ({
                ...prev,
                connect4: {
                  board: Array.from({ length: 6 }, () => Array(7).fill("")),
                  playerTurn: false,
                },
              }));
            }, 5000);
            return;
          }
        }
      }
    }
  };

  const checkDirection = (
    board: Board,
    r: number,
    c: number,
    dr: number,
    dc: number,
    player: Player
  ): Coordinate[] => {
    const coords: Coordinate[] = [[r, c]];
    for (let i = 1; i < 4; i++) {
      const nr = r + dr * i;
      const nc = c + dc * i;
      if (
        nr < 0 ||
        nr >= ROWS ||
        nc < 0 ||
        nc >= COLS ||
        board[nr][nc] !== player
      ) {
        return [];
      }
      coords.push([nr, nc]);
    }
    return coords;
  };

  const isWinningCell = (row: number, col: number): boolean => {
    return winningCoords.some(([wr, wc]) => wr === row && wc === col);
  };

  return (
    <div className="connect4-container">
      <h2 className="game-status">
        {winner
          ? `${winner === myColor ? "You Won!!" : "You lose!!"} `
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
                isWinningCell(rowIndex, colIndex) ? "winning" : ""
              }`}
              onClick={() => dropPiece(colIndex)}
              style={{
                background: cell || "#5c3c10",
                border: `2px solid ${cell ? cell : "transparent"}`,
              }}
            />
          ))
        )}
      </div>

      <style>{`
        .connect4-container {
          text-align: center;
          color: white;
          font-size: 24px;
          padding: 20px;
        }

        .game-board {
          display: grid;
          grid-template-columns: repeat(${COLS}, 70px);
          gap: 10px;
          background: #ffcc00;
          padding: 10px;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
          margin-top: 10px;
        }

        .cell {
          
          width: 55px;
          height: 55px;
          border-radius: 50%;
          cursor: ${winner ? "not-allowed" : "pointer"};
          transition: all 0.3s ease;
        }

        .winning {
          box-shadow: 0 0 10px 5px gold;
          transform: scale(1.1);
        }

        .game-status {
          font-size: 20px;
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
};

export default Connect4;
