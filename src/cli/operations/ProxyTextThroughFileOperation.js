'use strict';

const fs = require('fs');


class ProxyTextThroughFileOperation {

    constructor(inputFile, outputStream) {
        this._inputFile = inputFile;
        this._outputStream = outputStream;
    }


    execute() {
        const watcher = fs.watchFile(this._inputFile, (curr, prev) => {
            if (curr.mtime !== prev.mtime) {
              const fileStream = fs.createReadStream(this._inputFile);
              fileStream.pipe(this._outputStream);
            }
        });
        
        watcher.on('error', (err) => {
            console.error('Error: ', err);
        });
    }
}


module.exports = exports = ProxyTextThroughFileOperation;