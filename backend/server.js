const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { getDefaultHighWaterMark } = require("stream");

const app = express();
const PORT = 8000;

app.use(cors());

const VIDEO_FOLDER = path.join("D:\\Videos");

getFolderStructure = dir => {
    const entries = fs.readdirSync(dir, { withFileTypes: true})

    return entries.map(entry => {
        const fullPath = path.join(dir, entry.name);

        if(entry.isDirectory() && entry.name != "Subs"){
            return {
                name: entry.name,
                type: "folder",
                children: getFolderStructure(fullPath)
            }
        }
        else if(entry.isFile() && entry.name.match(/\.(mp4|mkv|avi)$/i)){
            return {
                name: entry.name,
                type: "file",
                path: path.relative(VIDEO_FOLDER, fullPath),
            };
        }
    }).filter(Boolean)
}

app.get("/folders", (req, res) => {
    const structure = getFolderStructure(VIDEO_FOLDER);
    res.json(structure)
});

app.get("/videos/:filename(*)", (req, res) => {
    const decodedPath = decodeURIComponent(req.params.filename);
    const videoPath = path.join(VIDEO_FOLDER, decodedPath);

    console.log(videoPath);

    if (!fs.existsSync(videoPath)) {
        return res.status(404).send("File not found!");
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        const file = fs.createReadStream(videoPath, {start, end});
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize,
            "Content-Type": "video/mp4",
        };

        res.writeHead(206, headers);
        file.pipe(res);
    } else {
        const headers = {
            "Content-Length": fileSize,
            "Content-Type": "video/mp4",
          };
          res.writeHead(200, headers);
          fs.createReadStream(videoPath).pipe(res);
    }
});


app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
