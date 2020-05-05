import { IPrismHttpServer } from '@stoplight/prism-http-server/src/types';
import { CreateMockServerOptions } from './createServer';
export declare type CreatePrism = (options: CreateMockServerOptions) => Promise<IPrismHttpServer | void>;
export declare function runPrismAndSetupWatcher(createPrism: CreatePrism, options: CreateMockServerOptions): Promise<unknown>;
