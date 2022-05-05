/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Render, Texture } from '../../../common/kingly';
import { LabelAccessor } from '../../../utils/common';
import { ColumnarViewModel, ContinuousDomainFocus } from '../types';
import { drawCanvas } from './draw_canvas';
import { drawWebgl } from './draw_webgl';

/** @internal */
export const BOX_GAP = 0.5;

/** @internal */
export const mix = (a: number, b: number, x: number) => (1 - x) * a + x * b; // like the GLSL `mix`

const getLayerCount = (columnarGeomData: ColumnarViewModel) => {
  const layerSet = new Set<number>();
  for (let i = 1; i < columnarGeomData.position1.length; i += 2) layerSet.add(columnarGeomData.position1[i]);
  return layerSet.size;
};

/** @internal */
export const drawFrame = (
  ctx: CanvasRenderingContext2D,
  gl: WebGL2RenderingContext,
  focus: ContinuousDomainFocus,
  cssWidth: number,
  cssHeight: number,
  dpr: number,
  columnarGeomData: ColumnarViewModel,
  formatter: LabelAccessor,
  pickTexture: Texture,
  pickTextureRenderer: Render,
  roundedRectRenderer: Render,
  hoverIndex: number,
) => {
  // focus
  const rowHeight = 1 / getLayerCount(columnarGeomData);

  // determine layer count
  return (logicalTime: number) => {
    const currentFocus: [number, number, number, number] = [
      mix(focus.prevFocusX0, focus.currentFocusX0, logicalTime),
      mix(focus.prevFocusX1, focus.currentFocusX1, logicalTime),
      mix(focus.prevFocusY0, focus.currentFocusY0, logicalTime),
      mix(focus.prevFocusY1, focus.currentFocusY1, logicalTime),
    ];

    drawWebgl(
      gl,
      logicalTime,
      cssWidth * dpr,
      cssHeight * dpr,
      pickTexture,
      pickTextureRenderer,
      roundedRectRenderer,
      hoverIndex,
      rowHeight,
      currentFocus,
      columnarGeomData.label.length,
    );

    drawCanvas(ctx, logicalTime, cssWidth, cssHeight, dpr, columnarGeomData, formatter, rowHeight, currentFocus);
  };
};
