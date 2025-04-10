import { createContext, ReactNode, useContext, useRef } from "react";

interface pcContextType {
  pc: React.RefObject<RTCPeerConnection | null>;
}

export const PcContext = createContext<pcContextType | undefined>(undefined);

export const PcProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const pc = useRef<RTCPeerConnection | null>(null);

  return <PcContext.Provider value={{ pc }}>{children}</PcContext.Provider>;
};

export const usePc = () => {
  const context = useContext(PcContext);
  if (!context) {
    throw new Error("usePc must be used within a PcProvider");
  }
  return context;
};
