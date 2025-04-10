import { useRemoteStream } from "../../contexts/RemoteStreamcontext";
import { useRemoteAudioVideo } from "../../contexts/RemoteAudioVideoContext";
import { Video, VideoOff, Mic, MicOff } from "react-feather";

const RemoteVideo: React.FC = () => {
  const { remoteStreamRef } = useRemoteStream();
  const { audioVideo } = useRemoteAudioVideo();
  console.log("RemoteVideo", audioVideo);

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
        boxShadow: "0px 0px 20px rgba(5, 5, 5, 0.76)",
        position: "relative", // Needed for overlay positioning
      }}
    >
      <video
        ref={remoteStreamRef}
        autoPlay
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
          bottom: "10px",
          left: "10px",
          display: "flex",
          gap: "10px",
        }}
      >
        {audioVideo.audio ? (
          <Mic color="red" size={15} />
        ) : (
          <MicOff color="red" size={15} />
        )}
        {audioVideo.video ? (
          <Video color="red" size={15} />
        ) : (
          <VideoOff color="red" size={15} />
        )}
      </div>
    </div>
  );
};

export default RemoteVideo;
