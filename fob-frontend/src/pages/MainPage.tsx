import React from "react";
import useWebRtc from "../hooks/useWebRtc";
import RemoteVideo from "../components/Video/RemoteVideo";
import SelfVideo from "../components/Video/SelfVideo";
import VideoController from "../components/Video/VideoController";
import GameSection from "../components/Game/GameSection";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToken } from "../contexts/TokenContext";
import logo from "../assets/logo.png";

const isMobile = () =>
  /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const MainPage: React.FC = () => {
  const { toggleVideo, toggleAudio, closeConnections } = useWebRtc();
  const navigate = useNavigate();
  const { token } = useToken();
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    if (isMobile()) {
      setMobile(true);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      closeConnections();
      navigate("/");
    }
  }, [token, navigate]);

  console.log("MainPage rendered");
  if (mobile) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <h2>Currently Available Only for Desktops</h2>
        <p>Please visit this website on a desktop device.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        minWidth: "950px",
        minHeight: "660px",
        width: "100vw",
        height: "100vh",
        background: "radial-gradient(circle, #a393eb, #5e63b6,#27296d)",
        backgroundSize: "cover, cover, 100px 100px",
        backgroundBlendMode: "overlay, overlay, multiply",
        animation: "moveWaves 10s infinite linear",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          height: "10%",
          width: "100%",
          display: "flex",
          color: "#fff",
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        <h3
          style={{
            margin: "13px",
            marginTop: "0px",
            marginRight: "0px",
            marginLeft: "10px",
            letterSpacing: "2px",
            padding: "15px",
            paddingRight: "0px",
            color: "#fcbf49", // White text for high contrast
            textShadow: "2px 2px 8px rgba(0, 0, 0, 0.3)", // Adds subtle depth
            fontSize: "30px",
          }}
        >
          GameMeet
        </h3>

        <img
          src={logo}
          alt="Gamemeet logo"
          style={{
            width: "40px",
            height: "40px",
            marginTop: "20px",
            marginLeft: "5px",
          }}
        />
      </div>

      <div
        style={{
          flex: 12, // 80% of the screen
          display: "flex",
          width: "100%",
          height: "90%",
          boxSizing: "border-box",
          gap: "50px",
        }}
      >
        {/* Left Section (Videos) */}
        <div
          style={{
            flex: 1, // 1/3rd of the screen
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            padding: "15px",
          }}
        >
          <RemoteVideo />
          <SelfVideo />
        </div>

        {/* Right Section (Game + Controls) */}
        <div
          style={{
            flex: 2, // 2/3rd of the screen
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            paddingLeft: "10px",
            gap: "10px",
            padding: "15px",
          }}
        >
          {/* Game Area */}
          <div
            style={{
              height: "85%", // Takes up all the remaining space
              width: "100%",
              background: "white",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "black",
              fontSize: "24px",
            }}
          >
            <GameSection closeConnections={closeConnections} />
          </div>

          {/* Controls Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              padding: "10px",
            }}
          >
            <VideoController
              toggleAudio={toggleAudio}
              toggleVideo={toggleVideo}
              closeConnections={closeConnections}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
