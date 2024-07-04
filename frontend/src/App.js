import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import VideoPlayer from './components/VideoPlayer';

function VideoBrowser() {
    const [folderStructure, setFolderStructure] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://${window.location.hostname}:8000/folders`)
        .then(response => response.json())
        .then(data => setFolderStructure(data))
        .catch(err => console.error("Error fetching folder structure:", err));
    }, []);

    const handleVideoSelect = (path) => {
        navigate(`/video/${encodeURIComponent(path)}`);
    };

    const renderFolder = (folder) => {
        return (
            <ul key={folder.name} className="ml-4">
                {
                    folder
                    .children
                    .filter(child => {
                        if (child.type === "file") {
                            var searchQueryKeyWords = searchQuery.split(" ");    
                            searchQueryKeyWords = searchQueryKeyWords.length > 1 ? searchQueryKeyWords.filter(keyword => keyword != "") : searchQueryKeyWords
                            return searchQueryKeyWords.some(keyword => child.name.toLowerCase().includes(keyword.toLowerCase()));
                        }
                        return true;
                    }).map(child => (
                        child.type == "folder" ? (
                            <li key={child.name} className="my-1">
                                📁 {child.name}
                                {renderFolder(child)}
                            </li>
                        ) : (
                            <li key={child.path} className="my-1">
                                🎬 <button 
                                    onClick={() => handleVideoSelect(child.path)}
                                    className="text-blue-600 hover:underline"
                                >
                                    {child.name}
                                </button>
                            </li>
                        )
                    ))
                }
            </ul>
        )
    }

    return (
        <div className="p-5 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Video Browser</h1>
            <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="p-2 border border-gray-300 rounded w-full max-w-md mb-6"
            />
            <div className="bg-white p-4 rounded shadow">
                {folderStructure.length > 0 ? renderFolder({ children: folderStructure }) : <p>Loading...</p>}
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<VideoBrowser />} />
                <Route path="/video/:videoPath" element={<VideoPlayer />} />
            </Routes>
        </Router>
    );
}

export default App;