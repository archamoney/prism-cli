import { CreatePrism } from './runner';
declare const createMultiProcessPrism: CreatePrism;
declare const createSingleProcessPrism: CreatePrism;
declare type CreateBaseServerOptions = {
    dynamic: boolean;
    cors: boolean;
    host: string;
    port: number;
    document: string;
    multiprocess: boolean;
    errors: boolean;
};
export interface CreateProxyServerOptions extends CreateBaseServerOptions {
    dynamic: false;
    upstream: URL;
}
export declare type CreateMockServerOptions = CreateBaseServerOptions;
export { createMultiProcessPrism, createSingleProcessPrism };
