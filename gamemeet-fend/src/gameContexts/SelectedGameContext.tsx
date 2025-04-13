import React, { createContext, useState, useContext } from "react";

type GameName = "chess" | "connect4" | "tictactoe";

interface SelectedGameType {
  selectedGame: GameName;
  playsFirst: boolean; // Optional (default can be set when needed)
}

interface SelectedGameContextType {
  selectedGame: SelectedGameType | null;
  setSelectedGame: (value: SelectedGameType | null) => void;
}

const SelectedGameContext = createContext<SelectedGameContextType | undefined>(
  undefined
);

export const SelectedGameContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [selectedGame, setSelectedGame] = useState<SelectedGameType | null>(
    null
  );

  return (
    <SelectedGameContext.Provider value={{ selectedGame, setSelectedGame }}>
      {children}
    </SelectedGameContext.Provider>
  );
};

export const useSelectedGame = () => {
  const context = useContext(SelectedGameContext);
  if (!context) {
    throw new Error(
      "useSelectedGame must be used within a SelectedGameContextProvider"
    ); // Fixed error message
  }
  return context;
};
