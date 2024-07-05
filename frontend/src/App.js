import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VideoPlayer from "./components/VideoPlayer";
import { DarkModeProvider, useDarkModeContext } from "./contexts/DarkModeProvider";
import VideoBrowser from "./components/VideoBrowser";

function AppContent() {
    const { isDarkMode } = useDarkModeContext();

    return (
        <div
            className={`min-h-screen ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
        >
            <Router>
                <Routes>
                    <Route path="/" element={<VideoBrowser />} />
                    <Route path="/video/:videoPath" element={<VideoPlayer />} />
                </Routes>
            </Router>
        </div>
    );
}

function App() {
    return (
        <DarkModeProvider>
            <AppContent />
        </DarkModeProvider>
    );
}

export default App;
