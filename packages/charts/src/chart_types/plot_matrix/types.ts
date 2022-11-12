/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Attributes, Render } from '../../common/kingly';
import { GL } from '../../common/webgl_constants';

/** @internal */
export interface PlotMatrixRenderLayer {
  zIndex: number;
  targetTexture: WebGLFramebuffer | null;
  useWith: Render;
  program?: WebGLProgram;
  geom: number; // 0 | 1 | 2 | 3 | 4 | 5 | 6 ie. GL.POINTS | GL.LINES | GL.LINE_STRIP | GL.LINE_LOOP | GL.TRIANGLES | GL.TRIANGLE_STRIP | GL.TRIANGLE_FAN;
  offset: number;
  count: number;
}

/** @internal */
export interface PlotMatrixRenderLayers {
  parcoords: PlotMatrixRenderLayer;
  scatterplot: PlotMatrixRenderLayer;
  parcoordsPick: PlotMatrixRenderLayer;
  scatterPick: PlotMatrixRenderLayer;
  binningRaster2d: PlotMatrixRenderLayer;
  binRanges2d: PlotMatrixRenderLayer;
  heatmapChart: PlotMatrixRenderLayer;
  hexHeatmapChart: PlotMatrixRenderLayer;
  contours2d: PlotMatrixRenderLayer;
  binningRaster1d: PlotMatrixRenderLayer;
  binRanges1d: PlotMatrixRenderLayer;
  areaChart: PlotMatrixRenderLayer;
  panelBorder: PlotMatrixRenderLayer;
}

/** @internal */
export interface GLResources {
  renderLayers: PlotMatrixRenderLayers;
  attributes: Attributes;
}

const NULL_LAYER: PlotMatrixRenderLayer = {
  zIndex: 0,
  targetTexture: null,
  useWith: () => {},
  geom: GL.POINTS,
  offset: 0,
  count: 0,
};

/** @internal */
export const NULL_GL_RESOURCES: GLResources = {
  renderLayers: {
    parcoords: NULL_LAYER,
    scatterplot: NULL_LAYER,
    parcoordsPick: NULL_LAYER,
    scatterPick: NULL_LAYER,
    binningRaster2d: NULL_LAYER,
    binRanges2d: NULL_LAYER,
    heatmapChart: NULL_LAYER,
    hexHeatmapChart: NULL_LAYER,
    contours2d: NULL_LAYER,
    binningRaster1d: NULL_LAYER,
    binRanges1d: NULL_LAYER,
    areaChart: NULL_LAYER,
    panelBorder: NULL_LAYER,
  },
  attributes: new Map(),
};

/** @internal */
export const nullPlotMatrixViewModel = {
  label: [],
  value: new Float64Array(),
  color: new Float32Array(),
  position0: new Float32Array(),
  position1: new Float32Array(),
  size0: new Float32Array(),
  size1: new Float32Array(),
};
