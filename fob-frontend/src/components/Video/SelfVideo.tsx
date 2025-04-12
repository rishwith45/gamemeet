import { useLocalStream } from "../../contexts/LocalStreamContext";
import { useSelfAudioVideo } from "../../contexts/SelfAudioVideoContext";
import { Video, VideoOff, Mic, MicOff } from "react-feather";

const SelfVideo: React.FC = () => {
  const { localStreamRef } = useLocalStream();
  const { audioVideo } = useSelfAudioVideo();

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "50%",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.81)",
        position: "relative", // Needed for absolute positioning of overlay
      }}
    >
      <video
        ref={localStreamRef}
        autoPlay
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          backgroundColor: "black",
        }}
      />

      {/* Overlay for audio/video status */}
      <div
        style={{
          position: "absolute",
          bottom: "0px",
          left: "0px",
          display: "flex",
          gap: "10px",
          backgroundColor: "black",
          width: "fit-content",
          padding: "5px",
          borderTopRightRadius: "5px",
        }}
      >
        {audioVideo.audio ? (
          <Mic color="white" size={15} />
        ) : (
          <MicOff color="white" size={15} />
        )}
        {audioVideo.video ? (
          <Video color="white" size={15} />
        ) : (
          <VideoOff color="white" size={15} />
        )}
      </div>
    </div>
  );
};

export default SelfVideo;
