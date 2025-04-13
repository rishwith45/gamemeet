import React, { createContext, ReactNode, useContext, useRef } from "react";

interface RemoteStreamContextType {
  remoteStreamRef: React.RefObject<HTMLVideoElement | null>;
}

const RemoteStreamContext = createContext<RemoteStreamContextType | undefined>(
  undefined
);

export const RemoteStreamProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const remoteStreamRef = useRef<HTMLVideoElement | null>(null);
  return (
    <RemoteStreamContext.Provider value={{ remoteStreamRef }}>
      {children}
    </RemoteStreamContext.Provider>
  );
};

export const useRemoteStream = () => {
  const context = useContext(RemoteStreamContext);
  if (!context) {
    throw new Error(
      "useRemoteStream must be used within a RemoteStreamProvider"
    );
  }
  return context;
};
