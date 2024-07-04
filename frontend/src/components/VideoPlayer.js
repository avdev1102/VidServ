import React, { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ReactPlayer from "react-player";

function VideoPlayer() {
    const { videoPath } = useParams();
    const decodedPath = decodeURIComponent(videoPath);
    const videoUrl = `http://${window.location.hostname}:8000/videos/${decodedPath}`;

    const playerRef = useRef(null);
    const [captionFile, setCaptionFile] = useState(null);
    const [captionUrl, setCaptionUrl] = useState("");
    const [captionSize, setCaptionSize] = useState("medium");
    const [showCaptions, setShowCaptions] = useState(true);

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
        <div className="p-6 max-w-4xl mx-auto">
            <Link to="/" className="text-blue-500 hover:underline mb-4 inline-block">
                ← Back to browser
            </Link>
            <h1 className="text-2xl font-bold mb-4">Now Playing</h1>

            <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
                <ReactPlayer
                    ref={playerRef}
                    url={videoUrl}
                    controls
                    playing
                    width="100%"
                    height="auto"
                />
            </div>

            <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-md">
                <label className="block mb-2 text-gray-700 font-semibold">
                    Upload Captions (.srt/.vtt):
                </label>
                <input
                    type="file"
                    accept=".srt,.vtt"
                    onChange={handleCaptionUpload}
                    className="block w-full p-2 border rounded-md"
                />

                {captionUrl && (
                    <div className="mt-4">
                        <button
                            onClick={() => setShowCaptions(!showCaptions)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md mr-2 hover:bg-blue-600"
                        >
                            {showCaptions ? "Hide Captions" : "Show Captions"}
                        </button>
                        <button
                            onClick={() => setCaptionUrl("")}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                            Remove Captions
                        </button>

                        <div className="mt-4">
                            <label className="block mb-2 text-gray-700 font-semibold">
                                Caption Size:
                            </label>
                            <select
                                value={captionSize}
                                onChange={(e) => setCaptionSize(e.target.value)}
                                className="p-2 border rounded-md"
                            >
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            <style>
                {`
                ::cue {
                    font-size: ${captionSize === "small" ? "12px" : captionSize === "large" ? "24px" : "18px"};
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
