import React, { createContext, useState, useContext, ReactNode } from "react";

interface GameOverContextProps {
  isGameOver: boolean;
  setGameOver: (value: boolean) => void;
}

const GameOverContext = createContext<GameOverContextProps | undefined>(
  undefined
);

export const GameOverProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isGameOver, setGameOver] = useState(false);

  return (
    <GameOverContext.Provider value={{ isGameOver, setGameOver }}>
      {children}
    </GameOverContext.Provider>
  );
};

export const useGameOver = (): GameOverContextProps => {
  const context = useContext(GameOverContext);
  if (context === undefined) {
    throw new Error("useGameOver must be used within a GameOverProvider");
  }
  return context;
};
