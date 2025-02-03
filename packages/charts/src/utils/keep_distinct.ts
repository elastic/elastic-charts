/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Predicate function, eg. to be called with [].filter, to keep distinct values
 * @example [1, 2, 4, 2, 4, 0, 3, 2].filter(keepDistinct) ==> [1, 2, 4, 0, 3]
 * @internal
 */
export function keepDistinct<T>(d: T, i: number, a: T[]): boolean {
  return a.indexOf(d) === i;
}
