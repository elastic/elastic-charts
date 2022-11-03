/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/** @internal */
export const zoomSafePointerX = (e: MouseEvent) => e.offsetX; // robust against Chrome, Safari, Firefox menu zooms and/or pinch zoom (FF needs zero margin)

/** @internal */
export const zoomSafePointerY = (e: MouseEvent) => e.offsetY; // robust against Chrome, Safari, Firefox menu zooms and/or pinch zoom (FF needs zero margin)

/** @internal */
export interface ElementSize {
  outerSize: number;
  innerLeading: number;
  innerTrailing: number;
  innerSize: number;
}

/** @internal */
export const elementSize = (canvas: HTMLCanvasElement, horizontal: boolean, pad: [number, number]): ElementSize => {
  const outerSize = Number.parseFloat(horizontal ? canvas.style.width : canvas.style.height);

  const innerLeading = outerSize * pad[0];
  const innerSize = outerSize * (1 - pad.reduce((p, n) => p + n));
  const innerTrailing = innerLeading + innerSize;

  return {
    outerSize,
    innerLeading,
    innerTrailing,
    innerSize,
  };
};
