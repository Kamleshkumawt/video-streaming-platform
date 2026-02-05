const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const server = http.createServer();
const port = 4000;

const VIDEOS_DIR = path.join(__dirname, 'videos');

if (!fs.existsSync(VIDEOS_DIR)) {
    fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

function loadVideos(){
    try {
        return fs.readdirSync(VIDEOS_DIR).filter((file) => {
            const ext = path.extname(file).toLowerCase();
            return [".mp4", ".webm", ".avi"].includes(ext);
        }).map((video) => ({
            filename: video,
            url: `/videos/${video}`,
        }));
    } catch (err) {
        console.error("Error loading videos :", err.message);
        return [];
    }
}

server.on('request', (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    //get the req path name
    const pathName = parsedUrl.pathname;
    if (pathName === '/videos' && req.method === 'GET') {
        const videos = loadVideos();
        console.log('videos loaded :', videos);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(videos));
        return;
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(port, () => {
    console.log(`Server running on port ${port}.....`);
});