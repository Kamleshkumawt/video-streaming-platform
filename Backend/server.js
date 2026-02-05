const http = require('http');
const port = 4000;
const server = http.createServer();

server.on('request', (req, res) => {
    res.end('Hello World');
});

server.listen(port, () => {
    console.log(`Server running on port ${port}.....`);
});