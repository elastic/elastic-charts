/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Render, Texture } from '../../../common/kingly';
import { GEOM_INDEX_OFFSET } from '../shaders';
import { BOX_GAP } from './draw_a_frame';

// text rendering and other config
const MAX_PADDING_RATIO = 0.25;
const MIN_FILL_RATIO = [1 - MAX_PADDING_RATIO, 0.6]; // retain at least 90% of the width and 60% of the height
const CORNER_RADIUS_RATIO = 0.25; // as a proportion of the shorter rectangle edge length
const VERTICES_PER_GEOM = 4; // assuming `gl.TRIANGLE_STRIP`
const DUMMY_INDEX = -1; // GLSL doesn't guarantee a NaN, and it's a shader integer anyway, so let's find a safe special number

/** @internal */
export const drawWebgl = (
  gl: WebGL2RenderingContext,
  logicalTime: number,
  canvasWidth: number,
  canvasHeight: number,
  verticalOffset: number,
  pickTexture: Texture,
  pickTextureRenderer: Render,
  roundedRectRenderer: Render,
  hoverIndex: number,
  rowHeight: number,
  currentFocus: [number, number, number, number],
  instanceCount: number,
) =>
  [false, true].forEach((pickLayer) =>
    (pickLayer ? pickTextureRenderer : roundedRectRenderer)({
      target: pickLayer ? pickTexture.target() : null,
      uniformValues: {
        pickLayer,
        t: Math.max(0.001, logicalTime), // for some reason, an exact zero will lead to `mix` as if it were 1 (glitch)
        resolution: [canvasWidth, canvasHeight],
        gapPx: pickLayer ? [0, 0] : [BOX_GAP, BOX_GAP], // in CSS pixels (but let's not leave a gap for shape picking)
        minFillRatio: MIN_FILL_RATIO,
        cornerRadiusPx: pickLayer ? 0 : canvasHeight * rowHeight * CORNER_RADIUS_RATIO, // note that for perf reasons the fragment shaders are split anyway
        hoverIndex: Number.isFinite(hoverIndex) ? hoverIndex + GEOM_INDEX_OFFSET : DUMMY_INDEX,
        rowHeight0: rowHeight,
        rowHeight1: rowHeight,
        focus0: currentFocus,
        focus1: currentFocus,
      },
      viewport: { x: 0, y: pickLayer ? 0 : verticalOffset, width: canvasWidth, height: canvasHeight }, // may conditionalize on textureWidthChanged || textureHeightChanged
      clear: { color: [0, 0, 0, 0] }, // or conditionalize: can use pickTexture.clear() for the texture
      draw: {
        geom: gl.TRIANGLE_STRIP,
        offset: 0,
        count: VERTICES_PER_GEOM,
        instanceCount,
      },
    }),
  );
