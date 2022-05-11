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
import { drawRect, drawCanvas } from './draw_canvas';
import { drawWebgl } from './draw_webgl';

const CHART_BOX_LINE_WIDTH = 1;
const MINIMAP_SIZE_RATIO_X = 3;
const MINIMAP_SIZE_RATIO_Y = 3;
const MINIMAP_FOCUS_BOX_LINE_WIDTH = 1;
const MINIMAP_BOX_LINE_WIDTH = 1;

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
    true,
    0,
  );

  drawCanvas(ctx, 1, cssWidth, cssHeight, dpr, columnarGeomData, rowHeight, currentFocus);

  // minimap geoms
  drawWebgl(
    gl,
    1,
    (cssWidth * dpr) / MINIMAP_SIZE_RATIO_X,
    (cssHeight * dpr) / MINIMAP_SIZE_RATIO_Y,
    (roundUpSize(cssHeight) - cssHeight) * dpr,
    pickTexture,
    pickTextureRenderer,
    roundedRectRenderer,
    hoverIndex,
    rowHeight,
    [0, 1, 0, 1],
    columnarGeomData.label.length,
    false,
    cssWidth * dpr - (cssWidth * dpr) / MINIMAP_SIZE_RATIO_X,
  );

  // chart border
  drawRect(ctx, cssWidth, cssHeight, 0, cssHeight, dpr, [0, 1, 0, 1], '', 'black', CHART_BOX_LINE_WIDTH);

  // minimap box erase
  drawRect(
    ctx,
    cssWidth / MINIMAP_SIZE_RATIO_X,
    cssHeight / MINIMAP_SIZE_RATIO_Y,
    cssWidth - cssWidth / MINIMAP_SIZE_RATIO_X,
    cssHeight,
    dpr,
    [0, 1, 0, 1],
    'rgba(255,255,255,1)',
    '',
    0,
  );

  // minimap box clear
  drawRect(
    ctx,
    cssWidth / MINIMAP_SIZE_RATIO_X,
    cssHeight / MINIMAP_SIZE_RATIO_Y,
    cssWidth - cssWidth / MINIMAP_SIZE_RATIO_X,
    cssHeight,
    dpr,
    [0, 1, 0, 1],
    'transparent',
    '',
    0,
  );

  // minimap focus border
  drawRect(
    ctx,
    cssWidth / MINIMAP_SIZE_RATIO_X,
    cssHeight / MINIMAP_SIZE_RATIO_Y,
    cssWidth - cssWidth / MINIMAP_SIZE_RATIO_X,
    cssHeight,
    dpr,
    currentFocus,
    '',
    'magenta',
    MINIMAP_FOCUS_BOX_LINE_WIDTH,
  );

  // minimap box rectangle
  drawRect(
    ctx,
    cssWidth / MINIMAP_SIZE_RATIO_X,
    cssHeight / MINIMAP_SIZE_RATIO_Y,
    cssWidth - cssWidth / MINIMAP_SIZE_RATIO_X,
    cssHeight,
    dpr,
    [0, 1, 0, 1],
    '',
    'black',
    MINIMAP_BOX_LINE_WIDTH,
  );
};
