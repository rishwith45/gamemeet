import React, { createContext, ReactNode, useContext, useState } from "react";

interface StatusType {
  status: boolean;
  statusMessage: string;
}

interface PeerConnectionStatusType {
  peerConnectionStatus: StatusType;
  setPeerConnectionStatus: (value: StatusType) => void;
}

const PeerConnectionStatusContext = createContext<
  PeerConnectionStatusType | undefined
>(undefined);

export const PeerConnectionStatusProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const initialStatus: StatusType = {
    status: false,
    statusMessage: "searching for player... , please wait",
  };
  const [peerConnectionStatus, setPeerConnectionStatus] =
    useState<StatusType>(initialStatus);
  return (
    <PeerConnectionStatusContext.Provider
      value={{ peerConnectionStatus, setPeerConnectionStatus }}
    >
      {children}
    </PeerConnectionStatusContext.Provider>
  );
};

export const usePeerConnectionStatus = () => {
  const context = useContext(PeerConnectionStatusContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
