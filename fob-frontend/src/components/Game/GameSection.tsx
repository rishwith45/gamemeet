import React, { useEffect, useMemo, useRef } from "react";
import GameSelector from "./GameSelector";
import { useSelectedGame } from "../../gameContexts/SelectedGameContext";
import Connect4 from "./Connect4";
import { useGameOver } from "../../gameContexts/GameOverContext";
import TicTacToe from "./TicTacToe";
import Chess from "./Chess";
import { usePeerConnectionStatus } from "../../contexts/PeerConnectionStatusContext";

interface ComponentProps {
  closeConnections: () => void;
}

const GameSection: React.FC<ComponentProps> = ({ closeConnections }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const { selectedGame } = useSelectedGame();
  const { isGameOver } = useGameOver();
  const { peerConnectionStatus } = usePeerConnectionStatus();

  useEffect(() => {
    console.log("selectedGame changed");
  }, [selectedGame]);

  const memoizedIcons = useMemo(() => {
    const icons = [
      "♜",
      "♦",
      "♟",
      "⚔",
      "❌",
      "🏆",
      "⭕",
      "♞",
      "🃏",
      "🎲",
      "♖",
      "♘",
      "♠",
      "♥",
      "♣",
      "♛",
      "🎯",
      "🎮",
      "🕹",
      "⚡",
      "👾",
      "🔮",
      "🚀",
      "🔱",
      "⚜",
      "🔺",
      "🔷",
      "♔",
      "🏹",
    ];
    return icons.map((icon) => ({
      icon,
      style: {
        position: "absolute" as const,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        fontSize: `${Math.random() * 30 + 20}px`,
        opacity: Math.random() * 0.7 + 0.3,
        transform: `rotate(${Math.random() * 360}deg)`,
        pointerEvents: "none" as const,
      },
    }));
  }, []);

  return (
    <div
      ref={parentRef}
      style={{
        width: "100%",
        height: "100%",
        background: "black",
        borderRadius: "10px",
        padding: "20px",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxSizing: "border-box",
        boxShadow: "0px 0px 20px black",
        position: "relative",
        overflow: "hidden",
      }}
      className="parent"
    >
      {/* Render memoized icons */}
      {memoizedIcons.map(({ icon, style }, index) => (
        <span key={index} style={style}>
          {icon}
        </span>
      ))}

      {/* Game Container */}
      <div
        className="child"
        style={{
          width: "70%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0, 0, 0, 0.7)",
          borderRadius: "10px",
          zIndex: 10,
        }}
      >
        {peerConnectionStatus.status === false && (
          <div
            style={{
              width: "70%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "16px",
              backgroundColor: "#fee2e2",
              border: "1px solid #f87171",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h1
              style={{
                color: "#b91c1c",
                fontWeight: "600",
                fontSize: "1.25rem",
              }}
            >
              {peerConnectionStatus.statusMessage}
            </h1>
            {peerConnectionStatus.statusMessage !==
              "searching for Player... , please wait" && (
              <button
                style={{
                  marginTop: "12px",
                  padding: "8px 16px",
                  backgroundColor: "#dc2626",
                  color: "white",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  transition: "background 0.3s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#b91c1c")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#dc2626")
                }
                onClick={closeConnections}
              >
                Quit
              </button>
            )}
          </div>
        )}

        {(!selectedGame?.selectedGame || isGameOver) &&
          peerConnectionStatus.status && <GameSelector />}
        {selectedGame?.selectedGame === "connect4" &&
          !isGameOver &&
          peerConnectionStatus.status && <Connect4 />}
        {selectedGame?.selectedGame === "tictactoe" &&
          !isGameOver &&
          peerConnectionStatus.status && <TicTacToe />}
        {selectedGame?.selectedGame === "chess" &&
          !isGameOver &&
          peerConnectionStatus.status && <Chess />}
      </div>
    </div>
  );
};

// ✅ Memoize the GameSection itself
export default React.memo(GameSection);
