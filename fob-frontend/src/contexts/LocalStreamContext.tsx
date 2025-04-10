import React, { createContext, useContext, useRef } from "react";

interface localStreamContextType {
  localStreamRef: React.RefObject<HTMLVideoElement | null>;
}

const localStreamContext = createContext<localStreamContextType | undefined>(
  undefined
);

export const LocalStreamProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const localStreamRef = useRef<HTMLVideoElement | null>(null);

  return (
    <localStreamContext.Provider value={{ localStreamRef }}>
      {children}
    </localStreamContext.Provider>
  );
};

export const useLocalStream = (): localStreamContextType => {
  const context = useContext(localStreamContext);

  if (!context) {
    throw new Error("useVideoContext must be used within a VideoProvider");
  }
  return context;
};
