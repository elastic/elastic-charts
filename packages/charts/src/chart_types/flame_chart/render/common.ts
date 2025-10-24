/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Horizontal space between flamegraph elements
 * @internal
 */
export const BOX_GAP_HORIZONTAL = 0.5;

/**
 * Vertical space between flamegraph elements
 * @internal
 */
export const BOX_GAP_VERTICAL = 2;

/**
 * The size of incrementing the canvas size when resizing to avoid
 * thrashing the layout and canvases on every one pixel width/height change
 */
const CANVAS_SIZE_INCREMENT = 256;

/** @internal */
export const roundUpSize = (cssPixelSize: number) =>
  CANVAS_SIZE_INCREMENT * Math.ceil(cssPixelSize / CANVAS_SIZE_INCREMENT);
