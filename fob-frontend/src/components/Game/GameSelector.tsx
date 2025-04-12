import React, { useState, useEffect } from "react";
import { Check } from "react-feather";
import { useHost } from "../../gameContexts/HostContext";
import { useSelectedGame } from "../../gameContexts/SelectedGameContext";
import { useDataChannel } from "../../contexts/DataChannelContext";
import { useGameOver } from "../../gameContexts/GameOverContext";

const games = [
  { id: "chess", name: "chess" },
  { id: "tictactoe", name: "tictactoe" },
  { id: "connect4", name: "connect4" },
] as const;

type GameName = "connect4" | "chess" | "tictactoe";

const GameSelector: React.FC = () => {
  const { isHost } = useHost();
  const { selectedGame, setSelectedGame } = useSelectedGame();
  const { sendMessage, isChannelReady } = useDataChannel();
  const { setGameOver } = useGameOver();
  const [localSelection, setLocalSelection] = useState<GameName | null>(null);

  useEffect(() => {
    setGameOver(false);
  }, []);

  const handleGameSelect = (gameName: GameName) => {
    if (isHost) {
      setLocalSelection(gameName);
    }
  };

  const startGame = () => {
    if (localSelection && isChannelReady) {
      const randomise = Math.random() < 0.5;
      const gameStateP1 = {
        selectedGame: localSelection,
        playsFirst: randomise,
      };
      const gameStateP2 = {
        game: localSelection,
        playsFirst: !randomise,
      };

      sendMessage({ type: "game-select", game: gameStateP2 });
      setSelectedGame(gameStateP1);
      setGameOver(false);
    }
  };

  return (
    <div className="selector-container">
      <h2 className="selector-title">
        {isHost
          ? "Choose a Game"
          : selectedGame?.selectedGame
          ? `Host selected: ${selectedGame.selectedGame}`
          : "Waiting for Host to Select a Game"}
      </h2>

      <div className="selector-list">
        {games.map((game) => {
          const isSelected = localSelection === game.name;

          return (
            <div
              key={game.id}
              onClick={() => handleGameSelect(game.id as GameName)}
              className={`selector-item ${isSelected ? "selected" : ""} ${
                isHost ? "clickable" : "disabled"
              } ${game.name}`}
            >
              <span className="game-name">{game.name}</span>
              {isSelected && <Check size={18} color="white" />}
            </div>
          );
        })}
      </div>

      {isHost && (
        <button
          className="start-button"
          disabled={!localSelection}
          onClick={startGame}
          color={"green"}
        >
          Start Game
        </button>
      )}

      <style>{`
        .selector-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 30px;
          color: white;
          font-family: "Segoe UI", sans-serif;
        }

        .selector-title {
          font-size: 26px;
          margin-bottom: 20px;
          text-align: center;
        }

        .selector-list {
          width: 300px;
          max-height: 300px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 16px;
          padding: 15px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }

        .selector-item {
          padding: 12px 16px;
          border-radius: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 18px;
          transition: all 0.2s ease;
          border: 2px solid transparent;
          color: white;
        }

        .selector-item.clickable {
          cursor: pointer;
        }

        .selector-item.clickable:hover {
          filter: brightness(1.2);
        }

        .selector-item.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .selector-item.selected {
          border-color: white;
          transform: scale(1.05);
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        }

        .selector-item .game-icon {
          font-size: 22px;
          margin-right: 10px;
        }

        .game-name {
          flex: 1;
          text-transform: capitalize;
        }

        .start-button {
          margin-top: 20px;
          background: rgba(72, 213, 50, 0.9);
          color: white;
          padding: 14px 24px;
          border-radius: 10px;
          border: none;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s ease-in-out, transform 0.1s ease;
          box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.4);
        }

        .start-button:hover {
          background: rgb(55, 213, 50);
          transform: translateY(-2px);
        }

        .start-button:disabled {
          background: rgba(180, 180, 180, 0.6);
          cursor: not-allowed;
        }

        /* 🎨 Game Specific Backgrounds */
        .chess {
          background: linear-gradient(135deg, #4e4e4e, #2e2e2e);
        }

        .connect4 {
          background: linear-gradient(135deg, #0055ff, #002e9e);
        }

        .tictactoe {
          background: linear-gradient(135deg, #d32f2f, #8e0000);
        }
      `}</style>
    </div>
  );
};

export default GameSelector;
