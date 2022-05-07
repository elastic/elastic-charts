/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/** @internal */
export const BOX_GAP = 0.5;

/** @internal */
export const mix = (a: number, b: number, x: number) => (1 - x) * a + x * b; // like the GLSL `mix`

const CANVAS_SIZE_INCREMENT = 256; // to avoid thrashing the layout and canvases on every one pixel width/height change

/** @internal */
export const roundUpSize = (cssPixelSize: number) =>
  CANVAS_SIZE_INCREMENT * Math.ceil(cssPixelSize / CANVAS_SIZE_INCREMENT);
