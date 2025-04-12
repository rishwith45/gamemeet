import React, { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard"; // ✅ Updated from chessboardjsx
import { useDataChannel } from "../../contexts/DataChannelContext";
import { useSelectedGame } from "../../gameContexts/SelectedGameContext";
import { useGameOver } from "../../gameContexts/GameOverContext";

interface Game {
  game: "chess";
}

interface MoveMessage {
  type: "move" | "reset";
  game: Game;
  playerTurn?: boolean;
  move?: string;
}

const ChessGame: React.FC = () => {
  const { selectedGame, setSelectedGame } = useSelectedGame();
  const { gameStates, sendMessage, isChannelReady, setGameStates } =
    useDataChannel();
  const [orientation] = useState<"white" | "black">(
    selectedGame?.playsFirst ? "white" : "black"
  );
  const [chess, setChess] = useState(new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [isMyTurn, setIsMyTurn] = useState<boolean | null>(null);
  const { isGameOver, setGameOver } = useGameOver();
  const [gameStatus, setGameStatus] = useState<string>("");

  useEffect(() => {
    console.log("gamestatus in gamestateseffect", gameStatus);
    if (gameStates && isMyTurn !== null) {
      setIsMyTurn(gameStates.chess?.playerTurn as boolean);
      console.log("Player turn: ", gameStates.chess?.playerTurn);
      const turn = gameStates.chess?.playerTurn as boolean;
      turn ? setGameStatus("Your Turn") : setGameStatus("Opponent's Turn");
    } else {
      console.log("or in else", orientation);
      orientation === "white" ? setIsMyTurn(true) : setIsMyTurn(false);
      orientation === "white"
        ? setGameStatus("Your Turn")
        : setGameStatus("Opponent's Turn");
    }
    if (gameStates.chess?.board) {
      const newChess = new Chess();
      newChess.load(gameStates.chess.board as string);
      console.log("this after message");
      console.log(newChess.ascii()); // Ensure board state is valid
      setChess(newChess);
      setFen(newChess.fen());
    }
    checkGameState();
  }, [gameStates]);

  // Update turn state
  const resetGameAfterDelay = () => {
    setTimeout(() => {
      setSelectedGame(null);
      setGameOver(true);

      const message: MoveMessage = {
        type: "reset",
        game: { game: "chess" },
      };

      sendMessage(message);
      setGameStates((prev) => ({
        ...prev,
        chess: {
          board: new Chess().fen(),
          playerTurn: false,
        },
      }));
    }, 5000); // Wait 3 seconds before resetting
  };
  useEffect(() => {
    console.log(gameStatus);
  }, [gameStatus]);
  // Handle piece movement
  const checkGameState = () => {
    console.log("Checking game state...");
    const chessCheck = new Chess(gameStates.chess?.board as string);
    console.log(chess.ascii());
    if (chessCheck.isCheckmate()) {
      console.log("game over");
      setGameStatus(
        "Checkmate! " +
          (chess.turn() === "w" && orientation === "black"
            ? "You Lose!!"
            : "You Won!!")
      );
      resetGameAfterDelay();
    } else if (chessCheck.isDraw()) {
      setGameStatus("It's a Draw!");
      resetGameAfterDelay();
    } else if (chessCheck.isStalemate()) {
      setGameStatus("Stalemate!");
      resetGameAfterDelay();
    }
  };

  const handleMove = (
    sourceSquare: string,
    targetSquare: string,
    promotion: string
  ) => {
    console.log(promotion);
    if (!isMyTurn || !isChannelReady) return false;

    const gameCopy = new Chess(chess.fen());
    try {
      const moveResult = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: promotion.toLocaleLowerCase()[1],
      });

      if (moveResult) {
        console.log("Updating FEN...");
        setChess(gameCopy);
        setFen(gameCopy.fen());
        sendGameMessage(moveResult.san);
        updateGameState(gameCopy.fen()); // ✅ Pass the latest state

        return true;
      }
    } catch (e) {
      console.log(e);
    }

    return false;
  };

  // Send move over DataChannel
  const sendGameMessage = (move: string) => {
    const message: MoveMessage = {
      type: "move",
      game: { game: "chess" },
      playerTurn: true,
      move: move,
    };
    sendMessage(message);
  };

  const updateGameState = (newFen: string) => {
    setGameStates((prev) => ({
      ...prev,
      chess: {
        board: newFen, // ✅ Always use updated FEN
        playerTurn: false,
      },
    }));
  };

  return (
    <div className="game-container">
      <h2 className="game-status">{gameStatus}</h2>
      <div className="chessboard-container">
        <Chessboard
          position={fen}
          boardWidth={390}
          onPieceDrop={handleMove}
          boardOrientation={orientation}
          arePiecesDraggable={!isGameOver && (isMyTurn as boolean)}
        />
      </div>
      <style>{`
        .game-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .game-status {
          font-size: 20px;
          margin-bottom: 10px;
        }
        .chessboard-container {
          width:390px;
          height: 390px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
       
      `}</style>
    </div>
  );
};

export default ChessGame;
