import http from 'node:http'
import path from 'path';
import {LimitTransform} from "./limitTransform";
import fs from "fs";
import {promisify} from "util";

const host = '127.0.0.1';
const port = 3000;
const speedPerSecond = +Number.parseInt(process.argv[2]) || 1024;

console.log(`Speed limit ${speedPerSecond} bytes per second.`)

const server = http.createServer(async (req, res) => {
        if (req.method === 'GET' && req.url === '/file.txt') {
            const filePath = path.resolve('./storage/data.txt')

            try {
                const access = promisify(fs.access)
                await access(filePath, fs.constants.R_OK);

                const fstat = promisify(fs.stat);
                const stat = await fstat(filePath);

                const headers = {
                    'content-length': stat.size,
                    'content-type': 'application/octet-stream',
                    'last-modified': stat.mtime.toUTCString(),
                }
                res.writeHead(200, headers)

                const stream = fs.createReadStream(filePath, {highWaterMark: speedPerSecond})
                    .pipe(new LimitTransform(speedPerSecond));

                stream.on('data', (chunk: Buffer) => {
                    res.write(chunk);
                })

            } catch (e) {
                res.writeHead(404, 'File not found.')
                res.end();
                return;
            }
        } else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end();
        }
    }
);

server.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});