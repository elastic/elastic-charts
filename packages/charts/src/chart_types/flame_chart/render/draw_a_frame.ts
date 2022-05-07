/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Render, Texture } from '../../../common/kingly';
import { ColumnarViewModel, ContinuousDomainFocus } from '../types';
import { mix, roundUpSize } from './common';
import { drawCanvas } from './draw_canvas';
import { drawWebgl } from './draw_webgl';

/** @internal */
export const drawFrame = (
  ctx: CanvasRenderingContext2D,
  gl: WebGL2RenderingContext,
  focus: ContinuousDomainFocus,
  cssWidth: number,
  cssHeight: number,
  dpr: number,
  columnarGeomData: ColumnarViewModel,
  pickTexture: Texture,
  pickTextureRenderer: Render,
  roundedRectRenderer: Render,
  hoverIndex: number,
  rowHeight: number,
) => (logicalTime: number) => {
  const currentFocus: [number, number, number, number] = [
    mix(focus.prevFocusX0, focus.currentFocusX0, logicalTime),
    mix(focus.prevFocusX1, focus.currentFocusX1, logicalTime),
    mix(focus.prevFocusY0, focus.currentFocusY0, logicalTime),
    mix(focus.prevFocusY1, focus.currentFocusY1, logicalTime),
  ];

  drawWebgl(
    gl,
    1,
    cssWidth * dpr,
    cssHeight * dpr,
    (roundUpSize(cssHeight) - cssHeight) * dpr,
    pickTexture,
    pickTextureRenderer,
    roundedRectRenderer,
    hoverIndex,
    rowHeight,
    currentFocus,
    columnarGeomData.label.length,
  );

  drawCanvas(ctx, 1, cssWidth, cssHeight, dpr, columnarGeomData, rowHeight, currentFocus);
};
