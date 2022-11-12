/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  bindVertexArray,
  createCompiledShader,
  createLinkedProgram,
  getAttributes,
  getRenderer,
  resetState,
  Texture,
} from '../../../common/kingly';
import { GL } from '../../../common/webgl_constants';
import { c } from '../plom/src/config';
import { getGLExtensions } from '../plom/src/utils';
import { GLResources, NULL_GL_RESOURCES } from '../types';
import {
  attributeLocations,
  fragAreaChart,
  fragBinGrid,
  fragBinRange,
  fragBorder,
  fragContours,
  fragHeatmap,
  fragHexHeatmap,
  fragNormalSplat,
  fragPlom,
  fragPlomPick,
  vertBorder,
  vertHeatmap,
  vertPlom,
} from './shaders';

/** @internal */
export function ensureWebgl(
  gl: WebGL2RenderingContext,
  pickTexture: Texture,
  binningRaster1d: Texture,
  binningRaster2d: Texture,
  binRanges1d: Texture,
  binRanges2d: Texture,
): GLResources {
  resetState(gl);
  getGLExtensions(gl);

  /**
   * Vertex array attributes
   */

  const vao = gl.createVertexArray();
  if (!vao) return NULL_GL_RESOURCES;

  bindVertexArray(gl, vao);

  /**
   * Programs
   */

  const fragBinning = c.kernelDensity ? fragNormalSplat : fragBinGrid;
  const vertPlomShader = createCompiledShader(gl, GL.VERTEX_SHADER, vertPlom);
  const fragPlomShader = createCompiledShader(gl, GL.FRAGMENT_SHADER, fragPlom);
  const fragPlomPickShader = createCompiledShader(gl, GL.FRAGMENT_SHADER, fragPlomPick);
  const fragBinningShader = createCompiledShader(gl, GL.FRAGMENT_SHADER, fragBinning);
  const vertHeatmapShader = createCompiledShader(gl, GL.VERTEX_SHADER, vertHeatmap);
  const fragBinRangeShader = createCompiledShader(gl, GL.FRAGMENT_SHADER, fragBinRange);
  const fragAreaChartShader = createCompiledShader(gl, GL.FRAGMENT_SHADER, fragAreaChart);
  const fragHeatmapShader = createCompiledShader(gl, GL.FRAGMENT_SHADER, fragHeatmap);
  const fragHexHeatmapShader = createCompiledShader(gl, GL.FRAGMENT_SHADER, fragHexHeatmap);
  const fragContoursShader = createCompiledShader(gl, GL.FRAGMENT_SHADER, fragContours);
  const vertBorderShader = createCompiledShader(gl, GL.VERTEX_SHADER, vertBorder);
  const fragBorderShader = createCompiledShader(gl, GL.FRAGMENT_SHADER, fragBorder);

  // render scatterplot and parallel coordinates
  const programScatterParcoords = createLinkedProgram(gl, vertPlomShader, fragPlomShader, attributeLocations);

  // render pick layer for scatterplot and parallel coordinates
  const programPickScatterParcoords = createLinkedProgram(gl, vertPlomShader, fragPlomPickShader, attributeLocations);

  // bin points or density kernel circles into an 1d/2d raster
  const programBinning = createLinkedProgram(gl, vertPlomShader, fragBinningShader, attributeLocations);

  // compute the min/max values, as well as the offset and scale min and 1/(max - min) from a binned raster
  const programBinRange = createLinkedProgram(gl, vertHeatmapShader, fragBinRangeShader, attributeLocations);

  // render an area chart with the density estimates
  const programAreaChart = createLinkedProgram(gl, vertHeatmapShader, fragAreaChartShader, attributeLocations);

  // render a 2d continuous heatmap in color
  const programHeatmapChart = createLinkedProgram(gl, vertHeatmapShader, fragHeatmapShader, attributeLocations);
  const programHexHeatmapChart = createLinkedProgram(gl, vertHeatmapShader, fragHexHeatmapShader, attributeLocations);

  // render a 2d contour layer
  const programContoursChart = createLinkedProgram(gl, vertHeatmapShader, fragContoursShader, attributeLocations);

  // render panel borders
  const programPanelBorder = createLinkedProgram(gl, vertBorderShader, fragBorderShader, attributeLocations);

  /**
   * Resource allocation: Render layer setup
   * Each layer is a tuple of a things like layer depth, GL renderer, geometry and offset/count for using the desired slice of the attrib arrays
   * todo: the flame graph could also switch to this layer array approach for uniformity, though that's a much simpler use case
   */

  const renderLayers = {
    parcoords: {
      zIndex: 0, // lowest value: farthest from viewer, 1st to execute
      targetTexture: null,
      useWith: getRenderer(gl, programScatterParcoords, vao, { depthTest: true, frontFace: GL.CW }),
      program: programScatterParcoords,
      geom: GL.LINES,
      offset: 0,
      count: Infinity,
    },
    scatterplot: {
      zIndex: 0, // lowest value: farthest from viewer, 1st to execute
      targetTexture: null,
      useWith: getRenderer(gl, programScatterParcoords, vao, { depthTest: true, frontFace: GL.CW }),
      geom: GL.POINTS,
      offset: 0,
      count: Infinity,
    },
    parcoordsPick: {
      zIndex: 1, // lowest value: farthest from viewer, 1st to execute
      targetTexture: pickTexture.target(),
      useWith: getRenderer(gl, programPickScatterParcoords, vao, {
        depthTest: false,
        frontFace: GL.CW,
      }),
      geom: GL.LINES,
      offset: 0,
      count: Infinity,
    },
    scatterPick: {
      zIndex: 1, // lowest value: farthest from viewer, 1st to execute
      targetTexture: pickTexture.target(),
      useWith: getRenderer(gl, programPickScatterParcoords, vao, {
        depthTest: false,
        frontFace: GL.CW,
      }),
      geom: GL.POINTS,
      offset: 0,
      count: Infinity,
    },
    binningRaster2d: {
      zIndex: 2,
      targetTexture: binningRaster2d.target(),
      useWith: getRenderer(gl, programBinning, vao, { depthTest: false, frontFace: GL.CW }),
      geom: GL.POINTS,
      offset: 0,
      count: Infinity,
    },
    binRanges2d: {
      zIndex: 3,
      targetTexture: binRanges2d.target(),
      useWith: getRenderer(gl, programBinRange, vao, { depthTest: false, frontFace: GL.CW }),
      geom: GL.TRIANGLE_STRIP,
      offset: Infinity,
      count: 4,
    },
    heatmapChart: {
      zIndex: 4,
      targetTexture: null,
      useWith: getRenderer(gl, programHeatmapChart, vao, { depthTest: false, frontFace: GL.CW }),
      geom: GL.TRIANGLE_STRIP,
      offset: Infinity,
      count: 4,
    },
    hexHeatmapChart: {
      zIndex: 5,
      targetTexture: null,
      useWith: getRenderer(gl, programHexHeatmapChart, vao, { depthTest: false, frontFace: GL.CW }),
      geom: GL.TRIANGLE_STRIP,
      offset: Infinity,
      count: 4,
    },
    contours2d: {
      zIndex: 6,
      targetTexture: null,
      useWith: getRenderer(gl, programContoursChart, vao, { depthTest: false, frontFace: GL.CW }),
      geom: GL.TRIANGLE_STRIP,
      offset: Infinity,
      count: 4,
    },
    binningRaster1d: {
      zIndex: 7,
      targetTexture: binningRaster1d.target(),
      useWith: getRenderer(gl, programBinning, vao, { depthTest: false, frontFace: GL.CW }),
      geom: GL.POINTS,
      offset: 0,
      count: Infinity,
    },
    binRanges1d: {
      zIndex: 8,
      targetTexture: binRanges1d.target(),
      useWith: getRenderer(gl, programBinRange, vao, { depthTest: false, frontFace: GL.CW }),
      geom: GL.TRIANGLE_STRIP,
      offset: Infinity,
      count: 4,
    },
    areaChart: {
      zIndex: 9,
      targetTexture: null,
      useWith: getRenderer(gl, programAreaChart, vao, { depthTest: false, frontFace: GL.CW }),
      geom: GL.TRIANGLE_STRIP,
      offset: Infinity,
      count: 4,
    },
    panelBorder: {
      zIndex: 10,
      targetTexture: null,
      useWith: getRenderer(gl, programPanelBorder, vao, { depthTest: false, frontFace: GL.CW }),
      geom: GL.LINES,
      offset: Infinity,
      count: 8,
    },
  };

  const attributes = getAttributes(gl, programScatterParcoords, attributeLocations);

  return { attributes, renderLayers };
}
