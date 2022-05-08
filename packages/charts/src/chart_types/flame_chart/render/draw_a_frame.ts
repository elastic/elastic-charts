/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Render, Texture } from '../../../common/kingly';
import { ColumnarViewModel } from '../types';
import { roundUpSize } from './common';
import { drawCanvas } from './draw_canvas';
import { drawWebgl } from './draw_webgl';

/** @internal */
export const drawFrame = (
  ctx: CanvasRenderingContext2D,
  gl: WebGL2RenderingContext,
  cssWidth: number,
  cssHeight: number,
  dpr: number,
  columnarGeomData: ColumnarViewModel,
  pickTexture: Texture,
  pickTextureRenderer: Render,
  roundedRectRenderer: Render,
  hoverIndex: number,
  rowHeight: number,
) => (currentFocus: [number, number, number, number]) => {
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
