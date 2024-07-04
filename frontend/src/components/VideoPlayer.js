import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactPlayer from 'react-player';

function VideoPlayer() {
    const { videoPath } = useParams();
    const decodedPath = decodeURIComponent(videoPath);
    const [subtitles, setSubtitles] = useState([]);
    const [selectedSubtitle, setSelectedSubtitle] = useState(null);
    const videoUrl = `http://${window.location.hostname}:8000/videos/${decodedPath}`;
    const videoDir = decodedPath.split('/').slice(0, -1).join('/');

    useEffect(() => {
        // Fetch available subtitles
        fetch(`http://${window.location.hostname}:8000/folders`)
            .then(response => response.json())
            .then(data => {
                const findSubtitles = (items) => {
                    let subs = [];
                    items.forEach(item => {
                        if (item.type === "subtitle" && item.path.startsWith(videoDir)) {
                            subs.push(item);
                        }
                        if (item.children) {
                            subs = [...subs, ...findSubtitles(item.children)];
                        }
                    });
                    return subs;
                };
                setSubtitles(findSubtitles(data));
            })
            .catch(err => console.error("Error fetching subtitles:", err));
    }, [videoDir]);

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">
                ← Back to browser
            </Link>
            <h1 className="text-2xl font-bold mb-4">Now Playing</h1>
            
            {subtitles.length > 0 && (
                <div className="mb-4">
                    <label htmlFor="subtitle-select" className="mr-2">Subtitles:</label>
                    <select
                        id="subtitle-select"
                        onChange={(e) => setSelectedSubtitle(e.target.value)}
                        className="p-2 border rounded"
                    >
                        <option value="">None</option>
                        {subtitles.map((sub, index) => (
                            <option key={index} value={sub.path}>
                                {sub.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="flex justify-center bg-black">
                <ReactPlayer
                    url={videoUrl}
                    controls
                    playing
                    width="100%"
                    height="auto"
                    config={{
                        file: {
                            attributes: {
                                controlsList: 'nodownload'
                            },
                            tracks: selectedSubtitle ? [{
                                kind: 'subtitles',
                                src: `http://${window.location.hostname}:8000/subtitles/${selectedSubtitle}`,
                                srcLang: 'en',
                                default: true,
                                label: 'English'
                            }] : []
                        }
                    }}
                />
            </div>
        </div>
    );
}

export default VideoPlayer;