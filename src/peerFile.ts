import {OutgoingHttpHeaders, ServerResponse} from "http";
import {promisify} from "util";
import fs from "fs";

export class PeerFile {
    filePath: string
    speedPerSecond: number
    readStream: fs.ReadStream

    constructor(filePath: string, speedPerSecond: number) {
        this.filePath = filePath;
        this.speedPerSecond = speedPerSecond;
        this.readStream = fs.createReadStream(this.filePath, {highWaterMark: this.speedPerSecond});
    }

    * makeChunk(): Generator<Buffer> {
        let chunk;
        while (null !== (chunk = this.readStream.read(this.speedPerSecond))) {
            yield chunk;
        }
    }

    getResponseHttpHeader(): Promise<OutgoingHttpHeaders> {
        const fstat = promisify(fs.stat);
        return fstat(this.filePath).then((stat) => {
            return {
                'content-length': stat.size,
                'content-type': 'application/octet-stream',
                'last-modified': stat.mtime.toUTCString(),
            }
        }).catch(() => {
            return {}
        });
    }

    async send(res: ServerResponse) {
        const headers = await this.getResponseHttpHeader()
        res.writeHead(200, headers)

        let timer: NodeJS.Timer = null;
        timer = setInterval(() => {
            for (let chunk of this.makeChunk()) {
                res.write(chunk);
            }
        }, 1000);
        this.readStream.on("close", function () {
            clearInterval(timer);
            res.end();
        });
    }
}