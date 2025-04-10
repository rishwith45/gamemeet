import React, { createContext, useContext, useState } from "react";

interface AudioVideoType {
  audio: boolean;
  video: boolean;
}
interface SelfAudioVideoType {
  audioVideo: AudioVideoType;
  setAudioVideo: (audioVideo: AudioVideoType) => void;
}

const SelfAudioVideoContext = createContext<SelfAudioVideoType | undefined>(
  undefined
);

export const SelfAudioVideoProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [audioVideo, setAudioVideo] = useState<AudioVideoType>({
    audio: true,
    video: true,
  });
  return (
    <SelfAudioVideoContext.Provider value={{ audioVideo, setAudioVideo }}>
      {children}
    </SelfAudioVideoContext.Provider>
  );
};

export const useSelfAudioVideo = () => {
  const context = useContext(SelfAudioVideoContext);
  if (!context) {
    throw new Error(
      "useSelfAudioVideo must be used within a SelfAudioVideoProvider"
    );
  }
  return context;
};
