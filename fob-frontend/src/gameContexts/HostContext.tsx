import React, { createContext, useContext, useState } from "react";

interface HostContextType {
  isHost: boolean;
  setIsHost: (value: boolean) => void;
}

const HostContext = createContext<HostContextType | undefined>(undefined);

export const HostProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isHost, setIsHost] = useState<boolean>(false); // Default: Not a host

  return (
    <HostContext.Provider value={{ isHost, setIsHost }}>
      {children}
    </HostContext.Provider>
  );
};

export const useHost = () => {
  const context = useContext(HostContext);
  if (!context) {
    throw new Error("useHost must be used within a HostProvider");
  }
  return context;
};
