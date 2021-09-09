import http from 'http'

const hostname = '127.0.0.1';
const port = 3000;

const speedLimit = Number.parseInt(process.argv[2]) || 1024;
console.log(`Speed limit ${speedLimit} bytes`)

const server = http.createServer((req, res) => {
    if (req.url === '/file.txt') {
        
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Page not found.');
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});