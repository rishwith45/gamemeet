import { createContext, useContext } from "react";
import { useState } from "react";

interface audioVideoType {
  audio: boolean;
  video: boolean;
}
interface RemoteAudioVideoContextType {
  audioVideo: audioVideoType;
  setAudioVideo: (audioVideo: audioVideoType) => void;
}

const RemoteAudioVideoContext = createContext<
  RemoteAudioVideoContextType | undefined
>(undefined);
export const RemoteAudioVideoProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [audioVideo, setAudioVideo] = useState<audioVideoType>({
    audio: false,
    video: false,
  });

  return (
    <RemoteAudioVideoContext.Provider value={{ audioVideo, setAudioVideo }}>
      {children}
    </RemoteAudioVideoContext.Provider>
  );
};

export const useRemoteAudioVideo = () => {
  const context = useContext(RemoteAudioVideoContext);
  if (!context) {
    throw new Error(
      "useRemoteAudioVideo must be used within a RemoteAudioVideoProvider"
    );
  }
  return context;
};
