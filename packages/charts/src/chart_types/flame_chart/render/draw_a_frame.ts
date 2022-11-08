/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Render, Texture } from '../../../common/kingly';
import { FlamegraphStyle } from '../../../utils/themes/theme';
import { ColumnarViewModel } from '../flame_api';
import { roundUpSize } from './common';
import { drawCanvas2d, drawRect } from './draw_canvas';
import { drawWebgl } from './draw_webgl';

const CHART_BOX_LINE_WIDTH = 0.5;
const MINIMAP_FOCUS_BOX_LINE_WIDTH = 1;
const MINIMAP_BOX_LINE_WIDTH = 1;
/** @internal */
export const PADDING_TOP = 16; // for the UI controls and the minimap protrusion
/** @internal */
export const PADDING_BOTTOM = 24; // for the UI controls and the minimap protrusion
/** @internal */
export const PADDING_LEFT = 16; // for the location indicator or edge zoom
/** @internal */
export const PADDING_RIGHT = 16; // for aesthetic purposes or edge zoom
const FOCUS_INDICATOR_PLACEHOLDER_LINE_WIDTH = 0.5;
const MINIMUM_FOCUS_INDICATOR_LENGTH = 4;
const TERMINAL_TICK_LINE_WIDTH = 1;
const TERMINAL_TICK_LINE_LENGTH = 4;

/** @internal */
export const EPSILON = 1e-4;

/** @internal */
export const drawFrame =
  (
    ctx: CanvasRenderingContext2D,
    gl: WebGL2RenderingContext,
    cssWidth: number,
    cssHeight: number,
    minimapWidth: number,
    minimapHeight: number,
    minimapLeft: number,
    minimapTop: number,
    dpr: number,
    columnarGeomData: ColumnarViewModel,
    pickTexture: Texture,
    pickTextureRenderer: Render,
    roundedRectRenderer: Render,
    hoverIndex: number,
    unitRowHeight: number,
    currentColor: Float32Array,
    theme: FlamegraphStyle,
  ) =>
  (currentFocus: [number, number, number, number], wobbleIndex: number, wobble: number, nodeTweenTime: number) => {
    const canvasHeightExcess = (roundUpSize(cssHeight) - cssHeight) * dpr;

    const minimapBottom = minimapTop + minimapHeight;

    const minimapCanvasWidth = minimapWidth * dpr;
    const minimapCanvasHeight = minimapHeight * dpr;
    const minimapCanvasX = minimapLeft * dpr;
    const minimapCanvasY = canvasHeightExcess;

    const focusLayerCssWidth = cssWidth - PADDING_LEFT - PADDING_RIGHT;
    const focusLayerCanvasWidth = focusLayerCssWidth * dpr;
    const focusLayerCanvasOffsetX = PADDING_LEFT * dpr;

    const focusLayerCssHeight = cssHeight - PADDING_TOP - PADDING_BOTTOM;

    const fullFocus: [number, number, number, number] = [0, 1, 0, 1];

    const { scrollbarThumb, scrollbarTrack } = theme;

    const drawFocusLayer = (pickLayer: boolean) =>
      drawWebgl(
        gl,
        nodeTweenTime,
        focusLayerCanvasWidth,
        focusLayerCssHeight * dpr,
        focusLayerCanvasOffsetX,
        (pickLayer ? 0 : canvasHeightExcess) + dpr * PADDING_BOTTOM,
        pickTexture,
        pickLayer ? pickTextureRenderer : roundedRectRenderer,
        wobble ? NaN : hoverIndex, // no hover highlight during wobble
        unitRowHeight,
        currentFocus,
        columnarGeomData.label.length,
        true,
        pickLayer,
        wobbleIndex,
        wobble,
      );

    const drawContextLayer = (pickLayer: boolean) =>
      drawWebgl(
        gl,
        nodeTweenTime,
        minimapCanvasWidth,
        minimapCanvasHeight,
        minimapCanvasX,
        pickLayer ? 0 : minimapCanvasY,
        pickTexture,
        pickLayer ? pickTextureRenderer : roundedRectRenderer,
        hoverIndex,
        unitRowHeight,
        fullFocus,
        columnarGeomData.label.length,
        false,
        pickLayer,
        wobbleIndex, // useful to wobble on the minimap too
        wobble,
      );

    // base (focus) layer
    drawFocusLayer(false);

    // minimap geoms
    drawContextLayer(false);

    // base (focus) pick layer
    drawFocusLayer(true);

    // minimap pick layer -- just for clearing, to avoid hover tooltip
    drawContextLayer(true);

    // focus layer text
    drawCanvas2d(
      ctx,
      nodeTweenTime,
      focusLayerCssWidth,
      focusLayerCssHeight,
      PADDING_LEFT,
      PADDING_TOP,
      dpr,
      columnarGeomData,
      unitRowHeight,
      currentFocus,
      currentColor,
    );

    // focus chart border
    drawRect(
      ctx,
      focusLayerCssWidth,
      focusLayerCssHeight,
      PADDING_LEFT,
      focusLayerCssHeight + PADDING_TOP,
      dpr,
      fullFocus,
      '',
      'black',
      CHART_BOX_LINE_WIDTH,
    );

    // focus chart horizontal placeholder
    drawRect(
      ctx,
      focusLayerCssWidth,
      0,
      PADDING_LEFT,
      FOCUS_INDICATOR_PLACEHOLDER_LINE_WIDTH / 2,
      dpr,
      fullFocus,
      '',
      scrollbarTrack,
      FOCUS_INDICATOR_PLACEHOLDER_LINE_WIDTH,
    );

    // focus chart horizontal focus indicator
    drawRect(
      ctx,
      Math.max(0, focusLayerCssWidth * (currentFocus[1] - currentFocus[0])),
      0,
      PADDING_LEFT + focusLayerCssWidth * currentFocus[0],
      FOCUS_INDICATOR_PLACEHOLDER_LINE_WIDTH / 2,
      dpr,
      fullFocus,
      '',
      scrollbarThumb,
      FOCUS_INDICATOR_PLACEHOLDER_LINE_WIDTH,
    );

    // focus chart horizontal focus terminal - start
    const atWallLeft = Math.abs(currentFocus[0]) < EPSILON ? 4 : 1;
    drawRect(
      ctx,
      TERMINAL_TICK_LINE_WIDTH * atWallLeft,
      TERMINAL_TICK_LINE_LENGTH * atWallLeft,
      PADDING_LEFT + focusLayerCssWidth * currentFocus[0] - (TERMINAL_TICK_LINE_WIDTH * atWallLeft) / 2,
      TERMINAL_TICK_LINE_LENGTH + (FOCUS_INDICATOR_PLACEHOLDER_LINE_WIDTH * atWallLeft) / 2,
      dpr,
      fullFocus,
      scrollbarThumb,
      '',
      0,
    );

    // focus chart horizontal focus terminal - end
    const atWallRight = Math.abs(currentFocus[1] - 1) < EPSILON ? 4 : 1;
    drawRect(
      ctx,
      TERMINAL_TICK_LINE_WIDTH * atWallRight,
      TERMINAL_TICK_LINE_LENGTH * atWallRight,
      PADDING_LEFT + focusLayerCssWidth * currentFocus[1] - (TERMINAL_TICK_LINE_WIDTH * atWallRight) / 2,
      TERMINAL_TICK_LINE_LENGTH + (FOCUS_INDICATOR_PLACEHOLDER_LINE_WIDTH * atWallRight) / 2,
      dpr,
      fullFocus,
      scrollbarThumb,
      '',
      0,
    );

    // focus chart vertical placeholder
    drawRect(
      ctx,
      0,
      focusLayerCssHeight,
      FOCUS_INDICATOR_PLACEHOLDER_LINE_WIDTH / 2,
      focusLayerCssHeight + PADDING_TOP,
      dpr,
      fullFocus,
      '',
      scrollbarTrack,
      FOCUS_INDICATOR_PLACEHOLDER_LINE_WIDTH,
    );

    // focus chart vertical focus indicator
    drawRect(
      ctx,
      0,
      Math.max(MINIMUM_FOCUS_INDICATOR_LENGTH, focusLayerCssHeight * (currentFocus[3] - currentFocus[2])),
      FOCUS_INDICATOR_PLACEHOLDER_LINE_WIDTH / 2,
      focusLayerCssHeight * (1 - currentFocus[2]) + PADDING_TOP,
      dpr,
      fullFocus,
      '',
      scrollbarThumb,
      FOCUS_INDICATOR_PLACEHOLDER_LINE_WIDTH,
    );

    // focus chart vertical focus terminal - start
    const atWallTop = Math.abs(currentFocus[2]) < EPSILON ? 4 : 1;
    drawRect(
      ctx,
      TERMINAL_TICK_LINE_LENGTH + 1, // 1 is added to make it the same side as horizontal; todo check why
      TERMINAL_TICK_LINE_WIDTH * atWallTop,
      0,
      focusLayerCssHeight * (1 - currentFocus[2]) + PADDING_TOP,
      dpr,
      fullFocus,
      scrollbarThumb,
      '',
      0,
    );

    // focus chart vertical focus terminal - end
    const atWallBottom = Math.abs(currentFocus[3] - 1) < EPSILON ? 4 : 1;
    drawRect(
      ctx,
      TERMINAL_TICK_LINE_LENGTH + 1, // 1 is added to make it the same side as horizontal; todo check why
      TERMINAL_TICK_LINE_WIDTH * atWallBottom,
      0,
      focusLayerCssHeight * (1 - currentFocus[3]) + PADDING_TOP,
      dpr,
      fullFocus,
      scrollbarThumb,
      '',
      0,
    );

    // minimap box - erase Canvas2d text from the main chart that falls within the minimap area
    drawRect(
      ctx,
      minimapWidth,
      minimapHeight,
      minimapLeft,
      minimapBottom,
      dpr,
      fullFocus,
      'rgba(255,255,255,1)',
      '',
      0,
    );

    // minimap box - make the Canvas2d transparent, so that the webgl layer underneath (minimap geoms) show up
    drawRect(ctx, minimapWidth, minimapHeight, minimapLeft, minimapBottom, dpr, fullFocus, 'transparent', '', 0);

    // minimap focus border
    drawRect(
      ctx,
      minimapWidth,
      minimapHeight,
      minimapLeft,
      minimapBottom,
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
      minimapBottom,
      dpr,
      fullFocus,
      '',
      'black',
      MINIMAP_BOX_LINE_WIDTH,
    );
  };
