import React, { useState, useEffect, useMemo } from "react";
import { Video, VideoOff, Mic, MicOff, X } from "react-feather";
import { useDataChannel } from "../../contexts/DataChannelContext";
import { useSelfAudioVideo } from "../../contexts/SelfAudioVideoContext";
import { useLocalStream } from "../../contexts/LocalStreamContext";

interface VideoControllerProps {
  toggleVideo: () => void;
  toggleAudio: () => void;
  closeConnections: () => void;
}

const VideoController: React.FC<VideoControllerProps> = ({
  toggleVideo,
  toggleAudio,
  closeConnections,
}) => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const { sendMessage } = useDataChannel();
  const { audioVideo, setAudioVideo } = useSelfAudioVideo();
  const { localStreamRef } = useLocalStream();

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Adaptive button size based on screen width
  const buttonSize = useMemo(() => {
    if (screenWidth > 1200) return 50; // Large screens
    if (screenWidth > 800) return 40; // Medium screens
    return 30; // Small screens
  }, [screenWidth]);

  // Define colors
  const videoButtonColor = "rgba(41, 42, 43, 0.81)"; // Local Stream (Blue)
  const audioButtonColor = "rgba(41, 42, 43, 0.81)";
  const closeButtonColor = "rgba(248, 28, 28, 0.92)"; // Red for close

  const boxShadowColor = "rgba(0, 0, 0, 0.4)";

  // Common button styles
  const buttonStyle = (color: string) => ({
    background: color,
    border: "none",
    borderRadius: "10px",
    padding: `${buttonSize / 5}px`,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease-in-out",
    width: `${buttonSize}px`,
    height: `${buttonSize}px`,
    boxShadow: `0px 4px 10px ${color}`, // Glow effect
  });

  return (
    <div
      style={{
        width: "auto",
        display: "flex",
        justifyContent: "space-around",
        padding: "10px",
        background: "white",
        borderRadius: "15px",
        gap: "10px",
        boxShadow: `0px 10px 30px ${boxShadowColor}`, // Outer shadow for depth
      }}
    >
      <button
        onClick={() => {
          if (localStreamRef.current?.srcObject === null) return;
          toggleVideo();
          setAudioVideo({ ...audioVideo, video: !audioVideo.video });
          sendMessage({
            type: "audioVideostatus",
            audioVideoStatus: { ...audioVideo, video: !audioVideo.video },
          });
        }}
        style={buttonStyle(videoButtonColor)}
        title={audioVideo.video ? "Turn Video Off" : "Turn Video On"}
      >
        {audioVideo.video ? (
          <Video size={buttonSize / 2} color="white" />
        ) : (
          <VideoOff size={buttonSize / 2} color="white" />
        )}
      </button>

      <button
        onClick={() => {
          if (localStreamRef.current?.srcObject === null) return;
          toggleAudio();
          setAudioVideo({
            ...audioVideo,
            audio: !audioVideo.audio,
          });
          sendMessage({
            type: "audioVideostatus",
            audioVideoStatus: {
              ...audioVideo,
              audio: !audioVideo.audio,
            },
          });
        }}
        style={buttonStyle(audioButtonColor)}
        title={audioVideo.audio ? "Mute Audio" : "Unmute Audio"}
      >
        {audioVideo.audio ? (
          <Mic size={buttonSize / 2} color="white" />
        ) : (
          <MicOff size={buttonSize / 2} color="white" />
        )}
      </button>

      <button
        onClick={closeConnections}
        style={buttonStyle(closeButtonColor)}
        title="Close Connection"
      >
        <X size={buttonSize / 2} color="white" />
      </button>
    </div>
  );
};

export default VideoController;
