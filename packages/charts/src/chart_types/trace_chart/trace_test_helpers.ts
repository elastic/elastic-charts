/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Shared test helpers for trace chart tests.
 *
 * Importing this module activates `jest-canvas-mock`, which patches
 * `HTMLCanvasElement.prototype.getContext` so any test that needs a canvas context — either via a
 * mounted component or via `makeCtx()` — gets a full jest-spy-backed mock automatically.
 * Scoped to trace chart tests only: only test files that import this module receive the patch.
 * @internal
 */

// Patches HTMLCanvasElement.prototype.getContext for the entire test file that imports this module.
import 'jest-canvas-mock';

/**
 * Returns a `jest-canvas-mock`-backed `CanvasRenderingContext2D`. Use this in unit tests that call
 * `draw()` / `pick*()` directly and need to inspect individual canvas API call counts or arguments.
 */
export function makeCtx(): CanvasRenderingContext2D {
  return document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
}
