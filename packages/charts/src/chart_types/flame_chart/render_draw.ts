/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Render, Texture } from '../../common/kingly';
import { LabelAccessor } from '../../utils/common';
import { GEOM_INDEX_OFFSET } from './shaders';
import { ColumnarViewModel, ContinuousDomainFocus } from './types';

// text rendering and other config
const MAX_PADDING_RATIO = 0.25;
const MIN_FILL_RATIO = [1 - MAX_PADDING_RATIO, 0.6]; // retain at least 90% of the width and 60% of the height
const CORNER_RADIUS_RATIO = 0.25; // as a proportion of the shorter rectangle edge length
const VERTICES_PER_GEOM = 4; // assuming `gl.TRIANGLE_STRIP`
const TEXT_PAD_LEFT = 3;
const TEXT_PAD_RIGHT = 3;
const MIN_TEXT_LENGTH = 0; // in font height, so 1 means roughly 2 characters (latin characters are tall on average)
const ROW_OFFSET_Y = 0.45; // approx. middle line (text is middle anchored so tall bars with small fonts can still have vertically centered text)
const MAX_FONT_HEIGHT_RATIO = 0.9; // relative to the row height
const MAX_FONT_SIZE = 14;
const BOX_GAP = 0.5;
const mix = (a: number, b: number, x: number) => (1 - x) * a + x * b; // like the GLSL `mix`
const scale = (value: number, from: number, to: number) => (value - from) / (to - from);

function drawWebgl(
  pickTextureRenderer: Render,
  roundedRectRenderer: Render,
  pickTexture: Texture,
  logicalTime: number,
  rowHeight: number,
  hoverIndex: number,
  focusLoX: number,
  focusHiX: number,
  focusLoY: number,
  focusHiY: number,
  canvasWidth: number,
  canvasHeight: number,
  gl: WebGL2RenderingContext,
  instanceCount: number,
) {
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
        hoverIndex: hoverIndex + GEOM_INDEX_OFFSET,
        rowHeight0: rowHeight,
        rowHeight1: rowHeight,
        focus0: [focusLoX, focusHiX, focusLoY, focusHiY],
        focus1: [focusLoX, focusHiX, focusLoY, focusHiY],
      },
      viewport: { x: 0, y: 0, width: canvasWidth, height: canvasHeight }, // may conditionalize on textureWidthChanged || textureHeightChanged
      clear: { color: [0, 0, 0, 0] }, // or conditionalize: can use pickTexture.clear() for the texture
      draw: {
        geom: gl.TRIANGLE_STRIP,
        offset: 0,
        count: VERTICES_PER_GEOM,
        instanceCount,
      },
    }),
  );
}

function drawCanvas(
  rowHeight: number,
  focusHiY: number,
  focusLoY: number,
  textureHeight: number,
  dpr: number,
  cssWidth: number,
  ctx: CanvasRenderingContext2D,
  cssHeight: number,
  columnarGeomData: ColumnarViewModel,
  logicalTime: number,
  focusHiX: number,
  focusLoX: number,
  formatter: LabelAccessor,
) {
  const zoomedRowHeight = rowHeight / Math.abs(focusHiY - focusLoY);
  const fontSize = Math.min(
    Math.round(zoomedRowHeight * textureHeight - dpr * BOX_GAP) * MAX_FONT_HEIGHT_RATIO,
    dpr * MAX_FONT_SIZE,
  );
  const minTextLengthCssPix = MIN_TEXT_LENGTH * fontSize; // don't render shorter text than this
  const minRectWidthForTextInCssPix = minTextLengthCssPix + TEXT_PAD_LEFT + TEXT_PAD_RIGHT;
  const minRectWidth = minRectWidthForTextInCssPix / cssWidth;

  // text rendering
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  let lastTextColor = '';
  columnarGeomData.label.forEach((dataName, i) => {
    const textColor = 'black';
    const size = mix(columnarGeomData.size0[i], columnarGeomData.size1[i], logicalTime);
    // todo also trivially skip text outside the current view (eg. more than 1 row above currently selected node; or left/right of the currently selected node
    // otherwise it becomes too choppy as the horizontal magnification makes rectangles wider for text even outside the chart
    const scaledSize = size / (focusHiX - focusLoX);
    if (scaledSize >= minRectWidth) {
      const xNorm = mix(columnarGeomData.position0[2 * i], columnarGeomData.position1[2 * i], logicalTime);
      const yNorm = mix(columnarGeomData.position0[2 * i + 1], columnarGeomData.position1[2 * i + 1], logicalTime);
      const baseX = scale(xNorm, focusLoX, focusHiX) * cssWidth;
      const leftOutside = Math.max(0, -baseX);
      const x = baseX + leftOutside; // don't start the text in the negative range, b/c it's not readable there
      const y = cssHeight * (1 - scale(yNorm, focusLoY, focusHiY));
      const baseWidth = scaledSize * cssWidth - BOX_GAP - TEXT_PAD_RIGHT;
      const width = baseWidth - leftOutside; // if a box is partially cut on the left, the remaining box becomes smaller
      const label = formatter(dataName);
      if (x + scaledSize < 0 || x > cssWidth || y < 0 || y > cssHeight || !label) return; // don't render what's outside
      ctx.beginPath();
      ctx.rect(x, y - zoomedRowHeight * cssHeight, width, zoomedRowHeight * cssHeight);
      if (textColor !== lastTextColor) {
        // as we're sorting the iteration, the number of color changes (API calls) is minimized
        ctx.fillStyle = textColor;
        lastTextColor = textColor;
      }
      ctx.save();
      ctx.clip();
      ctx.fillText(label, x + TEXT_PAD_LEFT, y - ROW_OFFSET_Y * rowHeight * cssHeight);
      ctx.restore();
    }
  });
  ctx.restore();
}

function getLayerCount(columnarGeomData: ColumnarViewModel) {
  const layerSet = new Set<number>();
  for (let i = 1; i < columnarGeomData.position1.length; i += 2) layerSet.add(columnarGeomData.position1[i]);
  return layerSet.size;
}

/** @internal */
export const renderer = (
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
  const canvasHeight = dpr * cssHeight;
  const rowHeight = 1 / getLayerCount(columnarGeomData);

  // determine layer count
  return (logicalTime: number) => {
    // get focus
    const focusLoX = mix(focus.prevFocusX0, focus.currentFocusX0, logicalTime);
    const focusLoY = mix(focus.prevFocusY0, focus.currentFocusY0, logicalTime);
    const focusHiX = mix(focus.prevFocusX1, focus.currentFocusX1, logicalTime);
    const focusHiY = mix(focus.prevFocusY1, focus.currentFocusY1, logicalTime);

    drawWebgl(
      pickTextureRenderer,
      roundedRectRenderer,
      pickTexture,
      logicalTime,
      rowHeight,
      hoverIndex,
      focusLoX,
      focusHiX,
      focusLoY,
      focusHiY,
      dpr * cssWidth,
      canvasHeight,
      gl,
      columnarGeomData.label.length,
    );

    drawCanvas(
      rowHeight,
      focusHiY,
      focusLoY,
      canvasHeight,
      dpr,
      cssWidth,
      ctx,
      cssHeight,
      columnarGeomData,
      logicalTime,
      focusHiX,
      focusLoX,
      formatter,
    );
  };
};
