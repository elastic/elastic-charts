/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { $Values } from 'utility-types';

/** @public */
export const ErrorType = Object.freeze({
  Graceful: 'graceful' as const,
});
/** @public */
export type ErrorType = $Values<typeof ErrorType>;

/**
 * Error to used to gracefully render empty chart
 * @internal
 */
export class GracefulError extends Error {
  type = ErrorType.Graceful;
}

/** @internal */
export function isGracefulError(error: Error): error is GracefulError {
  return (error as GracefulError)?.type === ErrorType.Graceful;
}
