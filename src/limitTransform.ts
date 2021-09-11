import {Transform} from "stream";

export class LimitTransform extends Transform {

    constructor(chunkSize: number) {
        super({
            writableHighWaterMark: chunkSize
        });
    }

    _write(chunk: any, encoding: BufferEncoding, callback: Function) {
        this.push(chunk);
        const timer: NodeJS.Timer = setTimeout(() => {
            clearTimeout(timer);
            callback();
        }, 1000);
    }
}