/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// Set while a chart renders headlessly, where the global Path2D may be missing or belong to another canvas.
let path2DOverride: typeof Path2D | undefined;

/**
 * Runs `fun` with paths created by `Path2DConstructor`, the one that matches the context being drawn on.
 * @internal
 */
export const withPath2D = <T>(Path2DConstructor: typeof Path2D, fun: () => T): T => {
  const previous = path2DOverride;
  path2DOverride = Path2DConstructor;
  try {
    return fun();
  } finally {
    path2DOverride = previous;
  }
};

/**
 * Creates a Path2D from SVG path data for the canvas currently being drawn on.
 * @internal
 */
export const createPath2D = (path: string): Path2D => new (path2DOverride ?? Path2D)(path);
