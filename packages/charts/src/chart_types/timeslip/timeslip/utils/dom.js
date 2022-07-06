/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/** @internal */
export const zoomSafePointerX = (e) => e.layerX ?? e.clientX; // robust against Chrome, Safari, Firefox menu zooms and/or pinch zoom (FF needs zero margin)

/** @internal */
export const zoomSafePointerY = (e) => e.layerY ?? e.clientX; // robust against Chrome, Safari, Firefox menu zooms and/or pinch zoom (FF needs zero margin)

/** @internal */
export const elementSizes = (canvas, horizontalPad, verticalPad) => {
  const { width: outerWidth, height: outerHeight } = canvas.getBoundingClientRect();

  const innerLeft = outerWidth * horizontalPad[0];
  const innerWidth = outerWidth * (1 - horizontalPad.reduce((p, n) => p + n));
  const innerRight = innerLeft + innerWidth;

  const innerTop = outerHeight * verticalPad[0];
  const innerHeight = outerHeight * (1 - verticalPad.reduce((p, n) => p + n));
  const innerBottom = innerTop + innerHeight;

  return {
    outerWidth: outerWidth,
    outerHeight,
    innerLeft,
    innerRight,
    innerWidth,
    innerTop,
    innerBottom,
    innerHeight,
  };
};
