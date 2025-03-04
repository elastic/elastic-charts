/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { BOX_GAP_HORIZONTAL, BOX_GAP_VERTICAL } from './common';
import type { Render, Texture } from '../../../common/kingly';
import { GEOM_INDEX_OFFSET } from '../shaders';

// text rendering and other config
const MAX_PADDING_RATIO = 0.25;
const MIN_FILL_RATIO = [1 - MAX_PADDING_RATIO, 0.6]; // retain at least 90% of the width and 60% of the height
const CORNER_RADIUS_RATIO = 0.25; // as a proportion of the shorter rectangle edge length
const VERTICES_PER_GEOM = 4; // assuming `gl.TRIANGLE_STRIP`
const DUMMY_INDEX = -1; // GLSL doesn't guarantee a NaN, and it's a shader integer anyway, so let's find a safe special number

/** @internal */
export const drawWebgl = (
  gl: WebGL2RenderingContext,
  nodeTweenTime: number,
  canvasWidth: number,
  canvasHeight: number,
  xOffset: number,
  yOffset: number,
  pickTexture: Texture,
  renderer: Render,
  hoverIndex: number,
  rowHeight: number,
  f: [number, number, number, number],
  instanceCount: number,
  focusLayer: boolean,
  pickLayer: boolean,
  wobbleIndex: number,
  wobble: number,
) =>
  renderer({
    target: pickLayer ? pickTexture.target() : null,
    uniformValues: {
      pickLayer,
      nodeTweenTime: Math.max(0.001, nodeTweenTime), // for some reason, an exact zero will lead to `mix` as if it were 1 (glitch)
      resolution: [canvasWidth, canvasHeight],
      gapPx: pickLayer || !focusLayer ? [0, 0] : [BOX_GAP_HORIZONTAL, BOX_GAP_VERTICAL], // in CSS pixels (but let's not leave a gap for shape picking)
      minFillRatio: MIN_FILL_RATIO,
      cornerRadiusPx: pickLayer ? 0 : canvasHeight * rowHeight * CORNER_RADIUS_RATIO, // note that for perf reasons the fragment shaders are split anyway
      hoverIndex: Number.isFinite(hoverIndex) ? hoverIndex + GEOM_INDEX_OFFSET : DUMMY_INDEX,
      wobbleIndex: Number.isFinite(wobbleIndex) ? wobbleIndex + GEOM_INDEX_OFFSET : DUMMY_INDEX,
      wobble,
      rowHeight0: rowHeight,
      rowHeight1: rowHeight,
      focus: [f[0], f[1], 0, 0, f[2], f[3], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    viewport: { x: xOffset, y: yOffset, width: canvasWidth, height: canvasHeight }, // may conditionalize on textureWidthChanged || textureHeightChanged
    clear: {
      color: [0, 0, 0, focusLayer || pickLayer ? 0 : 0.03],
      rect: [xOffset, yOffset, canvasWidth, canvasHeight],
    },
    draw:
      pickLayer && !focusLayer
        ? undefined
        : {
            geom: gl.TRIANGLE_STRIP,
            offset: 0,
            count: VERTICES_PER_GEOM,
            instanceCount,
          },
  });
