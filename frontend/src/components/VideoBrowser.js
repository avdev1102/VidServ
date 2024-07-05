import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkModeContext } from "../contexts/DarkModeProvider";

function VideoBrowser() {
    const [folderStructure, setFolderStructure] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const { isDarkMode, toggleDarkMode } = useDarkModeContext();

    useEffect(() => {
        fetch(`http://${window.location.hostname}:8000/folders`)
            .then((response) => response.json())
            .then((data) => setFolderStructure(data))
            .catch((err) => console.error("Error fetching folder structure:", err));
    }, []);

    const handleVideoSelect = (path) => {
        navigate(`/video/${encodeURIComponent(path)}`);
    };

    const renderFolder = (folder) => {
        return (
            <ul key={folder.name} className="ml-4">
                {folder.children
                    .filter((child) => {
                        if (child.type === "file") {
                            return searchQuery.split(" ").some((keyword) =>
                                child.name.toLowerCase().includes(keyword.toLowerCase())
                            );
                        }
                        return true;
                    })
                    .map((child) =>
                        child.type === "folder" ? (
                            <li key={child.name} className="my-1 break-words whitespace-normal">
                                📁 {child.name}
                                {renderFolder(child)}
                            </li>
                        ) : (
                            <li key={child.path} className="my-1 break-words whitespace-normal">
                                🎬{" "}
                                <button
                                    onClick={() => handleVideoSelect(child.path)}
                                    className={`${
                                        isDarkMode ? "text-blue-300" : "text-blue-600"
                                    } hover:underline`}
                                >
                                    {child.name}
                                </button>
                            </li>
                        )
                    )}
            </ul>
        );
    };

    return (
        <div
            className={`p-5 max-w-6xl mx-auto ${
                isDarkMode ? "bg-black text-white" : "bg-white text-black"
            }`}
        >
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Video Browser</h1>
                <button
                    onClick={toggleDarkMode}
                    className={`px-4 py-2 rounded ${
                        isDarkMode ? "bg-gray-700 text-white" : "bg-gray-300 text-black"
                    }`}
                >
                    {isDarkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
                </button>
            </div>

            <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`p-2 border rounded w-full max-w-md mb-6 ${
                    isDarkMode ? "bg-gray-800 text-white border-gray-600" : "bg-white text-black border-gray-300"
                }`}
            />

            <div
                className={`p-4 rounded shadow overflow-x-auto ${
                    isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
                }`}
            >
                {folderStructure.length > 0 ? (
                    renderFolder({ children: folderStructure })
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </div>
    );
}

export default VideoBrowser;
