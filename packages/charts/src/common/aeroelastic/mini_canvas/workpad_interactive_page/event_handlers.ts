/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

type CanvasOriginFn = () => { left: number; top: number };

/** @internal */
export const localMousePosition = (canvasOrigin: CanvasOriginFn, clientX: number, clientY: number, zoomScale = 1) => {
  const { left, top } = canvasOrigin();
  return {
    // commit unscaled coordinates
    x: (clientX - left) / zoomScale,
    y: (clientY - top) / zoomScale,
  };
};
