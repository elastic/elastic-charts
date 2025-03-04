/* eslint-disable header/header */

import type { operations, components } from '@octokit/openapi-types';

export type FileDiff = components['schemas']['diff-entry'];

export type OctokitParameters<T extends keyof operations> = Omit<
  ExtractParameters<operations[T]> & ExtractRequestBody<operations[T]>,
  'repo' | 'owner'
>;
export type OctokitResponse<T extends keyof operations> = ExtractOctokitResponse<operations[T]>;
export type OctokitSuccessResponse<T extends keyof operations> = SuccessResponseDataType<operations[T]>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
type ExtractParameters<T> = 'parameters' extends keyof T
  ? UnionToIntersection<
      {
        [K in keyof T['parameters']]: T['parameters'][K];
      }[keyof T['parameters']]
    >
  : {}; // eslint-disable-line @typescript-eslint/ban-types
type ExtractRequestBody<T> = 'requestBody' extends keyof T
  ? 'content' extends keyof T['requestBody']
    ? 'application/json' extends keyof T['requestBody']['content']
      ? T['requestBody']['content']['application/json']
      : {
          data: {
            [K in keyof T['requestBody']['content']]: T['requestBody']['content'][K];
          }[keyof T['requestBody']['content']];
        }
    : 'application/json' extends keyof T['requestBody']
      ? T['requestBody']['application/json']
      : {
          data: {
            [K in keyof T['requestBody']]: T['requestBody'][K];
          }[keyof T['requestBody']];
        }
  : {}; // eslint-disable-line @typescript-eslint/ban-types
type SuccessStatuses = 200 | 201 | 202 | 204;
type RedirectStatuses = 301 | 302;
type EmptyResponseStatuses = 201 | 204;
type KnownJsonResponseTypes = 'application/json' | 'application/scim+json' | 'text/html';
type SuccessResponseDataType<Responses> = {
  [K in SuccessStatuses & keyof Responses]: GetContentKeyIfPresent<Responses[K]> extends never
    ? never
    : OctokitResponse<GetContentKeyIfPresent<Responses[K]>, K>;
}[SuccessStatuses & keyof Responses];
type RedirectResponseDataType<Responses> = {
  [K in RedirectStatuses & keyof Responses]: OctokitResponse<unknown, K>;
}[RedirectStatuses & keyof Responses];
type EmptyResponseDataType<Responses> = {
  [K in EmptyResponseStatuses & keyof Responses]: OctokitResponse<never, K>;
}[EmptyResponseStatuses & keyof Responses];
type GetContentKeyIfPresent<T> = 'content' extends keyof T ? DataType<T['content']> : DataType<T>;
type DataType<T> = {
  [K in KnownJsonResponseTypes & keyof T]: T[K];
}[KnownJsonResponseTypes & keyof T];
type ExtractOctokitResponse<R> = 'responses' extends keyof R
  ? SuccessResponseDataType<R['responses']> extends never
    ? RedirectResponseDataType<R['responses']> extends never
      ? EmptyResponseDataType<R['responses']>
      : RedirectResponseDataType<R['responses']>
    : SuccessResponseDataType<R['responses']>
  : unknown;

/* eslint-enable header/header */
