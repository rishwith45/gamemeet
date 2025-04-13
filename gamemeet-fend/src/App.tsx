import "./App.css";
import LoginPage from "./pages/LandingPage";
import MainPage from "./pages/MainPage";
import { RemoteStreamProvider } from "./contexts/RemoteStreamcontext";
import { LocalStreamProvider } from "./contexts/LocalStreamContext";
import { PcProvider } from "./contexts/PcContext";
import { DataChannelContextProvider } from "./contexts/DataChannelContext";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { HostProvider } from "./gameContexts/HostContext";
import { SelectedGameContextProvider } from "./gameContexts/SelectedGameContext";
import { GameOverProvider } from "./gameContexts/GameOverContext";
import { PeerConnectionStatusProvider } from "./contexts/PeerConnectionStatusContext";
import { TokenProvider } from "./contexts/TokenContext";
import { SelfAudioVideoProvider } from "./contexts/SelfAudioVideoContext";
import { RemoteAudioVideoProvider } from "./contexts/RemoteAudioVideoContext";
function App() {
  return (
    <RemoteStreamProvider>
      <LocalStreamProvider>
        <PcProvider>
          <PeerConnectionStatusProvider>
            <SelectedGameContextProvider>
              <HostProvider>
                <GameOverProvider>
                  <SelfAudioVideoProvider>
                    <RemoteAudioVideoProvider>
                      <DataChannelContextProvider>
                        <TokenProvider>
                          <BrowserRouter>
                            <Routes>
                              <Route path="/" element={<LoginPage />} />
                              <Route
                                path="/PlayGround"
                                element={<MainPage />}
                              />
                            </Routes>
                          </BrowserRouter>
                        </TokenProvider>
                      </DataChannelContextProvider>
                    </RemoteAudioVideoProvider>
                  </SelfAudioVideoProvider>
                </GameOverProvider>
              </HostProvider>
            </SelectedGameContextProvider>
          </PeerConnectionStatusProvider>
        </PcProvider>
      </LocalStreamProvider>
    </RemoteStreamProvider>
  );
}

export default App;
