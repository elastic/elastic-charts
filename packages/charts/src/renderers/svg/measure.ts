/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

let measureContext: CanvasRenderingContext2D | null | undefined;

/**
 * One shared offscreen canvas context for text measurement, so the SVG backend measures text
 * exactly like the layout code does on canvas and both renderers lay out identically.
 * `null` where no canvas is available (jsdom, server).
 * @internal
 */
export function getMeasureContext(): CanvasRenderingContext2D | null {
  if (measureContext === undefined) {
    measureContext = typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d') ?? null;
  }
  return measureContext;
}
