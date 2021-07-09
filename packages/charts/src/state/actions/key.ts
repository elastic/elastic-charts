/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/** @internal */
export const ON_KEY_UP = 'ON_KEY_UP';

interface KeyUpAction {
  type: typeof ON_KEY_UP;
  /**
   * Keyboard key from event
   */
  key: string;
}

/**
 * Action called on `keyup` event
 * @param key keyboard key
 * @internal
 */
export function onKeyPress(key: string): KeyUpAction {
  return { type: ON_KEY_UP, key };
}

/** @internal */
export type KeyActions = KeyUpAction;
