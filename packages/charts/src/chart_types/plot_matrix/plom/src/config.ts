/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { magmaPalette, turboPalette } from '../colors';

const KERNEL_DENSITY = true;
const HEX = !KERNEL_DENSITY && true; // hex vs square grid
const BINNING_SIMPLIFICATION = KERNEL_DENSITY ? 4 : 23; // try anything approx. 16..32 for the latter number

/** @internal */
export const DARK_MODE = false;

/** @internal */
export const OUTER_WIDTH = 1900;
/** @internal */
export const OUTER_HEIGHT = 1054;
/** @internal */
export const VERTICAL_PADDING = 3; // otherwise lines on top or bottom will be truncated (like it used to be in xy)

/** @internal */
export const c = {
  dpr: 1.5, // can be tweaked: going with window.devicePixelRatio can yield too much frag shader work; 1 may be a bit too coarse
  voronoiDistance: 32,
  glDebug: false, // allowing it may incur some cost
  glTestContextLoss: false, // test the occurrence of a context loss and restoration
  eventDebug: false,
  binCountX: 256 / BINNING_SIMPLIFICATION + (!KERNEL_DENSITY && HEX ? -1 : 0), // without this hacky adjustment, hexagons are a bit too tall
  binCountY: 256 / BINNING_SIMPLIFICATION,
  kernelDensity: KERNEL_DENSITY,
  hex: !KERNEL_DENSITY && HEX,
  kernelRadius: 128 / BINNING_SIMPLIFICATION, // note: Safari's largest gl_PointSize is 64; beyond it, for more than that (hopefully not needed), we can switch to triangle tessellation
  kernelExponent: 24,
  kernelRadiusKeepInPanelRatio: 0, // points on the side protrude; add some padding
  splomPanelSizeRatio: 0.9,
  parcoordsX: 950,
  parcoordsY: 120,
  palettes: { turbo: turboPalette, magma: DARK_MODE ? magmaPalette.reverse() : magmaPalette },
};

/** @internal */
export const classNames = {
  axis: 'axis',
  axisBrush: 'axisBrush',
  axisHeading: 'axisHeading',
  axisOverlays: 'axisOverlays',
  axisTitle: 'axisTitle',
  dimAxis: 'dimAxis',
  plom: 'plom',
  plomControlView: 'plomControlView',
  plomGeomLayer: 'plomGeoms',
  plomGeomLayers: 'plomGeomLayers',
};
