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

function parseMultipartFormData(req, boundary, callback) {
    let buffer = Buffer.alloc(0);
    req.on('data', (chunk) => {
        buffer = Buffer.concat([buffer, chunk]);
        console.log('buffer :', buffer);
        let boundaryIndex;
        while ((boundaryIndex = buffer.indexOf(`--${boundary}`)) !== -1) {
            const partEnd = buffer.indexOf(`--${boundary}`, boundaryIndex + 1);
            if (partEnd === -1) break;
            const part = buffer.slice(boundaryIndex, partEnd);
            console.log('part :', part);
            buffer = buffer.slice(partEnd);
            console.log('buffer :', buffer);

            const partStr = part.toString();
            let filename = '';
            let fileStream = null;
            
            if (partStr.includes('filename=')) {
                filename = partStr.match(/filename="([^"]+)"/)[1];
                const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
                const filePath = path.join(VIDEOS_DIR, Date.now() + '-' + safeName);
                fileStream = fs.createWriteStream(filePath);

                const headerEnd = partStr.indexOf('\r\n\r\n');
                console.log('headerEnd :', headerEnd);
                if (headerEnd !== -1) {
                    fileStream.write(part.slice(headerEnd + 4, -2)); // Write file data from the first chunk
                }

                // Process remaining chunks of the file
                req.on('data', (chunk) => {
                    fileStream.write(chunk);
                    console.log('write chunk :', chunk);
                });
            }
            
            if (fileStream) {
                fileStream.on('finish', () => {
                    callback(null, filename);
                });
            }
        }
    });

    req.on('end', () => {
        if (buffer.length === 0) {
            callback('No data received');
        }
    });

    req.on('error', (err) => {
        callback(`Error during data processing: ${err}`);
    });
}

server.on('request', (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    //get the req path name
    const pathName = parsedUrl.pathname;
    if (pathName === '/videos' && req.method === 'GET') {
        const videos = loadVideos();
        console.log('videos loaded :', videos);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({success: true, message: 'Videos loaded successfully!',videos: videos}));
        return;
    } else if (req.method === 'POST' && req.url === '/upload') {
        const contentType = req.headers['content-type'];
        const boundary = contentType.split('boundary=')[1];
        console.log('boundary :', boundary);
        
        if (!boundary) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, message: 'Invalid request format Please try again!' }));
            return;
        }

        parseMultipartFormData(req, boundary, (error, filename) => {
            if (error) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, message: 'Video upload failed!', error: error }));
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/html');
                res.end(JSON.stringify({ success: true, message: `Video ${filename} uploaded successfully!`}));
            }
        });
    }  else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(port, () => {
    console.log(`Server running on port ${port}.....`);
});