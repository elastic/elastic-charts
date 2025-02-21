/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// eslint-disable-next-line no-restricted-imports
import type { Options } from 'ts-debounce';
// eslint-disable-next-line no-restricted-imports
import { debounce as tsDebounce } from 'ts-debounce';

/** @internal */
export interface DebouncedFunction<Args extends any[], F extends (...args: Args) => any> {
  (this: ThisParameterType<F>, ...args: Parameters<F> & Args): ReturnType<F>;
  cancel: (reason?: any) => void;
}

/**
 * Wrapper around ts-debounce to fix typings
 * @internal
 */
export function debounce<Args extends any[], F extends (...args: Args) => any>(
  func: F,
  waitMilliseconds?: number,
  options?: Options<ReturnType<F>>,
): DebouncedFunction<Args, F> {
  // TODO refactor code to ignore or use promise
  // As of ts - debounce@v3.0 it now returns a promise
  // we also need a better way to designate internal setting from external, the user does
  // not care that this function is debounced nor should they be providing a debounced function
  return tsDebounce(func, waitMilliseconds, options) as DebouncedFunction<Args, F>; // cast required to override promise return type
}
