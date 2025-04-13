import {
  createContext,
  ReactNode,
  useRef,
  useState,
  useContext,
  useEffect,
} from "react";
import { useSelectedGame } from "../gameContexts/SelectedGameContext";
import { useGameOver } from "../gameContexts/GameOverContext";
import { Chess } from "chess.js";
import { useRemoteAudioVideo } from "./RemoteAudioVideoContext";
import { useSelfAudioVideo } from "./SelfAudioVideoContext";

interface Game {
  game: "connect4" | "chess" | "tictactoe";
  playsFirst?: boolean;
}

interface GameMessage {
  type: "move" | "reset" | "game-select" | "audioVideostatus";
  game?: Game;
  move?: string; // Chess move in SAN (Standard Algebraic Notation)
  board?: string[][] | string; // Used for Tic-Tac-Toe & Connect4
  playerTurn?: boolean;
  audioVideoStatus?: AudioVideoType;
}

interface GameState {
  board: string[][] | string; // Chess uses FEN, others use 2D array
  playerTurn?: boolean;
}

interface AudioVideoType {
  audio: boolean;
  video: boolean;
}

interface DataChannelContextType {
  dataChannel: React.RefObject<RTCDataChannel | null>;
  isChannelReady: boolean;
  initializeDataChannel: (channel: RTCDataChannel) => void;
  sendMessage: (message: GameMessage) => void;
  gameStates: { [key in "connect4" | "chess" | "tictactoe"]?: GameState };
  setGameStates: React.Dispatch<
    React.SetStateAction<{
      [key in "connect4" | "chess" | "tictactoe"]?: GameState;
    }>
  >;
}

const DataChannelContext = createContext<DataChannelContextType | undefined>(
  undefined
);

export const DataChannelContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const [isChannelReady, setIsChannelReady] = useState<boolean>(false);
  const { setSelectedGame } = useSelectedGame();
  const { isGameOver, setGameOver } = useGameOver();
  const defaultBoards: Record<
    "connect4" | "chess" | "tictactoe",
    string[][] | string
  > = {
    connect4: Array.from({ length: 6 }, () => Array(7).fill("")),
    chess: new Chess().fen(), // Use FEN for Chess
    tictactoe: Array.from({ length: 3 }, () => Array(3).fill("")),
  };
  const [gameStates, setGameStates] = useState<{
    [key in "connect4" | "chess" | "tictactoe"]?: GameState;
  }>({
    connect4: { board: defaultBoards.connect4, playerTurn: true },
    chess: { board: defaultBoards.chess, playerTurn: true },
    tictactoe: { board: defaultBoards.tictactoe, playerTurn: true },
  });
  const { setAudioVideo } = useRemoteAudioVideo();
  const { audioVideo } = useSelfAudioVideo();

  useEffect(() => {
    setGameStates({
      connect4: { board: defaultBoards.connect4, playerTurn: true },
      chess: { board: defaultBoards.chess, playerTurn: true },
      tictactoe: { board: defaultBoards.tictactoe, playerTurn: true },
    });
  }, [isGameOver]);

  const initializeDataChannel = (channel: RTCDataChannel) => {
    dataChannel.current = channel;

    channel.onopen = () => {
      console.log(`✅ Data channel '${channel.label}' is open`);
      setIsChannelReady(true);
      sendMessage({ type: "audioVideostatus", audioVideoStatus: audioVideo });
    };

    channel.onclose = () => {
      console.log(`❌ Data channel '${channel.label}' is closed`);
      setIsChannelReady(false);
    };

    channel.onerror = (error) => {
      console.error(`⚠️ Data channel '${channel.label}' error:`, error);
      setIsChannelReady(false);
    };

    channel.onmessage = (event) => {
      console.log("📩 Received message:", event.data);
      try {
        const parsedMessage: GameMessage = JSON.parse(event.data);
        handleMessage(parsedMessage);
      } catch (error) {
        console.error("⛔ Error parsing message:", error);
      }
    };
  };

  const sendMessage = (message: GameMessage) => {
    if (dataChannel.current && dataChannel.current.readyState === "open") {
      dataChannel.current.send(JSON.stringify(message));
    } else {
      console.error("🚫 Data channel is not open");
    }
  };

  const handleMessage = (message: GameMessage) => {
    console.log("🔄 Handling received message:", message);
    console.log("Message type:", message.type);
    if (message.type === "audioVideostatus") {
      setAudioVideo(message.audioVideoStatus as AudioVideoType);
      return;
    }
    if (message.game) {
      const gameKey: "connect4" | "chess" | "tictactoe" = message.game.game;

      switch (message.type) {
        case "game-select":
          setGameOver(false);
          setSelectedGame({
            selectedGame: gameKey,
            playsFirst: message.game.playsFirst as boolean,
          });
          break;

        case "move":
          if (gameKey === "chess" && message.move) {
            try {
              setGameStates((prev) => {
                const chess = new Chess();
                // ✅ Always gets latest FEN
                chess.load(prev.chess?.board as string);

                chess.move(message.move as string);
                return {
                  ...prev,
                  chess: {
                    board: chess.fen(), // ✅ Updated correctly
                    playerTurn: message.playerTurn,
                  },
                };
              });
            } catch (error) {
              console.error("Invalid FEN:", error);
            }
          } else if (message.board) {
            setGameStates((prev) => ({
              ...prev,
              [gameKey]: {
                board: message.board,
                playerTurn: message.playerTurn,
              },
            }));
          }
          break;

        case "reset":
          if (gameKey === "chess") {
            const chess = new Chess();
            setGameStates((prev) => ({
              ...prev,
              chess: {
                board: chess.fen(), // Reset to initial FEN
                playerTurn: true,
              },
            }));
          } else {
            setGameStates((prev) => ({
              ...prev,
              [gameKey]: {
                board: defaultBoards[gameKey],
                playerTurn: true,
              },
            }));
          }
          break;

        default:
          console.error("❓ Unknown message type:", message.type);
      }
    }
  };

  return (
    <DataChannelContext.Provider
      value={{
        dataChannel,
        isChannelReady,
        initializeDataChannel,
        sendMessage,
        gameStates,
        setGameStates,
      }}
    >
      {children}
    </DataChannelContext.Provider>
  );
};

export const useDataChannel = (): DataChannelContextType => {
  const context = useContext(DataChannelContext);
  if (!context) {
    throw new Error(
      "❌ useDataChannel must be used within a DataChannelContextProvider"
    );
  }
  return context;
};
