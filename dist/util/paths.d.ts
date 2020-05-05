import { IHttpOperation } from '@stoplight/types';
import * as E from 'fp-ts/lib/Either';
import { ValuesTransformer } from './colorizer';
export declare function createExamplePath(operation: IHttpOperation, transformValues?: ValuesTransformer): E.Either<Error, string>;
