/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/** @internal */
export const Z_INDEX_EVENT = 'Z_INDEX_EVENT';

interface ZIndexEvent {
  type: typeof Z_INDEX_EVENT;
  zIndex: number;
}

/** @internal */
export function onComputedZIndex(zIndex: number): ZIndexEvent {
  return { type: Z_INDEX_EVENT, zIndex };
}

/** @internal */
export type ZIndexActions = ZIndexEvent;
