import React from "react";
import { useNavigate } from "react-router-dom";
import { useToken } from "../contexts/TokenContext";
import logo from "../assets/logo.png";

const isMobile = () =>
  /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setToken } = useToken(); // Use the token context to get and set the token
  const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;
  console.log("Backend URL:", BACKEND_URL);
  const mobile = isMobile();
  console.log(BACKEND_URL);

  const handlePlayNow = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      const res = await fetch(`${BACKEND_URL}/get-token`);
      const data = await res.json();
      console.log(data);
      mediaStream.getTracks().forEach((track) => track.stop());
      if (data.error) {
        alert("Too many requests, try again in few mins :(");
        return;
      }

      setToken(data.token); // Store token in state
      navigate("/playGround");
    } catch (error) {
      console.error("Permission denied:", error);
      alert("Camera and microphone access are required to play!");
    }
  };

  if (mobile) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "20px",
        }}
      >
        <h2>Currently gamemeet Available Only for Desktops</h2>
        <p>Please visit this website on a desktop device.</p>
      </div>
    );
  }
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        textAlign: "center",
        background: "radial-gradient(circle, #a393eb, #5e63b6,#27296d)",
        color: "#4a4a4a",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "30px",
          marginBottom: "20px",
        }}
      >
        {/* Connect 4 Board */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gridTemplateRows: "repeat(6, 1fr)",
            width: "100px",
            height: "100px",
            background: "#ffcc00",
            padding: "5px",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
          }}
        >
          {Array.from({ length: 42 }).map((_, index) => (
            <div
              key={index}
              style={{
                width: "80%",
                height: "80%",
                backgroundColor:
                  Math.random() > 0.7
                    ? Math.random() > 0.5
                      ? "red"
                      : "yellow"
                    : "#27296d",
                borderRadius: "50%",
                margin: "auto",
              }}
            />
          ))}
        </div>

        {/* Chess Board */}
        <div
          style={{
            width: "130px",
            height: "130px",
            background: "linear-gradient(45deg, #fff 50%, #000 50%)",
            display: "grid",
            gridTemplateColumns: "repeat(8, 1fr)",
            gridTemplateRows: "repeat(8, 1fr)",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
          }}
        >
          {Array.from({ length: 64 }).map((_, index) => (
            <div
              key={index}
              style={{
                backgroundColor:
                  (Math.floor(index / 8) + (index % 8)) % 2 === 0
                    ? "#F5DEB3"
                    : "#6B4F4F",
                width: "100%",
                height: "100%",
              }}
            />
          ))}
        </div>

        {/* Tic-Tac-Toe Board */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "repeat(3, 1fr)",
            width: "100px",
            height: "100px",
            background: "#ff4d4d",
            padding: "5px",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
          }}
        >
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              style={{
                width: "90%",
                height: "90%",
                backgroundColor: "#fff",
                margin: "auto",
                border: "2px solid #000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "15px",
                fontWeight: "bold",
              }}
            >
              {Math.random() > 0.7 ? (Math.random() > 0.5 ? "X" : "O") : ""}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          fontSize: "52px",
          fontWeight: "bold",
          marginBottom: "15px",
          textShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
          color: "#fcbf49",
        }}
      >
        Gamemeet
        <span style={{ marginLeft: "10px", marginTop: "20px" }}>
          <img
            src={logo}
            alt="Gamemeet logo"
            style={{ width: "40px", height: "40px", marginTop: "15px" }}
          />
        </span>
      </div>

      <p
        style={{
          fontSize: "20px",
          marginBottom: "30px",
          maxWidth: "600px",
          lineHeight: "1.5",
        }}
      >
        Play exciting board games with strangers in real-time! Enjoy seamless
        video chat while competing.
      </p>

      <button
        onClick={handlePlayNow}
        style={{
          padding: "15px 40px",
          fontSize: "22px",
          fontWeight: "bold",
          color: "#fff",
          background:
            "linear-gradient(90deg,rgb(246, 45, 23),rgb(222, 64, 25))",
          border: "none",
          borderRadius: "50px",
          cursor: "pointer",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
        }}
        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        Play Now
      </button>
    </div>
  );
};

export default LandingPage;
