"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createServer_1 = require("../util/createServer");
const sharedOptions_1 = require("./sharedOptions");
const runner_1 = require("../util/runner");
const mockCommand = {
    describe: 'Start a mock server with the given document file',
    command: 'mock <document>',
    builder: yargs => yargs
        .positional('document', {
        description: 'Path to a document file. Can be both a file or a fetchable resource on the web.',
        type: 'string',
    })
        .options({
        ...sharedOptions_1.default,
        dynamic: {
            alias: 'd',
            description: 'Dynamically generate examples.',
            boolean: true,
            default: false,
        },
    }),
    handler: parsedArgs => {
        const { multiprocess, dynamic, port, host, cors, document, errors, } = parsedArgs;
        const createPrism = multiprocess ? createServer_1.createMultiProcessPrism : createServer_1.createSingleProcessPrism;
        const options = { cors, dynamic, port, host, document, multiprocess, errors };
        return runner_1.runPrismAndSetupWatcher(createPrism, options);
    },
};
exports.default = mockCommand;
