import { useEffect, useRef, useState, useCallback } from "react";
import { usePc } from "../contexts/PcContext";
import { useLocalStream } from "../contexts/LocalStreamContext";
import { useRemoteStream } from "../contexts/RemoteStreamcontext";
import { useDataChannel } from "../contexts/DataChannelContext";
import { useHost } from "../gameContexts/HostContext";
import { usePeerConnectionStatus } from "../contexts/PeerConnectionStatusContext";
import { useNavigate } from "react-router-dom";
import { useGameOver } from "../gameContexts/GameOverContext";
import { useSelectedGame } from "../gameContexts/SelectedGameContext";
import { io, Socket } from "socket.io-client";
import { useToken } from "../contexts/TokenContext";
import { useSelfAudioVideo } from "../contexts/SelfAudioVideoContext";

const useWebRtc = () => {
  const { pc } = usePc();
  const { localStreamRef } = useLocalStream();
  const { remoteStreamRef } = useRemoteStream();
  const stream = useRef<MediaStream | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [room, setRoom] = useState<boolean>(false);
  const isOfferer = useRef<boolean>(false);
  const { dataChannel, initializeDataChannel } = useDataChannel();
  const { setIsHost } = useHost();
  const { setPeerConnectionStatus } = usePeerConnectionStatus();
  const navigate = useNavigate();
  const { setGameOver } = useGameOver();
  const { setSelectedGame } = useSelectedGame();
  const { token } = useToken();
  const [addedMediaDevices, setAddedMediaDevices] = useState<boolean>(false);
  const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;
  const { setAudioVideo } = useSelfAudioVideo();

  useEffect(() => {
    const signaling = async () => {
      console.log(token);
      const socket = io(`${BACKEND_URL}`, { auth: { token } });
      console.log(socket);
      return socket;
    };
    const handleRoomCreated = ({ oneOffers }: { oneOffers: boolean }) => {
      console.log("room created", oneOffers);

      isOfferer.current = oneOffers;
      setRoom(true);
      setIsHost(oneOffers);
    };

    const handleServerMessage = async (data: any) => {
      console.log("Received from server:", data);

      if (data.type === "offer") {
        await pc.current?.setRemoteDescription(data.offer);
        if (data.offer.type === "offer") {
          await pc.current?.setLocalDescription();
          socketRef.current?.emit("from-client", {
            type: "description",
            description: pc.current?.localDescription,
          });
        }
      } else if (data.type === "candidate") {
        try {
          await pc.current?.addIceCandidate(data.data);
        } catch (err) {
          console.error("Failed to add ICE candidate:", err);
        }
      }
    };

    if (!socketRef.current) {
      signaling().then((socket) => {
        if (!socket) return;
        socketRef.current = socket;
        socket.on("room-created", handleRoomCreated);
        socket.on("from-server", handleServerMessage);
        socket.on("disconnect", () => {
          console.log("Disconnected from signaling server");
          const statusUpdate = {
            status: false,
            statusMessage: "No players online, Try again later",
          };
          setPeerConnectionStatus(statusUpdate);
        });
      });
    }

    return () => {
      socketRef.current?.off("room-created", handleRoomCreated);
      socketRef.current?.off("from-server", handleServerMessage);
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      const iceServers = [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:3478" },
        { urls: "stun:stun2.l.google.com:5349" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:3478" },
      ];
      pc.current = new RTCPeerConnection({ iceServers });
      stream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      if (localStreamRef.current) {
        localStreamRef.current.srcObject = stream.current;
        localStreamRef.current.onloadedmetadata = () =>
          localStreamRef.current
            ?.play()
            .catch((err) => console.error("Error playing local stream:", err));
      }
      console.log("media devices added");
      setAddedMediaDevices(true);
    };
    init();

    return () => {
      pc.current?.close();
      stream.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!room || !pc.current) return;
    if (!addedMediaDevices) return;

    const init = async () => {
      if (!pc.current) {
        return;
      }
      console.log("in use Effect of adding tracks");
      if (pc.current && pc.current.signalingState !== "closed") {
        console.log("in if of adding tracks");
        stream.current?.getTracks().forEach((track) => {
          pc.current?.addTrack(track, stream.current!);
          console.log("Added track", track.kind);
        });
      } else {
        console.warn("Cannot add track, RTCPeerConnection is closed.");
        stream.current?.getTracks().forEach((track) => track.stop());
      }

      if (isOfferer.current) {
        dataChannel.current = pc.current!.createDataChannel("chat", {
          ordered: true,
          maxRetransmits: 10,
        });
        initializeDataChannel(dataChannel.current);
      } else {
        pc.current.ondatachannel = (event) => {
          dataChannel.current = event.channel;
          initializeDataChannel(dataChannel.current);
        };
      }

      console.log("in negotiation needed useeffect");

      const handleNegotiationNeeded = async () => {
        console.log("in negotiation needed function");
        if (!isOfferer.current) return;
        try {
          await pc.current?.setLocalDescription();
          socketRef.current?.emit("from-client", {
            type: "description",
            description: pc.current?.localDescription,
          });
          console.log("sending offer");
        } catch (err) {
          console.error("Negotiation failed:", err);
        }
      };

      pc.current.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current?.emit("from-client", {
            type: "candidate",
            candidate: event.candidate,
          });
          console.log("sending ice");
        }
      };

      pc.current.ontrack = (event) => {
        if (remoteStreamRef.current) {
          remoteStreamRef.current.srcObject = event.streams[0];
        }
      };

      pc.current.onnegotiationneeded = handleNegotiationNeeded;
      console.log("added onNego event");
      pc.current.oniceconnectionstatechange = () => {
        if (
          pc.current?.signalingState === "stable" &&
          pc.current?.iceConnectionState === "connected"
        ) {
          console.log("connection succes");
          socketRef.current?.disconnect();
          const statusUpdate = {
            status: true,
            statusMessage: "Connected to peer",
          };
          setPeerConnectionStatus(statusUpdate);
        }
        if (pc.current?.iceConnectionState === "disconnected") {
          const statusUpdate = {
            status: false,
            statusMessage: "Player left the lobby",
          };
          setPeerConnectionStatus(statusUpdate);
        }
      };
    };

    init();

    return () => {
      if (pc.current) {
        dataChannel.current?.close();
        pc.current.onicecandidate = null;
        pc.current.ontrack = null;
        pc.current.onnegotiationneeded = null;
      }
    };
  }, [room, addedMediaDevices]);

  const toggleVideo = useCallback(() => {
    stream.current?.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
  }, []);

  const toggleAudio = useCallback(() => {
    stream.current?.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
  }, []);

  const closeConnections = useCallback(() => {
    console.log("Closing connections...");
    stream.current?.getTracks().forEach((track) => {
      track.stop();
      console.log("stopped track", track.kind);
    });
    pc.current?.close();
    socketRef.current?.disconnect();
    dataChannel.current?.close();
    setGameOver(true);
    setPeerConnectionStatus({
      status: false,
      statusMessage: "searching for Player... , please wait",
    });
    setAudioVideo({ audio: true, video: true });
    setSelectedGame(null);
    navigate("/");
  }, [navigate, setGameOver, setPeerConnectionStatus]);

  return { toggleVideo, toggleAudio, closeConnections };
};

export default useWebRtc;
