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
  outerWidth: number;
  outerHeight: number;
  innerLeft: number;
  innerRight: number;
  innerWidth: number;
  innerTop: number;
  innerBottom: number;
  innerHeight: number;
}

/** @internal */
export const elementSizes = (
  canvas: HTMLCanvasElement,
  horizontalPad: [number, number],
  verticalPad: [number, number],
): ElementSize => {
  // const { width: outerWidth, height: outerHeight } = canvas.getBoundingClientRect();
  const outerWidth = Number.parseFloat(canvas.style.width);
  const outerHeight = Number.parseFloat(canvas.style.height);

  const innerLeft = outerWidth * horizontalPad[0];
  const innerWidth = outerWidth * (1 - horizontalPad.reduce((p, n) => p + n));
  const innerRight = innerLeft + innerWidth;

  const innerTop = outerHeight * verticalPad[0];
  const innerHeight = outerHeight * (1 - verticalPad.reduce((p, n) => p + n));
  const innerBottom = innerTop + innerHeight;

  return {
    outerWidth,
    outerHeight,
    innerLeft,
    innerRight,
    innerWidth,
    innerTop,
    innerBottom,
    innerHeight,
  };
};
