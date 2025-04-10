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

  console.log("gameselector component");

  // Reset local selection when game is over
  useEffect(() => {
    setGameOver(false);
    console.log("setting gameover in gameover in gameselector to faslse");
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
      setGameOver(false); // Start the game, reset gameOver
    }
  };

  const localStreamColor = "rgba(50, 66, 213, 0.81)";
  const boxShadowColor = "rgba(0, 0, 0, 0.4)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <h2 style={{ margin: 0, fontSize: "24px", textAlign: "center" }}>
        {isHost
          ? "Select a Game"
          : selectedGame?.selectedGame
          ? `Host selected: ${selectedGame.selectedGame}`
          : "Waiting for Host to Select a Game"}
      </h2>

      <div
        style={{
          width: "300px",
          height: "300px",
          alignSelf: "center",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "12px",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          overflowY: "auto",
          boxShadow: `0px 5px 15px ${boxShadowColor}`,
        }}
      >
        {games.map((game) => {
          const isSelected = localSelection === game.name;

          return (
            <div
              key={game.id}
              onClick={() => handleGameSelect(game.id as GameName)}
              style={{
                background: isSelected
                  ? localStreamColor
                  : "rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
                padding: "10px 15px",
                cursor: isHost ? "pointer" : "not-allowed",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "background 0.2s, transform 0.1s",
                border: isSelected
                  ? "2px solid white"
                  : "2px solid transparent",
                transform: isSelected ? "scale(1.05)" : "scale(1)",
                boxShadow: isSelected
                  ? `0px 3px 10px ${boxShadowColor}`
                  : "none",
                opacity: isHost ? 1 : 0.5,
              }}
            >
              <span style={{ fontSize: "18px" }}>{game.name}</span>
              {isSelected && <Check size={18} color="white" />}
            </div>
          );
        })}
      </div>

      {isHost && (
        <button
          onClick={startGame}
          disabled={!localSelection}
          style={{
            marginTop: "15px",
            alignSelf: "center",
            background: localSelection
              ? "rgba(40, 228, 90, 0.9)"
              : "rgba(180, 180, 180, 0.6)",
            color: "white",
            padding: "12px 20px",
            borderRadius: "8px",
            border: "none",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: localSelection ? "pointer" : "not-allowed",
            transition: "background 0.2s ease-in-out",
            boxShadow: `0px 5px 15px ${boxShadowColor}`,
          }}
          onMouseEnter={(e) =>
            localSelection &&
            (e.currentTarget.style.background = "rgb(55, 213, 50)")
          }
          onMouseLeave={(e) =>
            localSelection &&
            (e.currentTarget.style.background = "rgba(72, 213, 50, 0.9)")
          }
        >
          Start Game
        </button>
      )}
    </div>
  );
};

export default GameSelector;
