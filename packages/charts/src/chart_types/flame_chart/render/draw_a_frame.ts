/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Render, Texture } from '../../../common/kingly';
import { ColumnarViewModel } from '../flame_api';
import { roundUpSize } from './common';
import { drawRect, drawCanvas } from './draw_canvas';
import { drawWebgl } from './draw_webgl';

const CHART_BOX_LINE_WIDTH = 0.5;
const MINIMAP_SIZE_RATIO_X = 3;
const MINIMAP_SIZE_RATIO_Y = 5;
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
  const canvasHeightExcess = (roundUpSize(cssHeight) - cssHeight) * dpr;
  const minimapHeight = cssHeight / MINIMAP_SIZE_RATIO_Y;
  const minimapWidth = cssWidth / MINIMAP_SIZE_RATIO_X;
  const minimapLeft = cssWidth - minimapWidth;
  const fullFocus: [number, number, number, number] = [0, 1, 0, 1];

  const drawFocusLayer = (pickLayer: boolean) =>
    drawWebgl(
      gl,
      1,
      cssWidth * dpr,
      cssHeight * dpr,
      0,
      pickLayer ? 0 : canvasHeightExcess,
      pickTexture,
      pickLayer ? pickTextureRenderer : roundedRectRenderer,
      hoverIndex,
      rowHeight,
      currentFocus,
      columnarGeomData.label.length,
      true,
      pickLayer,
    );

  const drawContextLayer = (pickLayer: boolean) =>
    drawWebgl(
      gl,
      1,
      (cssWidth * dpr) / MINIMAP_SIZE_RATIO_X,
      (cssHeight * dpr) / MINIMAP_SIZE_RATIO_Y,
      cssWidth * dpr * (1 - 1 / MINIMAP_SIZE_RATIO_X),
      pickLayer ? 0 : canvasHeightExcess,
      pickTexture,
      pickLayer ? pickTextureRenderer : roundedRectRenderer,
      hoverIndex,
      rowHeight,
      fullFocus,
      columnarGeomData.label.length,
      false,
      pickLayer,
    );

  // base (focus) layer
  drawFocusLayer(false);

  drawCanvas(ctx, 1, cssWidth, cssHeight, dpr, columnarGeomData, rowHeight, currentFocus);

  // minimap geoms
  drawContextLayer(false);

  // base (focus) pick layer
  drawFocusLayer(true);

  // minimap pick layer
  drawContextLayer(true);

  // chart border
  drawRect(ctx, cssWidth, cssHeight, 0, cssHeight, dpr, fullFocus, '', 'black', CHART_BOX_LINE_WIDTH);

  // minimap box - erase Canvas2d text from the main chart that falls within the minimap area
  drawRect(ctx, minimapWidth, minimapHeight, minimapLeft, cssHeight, dpr, fullFocus, 'rgba(255,255,255,1)', '', 0);

  // minimap box - make the Canvas2d transparent, so that the webgl layer underneath (minimap geoms) show up
  drawRect(ctx, minimapWidth, minimapHeight, minimapLeft, cssHeight, dpr, fullFocus, 'transparent', '', 0);

  // minimap focus border
  drawRect(
    ctx,
    minimapWidth,
    minimapHeight,
    minimapLeft,
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
    minimapWidth,
    minimapHeight,
    minimapLeft,
    cssHeight,
    dpr,
    fullFocus,
    '',
    'black',
    MINIMAP_BOX_LINE_WIDTH,
  );
};
