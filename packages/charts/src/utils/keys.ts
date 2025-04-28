/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

type ModifierKeys = 'shiftKey' | 'ctrlKey' | 'altKey' | 'metaKey';

/** @internal */
export type KeyPressed = Record<ModifierKeys, boolean>;

/** @internal */
export const noModifierKeysPressed: KeyPressed = { shiftKey: false, ctrlKey: false, altKey: false, metaKey: false };

/** @internal */
export function getModifierKeys(overrides: Partial<KeyPressed> = {}): KeyPressed {
  return { ...noModifierKeysPressed, ...overrides };
}
