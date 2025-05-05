/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Represents the available modifier keys (e.g., Shift, Control, Alt, Meta).
 * These keys can be used to modify the behavior of user interactions.
 *
 * @public
 */
export type ModifierKeys = 'shiftKey' | 'ctrlKey' | 'altKey' | 'metaKey';

/**
 * Represents the state of modifier keys during an interaction.
 * Each key is a boolean indicating whether it is pressed (`true`) or not (`false`).
 *
 * @public
 */
export type KeyPressed = Record<ModifierKeys, boolean>;

/** @internal */
export const noModifierKeysPressed: KeyPressed = { shiftKey: false, ctrlKey: false, altKey: false, metaKey: false };

/** @internal */
export function getModifierKeys(overrides: Partial<KeyPressed> = {}): KeyPressed {
  return { ...noModifierKeysPressed, ...overrides };
}
