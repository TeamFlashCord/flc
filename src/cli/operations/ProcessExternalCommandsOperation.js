'use strict';

const fs = require('fs');
const byline = require('byline');

const ShutdownCommand = require('../commands/ShutdownCommand');


class ProcessExternalCommandsOperation {

    constructor(commandFile) {
        this._commandFile = commandFile;

        this._commandHandlerConstructors = {
            [ShutdownCommand.permanentName]: ShutdownCommand
        };
    }


    _awaitForCommand(callback) {
        const lineStream = byline.createStream();

        const watcher = fs.watchFile(this._commandFile, (curr, prev) => {
            if (curr.mtime !== prev.mtime) {
              const fileStream = fs.createReadStream(this._commandFile);
              fileStream.pipe(lineStream);
            }
        });
        watcher.on('error', (err) => {
            console.error('Error: ', err);
        });


        lineStream.on('readable', function () {
            let commandBuffer;

            while ((commandBuffer = lineStream.read()) !== null) {
                const commandString = commandBuffer.toString();

                console.log('FLA compiler received the command: ' + commandString);

                callback(commandString);
            }
        });
    }

    _parseCommand(commandString) {
        const commandParts = commandString.split(',');

        const commandName = commandParts[0];
        const commandParameters = commandParts.slice(1);

        return {
            name: commandName,
            parameters: commandParameters
        };
    }

    _executeCommand(command) {
        const CommandHandlerConstructor = this._commandHandlerConstructors[command.name];
        const commandHandler = new CommandHandlerConstructor();

        commandHandler.execute(command.parameters);
    }



    execute() {
        this._awaitForCommand(commandString => {
            const command = this._parseCommand(commandString);
            this._executeCommand(command);
        });
    }
}


module.exports = exports = ProcessExternalCommandsOperation;