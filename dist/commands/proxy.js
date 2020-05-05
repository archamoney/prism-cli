"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const createServer_1 = require("../util/createServer");
const sharedOptions_1 = require("./sharedOptions");
const runner_1 = require("../util/runner");
const proxyCommand = {
    describe: 'Start a proxy server with the given document file',
    command: 'proxy <document> <upstream>',
    builder: yargs => yargs
        .positional('document', {
        description: 'Path to a document file. Can be both a file or a fetchable resource on the web.',
        type: 'string',
    })
        .positional('upstream', {
        description: 'URL to a target server.',
        type: 'string',
    })
        .coerce('upstream', value => {
        try {
            return new URL(value);
        }
        catch (e) {
            throw new Error(`Invalid upstream URL provided: ${value}`);
        }
    })
        .options(sharedOptions_1.default),
    handler: parsedArgs => {
        const p = lodash_1.pick(parsedArgs, 'dynamic', 'cors', 'host', 'port', 'document', 'multiprocess', 'upstream', 'errors');
        const createPrism = p.multiprocess ? createServer_1.createMultiProcessPrism : createServer_1.createSingleProcessPrism;
        return runner_1.runPrismAndSetupWatcher(createPrism, p);
    },
};
exports.default = proxyCommand;
