import React, { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ReactPlayer from "react-player";
import { useDarkModeContext } from "../contexts/DarkModeProvider";

function VideoPlayer() {
    const { videoPath } = useParams();
    const decodedPath = decodeURIComponent(videoPath);
    const videoUrl = `http://${window.location.hostname}:8000/videos/${decodedPath}`;

    const playerRef = useRef(null);
    const [captionFile, setCaptionFile] = useState(null);
    const [captionUrl, setCaptionUrl] = useState("");
    const [captionSize, setCaptionSize] = useState("medium");
    const [showCaptions, setShowCaptions] = useState(true);
    const { isDarkMode, toggleDarkMode } = useDarkModeContext();

    useEffect(() => {
        if (playerRef.current && captionUrl) {
            const videoElement = playerRef.current.getInternalPlayer();
            if (videoElement) {
                let track = videoElement.querySelector("track");
                if (!track) {
                    track = document.createElement("track");
                    track.kind = "subtitles";
                    track.srcLang = "en";
                    track.default = true;
                    videoElement.appendChild(track);
                }
                track.src = captionUrl;
                videoElement.textTracks[0].mode = showCaptions ? "showing" : "hidden";
            }
        }
    }, [captionUrl, showCaptions]);

    const handleCaptionUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.name.endsWith(".srt")) {
            convertSrtToVtt(file);
        } else if (file.name.endsWith(".vtt")) {
            const url = URL.createObjectURL(file);
            setCaptionFile(file);
            setCaptionUrl(url);
        } else {
            alert("Please upload a .srt or .vtt file.");
        }
    };

    const convertSrtToVtt = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            let vttContent = "WEBVTT\n\n" + e.target.result
                .replace(/\r/g, "")
                .replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, "$1.$2");

            const blob = new Blob([vttContent], { type: "text/vtt" });
            setCaptionUrl(URL.createObjectURL(blob));
        };
        reader.readAsText(file);
    };

    return (
        <div
            className={`p-6 max-w-4xl mx-auto ${
                isDarkMode ? "bg-black text-white" : "bg-white text-black"
            }`}
        >
            <div className="flex justify-between items-center mb-4">
                <Link
                    to="/"
                    className={`${
                        isDarkMode ? "text-blue-300" : "text-blue-500"
                    } hover:underline`}
                >
                    ← Back to browser
                </Link>
                <button
                    onClick={toggleDarkMode}
                    className={`px-4 py-2 rounded ${
                        isDarkMode ? "bg-gray-700 text-white" : "bg-gray-300 text-black"
                    }`}
                >
                    {isDarkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
                </button>
            </div>

            <h1 className="text-2xl font-bold mb-4">Now Playing</h1>

            <div
                className={`relative rounded-lg overflow-hidden shadow-lg ${
                    isDarkMode ? "bg-gray-900" : "bg-black"
                }`}
            >
                <ReactPlayer
                    ref={playerRef}
                    url={videoUrl}
                    controls
                    playing
                    width="100%"
                    height="auto"
                />
            </div>

            <div
                className={`mt-4 p-4 rounded-lg shadow-md ${
                    isDarkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-black"
                }`}
            >
                <label className="block mb-2 font-semibold">
                    Upload Captions (.srt/.vtt):
                </label>
                <input
                    type="file"
                    accept=".srt,.vtt"
                    onChange={handleCaptionUpload}
                    className={`block w-full p-2 border rounded-md ${
                        isDarkMode ? "bg-gray-700 text-white" : "bg-white text-black"
                    }`}
                />

                {captionUrl && (
                    <div className="mt-4">
                        <button
                            onClick={() => setShowCaptions(!showCaptions)}
                            className={`px-4 py-2 rounded-md mr-2 hover:opacity-80 ${
                                isDarkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
                            }`}
                        >
                            {showCaptions ? "Hide Captions" : "Show Captions"}
                        </button>
                        <button
                            onClick={() => setCaptionUrl("")}
                            className={`px-4 py-2 rounded-md hover:opacity-80 ${
                                isDarkMode ? "bg-red-600 text-white" : "bg-red-500 text-white"
                            }`}
                        >
                            Remove Captions
                        </button>
                    </div>
                )}
            </div>

            <style>
                {`
                ::cue {
                    font-size: ${
                        captionSize === "small" ? "12px" : captionSize === "large" ? "24px" : "18px"
                    };
                    background: rgba(0, 0, 0, 0.6);
                    color: white;
                    padding: 4px;
                    border-radius: 4px;
                }
                `}
            </style>
        </div>
    );
}

export default VideoPlayer;
