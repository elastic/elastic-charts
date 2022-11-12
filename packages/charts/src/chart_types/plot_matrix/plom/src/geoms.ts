/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { bindFramebuffer, bindVertexArray, readPixel } from '../../../../common/kingly';
import { GL } from '../../../../common/webgl_constants';
import { c, VERTICAL_PADDING } from './config';
import { clamp, range } from './utils';

const DIMENSION_COUNT = 64; // max would be 64 scalar dimensions, but gl_VertexID counts as an attrib; change implies shader change
const FLOAT_COUNT_PER_VEC4 = 4; // each vec4 has 4 scalars (floats)
const ATTRIBUTE_COUNT = DIMENSION_COUNT / FLOAT_COUNT_PER_VEC4; // 16 is not coincidentally the maximum attribute count
const VERTEX_COUNT_PER_LINE_SECTION = 2; // each line section has two vertices
const DEPTH_EPSILON = 0.000001; // without this, near or far lines may be lost due to imprecise fp representation
const PICK_INDEX_BASE = 1;
const PALETTE_LENGTH = 256;
const PALETTE_MAX_INDEX = PALETTE_LENGTH - 1;
const VEC_INDICES = range(ATTRIBUTE_COUNT);
const AXIS_COUNT_PER_PANEL = 2; // parcoords: yLeft, yRight; scatterplot: x, y
const RANGE_POINT_COUNT = 2; // minimum and maximum

// Mapping the tuple index [0...tupleCount - 1] to the unit range [0, 1] per RGB channel since the shader expects it like that
// The tuple index is shifted by 0, 8 or 16 bits depending on rgbIndex [0..2] so each point/line gets a unique color
const nullPickIdentifier = [0, 0, 0]; // zero means, no point, so we add 1 to j (datum index 0 will get the value of 1)
const getPickColor = (i, rgbIndex) => (((i + PICK_INDEX_BASE) >>> (8 * rgbIndex)) % PALETTE_LENGTH) / PALETTE_MAX_INDEX;

const getAttributeArray = (dimensionColumns, color) => {
  const dimensionCount = dimensionColumns.length;
  const tupleCount = dimensionColumns[0].length ?? 0;
  return Object.fromEntries(
    VEC_INDICES.map((vecIndex) => {
      const pointPairs = [];
      for (let j = 0; j < tupleCount; j++) {
        for (let k = 0; k < VERTEX_COUNT_PER_LINE_SECTION; k++) {
          for (let i = 0; i < FLOAT_COUNT_PER_VEC4; i++) {
            const dimensionIndex = vecIndex * FLOAT_COUNT_PER_VEC4 + i;
            const attribValue =
              dimensionIndex < dimensionCount
                ? dimensionColumns[dimensionIndex][j] // within dimensionColumns? move dimension value for the point
                : dimensionIndex === DIMENSION_COUNT - 1
                ? clamp(color[j], DEPTH_EPSILON, 1 - DEPTH_EPSILON) // last dimension is always depth, with a small FP precision margin
                : dimensionIndex >= DIMENSION_COUNT - 4
                ? getPickColor(j, DIMENSION_COUNT - 2 - dimensionIndex) // the three preceding dimensionColumns encode color
                : 0.5; // just put the midpoint value in the unused dimensionColumns
            // we can't use gl_VertexID and gl_InstanceID because they'd count as one vertex array each, but we already use 64
            pointPairs.push(dimensionIndex === DIMENSION_COUNT - 1 && k % 2 === 0 ? -attribValue : attribValue);
          }
        }
      }
      return [`v${vecIndex.toString(16)}`, pointPairs];
    }),
  );
};

// representation: out of the 64 dimensions, put an 1 where either of the two axes used by a specific panel is used, 0 otherwise
const dimensionSelections = range(AXIS_COUNT_PER_PANEL).map(() =>
  range(ATTRIBUTE_COUNT).map(() => new Float32Array(ATTRIBUTE_COUNT)),
);

// representation: for each of the 64 dimensions, 0 indicates the lower bound, 1 the upper bound of the range (brush) filter
const rangeLimits = range(RANGE_POINT_COUNT).map(() =>
  range(ATTRIBUTE_COUNT).map(() => new Float32Array(ATTRIBUTE_COUNT)),
);

/** @internal */
export const geomLayerMaker = (gl: WebGL2RenderingContext, model, dimensions, renderLayers, textures, attributes) => {
  if (gl.isContextLost()) return;

  const { dpr } = model;
  const initialDims = dimensions.slice();
  const { width: preDprCanvasWidth, height: preDprCanvasHeight, line, domain } = model;

  const canvasWidth = dpr * preDprCanvasWidth;
  const canvasHeight = dpr * preDprCanvasHeight;

  const dimensionCount = initialDims.length;

  const isPickLayer = false;
  const color = isPickLayer ? line.color.map((_, i) => i / line.color.length) : line.color;

  const attributeData = getAttributeArray(
    initialDims.map((d) => d.paddedUnitValues),
    color,
  );

  // add two triangles to form a quad with GL.TRIANGLE_STRIP; also interpretable as two vertical lines (left/right side) with GL.LINES
  Object.entries(attributeData).forEach(
    ([, value]) => value.push(0, 0, 0, 0, /**/ 0, 1, 0, 1, /**/ 1, 0, 0, 2, /**/ 1, 1, 0, 3), // two triangles with GL.TRIANGLE_STRIP
  );

  // add two lines, so, with the GL.LINES interpretation of the previous addition above, a rectangle can be drawn from 4 lines
  Object.entries(attributeData).forEach(
    ([, value]) => value.push(0, 0, 0, 4, /**/ 1, 0, 0, 5, /**/ 0, 1, 0, 6, /**/ 1, 1, 0, 7), // two horizontal lines with GL.LINES
  );

  const preexistingAxisOrder = [];

  /**
   * Vertex arrays: setting up and filling the `datum` array for webgl
   *
   * We have a single global shared vertex array object now, so we can bind it once and forget it
   */
  // spectorLog(gl, 'create/bind vao, enable array attribs, buffer data')
  const vao = gl.createVertexArray();
  bindVertexArray(gl, vao);
  attributes.forEach((setValue, name) => setValue(new Float32Array(attributeData[name])));

  const tupleCount = initialDims[0] ? initialDims[0].values.length : 0;
  const vertexCount = VERTEX_COUNT_PER_LINE_SECTION * tupleCount;

  const render = (panels, setChanged, renderPickTexture, hoveredPointId) => {
    // spectorLog(gl, 'render the scene')
    if (gl.isContextLost()) return;

    const isHoveredPointId = Number.isFinite(hoveredPointId);

    const hoverIdentifier = isHoveredPointId
      ? [2, 1, 0].map((byteIndex) => getPickColor(hoveredPointId - PICK_INDEX_BASE, byteIndex))
      : nullPickIdentifier;

    let first = Infinity;
    let last = -Infinity;

    for (const [, panel] of panels) {
      last = Math.max(last, panel.xIndex);
      first = Math.min(first, panel.xIndex);
    }

    textures.binningRaster1d.clear();
    textures.binningRaster2d.clear();
    textures.binRanges1d.clear();
    textures.binRanges2d.clear();

    for (const panel of [...panels.values()]
      .flat()
      .sort(
        (a, b) =>
          (renderLayers[a.renderLayer]?.zIndex ?? 0) - (renderLayers[b.renderLayer]?.zIndex ?? 0) ||
          a.yIndex - b.yIndex ||
          a.xIndex - b.xIndex,
      )) {
      const renderLayerName = panel.renderLayer;
      const renderLayer = renderLayers[renderLayerName];
      if (!renderLayer) continue; // useful for debugging, with certain programs commented out to bypass
      const { xIndex } = panel;
      const { yIndex } = panel;
      if (!panel || !panel.visible) {
        continue;
      }
      const x = dpr * panel.canvasX;
      const y = dpr * panel.canvasY;
      const axisIndex0 = panel.dim1.crossfilterDimensionIndex;
      const axisIndex1 = panel.dim2.crossfilterDimensionIndex;
      const panelSizeX = dpr * panel.panelSizeX;
      const panelSizeY = dpr * panel.panelSizeY;
      const xTo = x + panelSizeX;
      if (
        setChanged ||
        (panel.yIndex === 0 &&
          (!preexistingAxisOrder[axisIndex0] ||
            preexistingAxisOrder[axisIndex0][0] !== x ||
            preexistingAxisOrder[axisIndex0][1] !== xTo))
      ) {
        if (panel.yIndex === 0) preexistingAxisOrder[axisIndex0] = [x, xTo];
        const hasHoverHighlight = renderLayerName === 'scatterplot' || renderLayerName === 'parcoords';
        const isAreaChart = renderLayerName === 'areaChart';
        const is1d = renderLayerName === 'binningRaster1d' || isAreaChart || renderLayerName === 'binRanges1d';

        const { binCountX } = c;
        const binCountY = is1d ? 1 : c.binCountY;

        const isDiagonal = yIndex - 1 === xIndex;

        const binningRaster = renderLayerName === 'binningRaster1d' || renderLayerName === 'binningRaster2d';
        const binRanges = renderLayerName === 'binRanges1d' || renderLayerName === 'binRanges2d';
        const parcoords = renderLayerName === 'parcoords';
        const parcoordsPick = renderLayerName === 'parcoordsPick';
        const scatterplot = renderLayerName === 'scatterplot';
        const scatterPick = renderLayerName === 'scatterPick';
        const panelsAcross = dimensionCount;

        const leftRight = [axisIndex0, axisIndex1];
        const filterEpsilon = (dpr * VERTICAL_PADDING) / panelSizeY;

        const upTo = panelsAcross;

        for (let loHi = 0; loHi < 2; loHi++) {
          // lower vs higher boundary:
          //   for `dimensionSelections[loHi]` the `loHi` value represents min(loHi == 0) or max(loHi == 1) of the range
          //   for `rangeLimits[loHi]` the `loHi` value represents the axis0(loHi == 0) or axis1(loHi == 1) picked for a panel
          //     where axis0 and axis1 are the two Y axes of a parcoords panel (or the X and Y axes of a scatterplot panel)
          for (let vecElemIndex = 0; vecElemIndex < 4; vecElemIndex++) {
            for (let d = 0; d < ATTRIBUTE_COUNT; d++) {
              const dimP = d + ATTRIBUTE_COUNT * vecElemIndex;
              dimensionSelections[loHi][vecElemIndex][d] =
                d + ATTRIBUTE_COUNT * vecElemIndex === leftRight[loHi] ? 1 : 0;
              rangeLimits[loHi][vecElemIndex][d] =
                (d + Math.max(1, ATTRIBUTE_COUNT * vecElemIndex) <= upTo
                  ? initialDims[dimP === 0 ? 0 : 1 + ((dimP - 1) % (initialDims.length - 1))].brush.filter.get()[loHi]
                  : loHi) +
                (2 * loHi - 1) * filterEpsilon;
            }
          }
        }

        const blotRadius = c.kernelDensity ? c.kernelRadius : 1;
        const blotMarginRatio = c.kernelDensity
          ? (c.kernelRadiusKeepInPanelRatio * blotRadius) / Math.min(panelSizeX, panelSizeY)
          : 0;
        const blotUsefulRatio = 1 - 2 * blotMarginRatio;

        const xOffset = dpr * (yIndex === 0 ? 0 : -c.parcoordsX);
        const yOffset = dpr * (yIndex === 0 ? 0 : -c.parcoordsY);
        const viewportX = dpr * model.pad.l + dpr * model.layoutWidth * domain.x[0];
        const viewportY = dpr * model.pad.b + dpr * model.layoutHeight * domain.y[0];
        const s = yIndex === 0 ? 1 : c.splomPanelSizeRatio;
        const rasterOrRange = binningRaster || binRanges;

        const item = {
          key: axisIndex0,

          binCount: [binCountX, binCountY],

          // target framebuffer resolution (canvas, or target texture)
          resolution: binningRaster
            ? [binCountX * panelsAcross, binCountY * panelsAcross]
            : binRanges
            ? [panelsAcross, panelsAcross]
            : [canvasWidth, canvasHeight],

          // top left corner of the rectangle to draw to on the target framebuffer (in pixels/texels)
          viewBoxPosition: binningRaster
            ? [
                xIndex * binCountX + blotMarginRatio * binCountX,
                (panelsAcross - yIndex) * binCountY + blotMarginRatio * binCountY,
              ]
            : binRanges
            ? [xIndex, panelsAcross - yIndex]
            : [x, y],

          // size of the rectangle to draw to on the target framebuffer (in pixels/texels)
          viewBoxSize: binningRaster
            ? [blotUsefulRatio * binCountX, blotUsefulRatio * binCountY]
            : binRanges
            ? [1, 1]
            : [s * panelSizeX, s * panelSizeY],

          // near-zero if parcoords, one if scatterplot
          scatter: yIndex === 0 ? 0.00001 : 1, // todo why does it not work with an exact zero as designed and as it works with parcoords (issue shows when filtering)

          // gl_PointSize will get this
          pointSize: scatterPick
            ? c.voronoiDistance // will be overridden below anyway
            : binningRaster
            ? c.kernelDensity
              ? c.kernelRadius
              : 1
            : binRanges
            ? 1
            : dpr > 1
            ? 3
            : 2,
          kernelExponent: c.kernelExponent,
          i: axisIndex0,
          ii: axisIndex1,
          panelIndex: xIndex,

          dim1A: dimensionSelections[0][0],
          dim1B: dimensionSelections[0][1],
          dim1C: dimensionSelections[0][2],
          dim1D: dimensionSelections[0][3],
          dim2A: dimensionSelections[1][0],
          dim2B: dimensionSelections[1][1],
          dim2C: dimensionSelections[1][2],
          dim2D: dimensionSelections[1][3],

          contextPointRadius: scatterplot ? 0.1 : 0, // eliminating crossfiltered points from binning or point picking

          scissorRect: [
            rasterOrRange
              ? (binningRaster ? binCountX : 1) * xIndex
              : xOffset + (xIndex === first ? 0 : x) + dpr * model.pad.l + dpr * model.layoutWidth * domain.x[0],
            binningRaster
              ? binCountY * (panelsAcross - yIndex)
              : binRanges
              ? panelsAcross - yIndex
              : -yOffset + y + dpr * model.pad.b + dpr * model.layoutHeight * domain.y[0],
            binningRaster
              ? binCountX
              : binRanges
              ? 1
              : panelSizeX * (parcoords || parcoordsPick ? 1 : c.splomPanelSizeRatio),
            binningRaster
              ? binCountY
              : binRanges
              ? 1
              : panelSizeY * (parcoords || parcoordsPick ? 1 : c.splomPanelSizeRatio),
          ],

          loA: rangeLimits[0][0],
          loB: rangeLimits[0][1],
          loC: rangeLimits[0][2],
          loD: rangeLimits[0][3],
          hiA: rangeLimits[1][0],
          hiB: rangeLimits[1][1],
          hiC: rangeLimits[1][2],
          hiD: rangeLimits[1][3],

          // the viewport, interpreted as pixel/texel position/size on the target framebuffer, will mean the -1..1 horiz and vert ranges of clip space
          viewportX: rasterOrRange ? 0 : xOffset + viewportX,
          viewportY: rasterOrRange ? 0 : -yOffset + viewportY,
          viewportWidth: binningRaster ? panelsAcross * binCountX : binRanges ? panelsAcross : canvasWidth,
          viewportHeight: binningRaster ? panelsAcross * binCountY : binRanges ? panelsAcross : canvasHeight,

          palette: textures.palette,
          heatmapPalette: textures.heatmapPalette,
          pickTexture: textures.pickTexture, // maybe for future 1px by 1px point pick texture
          hoverIdentifier: hasHoverHighlight ? hoverIdentifier : nullPickIdentifier,
          binningRaster: is1d ? textures.binningRaster1d : textures.binningRaster2d,
          binRanges: is1d && !isAreaChart ? textures.binRanges1d : textures.binRanges2d,
          zoomScale: yIndex === 0 || isDiagonal ? [1, 1] : panel.zoomScale || [1, 1],
          zoomOffset: yIndex === 0 || isDiagonal ? [0, 0] : panel.zoomOffset || [0, 0],
        };

        const offset = Number.isFinite(renderLayer.offset) ? renderLayer.offset : vertexCount;
        const count = Number.isFinite(renderLayer.count) ? renderLayer.count : vertexCount;

        const renderer = (item, retain) =>
          renderLayer.useWith({
            uniformValues: item,
            viewport: { x: item.viewportX, y: item.viewportY, width: item.viewportWidth, height: item.viewportHeight },
            target: renderLayer.targetTexture || null,
            clear: !retain &&
              ![
                'panelBorder',
                'binningRaster1d',
                'binningRaster2d',
                'binRanges1d',
                'binRanges2d',
                'contours2d',
              ].includes(renderLayerName) && {
                rect: item.scissorRect,
                color: [0, 0, 0, 0],
                depth: 1,
              },
            scissor: renderLayerName !== 'panelBorder' ? item.scissorRect : undefined,
            draw: {
              geom: renderLayer.geom,
              offset,
              count,
              instanceCount: 1,
            },
          });

        if (renderLayerName === 'scatterPick' && renderPickTexture) {
          const minVoronoiDistance = 1;
          const maxVoronoiDistance = c.voronoiDistance;
          const decrement = 1;
          if (c.glDebug) console.log('Rendering scatterPick');
          for (let i = maxVoronoiDistance; i >= minVoronoiDistance; i -= decrement) {
            renderer({ ...item, pointSize: i, contextPointRadius: 0 }, i !== maxVoronoiDistance);
          }
        } else if (renderLayerName !== 'scatterPick') {
          renderer(item);
        }
      }
    }
  };

  return {
    readPixel: (height, x, y) => {
      x -= 2; // slight offset so hover highlight doesn't vanish under mouse pointer tip
      y -= 2; // slight offset so hover highlight doesn't vanish under mouse pointer tip
      bindFramebuffer(gl, GL.READ_FRAMEBUFFER, textures.pickTexture.target());
      const pixel = readPixel(gl, dpr * x, dpr * (height - y));
      return pixel;
    },
    render,
  };
};
